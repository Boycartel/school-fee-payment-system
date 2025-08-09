import nodemailer from "nodemailer"
import { generateReceiptPDF } from "./pdf-generator"

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASSWORD,
  },
})

interface EmailOptions {
  to: string
  subject: string
  html: string
  attachments?: Array<{
    filename: string
    content: Buffer | string
    contentType?: string
    encoding?: string
  }>
}

export async function sendEmail(options: EmailOptions) {
  try {
    const mailOptions = {
      from: {
        name: "The Federal Polytechnic Bida",
        address: process.env.GMAIL_USER,
      },
      to: options.to,
      subject: options.subject,
      html: options.html,
      attachments: options.attachments || [],
    }

    const result = await transporter.sendMail(mailOptions)
    console.log("Email sent successfully:", result.messageId)
    return { success: true, messageId: result.messageId }
  } catch (error) {
    console.error("Email sending failed:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

export async function sendPaymentReceiptEmail(receiptData: any) {
  try {
    // Generate PDF receipt
    const pdfBuffer = await generateReceiptPDF(receiptData)

    // Generate HTML email template
    const { generatePaymentReceiptEmail } = await import("./email-templates")
    const emailHtml = generatePaymentReceiptEmail(receiptData)

    // Send email with PDF attachment
    const emailResult = await sendEmail({
      to: receiptData.student.email,
      subject: `Payment Receipt - ${receiptData.fee.fee_name} (${receiptData.payment.receipt_number})`,
      html: emailHtml,
      attachments: [
        {
          filename: `Receipt-${receiptData.payment.receipt_number}.pdf`,
          content: pdfBuffer,
          contentType: "application/pdf",
        },
      ],
    })

    return emailResult
  } catch (error) {
    console.error("Failed to send payment receipt email:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

export async function verifyEmailConnection() {
  try {
    await transporter.verify()
    console.log("Email server connection verified")
    return true
  } catch (error) {
    console.error("Email server connection failed:", error)
    return false
  }
}
