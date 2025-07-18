import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/database"
import { sendEmail } from "@/lib/email"
import { generatePaymentReceiptEmail } from "@/lib/email-templates"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { reference } = body

    if (!reference) {
      return NextResponse.json({ error: "Payment reference is required" }, { status: 400 })
    }

    // Verify payment with Paystack
    const paystackResponse = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      },
    })

    const paystackData = await paystackResponse.json()

    if (!paystackData.status || paystackData.data.status !== "success") {
      return NextResponse.json({ error: "Payment verification failed" }, { status: 400 })
    }

    // Update payment status in database
    const updateResult = await sql`
      UPDATE payments 
      SET status = 'verified', payment_date = NOW(), updated_at = NOW()
      WHERE reference = ${reference} AND status = 'pending'
      RETURNING *
    `

    if (updateResult.length === 0) {
      return NextResponse.json({ error: "Payment not found or already verified" }, { status: 404 })
    }

    const payment = updateResult[0]

    // Get complete payment details for email
    const paymentDetailsResult = await sql`
      SELECT 
        p.*,
        u.full_name,
        u.matric_number,
        u.email,
        u.phone,
        u.level,
        u.passport_photo,
        d.name as department_name,
        s.name as school_name,
        sf.fee_name,
        sf.description as fee_description,
        sf.amount as total_fee_amount,
        sf.academic_session,
        sf.allows_installments,
        sf.first_installment_percentage,
        sf.second_installment_percentage
      FROM payments p
      JOIN users u ON p.user_id = u.id
      LEFT JOIN departments d ON u.department_id = d.id
      LEFT JOIN schools s ON u.school_id = s.id
      LEFT JOIN school_fees sf ON p.school_fee_id = sf.id
      WHERE p.id = ${payment.id}
    `

    if (paymentDetailsResult.length === 0) {
      return NextResponse.json({ error: "Payment details not found" }, { status: 404 })
    }

    const paymentDetails = paymentDetailsResult[0]

    // Get all payments for this student and fee to calculate totals
    const allPaymentsResult = await sql`
      SELECT 
        amount,
        installment_number,
        payment_date,
        status
      FROM payments
      WHERE user_id = ${paymentDetails.user_id} 
        AND school_fee_id = ${paymentDetails.school_fee_id}
        AND status = 'verified'
      ORDER BY installment_number
    `

    // Calculate payment summary
    const totalPaid = allPaymentsResult.reduce((sum, p) => sum + Number(p.amount), 0)
    const balance = Number(paymentDetails.total_fee_amount) - totalPaid
    const isFullyPaid = balance <= 0

    // Prepare email data
    const emailData = {
      student: {
        full_name: paymentDetails.full_name,
        matric_number: paymentDetails.matric_number,
        email: paymentDetails.email,
        phone: paymentDetails.phone || "",
        level: paymentDetails.level,
        department_name: paymentDetails.department_name || "",
        school_name: paymentDetails.school_name || "",
      },
      payment: {
        reference: paymentDetails.reference,
        receipt_number: paymentDetails.receipt_number,
        amount: Number(paymentDetails.amount),
        payment_date: paymentDetails.payment_date,
        fee_type: paymentDetails.fee_type || "School Fee",
        academic_session: paymentDetails.academic_session,
        installment_number: paymentDetails.installment_number || 1,
        total_installments: paymentDetails.total_installments || 1,
      },
      fee: {
        fee_name: paymentDetails.fee_name,
        description: paymentDetails.fee_description || "",
        total_amount: Number(paymentDetails.total_fee_amount),
      },
      summary: {
        total_paid: totalPaid,
        balance: Math.max(0, balance),
        is_fully_paid: isFullyPaid,
      },
    }

    // Send email receipt
    try {
      const emailHtml = generatePaymentReceiptEmail(emailData)
      const emailResult = await sendEmail({
        to: paymentDetails.email,
        subject: `Payment Receipt - ${paymentDetails.fee_name} (${paymentDetails.receipt_number})`,
        html: emailHtml,
      })

      console.log("Email sent result:", emailResult)
    } catch (emailError) {
      console.error("Failed to send email receipt:", emailError)
      // Don't fail the payment verification if email fails
    }

    return NextResponse.json({
      success: true,
      message: "Payment verified successfully",
      payment: {
        id: payment.id,
        reference: payment.reference,
        receipt_number: payment.receipt_number,
        amount: Number(payment.amount),
        payment_date: payment.payment_date,
        fee_type: payment.fee_type,
        status: payment.status,
      },
    })
  } catch (error) {
    console.error("Payment verification error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
