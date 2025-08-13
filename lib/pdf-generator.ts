import puppeteer from "puppeteer"

export async function generateReceiptPDF(receiptData: any): Promise<Buffer> {
  let browser
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    })

    const page = await browser.newPage()

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: Arial, sans-serif; 
              line-height: 1.4; 
              color: #333; 
              background: white;
              padding: 20px;
            }
            .receipt-container { 
              max-width: 800px; 
              margin: 0 auto; 
              border: 2px solid #1e40af;
              border-radius: 8px;
              overflow: hidden;
            }
            .header { 
              background: #1e40af; 
              color: white; 
              padding: 30px 20px; 
              text-align: center; 
            }
            .header h1 { 
              font-size: 28px; 
              margin-bottom: 10px; 
              font-weight: bold;
            }
            .header p { 
              font-size: 16px; 
              margin: 5px 0;
            }
            .content { 
              padding: 30px; 
              background: white;
            }
            .receipt-info { 
              background: #f8fafc; 
              padding: 20px; 
              border-radius: 8px; 
              margin: 20px 0;
              border: 1px solid #e2e8f0;
            }
            .receipt-info h3 { 
              color: #1e40af; 
              margin-bottom: 15px; 
              font-size: 18px;
              border-bottom: 2px solid #1e40af;
              padding-bottom: 5px;
            }
            .info-grid { 
              display: grid; 
              grid-template-columns: 1fr 1fr; 
              gap: 15px;
            }
            .info-row { 
              display: flex; 
              justify-content: space-between; 
              margin: 10px 0;
              padding: 8px 0;
              border-bottom: 1px solid #e2e8f0;
            }
            .info-row:last-child {
              border-bottom: none;
            }
            .info-label { 
              font-weight: 600; 
              color: #374151;
            }
            .info-value { 
              font-weight: 500; 
              color: #111827;
            }
            .amount { 
              font-size: 20px; 
              font-weight: bold; 
              color: #059669;
            }
            .status-verified { 
              color: #059669; 
              font-weight: bold;
              background: #d1fae5;
              padding: 4px 8px;
              border-radius: 4px;
            }
            .footer { 
              text-align: center; 
              color: #6b7280; 
              font-size: 12px; 
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
            }
            .verification-note {
              background: #fef3c7;
              border: 1px solid #f59e0b;
              border-radius: 6px;
              padding: 15px;
              margin: 20px 0;
              text-align: center;
            }
            .verification-note strong {
              color: #92400e;
            }
            @media print {
              body { padding: 0; }
              .receipt-container { border: none; }
            }
          </style>
        </head>
        <body>
          <div class="receipt-container">
            <div class="header">
              <h1>PAYMENT RECEIPT</h1>
              <p>The Federal Polytechnic Bida</p>
              <p>Bida, Niger State, Nigeria</p>
            </div>
            
            <div class="content">
              <div class="receipt-info">
                <h3>Payment Information</h3>
                <div class="info-row">
                  <span class="info-label">Receipt Number:</span>
                  <span class="info-value"><strong>${receiptData.payment.receipt_number}</strong></span>
                </div>
                <div class="info-row">
                  <span class="info-label">Payment Reference:</span>
                  <span class="info-value">${receiptData.payment.reference}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Amount Paid:</span>
                  <span class="info-value amount">₦${receiptData.payment.amount.toLocaleString()}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Payment Date:</span>
                  <span class="info-value">${new Date(receiptData.payment.payment_date).toLocaleDateString("en-GB")}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Academic Session:</span>
                  <span class="info-value">${receiptData.payment.academic_session || "N/A"}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Status:</span>
                  <span class="info-value status-verified">VERIFIED</span>
                </div>
              </div>
              
              <div class="receipt-info">
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
                  <span class="info-value">${receiptData.student.department_name || "N/A"}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">School:</span>
                  <span class="info-value">${receiptData.student.school_name || "N/A"}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Level:</span>
                  <span class="info-value">${receiptData.student.level}</span>
                </div>
              </div>
              
              <div class="receipt-info">
                <h3>Fee Information</h3>
                <div class="info-row">
                  <span class="info-label">Fee Type:</span>
                  <span class="info-value">${receiptData.fee.fee_name}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Total Fee Amount:</span>
                  <span class="info-value">₦${receiptData.fee.total_amount.toLocaleString()}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Total Paid:</span>
                  <span class="info-value">₦${receiptData.summary.total_paid.toLocaleString()}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Balance:</span>
                  <span class="info-value">₦${receiptData.summary.balance.toLocaleString()}</span>
                </div>
              </div>
              
              <div class="verification-note">
                <strong>Verification:</strong> This receipt can be verified online using reference: <strong>${receiptData.payment.reference}</strong>
              </div>
              
              <div class="footer">
                <p>This is a computer-generated receipt and does not require a signature.</p>
                <p>Generated on ${new Date().toLocaleDateString("en-GB")} at ${new Date().toLocaleTimeString()}</p>
                <p>© ${new Date().getFullYear()} The Federal Polytechnic Bida. All rights reserved.</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `

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
    throw error
  } finally {
    if (browser) {
      await browser.close()
    }
  }
}
