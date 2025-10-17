import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium-min';

export async function generateReceiptPDF(receiptData: any): Promise<Buffer> {
  try {
    const receiptHtml = await generateReceiptHTML(receiptData);
    const pdfBuffer = await htmlToPdf(receiptHtml);
    return pdfBuffer;
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw error;
  }
}

async function htmlToPdf(html: string): Promise<Buffer> {
  let browser = null;
  
  try {
    // For Vercel environment
    const isDev = process.env.NODE_ENV === 'development';
    
    let executablePath: string;
    let args: string[];

    if (isDev) {
      // Local development - use system Chrome or download one
      executablePath = process.env.PUPPETEER_EXECUTABLE_PATH || 
        '/usr/bin/google-chrome' || 
        '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' ||
        'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
      args = [];
    } else {
      // Production - use Chromium from @sparticuz/chromium-min
      executablePath = await chromium.executablePath();
      args = chromium.args;
    }

    browser = await puppeteer.launch({
      args: [...args, '--no-sandbox', '--disable-setuid-sandbox'],
      executablePath,
      headless: true,
    });
    
    const page = await browser.newPage();
    
    // Set the HTML content
    await page.setContent(html, {
      waitUntil: 'networkidle0'
    });

    // Wait for fonts to load
    await page.evaluateHandle('document.fonts.ready');
    
    // Small delay to ensure all content is rendered
    await new Promise(resolve => setTimeout(resolve, 100));

    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '0.4in',
        right: '0.4in',
        bottom: '0.4in',
        left: '0.4in'
      },
      preferCSSPageSize: true
    });

    return pdfBuffer;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Your existing generateReceiptHTML function remains exactly the same
