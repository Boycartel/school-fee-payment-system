import nodemailer from "nodemailer"

// Create transporter for Gmail SMTP
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // Use SSL
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASSWORD,
  },
})

export interface EmailOptions {
  to: string
  subject: string
  html: string
  attachments?: Array<{
    filename: string
    content: Buffer
    contentType: string
  }>
}

export async function sendEmail(options: EmailOptions) {
  try {
    console.log("Sending email to:", options.to)

    const result = await transporter.sendMail({
      from: `"Federal Polytechnic Bida" <${process.env.GMAIL_USER}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      attachments: options.attachments,
    })

    console.log("Email sent successfully:", result.messageId)
    return { success: true, messageId: result.messageId }
  } catch (error) {
    console.error("Failed to send email:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

export async function sendEmailWithAttachment(options: EmailOptions) {
  return sendEmail(options)
}

export function getPaymentConfirmationTemplate(data: {
  studentName: string
  matricNumber: string
  amount: number
  reference: string
  paymentDate: string
}) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #1e40af; text-align: center;">Payment Confirmation</h2>
      <p>Dear ${data.studentName},</p>
      <p>This is to confirm that your payment has been successfully processed.</p>
      
      <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0;">Payment Details:</h3>
        <p><strong>Amount:</strong> ₦${data.amount.toLocaleString()}</p>
        <p><strong>Reference:</strong> ${data.reference}</p>
        <p><strong>Date:</strong> ${data.paymentDate}</p>
        <p><strong>Matric Number:</strong> ${data.matricNumber}</p>
      </div>
      
      <p>Thank you for your payment.</p>
      <p>Best regards,<br>Federal Polytechnic Bida</p>
    </div>
  `
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
