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

export async function sendEmail(options: { to: string; subject: string; html: string }) {
  try {
    const mailOptions = {
      from: {
        name: "The Federal Polytechnic Bida",
        address: process.env.GMAIL_USER,
      },
      to: options.to,
      subject: options.subject,
      html: options.html,
    }

    const result = await transporter.sendMail(mailOptions)
    console.log("Email sent successfully:", result.messageId)
    return { success: true, messageId: result.messageId }
  } catch (error) {
    console.error("Email sending failed:", error)
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
