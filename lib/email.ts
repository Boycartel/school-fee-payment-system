import nodemailer from "nodemailer"

const transporter = nodemailer.createTransporter({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // Use SSL
  auth: {
    user: process.env.GMAIL_USER || "talk2boycartel@gmail.com",
    pass: process.env.GMAIL_PASSWORD || "ylfrgfpabtlstydjRequires",
  },
})

export async function sendEmail(to: string, subject: string, html: string) {
  try {
    const mailOptions = {
      from: {
        name: "The Federal Polytechnic Bida",
        address: process.env.GMAIL_USER || "talk2boycartel@gmail.com",
      },
      to,
      subject,
      html,
    }

    const result = await transporter.sendMail(mailOptions)
    console.log("Email sent successfully:", result.messageId)
    return { success: true, messageId: result.messageId }
  } catch (error) {
    console.error("Email sending failed:", error)
    return { success: false, error: error.message }
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
) {
  try {
    const mailOptions = {
      from: {
        name: "The Federal Polytechnic Bida",
        address: process.env.GMAIL_USER || "talk2boycartel@gmail.com",
      },
      to,
      subject,
      html,
      attachments,
    }

    const result = await transporter.sendMail(mailOptions)
    console.log("Email with attachment sent successfully:", result.messageId)
    return { success: true, messageId: result.messageId }
  } catch (error) {
    console.error("Email with attachment sending failed:", error)
    return { success: false, error: error.message }
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
