import puppeteer from "puppeteer"

export async function generateReceiptPDF(receiptData: any): Promise<Buffer> {
  let browser
  try {
    // Launch puppeteer browser
    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    })

    const page = await browser.newPage()

    // Generate HTML content for PDF
    const htmlContent = generateReceiptHTML(receiptData)

    // Set content and generate PDF
    await page.setContent(htmlContent, { waitUntil: "networkidle0" })

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

    return pdfBuffer
  } catch (error) {
    console.error("Error generating PDF:", error)
    throw new Error("Failed to generate PDF receipt")
  } finally {
    if (browser) {
      await browser.close()
    }
  }
}

function generateReceiptHTML(receiptData: any): string {
  const { student, payment, fee, summary } = receiptData

  return `
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
          font-family: 'Arial', sans-serif;
          line-height: 1.6;
          color: #333;
          background: white;
        }
        
        .container {
          max-width: 800px;
          margin: 0 auto;
          padding: 30px;
        }
        
        .header {
          text-align: center;
          margin-bottom: 30px;
          border-bottom: 3px solid #0e1c36;
          padding-bottom: 20px;
        }
        
        .header h1 {
          color: #0e1c36;
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 5px;
        }
        
        .header p {
          color: #4a90e2;
          font-size: 14px;
        }
        
        .receipt-title {
          background: #f8f9fa;
          border: 1px solid #dee2e6;
          border-radius: 8px;
          padding: 20px;
          text-align: center;
          margin-bottom: 30px;
        }
        
        .receipt-title h2 {
          font-size: 20px;
          font-weight: bold;
          color: #000;
        }
        
        .section {
          margin-bottom: 25px;
        }
        
        .section-title {
          font-size: 16px;
          font-weight: bold;
          color: #0e1c36;
          border-bottom: 2px solid #4a90e2;
          padding-bottom: 8px;
          margin-bottom: 15px;
        }
        
        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
        }
        
        .info-item {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid #eee;
        }
        
        .info-label {
          font-weight: bold;
          color: #666;
          text-transform: uppercase;
          font-size: 12px;
        }
        
        .info-value {
          color: #333;
          font-size: 14px;
        }
        
        .summary {
          background: #f8f9fa;
          border-radius: 8px;
          padding: 20px;
          margin: 20px 0;
        }
        
        .summary-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;
          font-size: 14px;
        }
        
        .summary-total {
          display: flex;
          justify-content: space-between;
          margin-top: 15px;
          padding-top: 15px;
          border-top: 2px solid #0e1c36;
          font-weight: bold;
          font-size: 16px;
        }
        
        .amount {
          color: #0e1c36;
          font-weight: bold;
        }
        
        .verification-note {
          background: #e7f3ff;
          border-left: 4px solid #4a90e2;
          padding: 15px;
          margin: 20px 0;
          border-radius: 4px;
          font-size: 13px;
          line-height: 1.5;
        }
        
        .footer {
          text-align: center;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #dee2e6;
          font-size: 11px;
          color: #666;
          line-height: 1.4;
        }
        
        @media print {
          body { -webkit-print-color-adjust: exact; }
        }
      </style>
    </head>
    <body>
      <div class="container">
         Header 
        <div class="header">
          <h1>The Federal Polytechnic Bida</h1>
          <p>Fee Confirmation System</p>
        </div>

         Receipt Title 
        <div class="receipt-title">
          <h2>PAYMENT RECEIPT</h2>
        </div>

         Student Information 
        <div class="section">
          <div class="section-title">Student Information</div>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">Full Name:</span>
              <span class="info-value">${student.full_name}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Matric Number:</span>
              <span class="info-value">${student.matric_number}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Level:</span>
              <span class="info-value">${student.level}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Department:</span>
              <span class="info-value">${student.department_name}</span>
            </div>
          </div>
        </div>

         Payment Details 
        <div class="section">
          <div class="section-title">Payment Details</div>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">Receipt Number:</span>
              <span class="info-value">${payment.receipt_number}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Payment Reference:</span>
              <span class="info-value">${payment.reference}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Payment Date:</span>
              <span class="info-value">${new Date(payment.payment_date).toLocaleDateString("en-GB")}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Academic Session:</span>
              <span class="info-value">${payment.academic_session}</span>
            </div>
          </div>
        </div>

         Fee Information 
        <div class="section">
          <div class="section-title">Fee Information</div>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">Fee Name:</span>
              <span class="info-value">${fee.fee_name}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Fee Type:</span>
              <span class="info-value">${payment.fee_type}</span>
            </div>
          </div>
        </div>

         Payment Summary 
        <div class="summary">
          <div class="summary-row">
            <span>Amount Paid (This Transaction):</span>
            <span class="amount">₦${payment.amount.toLocaleString()}</span>
          </div>
          <div class="summary-row">
            <span>Total Amount Paid:</span>
            <span class="amount">₦${summary.total_paid.toLocaleString()}</span>
          </div>
          <div class="summary-row">
            <span>Outstanding Balance:</span>
            <span class="amount">₦${summary.balance.toLocaleString()}</span>
          </div>
          <div class="summary-total">
            <span>Total Fee Amount:</span>
            <span class="amount">₦${fee.total_amount.toLocaleString()}</span>
          </div>
        </div>

         Verification Note 
        <div class="verification-note">
          <strong>Payment Verification:</strong> This payment has been successfully verified and processed. 
          You can verify this payment anytime by visiting our verification portal with your payment reference: <strong>${payment.reference}</strong>
        </div>

         Footer 
        <div class="footer">
          <p><strong>The Federal Polytechnic Bida</strong></p>
          <p>Automated Fee Confirmation System</p>
          <p>This is an automated email. Please do not reply to this message.</p>
          <p>For support, contact the Bursary Department.</p>
          <p>© ${new Date().getFullYear()} The Federal Polytechnic Bida. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `
}
