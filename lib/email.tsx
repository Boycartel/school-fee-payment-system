import nodemailer from "nodemailer"
import { generateReceiptPDF } from "./pdf-generator"

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASSWORD,
  },
})

export async function sendPaymentReceiptEmail(receiptData: any) {
  try {
    // Generate PDF receipt
    const pdfBuffer = await generateReceiptPDF(receiptData)

    // Generate HTML email template
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
            .info-row { display: flex; justify-content: space-between; margin: 8px 0; border-bottom: 1px solid #e5e7eb; padding: 8px 0; }
            .info-row:last-child { border-bottom: none; }
            .info-label { font-weight: bold; color: #1e40af; }
            .info-value { color: #333; }
            .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
            .status-paid { color: #059669; font-weight: bold; }
            .amount { color: #059669; font-weight: bold; font-size: 14px; }
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
                <h3 style="color: #1e40af; border-bottom: 2px solid #1e40af; padding-bottom: 10px;">Payment Information</h3>
                <div class="info-row">
                  <span class="info-label">Receipt Number:</span>
                  <span class="info-value">${receiptData.payment.receipt_number}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Reference:</span>
                  <span class="info-value">${receiptData.payment.reference}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Amount Paid:</span>
                  <span class="amount">₦${receiptData.payment.amount.toLocaleString()}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Payment Date:</span>
                  <span class="info-value">${new Date(receiptData.payment.payment_date).toLocaleDateString()}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Status:</span>
                  <span class="status-paid">✓ VERIFIED</span>
                </div>
              </div>
              
              <div class="receipt-info">
                <h3 style="color: #1e40af; border-bottom: 2px solid #1e40af; padding-bottom: 10px;">Student Information</h3>
                <div class="info-row">
                  <span class="info-label">Full Name:</span>
                  <span class="info-value">${receiptData.student.full_name}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Matric Number:</span>
                  <span class="info-value">${receiptData.student.matric_number}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Department:</span>
                  <span class="info-value">${receiptData.student.department_name}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Level:</span>
                  <span class="info-value">${receiptData.student.level}</span>
                </div>
              </div>

              <div class="receipt-info">
                <h3 style="color: #1e40af; border-bottom: 2px solid #1e40af; padding-bottom: 10px;">Payment Summary</h3>
                <div class="info-row">
                  <span class="info-label">Total Fee:</span>
                  <span class="info-value">₦${receiptData.fee.total_amount.toLocaleString()}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Total Paid:</span>
                  <span class="amount">₦${receiptData.summary.total_paid.toLocaleString()}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Balance:</span>
                  <span class="info-value">${receiptData.summary.balance > 0 ? `₦${receiptData.summary.balance.toLocaleString()}` : "FULLY PAID ✓"}</span>
                </div>
              </div>
              
              <p><strong>Note:</strong> A detailed PDF receipt is attached to this email for your records. You can also download your receipt anytime from your student dashboard.</p>
              <p>For verification purposes, reference number: <strong>${receiptData.payment.reference}</strong></p>
            </div>
            
            <div class="footer">
              <p><strong>The Federal Polytechnic Bida</strong></p>
              <p>This is an automated email. Please do not reply to this email.</p>
              <p>For inquiries, contact the Bursary Department</p>
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
    return { success: true }
  } catch (error) {
    console.error("Error sending email:", error)
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
