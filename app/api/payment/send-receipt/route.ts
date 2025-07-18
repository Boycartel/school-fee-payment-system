import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { sendEmailWithAttachment } from "@/lib/email"
import { generateReceiptPDF } from "@/lib/pdf-generator"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: NextRequest) {
  try {
    const { reference } = await request.json()

    if (!reference) {
      return NextResponse.json({ success: false, error: "Payment reference is required" }, { status: 400 })
    }

    // Get payment details with all related information
    const paymentResult = await sql`
      SELECT 
        p.*,
        u.full_name,
        u.matric_number,
        u.email,
        u.phone,
        u.passport_photo,
        u.level,
        d.department_name,
        s.school_name,
        sf.fee_name,
        sf.description,
        sf.total_amount,
        sf.allows_installments,
        sf.first_installment_percentage,
        sf.second_installment_percentage,
        sf.first_installment_paid,
        sf.second_installment_paid
      FROM payments p
      JOIN users u ON p.user_id = u.id
      JOIN departments d ON u.department_id = d.id
      JOIN schools s ON d.school_id = s.id
      JOIN school_fees sf ON p.school_fee_id = sf.id
      WHERE p.reference = ${reference}
        AND p.status = 'verified'
    `

    if (paymentResult.length === 0) {
      return NextResponse.json({ success: false, error: "Payment not found or not verified" }, { status: 404 })
    }

    const payment = paymentResult[0]

    // Calculate payment summary
    const allPaymentsResult = await sql`
      SELECT amount, installment_number, created_at as payment_date
      FROM payments
      WHERE user_id = ${payment.user_id}
        AND school_fee_id = ${payment.school_fee_id}
        AND status = 'verified'
      ORDER BY created_at ASC
    `

    const totalPaid = allPaymentsResult.reduce((sum, p) => sum + Number(p.amount), 0)
    const balance = Number(payment.total_amount) - totalPaid
    const isFullyPaid = balance <= 0

    // Prepare receipt data
    const receiptData = {
      payment: {
        id: payment.id,
        reference: payment.reference,
        receipt_number: payment.receipt_number,
        amount: Number(payment.amount),
        payment_date: payment.created_at,
        fee_type: payment.fee_type,
        academic_session: payment.academic_session,
        installment_number: payment.installment_number,
        total_installments: payment.total_installments,
        payment_method: payment.payment_method,
      },
      student: {
        full_name: payment.full_name,
        matric_number: payment.matric_number,
        email: payment.email,
        phone: payment.phone,
        passport_photo: payment.passport_photo,
        level: payment.level,
        department_name: payment.department_name,
        school_name: payment.school_name,
      },
      fee: {
        fee_name: payment.fee_name,
        description: payment.description,
        total_amount: Number(payment.total_amount),
        allows_installments: payment.allows_installments,
        first_installment_percentage: Number(payment.first_installment_percentage),
        second_installment_percentage: Number(payment.second_installment_percentage),
      },
      summary: {
        total_paid: totalPaid,
        balance: Math.max(0, balance),
        is_fully_paid: isFullyPaid,
        all_payments: allPaymentsResult.map((p) => ({
          amount: Number(p.amount),
          installment_number: p.installment_number,
          payment_date: p.payment_date,
        })),
      },
    }

    // Generate PDF receipt
    const pdfBuffer = await generateReceiptPDF(receiptData)

    // Prepare email content
    const emailSubject = `Payment Receipt - ${payment.fee_name} (${payment.reference})`
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; border-bottom: 2px solid #0e1c36; padding-bottom: 20px; margin-bottom: 30px;">
          <h1 style="color: #0e1c36; margin: 0;">The Federal Polytechnic Bida</h1>
          <p style="color: #4a90e2; margin: 5px 0;">Fee Confirmation System</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #0e1c36; margin: 0 0 15px 0;">Payment Confirmation</h2>
          <p>Dear <strong>${payment.full_name}</strong>,</p>
          <p>Your payment has been successfully processed. Please find your official receipt attached to this email.</p>
        </div>
        
        <div style="background: #e7f3ff; border-left: 4px solid #4a90e2; padding: 15px; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0; color: #0e1c36;">Payment Details:</h3>
          <ul style="margin: 0; padding-left: 20px;">
            <li><strong>Reference:</strong> ${payment.reference}</li>
            <li><strong>Amount:</strong> ₦${Number(payment.amount).toLocaleString()}</li>
            <li><strong>Fee Type:</strong> ${payment.fee_name}</li>
            <li><strong>Academic Session:</strong> ${payment.academic_session}</li>
            <li><strong>Receipt Number:</strong> ${payment.receipt_number}</li>
          </ul>
        </div>
        
        <div style="background: #d4edda; border: 1px solid #c3e6cb; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 0; color: #155724;"><strong>✓ Payment Status:</strong> Verified and Confirmed</p>
        </div>
        
        <p>You can also view and print your receipt online by visiting your student dashboard.</p>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6;">
          <p style="color: #666; font-size: 12px; margin: 0;">
            <strong>The Federal Polytechnic Bida</strong><br>
            Automated Fee Confirmation System<br>
            This is an automated email. Please do not reply to this message.
          </p>
        </div>
      </div>
    `

    // Send email with PDF attachment
    const emailResult = await sendEmailWithAttachment(payment.email, emailSubject, emailHtml, [
      {
        filename: `Receipt_${payment.reference}.pdf`,
        content: pdfBuffer,
        contentType: "application/pdf",
      },
    ])

    if (emailResult.success) {
      return NextResponse.json({
        success: true,
        message: "Receipt sent successfully to your email",
        messageId: emailResult.messageId,
      })
    } else {
      return NextResponse.json({ success: false, error: "Failed to send receipt email" }, { status: 500 })
    }
  } catch (error) {
    console.error("Send receipt error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
