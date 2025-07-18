import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "talk2boycartel@gmail.com",
    pass: "dyjuroiowjvhmswa",
  },
})

export async function sendEmail(to: string, subject: string, html: string) {
  try {
    const mailOptions = {
      from: {
        name: "The Federal Polytechnic Bida",
        address: "talk2boycartel@gmail.com",
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
