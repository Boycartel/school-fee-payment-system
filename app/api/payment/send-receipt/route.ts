import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { generateReceiptPDF } from "@/lib/pdf-generator"
import { sendEmailWithAttachment, getPaymentConfirmationTemplate } from "@/lib/email"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: NextRequest) {
  try {
    const { reference } = await request.json()

    if (!reference) {
      return NextResponse.json({ error: "Payment reference is required" }, { status: 400 })
    }

    // Get payment details with student information
    const paymentQuery = `
      SELECT 
        p.id,
        p.reference,
        p.amount,
        p.status,
        p.created_at,
        u.matric_number,
        u.first_name,
        u.last_name,
        u.email,
        u.phone,
        s.school_name as school,
        d.department_name as department,
        u.level
      FROM payments p
      JOIN users u ON p.user_id = u.id
      LEFT JOIN schools s ON u.school_id = s.id
      LEFT JOIN departments d ON u.department_id = d.id
      WHERE p.reference = $1 AND p.status = 'success'
    `

    const payments = await sql(paymentQuery, [reference])

    if (payments.length === 0) {
      return NextResponse.json({ error: "Payment not found or not successful" }, { status: 404 })
    }

    const payment = payments[0]

    // Get fee details for this payment
    const feesQuery = `
      SELECT 
        sf.fee_name,
        sf.amount
      FROM student_fees sf
      JOIN users u ON sf.user_id = u.id
      JOIN payments p ON p.user_id = u.id
      WHERE p.reference = $1 AND sf.status = 'paid'
    `

    const fees = await sql(feesQuery, [reference])

    // Prepare payment data for PDF generation
    const paymentData = {
      id: payment.id,
      reference: payment.reference,
      amount: payment.amount,
      status: payment.status,
      created_at: payment.created_at,
      student: {
        matric_number: payment.matric_number,
        first_name: payment.first_name,
        last_name: payment.last_name,
        email: payment.email,
        phone: payment.phone,
        school: payment.school || "N/A",
        department: payment.department || "N/A",
        level: payment.level,
      },
      fees: fees.map((fee) => ({
        fee_name: fee.fee_name,
        amount: fee.amount,
      })),
    }

    // Generate PDF receipt
    console.log("Generating PDF receipt...")
    const pdfBuffer = await generateReceiptPDF(paymentData)

    // Prepare email content
    const studentName = `${payment.first_name} ${payment.last_name}`
    const emailHtml = getPaymentConfirmationTemplate(studentName, payment.amount, payment.reference)

    // Send email with PDF attachment
    console.log("Sending email with receipt...")
    const emailResult = await sendEmailWithAttachment({
      to: payment.email,
      subject: `Payment Receipt - ${payment.reference}`,
      html: emailHtml,
      attachments: [
        {
          filename: `Receipt_${payment.reference}.pdf`,
          content: pdfBuffer,
          contentType: "application/pdf",
        },
      ],
    })

    if (emailResult.success) {
      return NextResponse.json({
        success: true,
        message: "Receipt sent successfully",
        messageId: emailResult.messageId,
      })
    } else {
      return NextResponse.json({ error: "Failed to send receipt email", details: emailResult.error }, { status: 500 })
    }
  } catch (error) {
    console.error("Send receipt error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
