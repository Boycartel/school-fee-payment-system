import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/database"
import { sendEmail } from "@/lib/email"
import { generatePaymentReceiptEmail } from "@/lib/email-templates"

export async function POST(request: NextRequest) {
  try {
    const { reference } = await request.json()

    if (!reference) {
      return NextResponse.json(
        {
          success: false,
          message: "Payment reference is required",
        },
        { status: 400 },
      )
    }

    console.log("Verifying payment with reference:", reference)

    // Check if payment already exists and is verified
    const existingPayment = await sql`
      SELECT p.*, u.full_name, u.email, u.matric_number, u.level, u.phone, u.passport_photo,
             d.name as department_name, s.name as school_name,
             sf.fee_name, sf.amount as total_fee_amount, sf.academic_session
      FROM payments p
      LEFT JOIN users u ON p.user_id = u.id
      LEFT JOIN departments d ON u.department_id = d.id
      LEFT JOIN schools s ON u.school_id = s.id
      LEFT JOIN school_fees sf ON p.school_fee_id = sf.id
      WHERE p.reference = ${reference}
      LIMIT 1
    `

    if (existingPayment.length > 0 && existingPayment[0].status === "verified") {
      console.log("Payment already verified:", reference)
      return NextResponse.json({
        success: true,
        message: "Payment already verified",
        payment: {
          reference: existingPayment[0].reference,
          amount: Number(existingPayment[0].amount),
          status: "verified",
          receipt_number: existingPayment[0].receipt_number,
          created_at: existingPayment[0].created_at,
        },
        student: {
          email: existingPayment[0].email || "N/A",
          full_name: existingPayment[0].full_name || "N/A",
        },
      })
    }

    // Verify payment with Paystack
    console.log("Verifying with Paystack...")
    const paystackResponse = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
    })

    if (!paystackResponse.ok) {
      console.error("Paystack verification failed:", paystackResponse.status)
      return NextResponse.json(
        {
          success: false,
          message: "Failed to verify payment with Paystack",
        },
        { status: 500 },
      )
    }

    const paystackData = await paystackResponse.json()
    console.log("Paystack response:", paystackData)

    if (!paystackData.status || !paystackData.data) {
      console.error("Invalid Paystack response:", paystackData)
      return NextResponse.json(
        {
          success: false,
          message: "Invalid payment reference",
        },
        { status: 400 },
      )
    }

    const transactionData = paystackData.data

    // Check if payment was successful
    if (transactionData.status !== "success") {
      console.error("Payment not successful:", transactionData.status)
      return NextResponse.json(
        {
          success: false,
          message: `Payment status: ${transactionData.status}`,
        },
        { status: 400 },
      )
    }

    console.log("Payment successful, processing...")

    // Extract metadata from the transaction
    const metadata = transactionData.metadata || {}
    const customFields = transactionData.custom_fields || {}

    // Get user information from metadata or custom fields
    const userId = metadata.user_id || customFields.user_id || null
    const schoolFeeId = metadata.school_fee_id || customFields.school_fee_id || null
    const feeType = metadata.fee_type || customFields.fee_type || "School Fee"
    const academicSession = metadata.academic_session || customFields.academic_session || "2024/2025"
    const installmentNumber = metadata.installment_number || customFields.installment_number || 1
    const totalInstallments = metadata.total_installments || customFields.total_installments || 1
    const isFullPayment = metadata.is_full_payment || customFields.is_full_payment || false

    console.log("Payment metadata:", { userId, schoolFeeId, feeType, installmentNumber, isFullPayment })

    let studentInfo = null
    let feeInfo = null

    // Get student information
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
        console.log("Student found:", studentInfo.full_name)
      }
    }

    // Get fee information
    if (schoolFeeId) {
      const feeResult = await sql`
        SELECT 
          id,
          fee_name,
          description,
          amount as total_amount,
          academic_session,
          allows_installments,
          first_installment_percentage,
          second_installment_percentage
        FROM school_fees
        WHERE id = ${schoolFeeId}
      `

      if (feeResult.length > 0) {
        feeInfo = feeResult[0]
        console.log("Fee found:", feeInfo.fee_name)
      }
    }

    // Generate receipt number
    const receiptNumber = `FPB${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`

    // Save payment to database
    console.log("Saving payment to database...")
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
        is_full_payment,
        user_email,
        user_name,
        paystack_data,
        payment_date,
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
        ${isFullPayment},
        ${transactionData.customer.email},
        ${studentInfo?.full_name || `${transactionData.customer.first_name || ""} ${transactionData.customer.last_name || ""}`.trim()},
        ${JSON.stringify(transactionData)},
        NOW(),
        NOW(),
        NOW()
      )
      ON CONFLICT (reference) DO UPDATE SET
        status = 'verified',
        payment_date = NOW(),
        updated_at = NOW()
      RETURNING *
    `

    const savedPayment = paymentResult[0]
    console.log("Payment saved:", savedPayment.id)

    // Calculate payment summary
    let totalPaid = Number(savedPayment.amount)
    let balance = 0
    let isFullyPaid = true

    if (feeInfo && userId && schoolFeeId) {
      const allPayments = await sql`
        SELECT amount FROM payments
        WHERE user_id = ${userId} AND school_fee_id = ${schoolFeeId} AND status = 'verified'
      `

      totalPaid = allPayments.reduce((sum, p) => sum + Number(p.amount), 0)
      balance = Math.max(0, Number(feeInfo.total_amount) - totalPaid)
      isFullyPaid = balance <= 0

      console.log("Payment summary:", { totalPaid, balance, isFullyPaid })
    }

    // Send email receipt
    const emailRecipient = studentInfo?.email || transactionData.customer.email
    if (emailRecipient) {
      try {
        console.log("Sending email receipt to:", emailRecipient)

        const emailData = {
          student: {
            full_name:
              studentInfo?.full_name ||
              `${transactionData.customer.first_name || ""} ${transactionData.customer.last_name || ""}`.trim() ||
              "Student",
            matric_number: studentInfo?.matric_number || "N/A",
            email: emailRecipient,
            phone: studentInfo?.phone || "N/A",
            level: studentInfo?.level || "N/A",
            department_name: studentInfo?.department_name || "N/A",
            school_name: studentInfo?.school_name || "The Federal Polytechnic Bida",
            passport_photo: studentInfo?.passport_photo,
          },
          payment: {
            reference: savedPayment.reference,
            receipt_number: savedPayment.receipt_number,
            amount: Number(savedPayment.amount) || 0,
            payment_date: savedPayment.payment_date || savedPayment.created_at,
            fee_type: savedPayment.fee_type || "School Fee",
            academic_session: savedPayment.academic_session || "2024/2025",
            installment_number: Number(savedPayment.installment_number) || 1,
            total_installments: Number(savedPayment.total_installments) || 1,
            payment_method: "Paystack",
          },
          fee: {
            fee_name: feeInfo?.fee_name || "School Fee",
            description: feeInfo?.description || "School Fee Payment",
            total_amount: Number(feeInfo?.total_amount) || Number(savedPayment.amount),
            allows_installments: feeInfo?.allows_installments || false,
            first_installment_percentage: Number(feeInfo?.first_installment_percentage) || 0,
            second_installment_percentage: Number(feeInfo?.second_installment_percentage) || 0,
          },
          summary: {
            total_paid: totalPaid,
            balance: balance,
            is_fully_paid: isFullyPaid,
          },
        }

        const emailHtml = generatePaymentReceiptEmail(emailData)

        const emailResult = await sendEmail({
          to: emailRecipient,
          subject: `Payment Receipt - ${emailData.fee.fee_name} (${savedPayment.receipt_number})`,
          html: emailHtml,
        })

        console.log("Email sent successfully:", emailResult.success)
      } catch (emailError) {
        console.error("Failed to send email receipt:", emailError)
        // Don't fail the payment verification if email fails
      }
    } else {
      console.log("No email recipient found")
    }

    // Update fee status if needed
    if (userId && schoolFeeId && (isFullPayment || installmentNumber)) {
      try {
        if (isFullPayment) {
          // Mark both installments as paid for full payment
          await sql`
            UPDATE school_fees 
            SET first_installment_paid = true, second_installment_paid = true, updated_at = NOW()
            WHERE id = ${schoolFeeId}
          `
        } else if (installmentNumber === 1) {
          // Mark first installment as paid
          await sql`
            UPDATE school_fees 
            SET first_installment_paid = true, updated_at = NOW()
            WHERE id = ${schoolFeeId}
          `
        } else if (installmentNumber === 2) {
          // Mark second installment as paid
          await sql`
            UPDATE school_fees 
            SET second_installment_paid = true, updated_at = NOW()
            WHERE id = ${schoolFeeId}
          `
        }
        console.log("Fee status updated")
      } catch (updateError) {
        console.error("Failed to update fee status:", updateError)
      }
    }

    // Return success response
    console.log("Payment verification completed successfully")
    return NextResponse.json({
      success: true,
      message: "Payment verified successfully",
      payment: {
        reference: savedPayment.reference,
        amount: Number(savedPayment.amount),
        status: "verified",
        receipt_number: savedPayment.receipt_number,
        created_at: savedPayment.created_at,
        fee_type: savedPayment.fee_type,
        academic_session: savedPayment.academic_session,
      },
      student: {
        email: emailRecipient,
        full_name:
          studentInfo?.full_name ||
          `${transactionData.customer.first_name || ""} ${transactionData.customer.last_name || ""}`.trim() ||
          "Student",
      },
    })
  } catch (error) {
    console.error("Payment verification error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error during payment verification",
      },
      { status: 500 },
    )
  }
}
