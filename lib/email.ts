import nodemailer from "nodemailer"
import { generateReceiptPDF } from "./pdf-generator"

const transporter = nodemailer.createTransporter({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASSWORD,
  },
})

interface EmailReceiptData {
  student: {
    full_name: string
    matric_number: string
    department: string
    level: string
    school: string
    email: string
  }
  payment: {
    reference: string
    receipt_number: string
    amount: number
    payment_date: string
    session: string
    status: string
  }
  fees: Array<{
    fee_name: string
    amount: number
  }>
  summary: {
    total_paid: number
    balance: number
  }
}

export async function sendPaymentReceiptEmail(receiptData: EmailReceiptData): Promise<boolean> {
  try {
    // Generate PDF
    const pdfBuffer = await generateReceiptPDF(receiptData)

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; background: #1e40af; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 20px; }
            .receipt-info { background: white; padding: 15px; border-radius: 8px; margin: 15px 0; }
            .info-row { display: flex; justify-content: space-between; margin: 8px 0; }
            .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
            .status-paid { color: #059669; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Payment Receipt</h1>
              <p>The Federal Polytechnic Bida</p>
            </div>
            
            <div class="content">
              <p>Dear ${receiptData.student.full_name},</p>
              <p>Your payment has been successfully processed. Please find your receipt details below:</p>
              
              <div class="receipt-info">
                <h3>Payment Information</h3>
                <div class="info-row">
                  <span>Receipt Number:</span>
                  <span><strong>${receiptData.payment.receipt_number}</strong></span>
                </div>
                <div class="info-row">
                  <span>Reference:</span>
                  <span>${receiptData.payment.reference}</span>
                </div>
                <div class="info-row">
                  <span>Amount Paid:</span>
                  <span><strong>₦${receiptData.payment.amount.toLocaleString()}</strong></span>
                </div>
                <div class="info-row">
                  <span>Payment Date:</span>
                  <span>${new Date(receiptData.payment.payment_date).toLocaleDateString()}</span>
                </div>
                <div class="info-row">
                  <span>Status:</span>
                  <span class="status-paid">${receiptData.payment.status}</span>
                </div>
              </div>
              
              <div class="receipt-info">
                <h3>Student Information</h3>
                <div class="info-row">
                  <span>Matric Number:</span>
                  <span>${receiptData.student.matric_number}</span>
                </div>
                <div class="info-row">
                  <span>Department:</span>
                  <span>${receiptData.student.department}</span>
                </div>
                <div class="info-row">
                  <span>Level:</span>
                  <span>${receiptData.student.level}</span>
                </div>
              </div>
              
              <p><strong>Note:</strong> A detailed PDF receipt is attached to this email for your records.</p>
              <p>You can also verify this payment online using the reference number: <strong>${receiptData.payment.reference}</strong></p>
            </div>
            
            <div class="footer">
              <p>This is an automated email from The Federal Polytechnic Bida</p>
              <p>Please do not reply to this email</p>
            </div>
          </div>
        </body>
      </html>
    `

    const mailOptions = {
      from: `"The Federal Polytechnic Bida" <${process.env.GMAIL_USER}>`,
      to: receiptData.student.email,
      subject: `Payment Receipt - ${receiptData.payment.receipt_number}`,
      html: htmlContent,
      attachments: [
        {
          filename: `Receipt-${receiptData.payment.receipt_number}.pdf`,
          content: pdfBuffer,
          contentType: "application/pdf",
        },
      ],
    }

    await transporter.sendMail(mailOptions)
    return true
  } catch (error) {
    console.error("Error sending email:", error)
    return false
  }
}
