import nodemailer from "nodemailer"

interface EmailOptions {
  to: string
  subject: string
  html: string
}

interface EmailWithAttachmentOptions extends EmailOptions {
  attachments?: Array<{
    filename: string
    content: Buffer
    contentType: string
  }>
}

export async function sendEmail(options: EmailOptions) {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASSWORD,
      },
    })

    const mailOptions = {
      from: `"The Federal Polytechnic Bida" <${process.env.GMAIL_USER}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
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

export async function sendEmailWithAttachment(options: EmailWithAttachmentOptions) {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASSWORD,
      },
    })

    const mailOptions = {
      from: `"The Federal Polytechnic Bida" <${process.env.GMAIL_USER}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      attachments: options.attachments,
    }

    const result = await transporter.sendMail(mailOptions)
    console.log("Email with attachment sent successfully:", result.messageId)

    return {
      success: true,
      messageId: result.messageId,
    }
  } catch (error) {
    console.error("Failed to send email with attachment:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

export function getPaymentConfirmationTemplate({
  studentName,
  amount,
  reference,
  matricNumber,
  department,
  level,
  session,
  purpose,
  date = new Date(),
}: {
  studentName: string
  amount: number
  reference: string
  matricNumber: string
  department: string
  level: string
  session: string
  purpose: string
  date?: Date
}) {
  const fmtAmount = amount.toLocaleString("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 2,
  })

  const fmtDate = date.toLocaleDateString("en-GB")

  return `
RECEIPT OF PAYMENT

This is to acknowledge receipt of the sum of ${fmtAmount} (Naira) from:

Student Name: ${studentName}
Matric No. / Reg No.: ${matricNumber}
Department: ${department}
Level: ${level}
Session: ${session}
Purpose of Payment: ${purpose}
Payment Reference: ${reference}
Date of Payment: ${fmtDate}
Payment Method: Paystack

Thank you for your prompt payment.

The Bursary Department,
The Federal Polytechnic Bida
  `.trim()
}
