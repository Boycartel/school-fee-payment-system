import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/database"
import { sendEmail } from "@/lib/email"
import { generatePaymentReceiptEmail } from "@/lib/email-templates"

export async function POST(request: NextRequest) {
  try {
    const { reference } = await request.json()

    if (!reference) {
      return NextResponse.json({ success: false, message: "Payment reference is required" }, { status: 400 })
    }

    // Check if payment exists in our database
    const existingPayment = await sql`
      SELECT * FROM payments 
      WHERE reference = ${reference}
      LIMIT 1
    `

    if (existingPayment.length > 0) {
      const payment = existingPayment[0]

      // If payment is already verified, return success
      if (payment.status === "verified") {
        return NextResponse.json({
          success: true,
          message: "Payment already verified",
          payment: {
            reference: payment.reference,
            amount: Number(payment.amount),
            status: "verified",
            receipt_number: payment.receipt_number,
            created_at: payment.created_at,
          },
          student: {
            email: payment.user_email || "N/A",
            full_name: payment.user_name || "N/A",
          },
        })
      }
    }

    // Verify payment with Paystack
    const paystackResponse = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
    })

    if (!paystackResponse.ok) {
      return NextResponse.json({ success: false, message: "Failed to verify payment with Paystack" }, { status: 500 })
    }

    const paystackData = await paystackResponse.json()

    if (!paystackData.status || !paystackData.data) {
      return NextResponse.json({ success: false, message: "Invalid payment reference" }, { status: 400 })
    }

    const transactionData = paystackData.data

    // Check if payment was successful
    if (transactionData.status !== "success") {
      return NextResponse.json({ success: false, message: "Payment was not successful" }, { status: 400 })
    }

    // Extract metadata from the transaction
    const metadata = transactionData.metadata || {}
    const customFields = transactionData.custom_fields || {}

    // Get user information
    const userId = metadata.user_id || customFields.user_id || null
    const schoolFeeId = metadata.school_fee_id || customFields.school_fee_id || null
    const feeType = metadata.fee_type || customFields.fee_type || "School Fee"
    const academicSession = metadata.academic_session || customFields.academic_session || "2024/2025"
    const installmentNumber = metadata.installment_number || customFields.installment_number || 1
    const totalInstallments = metadata.total_installments || customFields.total_installments || 1

    let studentInfo = null
    let feeInfo = null

    // Get student information if user_id is available
    if (userId) {
      const userResult = await sql`
        SELECT 
          u.id,
          u.full_name,
          u.matric_number,
          u.email,
          u.phone,
          u.level,
          u.passport_photo,
          d.name as department_name,
          s.name as school_name
        FROM users u
        LEFT JOIN departments d ON u.department_id = d.id
        LEFT JOIN schools s ON u.school_id = s.id
        WHERE u.id = ${userId}
      `

      if (userResult.length > 0) {
        studentInfo = userResult[0]
      }
    }

    // Get fee information if school_fee_id is available
    if (schoolFeeId) {
      const feeResult = await sql`
        SELECT 
          id,
          fee_name,
          description,
          amount as total_amount,
          allows_installments,
          first_installment_percentage,
          second_installment_percentage
        FROM school_fees
        WHERE id = ${schoolFeeId}
      `

      if (feeResult.length > 0) {
        feeInfo = feeResult[0]
      }
    }

    // Generate receipt number
    const receiptNumber = `FPB${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`

    // Save payment to database (only with columns that exist)
    const paymentResult = await sql`
      INSERT INTO payments (
        reference,
        user_id,
        school_fee_id,
        amount,
        status,
        payment_method,
        receipt_number,
        fee_type,
        academic_session,
        installment_number,
        total_installments,
        created_at,
        updated_at
      ) VALUES (
        ${reference},
        ${userId},
        ${schoolFeeId},
        ${transactionData.amount / 100},
        'verified',
        'paystack',
        ${receiptNumber},
        ${feeType},
        ${academicSession},
        ${installmentNumber},
        ${totalInstallments},
        NOW(),
        NOW()
      )
      RETURNING *
    `

    const savedPayment = paymentResult[0]

    // Calculate payment summary
    let totalPaid = Number(savedPayment.amount)
    let balance = 0
    let isFullyPaid = true

    if (feeInfo) {
      const allPayments = await sql`
        SELECT amount FROM payments
        WHERE user_id = ${userId} AND school_fee_id = ${schoolFeeId} AND status = 'verified'
      `

      totalPaid = allPayments.reduce((sum, p) => sum + Number(p.amount), 0)
      balance = Math.max(0, Number(feeInfo.total_amount) - totalPaid)
      isFullyPaid = balance <= 0
    }

    // Send email receipt if student info is available
    if (studentInfo && feeInfo) {
      try {
        const emailData = {
          student: {
            full_name: studentInfo.full_name || "N/A",
            matric_number: studentInfo.matric_number || "N/A",
            email: studentInfo.email || transactionData.customer.email,
            phone: studentInfo.phone || "N/A",
            level: studentInfo.level || "N/A",
            department_name: studentInfo.department_name || "N/A",
            school_name: studentInfo.school_name || "The Federal Polytechnic Bida",
            passport_photo: studentInfo.passport_photo,
          },
          payment: {
            reference: savedPayment.reference,
            receipt_number: savedPayment.receipt_number,
            amount: Number(savedPayment.amount) || 0,
            payment_date: savedPayment.created_at,
            fee_type: savedPayment.fee_type,
            academic_session: savedPayment.academic_session,
            installment_number: Number(savedPayment.installment_number) || 1,
            total_installments: Number(savedPayment.total_installments) || 1,
            payment_method: savedPayment.payment_method || "paystack",
          },
          fee: {
            fee_name: feeInfo.fee_name || "School Fee",
            description: feeInfo.description || "N/A",
            total_amount: Number(feeInfo.total_amount) || 0,
            allows_installments: feeInfo.allows_installments || false,
            first_installment_percentage: Number(feeInfo.first_installment_percentage) || 0,
            second_installment_percentage: Number(feeInfo.second_installment_percentage) || 0,
          },
          summary: {
            total_paid: totalPaid,
            balance: balance,
            is_fully_paid: isFullyPaid,
          },
        }

        const emailHtml = generatePaymentReceiptEmail(emailData)

        await sendEmail({
          to: studentInfo.email,
          subject: `Payment Receipt - ${feeInfo.fee_name} (${savedPayment.reference})`,
          html: emailHtml,
        })

        console.log("Receipt email sent successfully")
      } catch (emailError) {
        console.error("Failed to send email receipt:", emailError)
      }
    }

    // Return success response
    return NextResponse.json({
      success: true,
      message: "Payment verified successfully",
      payment: {
        reference: savedPayment.reference,
        amount: Number(savedPayment.amount),
        status: "verified",
        receipt_number: savedPayment.receipt_number,
        created_at: savedPayment.created_at,
      },
      student: {
        email: studentInfo?.email || transactionData.customer.email,
        full_name:
          studentInfo?.full_name || transactionData.customer.first_name + " " + transactionData.customer.last_name,
      },
    })
  } catch (error) {
    console.error("Payment verification error:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}