async function generateReceiptHTML(receiptData: any): Promise<string> {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: white;
          padding: 0;
          line-height: 1.4;
        }
        
        .print-container {
          max-width: 800px;
          margin: 0 auto;
          background: white;
          border: 2px solid #d1d5db;
        }
        
        .print-header {
          background: #e5e7eb;
          color: black;
          text-align: center;
          padding: 24px 16px;
        }
        
        .logo-container {
          width: 64px;
          height: 64px;
          margin: 0 auto 12px;
          background: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid #2563eb;
        }
        
        .logo-container img {
          width: 48px;
          height: auto;
        }
        
        .print-header h1 {
          font-size: 20px;
          font-weight: bold;
          margin: 4px 0;
        }
        
        .print-header p {
          font-size: 12px;
          opacity: 0.9;
          margin: 8px 0;
        }
        
        .receipt-title {
          background: white;
          color: black;
          padding: 8px 16px;
          border-radius: 9999px;
          display: inline-block;
          margin-top: 12px;
          border: 2px solid #2563eb;
        }
        
        .receipt-title h2 {
          font-size: 18px;
          font-weight: bold;
        }
        
        .print-content {
          padding: 24px;
          background: white;
        }
        
        .student-card {
          background: #f8fafc;
          border: 1px solid #d1d5db;
          border-radius: 12px;
          padding: 24px;
          margin-bottom: 24px;
        }
        
        .student-card-flex {
          display: flex;
          gap: 24px;
          align-items: flex-start;
        }
        
        .student-photo {
          flex-shrink: 0;
        }
        
        .student-photo-box {
          width: 96px;
          height: 128px;
          border: 2px solid #60a5fa;
          border-radius: 8px;
          background: #f3f4f6;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #9ca3af;
          font-size: 12px;
          text-align: center;
          overflow: hidden;
        }
        
        .student-photo-box img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .student-details {
          flex: 1;
        }
        
        .student-details-header {
          border-bottom: 1px solid rgba(96, 165, 250, 0.3);
          padding-bottom: 12px;
          margin-bottom: 16px;
        }
        
        .student-details-header h3 {
          font-size: 18px;
          font-weight: bold;
          color: #2563eb;
        }
        
        .details-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 32px 32px;
        }
        
        .detail-item {
          margin-bottom: 12px;
        }
        
        .detail-label {
          font-size: 12px;
          font-weight: 500;
          color: #2563eb;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        
        .detail-value {
          font-size: 14px;
          font-weight: 600;
          color: #111827;
          margin-top: 4px;
        }
        
        .detail-value.mono {
          font-family: 'Courier New', monospace;
        }
        
        .qr-code {
          flex-shrink: 0;
          text-align: center;
        }
        
        .qr-box {
          background: white;
          padding: 12px;
          border: 2px solid #60a5fa;
          border-radius: 8px;
          width: 120px;
          height: 120px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          color: #6b7280;
        }
        
        .qr-text {
          font-size: 12px;
          color: #4b5563;
          margin-top: 8px;
        }
        
        .payment-table {
          width: 100%;
          border: 2px solid #60a5fa;
          border-collapse: collapse;
          margin-bottom: 24px;
          font-size: 14px;
        }
        
        .payment-table th {
          background: #000000;
          color: white;
          padding: 12px;
          text-align: left;
          font-weight: 600;
        }
        
        .payment-table td {
          padding: 12px;
          border-bottom: 1px solid #e5e7eb;
          color: #111827;
        }
        
        .payment-table tr:nth-child(even) td {
          background: #f3f4f6;
        }
        
        .payment-table tr:last-child td {
          border-bottom: none;
          background: #f3f4f6;
          font-weight: bold;
        }
        
        .amount-paid {
          color: #059669;
          font-weight: bold;
          font-size: 18px;
        }
        
        .summary-section {
          background: #f8fafc;
          padding: 16px;
          border-left: 4px solid #d1d5db;
          margin-bottom: 24px;
        }
        
        .summary-section h3 {
          font-size: 16px;
          font-weight: 600;
          color: #2563eb;
          margin-bottom: 12px;
        }
        
        .summary-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        
        .summary-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
        }
        
        .summary-label {
          font-weight: 500;
          color: #2563eb;
          font-size: 14px;
        }
        
        .summary-value {
          font-weight: 600;
          color: #111827;
          font-size: 14px;
        }
        
        .summary-value.green {
          color: #059669;
        }
        
        .summary-value.red {
          color: #dc2626;
        }
        
        .footer-section {
          text-align: center;
          margin-top: 24px;
          padding-top: 16px;
          border-top: 2px solid #d1d5db;
        }
        
        .footer-section p {
          font-size: 14px;
          font-weight: 600;
          color: #2563eb;
          margin-bottom: 4px;
        }
        
        .footer-section .small {
          font-size: 12px;
          color: #4b5563;
          font-weight: normal;
          margin-bottom: 8px;
        }
        
        @media print {
          body {
            margin: 0;
            padding: 0;
          }
          .print-container {
            border: none;
            box-shadow: none;
          }
        }
      </style>
    </head>
    <body>
      <div class="print-container">
        <!-- Your existing HTML content -->
        <div class="print-header">
          <div class="logo-container">
            <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTI0IDRDMzEuNzMyIDQgMzggMTAuMjY4IDM4IDE4QzM4IDI1LjczMiAzMS43MzIgMzIgMjQgMzJDMTYuMjY4IDMyIDEwIDI1LjczMiAxMCAxOEMxMCAxMC4yNjggMTYuMjY4IDQgMjQgNFoiIGZpbGw9IiMyNTYzZWIiLz4KPHBhdGggZD0iTTI0IDI4QzI2LjIwOTEgMjggMjggMjYuMjA5MSAyOCAyNEMyOCAyMS43OTA5IDI2LjIwOTEgMjAgMjQgMjBDMjEuNzkwOSAyMCAyMCAyMS43OTA5IDIwIDI0QzIwIDI2LjIwOTEgMjEuNzkwOSAyOCAyNCAyOFoiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik0xOSAxNEMxOSAxMi44OTU0IDE5Ljg5NTQgMTIgMjEgMTJIMjdDMjguMTA0NiAxMiAyOSAxMi44OTU0IDI5IDE0VjE4QzI5IDE5LjEwNDYgMjguMTA0NiAyMCAyNyAyMEgyMUMxOS44OTU0IDIwIDE5IDE5LjEwNDYgMTkgMThWMTRaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K" alt="School Logo" />
          </div>
          <h1>The Federal Polytechnic Bida</h1>
          <p>Niger State, North Central, Nigeria<br/>KM 1.5, Doko Road, Bida Niger State</p>
          <div class="receipt-title">
            <h2>PAYMENT RECEIPT</h2>
          </div>
        </div>

        <div class="print-content">
          <!-- Student Information Card -->
          <div class="student-card">
            <div class="student-card-flex">
              <!-- Student Photo -->
              <div class="student-photo">
                <div class="student-photo-box">
                  ${
                    receiptData.student.passport_photo
                      ? `<img src="${receiptData.student.passport_photo}" alt="Student Photo" />`
                      : "No Photo Available"
                  }
                </div>
              </div>

              <!-- Student Details -->
              <div class="student-details">
                <div class="student-details-header">
                  <h3>STUDENT INFORMATION</h3>
                </div>
                <div class="details-grid">
                  <div>
                    <div class="detail-item">
                      <div class="detail-label">Full Name</div>
                      <div class="detail-value">${receiptData.student.full_name || 'N/A'}</div>
                    </div>
                    <div class="detail-item">
                      <div class="detail-label">Matric Number</div>
                      <div class="detail-value mono">${receiptData.student.matric_number || 'N/A'}</div>
                    </div>
                    <div class="detail-item">
                      <div class="detail-label">Level</div>
                      <div class="detail-value">${receiptData.student.level || 'N/A'}</div>
                    </div>
                  </div>
                  <div>
                    <div class="detail-item">
                      <div class="detail-label">School</div>
                      <div class="detail-value">${receiptData.student.school_name || 'N/A'}</div>
                    </div>
                    <div class="detail-item">
                      <div class="detail-label">Department</div>
                      <div class="detail-value">${receiptData.student.department_name || 'N/A'}</div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- QR Code -->
              <div class="qr-code">
                <div class="qr-box">
                  QR Code<br/>Placeholder
                </div>
                <div class="qr-text">Scan to verify</div>
              </div>
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
                <td>${receiptData.fee.fee_name || 'N/A'}</td>
              </tr>
              <tr>
                <td>Academic Session</td>
                <td>${receiptData.payment.academic_session || 'N/A'}</td>
              </tr>
              <tr>
                <td>Payment Type</td>
                <td>${receiptData.payment.fee_type || 'N/A'}</td>
              </tr>
              <tr>
                <td>Payment Date</td>
                <td>${receiptData.payment.payment_date ? new Date(receiptData.payment.payment_date).toLocaleDateString() : 'N/A'}</td>
              </tr>
              <tr>
                <td>Reference Number</td>
                <td style="font-family: 'Courier New', monospace;">${receiptData.payment.reference || 'N/A'}</td>
              </tr>
              <tr>
                <td>Receipt Number</td>
                <td style="font-family: 'Courier New', monospace;">${receiptData.payment.receipt_number || 'N/A'}</td>
              </tr>
              <tr>
                <td>Payment Method</td>
                <td style="text-transform: capitalize;">${receiptData.payment.payment_method || 'N/A'}</td>
              </tr>
              <tr>
                <td style="font-weight: bold;">Amount Paid</td>
                <td style="font-weight: bold;"><span class="amount-paid">₦${receiptData.payment.amount ? receiptData.payment.amount.toLocaleString() : '0'}</span></td>
              </tr>
            </tbody>
          </table>

          <!-- Payment Summary -->
          <div class="summary-section">
            <h3>Payment Summary</h3>
            <div class="summary-grid">
              <div>
                <div class="summary-row">
                  <span class="summary-label">Total Fee:</span>
                  <span class="summary-value">₦${receiptData.fee.total_amount ? receiptData.fee.total_amount.toLocaleString() : '0'}</span>
                </div>
                <div class="summary-row">
                  <span class="summary-label">Total Paid:</span>
                  <span class="summary-value green">₦${receiptData.summary.total_paid ? receiptData.summary.total_paid.toLocaleString() : '0'}</span>
                </div>
              </div>
              <div>
                <div class="summary-row">
                  <span class="summary-label">Balance:</span>
                  <span class="summary-value ${receiptData.summary.balance > 0 ? 'red' : 'green'}">
                    ${receiptData.summary.balance > 0 ? `₦${receiptData.summary.balance.toLocaleString()}` : 'FULLY PAID ✓'}
                  </span>
                </div>
                <div class="summary-row">
                  <span class="summary-label">Status:</span>
                  <span class="summary-value ${receiptData.summary.is_fully_paid ? 'green' : 'red'}">
                    ${receiptData.summary.is_fully_paid ? 'PAYMENT COMPLETE' : 'PARTIAL PAYMENT'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="footer-section">
            <p>This is an official receipt from The Federal Polytechnic Bida</p>
            <p class="small">Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
            <p class="small">For verification, scan the QR code or visit our portal with reference: ${receiptData.payment.reference || 'N/A'}</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}
