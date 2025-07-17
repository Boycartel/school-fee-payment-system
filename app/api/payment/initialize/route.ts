import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { sql } from "@/lib/database"

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const body = await request.json()
    const {
      amount,
      feeType,
      academicSession,
      semester,
      schoolFeeId,
      installmentNumber,
      totalInstallments,
      isFullPayment,
    } = body

    if (!schoolFeeId || !amount) {
      return NextResponse.json({ error: "School fee ID and amount are required" }, { status: 400 })
    }

    // Get student details
    const studentResult = await sql`
      SELECT * FROM users WHERE id = ${decoded.studentId} AND role = 'student'
    `

    if (studentResult.length === 0) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 })
    }

    const student = studentResult[0]

    // Get school fee details - simplified query without join
    const feeResult = await sql`
      SELECT * FROM school_fees WHERE id = ${schoolFeeId}
    `

    if (feeResult.length === 0) {
      return NextResponse.json({ error: "Fee not found" }, { status: 404 })
    }

    const fee = feeResult[0]

    // Check if user has made any payment before for this session
    const anyExistingPayment = await sql`
      SELECT * FROM payments 
      WHERE user_id = ${student.id} 
        AND school_fee_id = ${schoolFeeId}
        AND status = 'verified'
    `

    // Calculate total amount paid so far
    const totalPaidAmount = anyExistingPayment.reduce((sum, payment) => sum + Number(payment.amount), 0)

    // If this is a full payment and user has no previous payments, mark installment as 100%
    if (isFullPayment && anyExistingPayment.length === 0 && Number(amount) === Number(fee.amount)) {
      // Update the school fee to mark both installments as paid (100%)
      await sql`
        UPDATE school_fees 
        SET first_installment_paid = true, second_installment_paid = true
        WHERE id = ${schoolFeeId}
      `
    }
    // If user has made previous payments and current payment completes the full amount
    else if (anyExistingPayment.length > 0 && totalPaidAmount + Number(amount) >= Number(fee.amount)) {
      // Update the school fee to mark both installments as paid (100%)
      await sql`
        UPDATE school_fees 
        SET first_installment_paid = true, second_installment_paid = true
        WHERE id = ${schoolFeeId}
      `
    }

    // Check if payment already exists for this installment
    const existingPayment = await sql`
      SELECT * FROM payments 
      WHERE user_id = ${student.id} 
        AND school_fee_id = ${schoolFeeId}
        AND installment_number = ${installmentNumber || 1}
        AND status = 'verified'
    `

    if (existingPayment.length > 0) {
      return NextResponse.json({ error: "This installment has already been paid" }, { status: 400 })
    }

    // Generate reference and receipt number
    const reference = `FPB-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
    const receiptNumber = `RCP-${Date.now()}`

    // Create payment record
    const paymentResult = await sql`
      INSERT INTO payments (
        id, user_id, school_fee_id, amount, reference, receipt_number,
        payment_method, academic_session, fee_type, installment_number,
        total_installments, status, created_at, updated_at
      )
      VALUES (
        gen_random_uuid()::text, ${student.id}, ${schoolFeeId}, ${amount}, 
        ${reference}, ${receiptNumber}, 'online', ${academicSession || fee.academic_session},
        ${feeType || "School Fee"}, ${installmentNumber || 1}, ${totalInstallments || 1}, 'pending',
        NOW(), NOW()
      )
      RETURNING *
    `

    const payment = paymentResult[0]

    // Initialize Paystack payment
    const paystackResponse = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: student.email,
        amount: amount * 100, // Paystack expects amount in kobo
        reference: reference,
        callback_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/callback`,
        metadata: {
          student_id: student.id,
          student_name: student.full_name,
          matric_number: student.matric_number,
          fee_name: fee.fee_name,
          payment_type: feeType || "School Fee",
          academic_session: academicSession || fee.academic_session,
        },
      }),
    })

    const paystackData = await paystackResponse.json()

    if (!paystackData.status) {
      // Delete the payment record if Paystack initialization fails
      await sql`DELETE FROM payments WHERE id = ${payment.id}`
      return NextResponse.json({ error: "Payment initialization failed" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      authorization_url: paystackData.data.authorization_url,
      reference: reference,
      amount: amount,
    })
  } catch (error) {
    console.error("Payment initialization error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
