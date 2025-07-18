interface StudentInfo {
  full_name: string
  matric_number: string
  email: string
  phone: string
  level: string
  department_name: string
  school_name: string
  passport_photo?: string | null
}

interface PaymentInfo {
  reference: string
  receipt_number: string
  amount: number
  payment_date: string | Date
  fee_type: string
  academic_session: string
  installment_number: number
  total_installments: number
  payment_method?: string
}

interface FeeInfo {
  fee_name: string
  description: string
  total_amount: number
}

interface PaymentSummary {
  total_paid: number
  balance: number
  is_fully_paid: boolean
}

interface EmailData {
  student: StudentInfo
  payment: PaymentInfo
  fee: FeeInfo
  summary: PaymentSummary
}

export function generatePaymentReceiptEmail(data: EmailData): string {
  // Ensure all numeric values are properly handled
  const amount = Number(data.payment.amount) || 0
  const totalAmount = Number(data.fee.total_amount) || 0
  const totalPaid = Number(data.summary.total_paid) || 0
  const balance = Number(data.summary.balance) || 0

  // Format date properly
  const paymentDate = new Date(data.payment.payment_date)
  const formattedDate = paymentDate.toLocaleDateString("en-GB")

  // Create simple text receipt
  const receiptText = `
RECEIPT OF PAYMENT

This is to acknowledge receipt of the sum of ₦${amount.toLocaleString()} (Naira) from:

Student Name: ${data.student.full_name}
Matric No. / Reg No.: ${data.student.matric_number}
Department: ${data.student.department_name}
Level: ${data.student.level}
Session: ${data.payment.academic_session}
Purpose of Payment: ${data.fee.fee_name}
Payment Reference: ${data.payment.reference}
Date of Payment: ${formattedDate}
Payment Method: ${data.payment.payment_method || "Paystack"}

Payment Summary:
- Amount Paid: ₦${amount.toLocaleString()}
- Total Fee: ₦${totalAmount.toLocaleString()}
- Balance: ${balance > 0 ? `₦${balance.toLocaleString()}` : "FULLY PAID"}

This payment has been verified and confirmed.

---
The Federal Polytechnic Bida
Automated Fee Confirmation System
Generated on ${new Date().toLocaleDateString("en-GB")} at ${new Date().toLocaleTimeString("en-GB")}
  `

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Payment Receipt</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f4f4f4;
        }
        .container {
          background-color: white;
          padding: 30px;
          border-radius: 10px;
          box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }
        .header {
          text-align: center;
          border-bottom: 3px solid #0e1c36;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .title {
          color: #0e1c36;
          font-size: 24px;
          font-weight: bold;
          margin: 0;
        }
        .subtitle {
          color: #4a90e2;
          font-size: 16px;
          margin: 5px 0 0 0;
        }
        .receipt-content {
          background-color: #f8f9fa;
          border: 1px solid #dee2e6;
          border-radius: 8px;
          padding: 20px;
          margin: 20px 0;
          font-family: monospace;
          white-space: pre-line;
          line-height: 1.5;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #dee2e6;
          color: #666;
          font-size: 12px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 class="title">The Federal Polytechnic Bida</h1>
          <p class="subtitle">Fee Confirmation System</p>
        </div>
        
        <div class="receipt-content">${receiptText}</div>
        
        <div class="footer">
          <p><strong>The Federal Polytechnic Bida</strong></p>
          <p>This is an automated email. Please do not reply to this message.</p>
          <p>For support, contact the Bursary Department.</p>
        </div>
      </div>
    </body>
    </html>
  `
}
