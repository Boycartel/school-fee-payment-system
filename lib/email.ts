import nodemailer from "nodemailer"
import { ReceiptPDF } from "@/components/receipt-pdf"
import { render } from "@react-pdf/renderer"

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

export async function sendPaymentReceiptEmail(
  to: string,
  subject: string,
  html: string,
  receiptData: any
) {
  try {
    // Generate the PDF buffer
    const pdfBuffer = await generateReceiptPDF(receiptData)

    // Send email with PDF attachment
    return await sendEmail({
      to,
      subject,
      html,
      attachments: [
        {
          filename: `payment-receipt-${receiptData.payment.receipt_number}.pdf`,
          content: pdfBuffer,
          contentType: "application/pdf",
        },
      ],
    })
  } catch (error) {
    console.error("Failed to send payment receipt email:", error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to send payment receipt" 
    }
  }
}

async function generateReceiptPDF(receiptData: any): Promise<Buffer> {
  try {
    // Create a PDF document
    const pdfStream = await render(<ReceiptPDF receipt={receiptData} />)
    
    // Convert to buffer
    return new Promise((resolve, reject) => {
      const chunks: Uint8Array[] = []
      pdfStream.on("data", (chunk) => chunks.push(chunk))
      pdfStream.on("end", () => resolve(Buffer.concat(chunks)))
      pdfStream.on("error", reject)
    })
  } catch (error) {
    console.error("Error generating PDF:", error)
    throw error
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
