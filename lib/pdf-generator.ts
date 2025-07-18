import puppeteer from "puppeteer"

interface PaymentData {
  id: number
  reference: string
  amount: number
  status: string
  created_at: string
  student: {
    matric_number: string
    first_name: string
    last_name: string
    email: string
    phone: string
    school: string
    department: string
    level: string
  }
  fees: Array<{
    fee_name: string
    amount: number
  }>
}

export async function generateReceiptPDF(paymentData: PaymentData): Promise<Buffer> {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  })

  try {
    const page = await browser.newPage()

    const html = `
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
          line-height: 1.4;
          color: #000;
          background: white;
        }
        
        .receipt-container {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          background: white;
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
          background: url('/images/bida-logo.png') center/contain no-repeat;
        }
        
        .school-name {
          font-size: 24px;
          font-weight: bold;
          color: #1e40af;
          margin-bottom: 5px;
        }
        
        .school-address {
          font-size: 14px;
          color: #666;
          margin-bottom: 15px;
        }
        
        .receipt-title {
          font-size: 20px;
          font-weight: bold;
          color: #000;
          margin-top: 15px;
        }
        
        .receipt-info {
          display: flex;
          justify-content: space-between;
          margin-bottom: 30px;
          gap: 40px;
        }
        
        .info-section {
          flex: 1;
        }
        
        .info-title {
          font-size: 16px;
          font-weight: bold;
          color: #1e40af;
          margin-bottom: 10px;
          border-bottom: 1px solid #e5e7eb;
          padding-bottom: 5px;
        }
        
        .info-item {
          display: flex;
          margin-bottom: 8px;
        }
        
        .info-label {
          font-weight: bold;
          min-width: 120px;
          color: #374151;
        }
        
        .info-value {
          color: #000;
        }
        
        .fees-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 30px;
        }
        
        .fees-table th,
        .fees-table td {
          border: 1px solid #d1d5db;
          padding: 12px;
          text-align: left;
        }
        
        .fees-table th {
          background-color: #f3f4f6;
          font-weight: bold;
          color: #374151;
        }
        
        .fees-table tr:nth-child(even) {
          background-color: #f9fafb;
        }
        
        .amount {
          text-align: right;
          font-weight: bold;
        }
        
        .total-section {
          border-top: 2px solid #1e40af;
          padding-top: 20px;
          margin-top: 20px;
        }
        
        .total-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;
          font-size: 16px;
        }
        
        .total-final {
          font-size: 20px;
          font-weight: bold;
          color: #1e40af;
          border-top: 1px solid #d1d5db;
          padding-top: 10px;
        }
        
        .footer {
          margin-top: 40px;
          text-align: center;
          font-size: 12px;
          color: #666;
          border-top: 1px solid #e5e7eb;
          padding-top: 20px;
        }
        
        .status-badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: bold;
          text-transform: uppercase;
        }
        
        .status-success {
          background-color: #dcfce7;
          color: #166534;
        }
        
        @media print {
          body { margin: 0; }
          .receipt-container { 
            max-width: none; 
            margin: 0; 
            padding: 15px;
          }
        }
      </style>
    </head>
    <body>
      <div class="receipt-container">
        <div class="header">
          <div class="logo"></div>
          <div class="school-name">THE FEDERAL POLYTECHNIC BIDA</div>
          <div class="school-address">
            P.M.B 55, Bida, Niger State, Nigeria<br>
            Tel: +234-xxx-xxx-xxxx | Email: info@fedpolybida.edu.ng
          </div>
          <div class="receipt-title">PAYMENT RECEIPT</div>
        </div>

        <div class="receipt-info">
          <div class="info-section">
            <div class="info-title">Student Information</div>
            <div class="info-item">
              <span class="info-label">Matric Number:</span>
              <span class="info-value">${paymentData.student.matric_number}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Full Name:</span>
              <span class="info-value">${paymentData.student.first_name} ${paymentData.student.last_name}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Email:</span>
              <span class="info-value">${paymentData.student.email}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Phone:</span>
              <span class="info-value">${paymentData.student.phone}</span>
            </div>
            <div class="info-item">
              <span class="info-label">School:</span>
              <span class="info-value">${paymentData.student.school}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Department:</span>
              <span class="info-value">${paymentData.student.department}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Level:</span>
              <span class="info-value">${paymentData.student.level}</span>
            </div>
          </div>

          <div class="info-section">
            <div class="info-title">Payment Information</div>
            <div class="info-item">
              <span class="info-label">Reference:</span>
              <span class="info-value">${paymentData.reference}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Date:</span>
              <span class="info-value">${new Date(paymentData.created_at).toLocaleDateString("en-GB")}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Time:</span>
              <span class="info-value">${new Date(paymentData.created_at).toLocaleTimeString("en-GB")}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Status:</span>
              <span class="info-value">
                <span class="status-badge status-success">${paymentData.status}</span>
              </span>
            </div>
          </div>
        </div>

        <table class="fees-table">
          <thead>
            <tr>
              <th>S/N</th>
              <th>Fee Description</th>
              <th class="amount">Amount (₦)</th>
            </tr>
          </thead>
          <tbody>
            ${paymentData.fees
              .map(
                (fee, index) => `
              <tr>
                <td>${index + 1}</td>
                <td>${fee.fee_name}</td>
                <td class="amount">${fee.amount.toLocaleString()}</td>
              </tr>
            `,
              )
              .join("")}
          </tbody>
        </table>

        <div class="total-section">
          <div class="total-row">
            <span>Subtotal:</span>
            <span>₦${paymentData.amount.toLocaleString()}</span>
          </div>
          <div class="total-row">
            <span>Transaction Fee:</span>
            <span>₦0</span>
          </div>
          <div class="total-row total-final">
            <span>Total Amount Paid:</span>
            <span>₦${paymentData.amount.toLocaleString()}</span>
          </div>
        </div>

        <div class="footer">
          <p><strong>This is a computer-generated receipt and does not require a signature.</strong></p>
          <p>For inquiries, please contact the Bursary Department or visit our website.</p>
          <p>Generated on ${new Date().toLocaleString("en-GB")}</p>
        </div>
      </div>
    </body>
    </html>
    `

    await page.setContent(html, { waitUntil: "networkidle0" })

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "20px",
        right: "20px",
        bottom: "20px",
        left: "20px",
      },
    })

    return pdf
  } finally {
    await browser.close()
  }
}
