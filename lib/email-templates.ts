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
  const formattedTime = paymentDate.toLocaleTimeString("en-GB")

  return `
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
          background: #f5f5f5;
          color: black;
          line-height: 1.4;
          padding: 20px;
        }
        
        .receipt-container {
          max-width: 800px;
          margin: 0 auto;
          background: white;
          border: 2px solid #d1d5db;
          border-radius: 8px;
          overflow: hidden;
        }
        
        .header {
          background: #e5e7eb;
          text-align: center;
          padding: 30px 20px;
          border-bottom: 2px solid #d1d5db;
        }
        
        .logo {
          width: 80px;
          height: 80px;
          margin: 0 auto 15px;
          background: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid #3b82f6;
        }
        
        .school-name {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 8px;
          color: #1f2937;
        }
        
        .school-address {
          font-size: 14px;
          margin-bottom: 20px;
          color: #6b7280;
          line-height: 1.5;
        }
        
        .receipt-title {
          background: white;
          color: black;
          padding: 12px 30px;
          border-radius: 25px;
          display: inline-block;
          font-size: 18px;
          font-weight: bold;
          border: 2px solid #3b82f6;
        }
        
        .content {
          padding: 30px;
        }
        
        .student-info {
          background: #f8fafc;
          border: 2px solid #d1d5db;
          border-radius: 12px;
          padding: 25px;
          margin-bottom: 25px;
          display: flex;
          gap: 25px;
          align-items: flex-start;
        }
        
        .student-photo {
          width: 100px;
          height: 120px;
          border: 2px solid #3b82f6;
          border-radius: 8px;
          background: #6b7280;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 12px;
          flex-shrink: 0;
          text-align: center;
        }
        
        .student-details {
          flex: 1;
        }
        
        .section-title {
          font-size: 18px;
          font-weight: bold;
          color: #3b82f6;
          border-bottom: 2px solid #3b82f6;
          padding-bottom: 8px;
          margin-bottom: 20px;
        }
        
        .details-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        
        .detail-item {
          display: flex;
          flex-direction: column;
        }
        
        .detail-label {
          font-size: 12px;
          font-weight: bold;
          color: #3b82f6;
          text-transform: uppercase;
          margin-bottom: 5px;
          letter-spacing: 0.5px;
        }
        
        .detail-value {
          font-size: 14px;
          font-weight: 600;
          color: #111827;
        }
        
        .qr-section {
          width: 120px;
          text-align: center;
          flex-shrink: 0;
        }
        
        .qr-code {
          width: 100px;
          height: 100px;
          background: white;
          border: 2px solid #3b82f6;
          border-radius: 8px;
          margin: 0 auto 15px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          color: #3b82f6;
        }
        
        .payment-table {
          width: 100%;
          border: 2px solid #3b82f6;
          border-radius: 8px;
          overflow: hidden;
          margin-bottom: 25px;
        }
        
        .payment-table th {
          background: #000000;
          color: white;
          padding: 15px;
          text-align: left;
          font-size: 14px;
          font-weight: bold;
        }
        
        .payment-table td {
          padding: 15px;
          border-bottom: 1px solid #e5e7eb;
          font-size: 14px;
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
          font-size: 16px;
        }
        
        .payment-summary {
          background: #f1f5f9;
          border-left: 4px solid #3b82f6;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 25px;
        }
        
        .summary-title {
          font-size: 16px;
          font-weight: bold;
          color: #3b82f6;
          margin-bottom: 15px;
        }
        
        .summary-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        
        .summary-item {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;
          padding: 5px 0;
        }
        
        .summary-label {
          font-size: 14px;
          font-weight: 500;
          color: #3b82f6;
        }
        
        .summary-value {
          font-size: 14px;
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
          margin-top: 30px;
          padding-top: 20px;
          border-top: 2px solid #e5e7eb;
        }
        
        .footer-title {
          font-size: 14px;
          font-weight: bold;
          color: #3b82f6;
          margin-bottom: 8px;
        }
        
        .footer-text {
          font-size: 12px;
          color: #6b7280;
          margin-bottom: 5px;
        }
        
        @media (max-width: 600px) {
          .student-info {
            flex-direction: column;
            text-align: center;
          }
          
          .details-grid {
            grid-template-columns: 1fr;
          }
          
          .summary-grid {
            grid-template-columns: 1fr;
          }
        }
      </style>
    </head>
    <body>
      <div class="receipt-container">
        <!-- Header -->
        <div class="header">
          <div class="logo">
            <span style="font-size: 12px; color: #3b82f6; font-weight: bold;">FPB</span>
          </div>
          <div class="school-name">The Federal Polytechnic Bida</div>
          <div class="school-address">
            Niger State, North Central, Nigeria<br>
            KM 1.5, Doko Road, Bida Niger State<br>
            Tel: +234-xxx-xxx-xxxx | Email: info@fedpolybida.edu.ng
          </div>
          <div class="receipt-title">PAYMENT RECEIPT</div>
        </div>

        <!-- Content -->
        <div class="content">
          <!-- Student Information -->
          <div class="student-info">
            <div class="student-photo">
              ${
                data.student.passport_photo
                  ? `<img src="${data.student.passport_photo}" alt="Student" style="width: 100%; height: 100%; object-fit: cover; border-radius: 6px;">`
                  : "No Photo<br>Available"
              }
            </div>
            
            <div class="student-details">
              <div class="section-title">STUDENT INFORMATION</div>
              <div class="details-grid">
                <div class="detail-item">
                  <div class="detail-label">Full Name</div>
                  <div class="detail-value">${data.student.full_name}</div>
                </div>
                <div class="detail-item">
                  <div class="detail-label">Matric Number</div>
                  <div class="detail-value">${data.student.matric_number}</div>
                </div>
                <div class="detail-item">
                  <div class="detail-label">Level</div>
                  <div class="detail-value">${data.student.level}</div>
                </div>
                <div class="detail-item">
                  <div class="detail-label">School</div>
                  <div class="detail-value">${data.student.school_name}</div>
                </div>
                <div class="detail-item">
                  <div class="detail-label">Department</div>
                  <div class="detail-value">${data.student.department_name}</div>
                </div>
                <div class="detail-item">
                  <div class="detail-label">Email</div>
                  <div class="detail-value">${data.student.email}</div>
                </div>
              </div>
            </div>
            
            <div class="qr-section">
              <div class="qr-code">QR Code</div>
              <div style="font-size: 12px; color: #6b7280;">Scan to verify</div>
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
                <td>${data.fee.fee_name}</td>
              </tr>
              <tr>
                <td>Academic Session</td>
                <td>${data.payment.academic_session}</td>
              </tr>
              <tr>
                <td>Payment Type</td>
                <td>${data.payment.fee_type}</td>
              </tr>
              <tr>
                <td>Payment Date</td>
                <td>${formattedDate}</td>
              </tr>
              <tr>
                <td>Payment Time</td>
                <td>${formattedTime}</td>
              </tr>
              <tr>
                <td>Reference Number</td>
                <td>${data.payment.reference}</td>
              </tr>
              <tr>
                <td>Receipt Number</td>
                <td>${data.payment.receipt_number}</td>
              </tr>
              <tr>
                <td>Payment Method</td>
                <td style="text-transform: capitalize;">${data.payment.payment_method || "Paystack"}</td>
              </tr>
              <tr style="background: #f3f4f6;">
                <td style="font-weight: bold;">Amount Paid</td>
                <td class="amount-highlight">₦${amount.toLocaleString()}</td>
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
                  <span class="summary-value">₦${totalAmount.toLocaleString()}</span>
                </div>
                <div class="summary-item">
                  <span class="summary-label">Total Paid:</span>
                  <span class="summary-value green">₦${totalPaid.toLocaleString()}</span>
                </div>
              </div>
              <div>
                <div class="summary-item">
                  <span class="summary-label">Balance:</span>
                  <span class="summary-value ${balance > 0 ? "red" : "green"}">
                    ${balance > 0 ? `₦${balance.toLocaleString()}` : "FULLY PAID ✓"}
                  </span>
                </div>
                <div class="summary-item">
                  <span class="summary-label">Status:</span>
                  <span class="summary-value green">
                    ✓ ${data.summary.is_fully_paid ? "PAYMENT COMPLETE" : "PARTIAL PAYMENT"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="footer">
            <div class="footer-title">This is an official receipt from The Federal Polytechnic Bida</div>
            <div class="footer-text">Generated on ${new Date().toLocaleDateString("en-GB")} at ${new Date().toLocaleTimeString("en-GB")}</div>
            <div class="footer-text">For verification, scan the QR code or visit our portal with reference: ${data.payment.reference}</div>
            <div class="footer-text">This receipt is valid and can be used for official purposes.</div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `
}
