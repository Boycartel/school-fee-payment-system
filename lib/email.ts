import nodemailer from "nodemailer"

const transporter = nodemailer.createTransporter({
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
    content: Buffer
    contentType: string
  }>
}

export async function sendEmail({ to, subject, html }: EmailOptions) {
  try {
    const info = await transporter.sendMail({
      from: `"Federal Polytechnic Bida" <${process.env.GMAIL_USER}>`,
      to,
      subject,
      html,
    })

    console.log("Email sent:", info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error("Email sending failed:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

export async function sendEmailWithAttachment({ to, subject, html, attachments }: EmailOptions) {
  try {
    const info = await transporter.sendMail({
      from: `"Federal Polytechnic Bida" <${process.env.GMAIL_USER}>`,
      to,
      subject,
      html,
      attachments,
    })

    console.log("Email with attachment sent:", info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error("Email sending failed:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

export function getPaymentConfirmationTemplate(studentName: string, amount: number, reference: string) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Payment Confirmation</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background: #1e40af;
          color: white;
          padding: 20px;
          text-align: center;
          border-radius: 8px 8px 0 0;
        }
        .content {
          background: #f8f9fa;
          padding: 30px;
          border-radius: 0 0 8px 8px;
        }
        .highlight {
          background: #e3f2fd;
          padding: 15px;
          border-radius: 5px;
          margin: 20px 0;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          font-size: 12px;
          color: #666;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Payment Confirmation</h1>
        <p>The Federal Polytechnic Bida</p>
      </div>
      
      <div class="content">
        <p>Dear ${studentName},</p>
        
        <p>We are pleased to confirm that your school fee payment has been successfully processed.</p>
        
        <div class="highlight">
          <h3>Payment Details:</h3>
          <p><strong>Amount Paid:</strong> ₦${amount.toLocaleString()}</p>
          <p><strong>Reference Number:</strong> ${reference}</p>
          <p><strong>Date:</strong> ${new Date().toLocaleDateString("en-GB")}</p>
          <p><strong>Status:</strong> Successful</p>
        </div>
        
        <p>Please find your official payment receipt attached to this email. Keep this receipt for your records as proof of payment.</p>
        
        <p>If you have any questions or concerns regarding this payment, please contact the Bursary Department.</p>
        
        <p>Thank you for your prompt payment.</p>
        
        <p>Best regards,<br>
        <strong>The Bursary Department</strong><br>
        The Federal Polytechnic Bida</p>
      </div>
      
      <div class="footer">
        <p>This is an automated email. Please do not reply to this message.</p>
      </div>
    </body>
    </html>
  `
}

export function getActivationTemplate(studentName: string, matricNumber: string, tempPassword: string) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Account Activation</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background: #1e40af;
          color: white;
          padding: 20px;
          text-align: center;
          border-radius: 8px 8px 0 0;
        }
        .content {
          background: #f8f9fa;
          padding: 30px;
          border-radius: 0 0 8px 8px;
        }
        .credentials {
          background: #e3f2fd;
          padding: 15px;
          border-radius: 5px;
          margin: 20px 0;
        }
        .warning {
          background: #fff3cd;
          border: 1px solid #ffeaa7;
          padding: 15px;
          border-radius: 5px;
          margin: 20px 0;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          font-size: 12px;
          color: #666;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Welcome to FedPoly Bida Portal</h1>
        <p>Account Activation</p>
      </div>
      
      <div class="content">
        <p>Dear ${studentName},</p>
        
        <p>Your student account has been successfully activated. You can now access the school fee payment portal using the credentials below:</p>
        
        <div class="credentials">
          <h3>Login Credentials:</h3>
          <p><strong>Matric Number:</strong> ${matricNumber}</p>
          <p><strong>Temporary Password:</strong> ${tempPassword}</p>
        </div>
        
        <div class="warning">
          <p><strong>Important Security Notice:</strong></p>
          <p>Please change your password immediately after your first login for security purposes.</p>
        </div>
        
        <p>You can access the portal at: <a href="${process.env.NEXT_PUBLIC_BASE_URL}/student/login">${process.env.NEXT_PUBLIC_BASE_URL}/student/login</a></p>
        
        <p>If you have any questions or need assistance, please contact the IT Support team.</p>
        
        <p>Best regards,<br>
        <strong>IT Support Team</strong><br>
        The Federal Polytechnic Bida</p>
      </div>
      
      <div class="footer">
        <p>This is an automated email. Please do not reply to this message.</p>
      </div>
    </body>
    </html>
  `
}
