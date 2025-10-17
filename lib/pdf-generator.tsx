import html2pdf from "html2pdf.js"

export async function generateReceiptPDF(receiptData: any): Promise<Buffer> {
  try {
    const receiptHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: Arial, sans-serif;
            background: white;
            padding: 20px;
          }
          
          .receipt-container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            border: 2px solid #d1d5db;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          }
          
          .receipt-header {
            background-color: #e5e7eb;
            text-align: center;
            padding: 20px;
            border-bottom: 1px solid #d1d5db;
          }
          
          .logo-section {
            width: 60px;
            height: 60px;
            margin: 0 auto 10px;
            background: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 2px solid #e5e7eb;
          }
          
          .logo-section img {
            width: 45px;
            height: 45px;
            object-fit: contain;
          }
          
          .receipt-header h1 {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 5px;
            color: #000;
          }
          
          .receipt-header p {
            font-size: 9px;
            color: #555;
            margin-bottom: 3px;
          }
          
          .receipt-title {
            background: white;
            color: #000;
            padding: 8px 16px;
            border-radius: 20px;
            display: inline-block;
            font-weight: bold;
            margin-top: 10px;
            font-size: 14px;
          }
          
          .receipt-content {
            padding: 20px;
          }
          
          .student-card {
            background: #f8fafc;
            border: 2px solid #d1d5db;
            border-radius: 10px;
            padding: 15px;
            margin-bottom: 20px;
          }
          
          .student-header {
            display: flex;
            gap: 15px;
            margin-bottom: 15px;
          }
          
          .student-photo {
            width: 80px;
            min-width: 80px;
            height: 100px;
            border: 2px solid #60a5fa;
            border-radius: 8px;
            background: #e5e7eb;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 11px;
            color: #999;
          }
          
          .student-details {
            flex: 1;
          }
          
          .student-details h3 {
            color: #2563eb;
            font-size: 11px;
            font-weight: bold;
            margin-bottom: 10px;
            border-bottom: 2px solid #60a5fa;
            padding-bottom: 5px;
            text-transform: uppercase;
          }
          
          .details-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
          }
          
          .detail-item {
            margin-bottom: 8px;
          }
          
          .detail-label {
            font-size: 7px;
            font-weight: bold;
            color: #2563eb;
            text-transform: uppercase;
          }
          
          .detail-value {
            font-size: 9px;
            color: #111;
            font-weight: 500;
            margin-top: 2px;
          }
          
          .qr-section {
            text-align: center;
            border: 2px solid #60a5fa;
            padding: 8px;
            border-radius: 8px;
            background: white;
          }
          
          .qr-section img {
            width: 80px;
            height: 80px;
          }
          
          .qr-label {
            font-size: 7px;
            color: #999;
            margin-top: 5px;
          }
          
          .payment-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
            border: 2px solid #60a5fa;
            border-radius: 8px;
            overflow: hidden;
          }
          
          .payment-table thead {
            background-color: #000;
            color: white;
          }
          
          .payment-table th {
            padding: 10px;
            text-align: left;
            font-size: 9px;
            font-weight: bold;
          }
          
          .payment-table td {
            padding: 8px 10px;
            border-bottom: 1px solid #e5e7eb;
            font-size: 8px;
            color: #111;
          }
          
          .payment-table tbody tr:nth-child(even) {
            background-color: #f9fafb;
          }
          
          .payment-table tbody tr:last-child {
            background-color: #f3f4f6;
            font-weight: bold;
          }
          
          .payment-table tbody tr:last-child td:nth-child(2) {
            color: #059669;
          }
          
          .summary-section {
            background: #f1f5f9;
            padding: 15px;
            border-left: 4px solid #d1d5db;
            border-radius: 4px;
            margin-bottom: 20px;
          }
          
          .summary-section h3 {
            color: #2563eb;
            font-size: 10px;
            font-weight: bold;
            margin-bottom: 10px;
          }
          
          .summary-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
          }
          
          .summary-item {
            display: flex;
            justify-content: space-between;
            font-size: 8px;
            margin-bottom: 5px;
          }
          
          .summary-label {
            color: #2563eb;
            font-weight: bold;
          }
          
          .summary-value {
            color: #111;
            font-weight: bold;
          }
          
          .summary-value.paid {
            color: #059669;
          }
          
          .summary-value.balance {
            color: #dc2626;
          }
          
          .summary-value.complete {
            color: #059669;
          }
          
          .receipt-footer {
            text-align: center;
            border-top: 2px solid #e5e7eb;
            padding-top: 15px;
            margin-top: 15px;
          }
          
          .footer-text {
            font-size: 8px;
            color: #111;
            font-weight: 600;
            margin-bottom: 5px;
          }
          
          .footer-subtext {
            font-size: 7px;
            color: #666;
            margin-bottom: 3px;
          }
        </style>
      </head>
      <body>
        <div class="receipt-container">
          <div class="receipt-header">
            <div class="logo-section">
              <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIGZpbGw9IiNFRUVFRUUiLz48L3N2Zz4=" alt="Logo" />
            </div>
            <h1>The Federal Polytechnic Bida</h1>
            <p>Niger State, North Central, Nigeria</p>
            <p>KM 1.5, Doko Road, Bida Niger State</p>
            <div class="receipt-title">PAYMENT RECEIPT</div>
          </div>
          
          <div class="receipt-content">
            <div class="student-card">
              <div class="student-header">
                <div class="student-photo">No Photo</div>
                <div class="student-details">
                  <h3>Student Information</h3>
                  <div class="details-grid">
                    <div>
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
                    </div>
                    <div>
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
                </div>
              </div>
            </div>
            
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
                  <td>Online</td>
                </tr>
                <tr>
                  <td>Amount Paid</td>
                  <td>₦${receiptData.payment.amount.toLocaleString()}</td>
                </tr>
              </tbody>
            </table>
            
            <div class="summary-section">
              <h3>Payment Summary</h3>
              <div class="summary-grid">
                <div>
                  <div class="summary-item">
                    <span class="summary-label">Total Fee:</span>
                    <span class="summary-value">₦${receiptData.fee.total_amount.toLocaleString()}</span>
                  </div>
                  <div class="summary-item">
                    <span class="summary-label">Total Paid:</span>
                    <span class="summary-value paid">₦${receiptData.summary.total_paid.toLocaleString()}</span>
                  </div>
                </div>
                <div>
                  <div class="summary-item">
                    <span class="summary-label">Balance:</span>
                    <span class="summary-value ${receiptData.summary.balance > 0 ? "balance" : "complete"}">
                      ${receiptData.summary.balance > 0 ? "₦" + receiptData.summary.balance.toLocaleString() : "FULLY PAID ✓"}
                    </span>
                  </div>
                  <div class="summary-item">
                    <span class="summary-label">Status:</span>
                    <span class="summary-value complete">
                      ${receiptData.summary.is_fully_paid ? "PAYMENT COMPLETE" : "PARTIAL PAYMENT"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="receipt-footer">
              <div class="footer-text">This is an official receipt from The Federal Polytechnic Bida</div>
              <div class="footer-subtext">Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</div>
              <div class="footer-subtext">For verification, scan the QR code or visit our portal with reference: ${receiptData.payment.reference}</div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `

    // Use html2pdf to convert HTML to PDF
    const element = document.createElement("div")
    element.innerHTML = receiptHTML

    const opt = {
      margin: 5,
      filename: `Receipt-${receiptData.payment.receipt_number}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { orientation: "portrait", unit: "mm", format: "a4" },
    }

    return new Promise((resolve, reject) => {
      try {
        html2pdf()
          .set(opt)
          .from(element)
          .toPdf()
          .get("pdf")
          .then((pdf: any) => {
            const buffer = Buffer.from(pdf.output("arraybuffer"))
            resolve(buffer)
          })
          .catch((error: any) => {
            reject(error)
          })
      } catch (error) {
        reject(error)
      }
    })
  } catch (error) {
    throw error
  }
}
