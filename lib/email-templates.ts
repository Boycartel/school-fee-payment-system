export function generatePaymentReceiptEmail(paymentData: {
  studentName: string
  matricNumber: string
  email: string
  phone?: string
  level: string
  department: string
  school: string
  feeName: string
  feeType: string
  amount: number
  totalAmount: number
  reference: string
  receiptNumber: string
  paymentDate: string
  academicSession: string
  installmentNumber?: number
  totalInstallments?: number
  totalPaid: number
  balance: number
}) {
  const {
    studentName,
    matricNumber,
    email,
    phone,
    level,
    department,
    school,
    feeName,
    feeType,
    amount,
    totalAmount,
    reference,
    receiptNumber,
    paymentDate,
    academicSession,
    installmentNumber,
    totalInstallments,
    totalPaid,
    balance,
  } = paymentData

  const isInstallment = installmentNumber && totalInstallments && totalInstallments > 1
  const paymentStatus = balance > 0 ? "Partial Payment" : "Fully Paid"

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Payment Receipt - ${feeName}</title>
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
        .logo {
          width: 80px;
          height: 80px;
          margin: 0 auto 15px;
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
        .receipt-title {
          background-color: #f8f9fa;
          border: 2px solid #dee2e6;
          border-radius: 8px;
          padding: 15px;
          text-align: center;
          margin-bottom: 30px;
        }
        .receipt-title h2 {
          color: #000;
          font-weight: bold;
          font-size: 20px;
          margin: 0;
        }
        .info-section {
          margin-bottom: 25px;
        }
        .info-title {
          color: #0e1c36;
          font-size: 18px;
          font-weight: bold;
          margin-bottom: 15px;
          border-bottom: 2px solid #4a90e2;
          padding-bottom: 5px;
        }
        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
        }
        .info-item {
          display: flex;
          flex-direction: column;
        }
        .info-label {
          font-weight: bold;
          color: #666;
          font-size: 12px;
          text-transform: uppercase;
          margin-bottom: 3px;
        }
        .info-value {
          color: #333;
          font-size: 14px;
        }
        .payment-summary {
          background-color: #f8f9fa;
          border-radius: 8px;
          padding: 20px;
          margin: 25px 0;
        }
        .summary-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;
          padding: 5px 0;
        }
        .summary-row.total {
          border-top: 2px solid #0e1c36;
          padding-top: 15px;
          margin-top: 15px;
          font-weight: bold;
          font-size: 16px;
        }
        .amount {
          color: #0e1c36;
          font-weight: bold;
        }
        .status-badge {
          display: inline-block;
          padding: 5px 15px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: bold;
          text-transform: uppercase;
        }
        .status-verified {
          background-color: #d4edda;
          color: #155724;
        }
        .status-partial {
          background-color: #fff3cd;
          color: #856404;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #dee2e6;
          color: #666;
          font-size: 12px;
        }
        .verification-note {
          background-color: #e7f3ff;
          border-left: 4px solid #4a90e2;
          padding: 15px;
          margin: 20px 0;
          border-radius: 0 5px 5px 0;
        }
        @media (max-width: 600px) {
          .info-grid {
            grid-template-columns: 1fr;
          }
          .summary-row {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">
            <svg width="80" height="80" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="50" cy="50" r="45" fill="#0e1c36"/>
              <circle cx="50" cy="50" r="35" fill="#4a90e2"/>
              <rect x="40" y="35" width="20" height="15" fill="white" rx="2"/>
              <rect x="42" y="37" width="16" height="2" fill="#0e1c36"/>
              <rect x="42" y="40" width="16" height="2" fill="#0e1c36"/>
              <rect x="42" y="43" width="16" height="2" fill="#0e1c36"/>
              <rect x="45" y="55" width="10" height="15" fill="white"/>
            </svg>
          </div>
          <h1 class="title">The Federal Polytechnic Bida</h1>
          <p class="subtitle">Fee Confirmation System</p>
        </div>

        <div class="receipt-title">
          <h2>PAYMENT RECEIPT</h2>
        </div>

        <div class="info-section">
          <div class="info-title">Student Information</div>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">Full Name</span>
              <span class="info-value">${studentName}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Matric Number</span>
              <span class="info-value">${matricNumber}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Level</span>
              <span class="info-value">${level}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Department</span>
              <span class="info-value">${department}</span>
            </div>
            <div class="info-item">
              <span class="info-label">School</span>
              <span class="info-value">${school}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Email</span>
              <span class="info-value">${email}</span>
            </div>
          </div>
        </div>

        <div class="info-section">
          <div class="info-title">Payment Details</div>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">Receipt Number</span>
              <span class="info-value">${receiptNumber}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Payment Reference</span>
              <span class="info-value">${reference}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Payment Date</span>
              <span class="info-value">${new Date(paymentDate).toLocaleDateString("en-GB")}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Academic Session</span>
              <span class="info-value">${academicSession}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Fee Type</span>
              <span class="info-value">${feeType}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Payment Status</span>
              <span class="info-value">
                <span class="status-badge ${balance > 0 ? "status-partial" : "status-verified"}">
                  ${paymentStatus}
                </span>
              </span>
            </div>
          </div>
        </div>

        <div class="info-section">
          <div class="info-title">Fee Information</div>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">Fee Name</span>
              <span class="info-value">${feeName}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Total Fee Amount</span>
              <span class="info-value amount">₦${totalAmount.toLocaleString()}</span>
            </div>
            ${
              isInstallment
                ? `
            <div class="info-item">
              <span class="info-label">Installment</span>
              <span class="info-value">${installmentNumber} of ${totalInstallments}</span>
            </div>
            <div class="info-item">
              <span class="info-label">This Payment</span>
              <span class="info-value amount">₦${amount.toLocaleString()}</span>
            </div>
            `
                : ""
            }
          </div>
        </div>

        <div class="payment-summary">
          <div class="summary-row">
            <span>Amount Paid (This Transaction):</span>
            <span class="amount">₦${amount.toLocaleString()}</span>
          </div>
          <div class="summary-row">
            <span>Total Amount Paid:</span>
            <span class="amount">₦${totalPaid.toLocaleString()}</span>
          </div>
          <div class="summary-row">
            <span>Outstanding Balance:</span>
            <span class="amount">₦${balance.toLocaleString()}</span>
          </div>
          <div class="summary-row total">
            <span>Total Fee Amount:</span>
            <span class="amount">₦${totalAmount.toLocaleString()}</span>
          </div>
        </div>

        <div class="verification-note">
          <strong>Payment Verification:</strong> This payment has been successfully verified and processed. 
          You can verify this payment anytime by visiting our verification portal with your payment reference: <strong>${reference}</strong>
        </div>

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
