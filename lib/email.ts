import nodemailer from "nodemailer"
import { generateReceiptPDF } from "./pdf-generator"
import { getPaymentConfirmationTemplate } from "./email-templates"

// Create transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASSWORD,
  },
})

export async function sendPaymentReceiptEmail(
  email: string,
  receiptData: any,
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log(`[Email] Attempting to send receipt to: ${email}`)

    // Generate PDF
    let pdfBuffer: Buffer | null = null
    try {
      console.log("[Email] Generating PDF...")
      pdfBuffer = await generateReceiptPDF(receiptData)
      console.log("[Email] PDF generated successfully")
    } catch (pdfError) {
      console.error("[Email] PDF generation failed:", pdfError)
      // Continue with email anyway, just without PDF
    }

    // Get HTML template
    const htmlTemplate = getPaymentConfirmationTemplate(receiptData)

    // Prepare attachments
    const attachments = []
    if (pdfBuffer) {
      attachments.push({
        filename: `Receipt-${receiptData.payment.receipt_number}.pdf`,
        content: pdfBuffer,
        contentType: "application/pdf",
      })
    }

    // Send email
    const mailOptions = {
      from: `"The Federal Polytechnic Bida" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: `Payment Receipt - Reference: ${receiptData.payment.reference}`,
      html: htmlTemplate,
      attachments: attachments,
    }

    const result = await transporter.sendMail(mailOptions)
    console.log("[Email] Email sent successfully:", result.messageId)
    return { success: true }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    console.error("[Email] Failed to send payment receipt email:", errorMessage)
    return {
      success: false,
      error: errorMessage,
    }
  }
}
