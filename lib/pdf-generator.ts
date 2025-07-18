import puppeteer from "puppeteer"

export async function generateReceiptPDF(receiptData: any): Promise<Buffer> {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  })

  try {
    const page = await browser.newPage()

    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Payment Receipt</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: Arial, sans-serif;
            background: white;
            color: black;
            line-height: 1.4;
          }
          
          .receipt-container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            border: 2px solid #d1d5db;
          }
          
          .header {
            background: #e5e7eb;
            text-align: center;
            padding: 20px;
            border-bottom: 2px solid #d1d5db;
          }
          
          .logo {
            width: 60px;
            height: 60px;
            margin: 0 auto 15px;
            background: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          
          .school-name {
            font-size: 20px;
            font-weight: bold;
            margin-bottom: 5px;
          }
          
          .school-address {
            font-size: 12px;
            margin-bottom: 15px;
            opacity: 0.8;
          }
          
          .receipt-title {
            background: white;
            color: black;
            padding: 8px 20px;
            border-radius: 20px;
            display: inline-block;
            font-size: 16px;
            font-weight: bold;
          }
          
          .content {
            padding: 20px;
          }
          
          .student-info {
            background: #f8fafc;
            border: 2px solid #d1d5db;
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 20px;
            display: flex;
            gap: 20px;
          }
          
          .student-photo {
            width: 80px;
            height: 100px;
            border: 2px solid #3b82f6;
            border-radius: 8px;
            background: #6b7280;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 10px;
            flex-shrink: 0;
          }
          
          .student-details {
            flex: 1;
          }
          
          .section-title {
            font-size: 16px;
            font-weight: bold;
            color: #3b82f6;
            border-bottom: 2px solid #3b82f6;
            padding-bottom: 5px;
            margin-bottom: 15px;
          }
          
          .details-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
          }
          
          .detail-item {
            display: flex;
            flex-direction: column;
          }
          
          .detail-label {
            font-size: 10px;
            font-weight: bold;
            color: #3b82f6;
            text-transform: uppercase;
            margin-bottom: 3px;
          }
          
          .detail-value {
            font-size: 12px;
            font-weight: 600;
            color: #111827;
          }
          
          .qr-section {
            width: 100px;
            text-align: center;
            flex-shrink: 0;
          }
          
          .qr-code {
            width: 80px;
            height: 80px;
            background: white;
            border: 2px solid #3b82f6;
            border-radius: 8px;
            margin: 0 auto 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 10px;
          }
          
          .payment-table {
            width: 100%;
            border: 2px solid #3b82f6;
            border-radius: 8px;
            overflow: hidden;
            margin-bottom: 20px;
          }
          
          .payment-table th {
            background: #000000;
            color: white;
            padding: 10px;
            text-align: left;
            font-size: 12px;
            font-weight: bold;
          }
          
          .payment-table td {
            padding: 10px;
            border-bottom: 1px solid #e5e7eb;
            font-size: 12px;
          }
          
          .payment-table tr:nth-child(even) {
            background: #f9fafb;
          }
          
          .payment-table tr:last-child td {
            border-bottom: none;
          }
          
          .amount-highlight {
            font-weight: bold;
            color: #059669;
            font-size: 14px;
          }
          
          .payment-summary {
            background: #f1f5f9;
            border-left: 4px solid #d1d5db;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
          }
          
          .summary-title {
            font-size: 14px;
            font-weight: bold;
            color: #3b82f6;
            margin-bottom: 10px;
          }
          
          .summary-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
          }
          
          .summary-item {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
          }
          
          .summary-label {
            font-size: 12px;
            font-weight: 500;
            color: #3b82f6;
          }
          
          .summary-value {
            font-size: 12px;
            font-weight: 600;
            color: #111827;
          }
          
          .summary-value.green {
            color: #059669;
          }
          
          .summary-value.red {
            color: #dc2626;
          }
          
          .footer {
            text-align: center;
            margin-top: 20px;
            padding-top: 15px;
            border-top: 2px solid #e5e7eb;
          }
          
          .footer-title {
            font-size: 12px;
            font-weight: bold;
            color: #3b82f6;
            margin-bottom: 5px;
          }
          
          .footer-text {
            font-size: 10px;
            color: #6b7280;
            margin-bottom: 3px;
          }
          
          @media print {
            body { margin: 0; }
            .receipt-container { 
              max-width: none; 
              margin: 0;
              border: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="receipt-container">
          <!-- Header -->
          <div class="header">
            <div class="logo">
              <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==" alt="Logo" style="width: 40px; height: 40px;">
            </div>
            <div class="school-name">The Federal Polytechnic Bida</div>
            <div class="school-address">
              Niger State, North Central, Nigeria<br>
              KM 1.5, Doko Road, Bida Niger State
            </div>
            <div class="receipt-title">PAYMENT RECEIPT</div>
          </div>

          <!-- Content -->
          <div class="content">
            <!-- Student Information -->
            <div class="student-info">
              <div class="student-photo">
                ${
                  receiptData.student.passport_photo
                    ? `<img src="${receiptData.student.passport_photo}" alt="Student" style="width: 100%; height: 100%; object-fit: cover;">`
                    : "No Photo"
                }
              </div>
              
              <div class="student-details">
                <div class="section-title">STUDENT INFORMATION</div>
                <div class="details-grid">
                  <div class="detail-item">
                    <div class="detail-label">Full Name</div>
                    <div class="detail-value">${receiptData.student.full_name}</div>
                  </div>
                  <div class="detail-item">
                    <div class="detail-label">Matric Number</div>
                    <div class="detail-value">${receiptData.student.matric_number}</div>
                  </div>
                  <div class="detail-item">
                    <div class="detail-label">Level</div>
                    <div class="detail-value">${receiptData.student.level}</div>
                  </div>
                  <div class="detail-item">
                    <div class="detail-label">School</div>
                    <div class="detail-value">${receiptData.student.school_name}</div>
                  </div>
                  <div class="detail-item">
                    <div class="detail-label">Department</div>
                    <div class="detail-value">${receiptData.student.department_name}</div>
                  </div>
                </div>
              </div>
              
              <div class="qr-section">
                <div class="qr-code">QR Code</div>
                <div style="font-size: 10px;">Scan to verify</div>
              </div>
            </div>

            <!-- Payment Details Table -->
            <table class="payment-table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Fee Type</td>
                  <td>${receiptData.fee.fee_name}</td>
                </tr>
                <tr>
                  <td>Academic Session</td>
                  <td>${receiptData.payment.academic_session}</td>
                </tr>
                <tr>
                  <td>Payment Type</td>
                  <td>${receiptData.payment.fee_type}</td>
                </tr>
                <tr>
                  <td>Payment Date</td>
                  <td>${new Date(receiptData.payment.payment_date).toLocaleDateString()}</td>
                </tr>
                <tr>
                  <td>Reference Number</td>
                  <td>${receiptData.payment.reference}</td>
                </tr>
                <tr>
                  <td>Receipt Number</td>
                  <td>${receiptData.payment.receipt_number}</td>
                </tr>
                <tr>
                  <td>Payment Method</td>
                  <td style="text-transform: capitalize;">${receiptData.payment.payment_method}</td>
                </tr>
                <tr style="background: #f3f4f6;">
                  <td style="font-weight: bold;">Amount Paid</td>
                  <td class="amount-highlight">₦${receiptData.payment.amount.toLocaleString()}</td>
                </tr>
              </tbody>
            </table>

            <!-- Payment Summary -->
            <div class="payment-summary">
              <div class="summary-title">Payment Summary</div>
              <div class="summary-grid">
                <div>
                  <div class="summary-item">
                    <span class="summary-label">Total Fee:</span>
                    <span class="summary-value">₦${receiptData.fee.total_amount.toLocaleString()}</span>
                  </div>
                  <div class="summary-item">
                    <span class="summary-label">Total Paid:</span>
                    <span class="summary-value green">₦${receiptData.summary.total_paid.toLocaleString()}</span>
                  </div>
                </div>
                <div>
                  <div class="summary-item">
                    <span class="summary-label">Balance:</span>
                    <span class="summary-value ${receiptData.summary.balance > 0 ? "red" : "green"}">
                      ${receiptData.summary.balance > 0 ? `₦${receiptData.summary.balance.toLocaleString()}` : "FULLY PAID ✓"}
                    </span>
                  </div>
                  <div class="summary-item">
                    <span class="summary-label">Status:</span>
                    <span class="summary-value green">
                      ✓ ${receiptData.summary.is_fully_paid ? "PAYMENT COMPLETE" : "PARTIAL PAYMENT"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Footer -->
            <div class="footer">
              <div class="footer-title">This is an official receipt from The Federal Polytechnic Bida</div>
              <div class="footer-text">Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</div>
              <div class="footer-text">For verification, scan the QR code or visit our portal with reference: ${receiptData.payment.reference}</div>
            </div>
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
        top: "0.5in",
        right: "0.5in",
        bottom: "0.5in",
        left: "0.5in",
      },
    })

    return pdf
  } finally {
    await browser.close()
  }
}
