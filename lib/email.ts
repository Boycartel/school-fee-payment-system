import nodemailer from "nodemailer"

interface EmailOptions {
  to: string
  subject: string
  html: string
  attachments?: Array<{
    filename: string
    content: Buffer
    contentType: string
  }>
}

interface EmailResult {
  success: boolean
  messageId?: string
  error?: string
}

// Create transporter with Gmail SMTP configuration
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // Use SSL
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASSWORD,
    },
  })
}

export async function sendEmail(options: EmailOptions): Promise<EmailResult> {
  try {
    console.log("Sending email to:", options.to)

    if (!process.env.GMAIL_USER || !process.env.GMAIL_PASSWORD) {
      throw new Error("Gmail credentials not configured")
    }

    const transporter = createTransporter()

    const mailOptions = {
      from: {
        name: "The Federal Polytechnic Bida",
        address: process.env.GMAIL_USER,
      },
      to: options.to,
      subject: options.subject,
      html: options.html,
      attachments: options.attachments,
    }

    const result = await transporter.sendMail(mailOptions)
    console.log("Email sent successfully:", result.messageId)

    return {
      success: true,
      messageId: result.messageId,
    }
  } catch (error) {
    console.error("Failed to send email:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

export async function sendEmailWithAttachment(
  to: string,
  subject: string,
  html: string,
  attachments: Array<{
    filename: string
    content: Buffer
    contentType: string
  }>,
): Promise<EmailResult> {
  return sendEmail({
    to,
    subject,
    html,
    attachments,
  })
}

// Template for payment confirmation email
export function getPaymentConfirmationTemplate(data: {
  studentName: string
  amount: number
  reference: string
  receiptNumber: string
  paymentDate: string
}) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Payment Confirmation</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #1e40af; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .footer { padding: 20px; text-align: center; color: #666; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Payment Confirmation</h1>
                <p>The Federal Polytechnic Bida</p>
            </div>
            <div class="content">
                <h2>Dear ${data.studentName},</h2>
                <p>Your payment has been successfully processed.</p>
                <ul>
                    <li><strong>Amount:</strong> ₦${data.amount.toLocaleString()}</li>
                    <li><strong>Reference:</strong> ${data.reference}</li>
                    <li><strong>Receipt Number:</strong> ${data.receiptNumber}</li>
                    <li><strong>Date:</strong> ${data.paymentDate}</li>
                </ul>
                <p>Thank you for your payment.</p>
            </div>
            <div class="footer">
                <p>&copy; 2024 The Federal Polytechnic Bida</p>
            </div>
        </div>
    </body>
    </html>
  `
}
