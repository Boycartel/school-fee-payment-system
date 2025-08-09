import puppeteer from "puppeteer"

interface ReceiptData {
  student: {
    full_name: string
    matric_number: string
    department: string
    level: string
    school: string
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

export async function generateReceiptPDF(receiptData: ReceiptData): Promise<Buffer> {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  })

  try {
    const page = await browser.newPage()

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Payment Receipt</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              font-family: Arial, sans-serif;
              font-size: 12px;
              line-height: 1.4;
              color: #333;
              background: white;
            }
            
            .receipt-container {
              max-width: 800px;
              margin: 0 auto;
              padding: 20px;
            }
            
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 2px solid #1e40af;
              padding-bottom: 20px;
            }
            
            .logo {
              width: 80px;
              height: 80px;
              margin: 0 auto 15px;
              background: #f3f4f6;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 24px;
              font-weight: bold;
              color: #1e40af;
            }
            
            .school-name {
              font-size: 18px;
              font-weight: bold;
              color: #1e40af;
              margin-bottom: 5px;
            }
            
            .receipt-title {
              font-size: 16px;
              font-weight: bold;
              color: #000;
              margin-top: 15px;
            }
            
            .receipt-info {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 30px;
              margin-bottom: 30px;
            }
            
            .info-section h3 {
              font-size: 14px;
              font-weight: bold;
              color: #1e40af;
              margin-bottom: 10px;
              border-bottom: 1px solid #e5e7eb;
              padding-bottom: 5px;
            }
            
            .info-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 8px;
            }
            
            .info-label {
              font-weight: 600;
              color: #374151;
            }
            
            .info-value {
              color: #111827;
            }
            
            .fees-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
            }
            
            .fees-table th,
            .fees-table td {
              padding: 12px;
              text-align: left;
              border-bottom: 1px solid #e5e7eb;
            }
            
            .fees-table th {
              background-color: #f9fafb;
              font-weight: bold;
              color: #374151;
            }
            
            .fees-table tr:nth-child(even) {
              background-color: #f9fafb;
            }
            
            .summary-section {
              background-color: #f0f9ff;
              padding: 20px;
              border-radius: 8px;
              margin-bottom: 30px;
            }
            
            .summary-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 10px;
            }
            
            .summary-row.total {
              font-weight: bold;
              font-size: 14px;
              border-top: 2px solid #1e40af;
              padding-top: 10px;
              margin-top: 10px;
            }
            
            .footer {
              text-align: center;
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
              color: #6b7280;
              font-size: 11px;
            }
            
            .verification-note {
              background-color: #fef3c7;
              padding: 15px;
              border-radius: 8px;
              margin-bottom: 20px;
              border-left: 4px solid #f59e0b;
            }
            
            .status-paid {
              color: #059669;
              font-weight: bold;
            }
          </style>
        </head>
        <body>
          <div class="receipt-container">
            <div class="header">
              <div class="logo">FPB</div>
              <div class="school-name">THE FEDERAL POLYTECHNIC BIDA</div>
              <div>Niger State, Nigeria</div>
              <div class="receipt-title">PAYMENT RECEIPT</div>
            </div>
            
            <div class="receipt-info">
              <div class="info-section">
                <h3>Student Information</h3>
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
                  <span class="info-value">${receiptData.student.department}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Level:</span>
                  <span class="info-value">${receiptData.student.level}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">School:</span>
                  <span class="info-value">${receiptData.student.school}</span>
                </div>
              </div>
              
              <div class="info-section">
                <h3>Payment Information</h3>
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
                  <span class="info-value">₦${receiptData.payment.amount.toLocaleString()}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Payment Date:</span>
                  <span class="info-value">${new Date(receiptData.payment.payment_date).toLocaleDateString()}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Session:</span>
                  <span class="info-value">${receiptData.payment.session}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Status:</span>
                  <span class="info-value status-paid">${receiptData.payment.status}</span>
                </div>
              </div>
            </div>
            
            <div class="verification-note">
              <strong>Verification:</strong> This receipt can be verified online using the reference number: ${receiptData.payment.reference}
            </div>
            
            <table class="fees-table">
              <thead>
                <tr>
                  <th>Fee Description</th>
                  <th>Amount (₦)</th>
                </tr>
              </thead>
              <tbody>
                ${receiptData.fees
                  .map(
                    (fee) => `
                  <tr>
                    <td>${fee.fee_name}</td>
                    <td>₦${fee.amount.toLocaleString()}</td>
                  </tr>
                `,
                  )
                  .join("")}
              </tbody>
            </table>
            
            <div class="summary-section">
              <div class="summary-row">
                <span>Total Paid:</span>
                <span>₦${receiptData.summary.total_paid.toLocaleString()}</span>
              </div>
              <div class="summary-row">
                <span>Balance:</span>
                <span>₦${receiptData.summary.balance.toLocaleString()}</span>
              </div>
              <div class="summary-row total">
                <span>Payment Status:</span>
                <span class="status-paid">VERIFIED</span>
              </div>
            </div>
            
            <div class="footer">
              <p>This is an official receipt from The Federal Polytechnic Bida</p>
              <p>Generated on ${new Date().toLocaleString()}</p>
              <p>For verification, visit our online portal or contact the bursary department</p>
            </div>
          </div>
        </body>
      </html>
    `

    await page.setContent(htmlContent)

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "20px",
        right: "20px",
        bottom: "20px",
        left: "20px",
      },
    })

    return Buffer.from(pdfBuffer)
  } finally {
    await browser.close()
  }
}
