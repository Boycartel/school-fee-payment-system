import PDFDocument from "pdfkit"

export async function generateReceiptPDF(receiptData: any): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const chunks: Buffer[] = []
      const doc = new PDFDocument({ margin: 0 })

      doc.on("data", (chunk) => chunks.push(chunk))
      doc.on("end", () => resolve(Buffer.concat(chunks)))
      doc.on("error", reject)

      // Header Section - Gray background
      doc.fillColor("#e5e7eb").rect(0, 0, 612, 100).fill()
      
      // Logo placeholder (centered circle)
      doc.fillColor("#ffffff").circle(306, 35, 20).fill()
      doc.strokeColor("#2563eb").lineWidth(2).circle(306, 35, 20).stroke()
      doc.fillColor("#2563eb").fontSize(8).font("Helvetica-Bold").text("LOGO", 296, 32, { width: 40, align: "center" })
      
      // Institution name and address
      doc.fillColor("#000000").fontSize(14).font("Helvetica-Bold").text("The Federal Polytechnic Bida", 0, 60, { align: "center" })
      doc.fontSize(9).font("Helvetica").text("Niger State, North Central, Nigeria", 0, 78, { align: "center" })
      doc.fontSize(9).text("KM 1.5, Doko Road, Bida Niger State", 0, 88, { align: "center" })

      // Receipt Title - White badge
      doc.fillColor("#ffffff").roundedRect(180, 115, 250, 30, 15).fill()
      doc.fillColor("#000000").fontSize(16).font("Helvetica-Bold").text("PAYMENT RECEIPT", 0, 122, { align: "center" })

      // Student Information Card
      const startY = 160
      doc.fillColor("#f8fafc").roundedRect(30, startY, 552, 120, 8).fill()
      doc.strokeColor("#d1d5db").lineWidth(1).roundedRect(30, startY, 552, 120, 8).stroke()

      // Student Photo Placeholder
      doc.fillColor("#e5e7eb").rect(40, startY + 12, 96, 128).fill()
      doc.strokeColor("#60a5fa").lineWidth(2).rect(40, startY + 12, 96, 128).stroke()
      doc.fillColor("#9ca3af").fontSize(10).font("Helvetica").text("No Photo", 40, startY + 70, { width: 96, align: "center" })

      // Student Details Section
      const detailsX = 150
      doc.fillColor("#2563eb").fontSize(12).font("Helvetica-Bold").text("STUDENT INFORMATION", detailsX, startY + 15)
      
      // Blue underline
      doc.strokeColor("#60a5fa").lineWidth(1).opacity(0.3)
        .moveTo(detailsX, startY + 32)
        .lineTo(detailsX + 200, startY + 32)
        .stroke()

      // Student details in two columns
      const studentDetails = [
        { label: "Full Name", value: receiptData.student?.full_name || 'N/A' },
        { label: "Matric Number", value: receiptData.student?.matric_number || 'N/A' },
        { label: "Level", value: receiptData.student?.level || 'N/A' },
        { label: "School", value: receiptData.student?.school_name || 'N/A' },
        { label: "Department", value: receiptData.student?.department_name || 'N/A' },
      ]

      let detailY = startY + 45
      const col1X = detailsX
      const col2X = detailsX + 200
      
      // First column
      doc.fillColor("#2563eb").fontSize(7).font("Helvetica-Bold").text("Full Name", col1X, detailY)
      doc.fillColor("#111827").fontSize(8).font("Helvetica").text(studentDetails[0].value, col1X, detailY + 10, { width: 180 })
      
      doc.fillColor("#2563eb").fontSize(7).font("Helvetica-Bold").text("Matric Number", col1X, detailY + 25)
      doc.fillColor("#111827").fontSize(8).font("Helvetica").text(studentDetails[1].value, col1X, detailY + 35, { width: 180 })
      
      doc.fillColor("#2563eb").fontSize(7).font("Helvetica-Bold").text("Level", col1X, detailY + 50)
      doc.fillColor("#111827").fontSize(8).font("Helvetica").text(studentDetails[2].value, col1X, detailY + 60, { width: 180 })

      // Second column
      doc.fillColor("#2563eb").fontSize(7).font("Helvetica-Bold").text("School", col2X, detailY)
      doc.fillColor("#111827").fontSize(8).font("Helvetica").text(studentDetails[3].value, col2X, detailY + 10, { width: 180 })
      
      doc.fillColor("#2563eb").fontSize(7).font("Helvetica-Bold").text("Department", col2X, detailY + 25)
      doc.fillColor("#111827").fontSize(8).font("Helvetica").text(studentDetails[4].value, col2X, detailY + 35, { width: 180 })

      // QR Code Placeholder
      const qrX = 450
      doc.fillColor("#ffffff").rect(qrX, startY + 20, 120, 120).fill()
      doc.strokeColor("#60a5fa").lineWidth(2).rect(qrX, startY + 20, 120, 120).stroke()
      doc.fillColor("#6b7280").fontSize(8).font("Helvetica").text("QR CODE", qrX, startY + 75, { width: 120, align: "center" })
      doc.fillColor("#4b5563").fontSize(7).text("Scan to verify", qrX, startY + 140, { width: 120, align: "center" })

      // Payment Details Table
      const tableStartY = startY + 140
      const tableHeaders = ["Description", "Details"]
      const tableData = [
        ["Fee Type", receiptData.fee?.fee_name || 'N/A'],
        ["Academic Session", receiptData.payment?.academic_session || 'N/A'],
        ["Payment Type", receiptData.payment?.fee_type || 'N/A'],
        ["Payment Date", receiptData.payment?.payment_date ? new Date(receiptData.payment.payment_date).toLocaleDateString() : 'N/A'],
        ["Reference Number", receiptData.payment?.reference || 'N/A'],
        ["Receipt Number", receiptData.payment?.receipt_number || 'N/A'],
        ["Payment Method", receiptData.payment?.payment_method ? receiptData.payment.payment_method.toUpperCase() : 'N/A'],
        ["Amount Paid", `₦${receiptData.payment?.amount ? receiptData.payment.amount.toLocaleString() : '0'}`],
      ]

      // Table Header - Black background
      doc.fillColor("#000000").rect(30, tableStartY, 552, 20).fill()
      doc.fillColor("#ffffff").fontSize(10).font("Helvetica-Bold")
      doc.text(tableHeaders[0], 40, tableStartY + 5, { width: 250 })
      doc.text(tableHeaders[1], 300, tableStartY + 5, { width: 270 })

      // Table Rows with alternating colors
      let rowY = tableStartY + 20
      tableData.forEach((row, index) => {
        const bgColor = index % 2 === 0 ? "#ffffff" : "#f3f4f6"
        doc.fillColor(bgColor).rect(30, rowY, 552, 20).fill()
        doc.strokeColor("#e5e7eb").lineWidth(0.5).rect(30, rowY, 552, 20).stroke()

        // Description column
        doc.fillColor("#111827").fontSize(8)
        doc.font(index === tableData.length - 1 ? "Helvetica-Bold" : "Helvetica")
        doc.text(row[0], 40, rowY + 5, { width: 250 })

        // Details column - green for amount
        const textColor = index === tableData.length - 1 ? "#059669" : "#111827"
        doc.fillColor(textColor)
        doc.text(row[1], 300, rowY + 5, { width: 270 })
        
        rowY += 20
      })

      // Payment Summary Section
      const summaryStartY = rowY + 15
      doc.fillColor("#f1f5f9").roundedRect(30, summaryStartY, 552, 80, 4).fill()
      doc.strokeColor("#d1d5db").lineWidth(4).rect(30, summaryStartY, 4, 80).stroke()

      doc.fillColor("#2563eb").fontSize(11).font("Helvetica-Bold").text("Payment Summary", 45, summaryStartY + 12)

      const summaryData = [
        { label: "Total Fee:", value: `₦${receiptData.fee?.total_amount ? receiptData.fee.total_amount.toLocaleString() : '0'}` },
        { label: "Total Paid:", value: `₦${receiptData.summary?.total_paid ? receiptData.summary.total_paid.toLocaleString() : '0'}`, color: "#059669" },
        {
          label: "Balance:",
          value: receiptData.summary?.balance > 0 ? `₦${receiptData.summary.balance.toLocaleString()}` : "FULLY PAID ✓",
          color: receiptData.summary?.balance > 0 ? "#dc2626" : "#059669",
        },
        {
          label: "Status:",
          value: receiptData.summary?.is_fully_paid ? "PAYMENT COMPLETE" : "PARTIAL PAYMENT",
          color: "#059669",
        },
      ]

      const summaryY = summaryStartY + 32
      const colWidth = 276
      
      summaryData.forEach((item, index) => {
        const col = Math.floor(index / 2)
        const row = index % 2

        const x = 45 + col * colWidth
        const y = summaryY + row * 20

        // Label
        doc.fillColor("#2563eb").fontSize(8).font("Helvetica-Bold").text(item.label, x, y)
        
        // Value
        doc.fillColor(item.color || "#111827").fontSize(8).font("Helvetica-Bold")
        doc.text(item.value, x + 80, y)
      })

      // Check icon for status
      doc.fillColor("#059669").fontSize(6).text("✓", 45 + 276 + 80, summaryY + 20)

      // Footer Section
      const footerY = summaryStartY + 90
      doc.strokeColor("#d1d5db").lineWidth(2).moveTo(30, footerY).lineTo(582, footerY).stroke()

      // Footer text
      doc.fillColor("#2563eb").fontSize(8).font("Helvetica-Bold")
        .text("This is an official receipt from The Federal Polytechnic Bida", 0, footerY + 10, { align: "center" })
      
      doc.fillColor("#6b7280").fontSize(7).font("Helvetica")
        .text(`Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, 0, footerY + 25, { align: "center" })
      
      doc.fillColor("#6b7280").fontSize(7)
        .text(`For verification, scan the QR code or visit our portal with reference: ${receiptData.payment?.reference || 'N/A'}`, 0, footerY + 38, { align: "center" })

      doc.end()
    } catch (error) {
      reject(error)
    }
  })
}
