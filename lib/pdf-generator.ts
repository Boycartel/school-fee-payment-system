import PDFDocument from "pdfkit"

export async function generateReceiptPDF(receiptData: any): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const chunks: Buffer[] = []
      const doc = new PDFDocument()

      doc.on("data", (chunk) => chunks.push(chunk))
      doc.on("end", () => resolve(Buffer.concat(chunks)))
      doc.on("error", reject)

      // Header Section
      doc.fillColor("#e5e7eb").rect(0, 0, 612, 100).fill()
      doc.fillColor("#000000").fontSize(14).font("Helvetica-Bold").text("The Federal Polytechnic Bida", 50, 15)
      doc.fontSize(9).font("Helvetica").text("Niger State, North Central, Nigeria", 50, 32)
      doc.fontSize(9).text("KM 1.5, Doko Road, Bida Niger State", 50, 42)

      // Receipt Title
      doc.fillColor("#ffffff").rect(180, 55, 250, 30).fill()
      doc.fillColor("#000000").fontSize(16).font("Helvetica-Bold").text("PAYMENT RECEIPT", 200, 62, { width: 210 })

      // Student Information Card Header
      const startY = 115
      doc.fillColor("#f3f4f6").rect(30, startY, 552, 120).fill()
      doc.strokeColor("#d1d5db").lineWidth(1).rect(30, startY, 552, 120).stroke()

      // Student Photo Placeholder
      doc
        .fillColor("#e5e7eb")
        .rect(40, startY + 8, 60, 80)
        .fill()
      doc
        .strokeColor("#60a5fa")
        .lineWidth(2)
        .rect(40, startY + 8, 60, 80)
        .stroke()
      doc
        .fillColor("#9ca3af")
        .fontSize(8)
        .text("Photo", 50, startY + 40, { align: "center", width: 40 })

      // Student Details
      const detailsX = 110
      doc
        .fillColor("#2563eb")
        .fontSize(10)
        .font("Helvetica-Bold")
        .text("STUDENT INFORMATION", detailsX, startY + 10)

      const studentDetails = [
        { label: "Full Name", value: receiptData.student.full_name },
        { label: "Matric Number", value: receiptData.student.matric_number },
        { label: "Level", value: receiptData.student.level },
        { label: "School", value: receiptData.student.school_name },
        { label: "Department", value: receiptData.student.department_name },
      ]

      let detailY = startY + 30
      studentDetails.forEach((detail) => {
        doc.fillColor("#2563eb").fontSize(7).font("Helvetica-Bold").text(detail.label, detailsX, detailY)
        doc
          .fillColor("#111827")
          .fontSize(8)
          .font("Helvetica")
          .text(detail.value, detailsX, detailY + 10)
        detailY += 18
      })

      // Payment Details Table
      const tableStartY = startY + 130
      const tableHeaders = ["Description", "Details"]
      const tableData = [
        ["Fee Type", receiptData.fee.fee_name],
        ["Academic Session", receiptData.payment.academic_session],
        ["Payment Type", receiptData.payment.fee_type],
        ["Payment Date", new Date(receiptData.payment.payment_date).toLocaleDateString()],
        ["Reference Number", receiptData.payment.reference],
        ["Receipt Number", receiptData.payment.receipt_number],
        ["Payment Method", "Paystack"],
        ["Amount Paid", `₦${receiptData.payment.amount.toLocaleString()}`],
      ]

      // Table Header
      doc.fillColor("#000000").rect(30, tableStartY, 552, 20).fill()
      doc.fillColor("#ffffff").fontSize(10).font("Helvetica-Bold")
      doc.text(tableHeaders[0], 40, tableStartY + 5, { width: 250 })
      doc.text(tableHeaders[1], 300, tableStartY + 5, { width: 270 })

      // Table Rows
      let rowY = tableStartY + 20
      tableData.forEach((row, index) => {
        const bgColor = index % 2 === 0 ? "#ffffff" : "#f9fafb"
        doc.fillColor(bgColor).rect(30, rowY, 552, 20).fill()
        doc.strokeColor("#e5e7eb").lineWidth(0.5).rect(30, rowY, 552, 20).stroke()

        doc
          .fillColor("#111827")
          .fontSize(8)
          .font(index === tableData.length - 1 ? "Helvetica-Bold" : "Helvetica")
        doc.text(row[0], 40, rowY + 5, { width: 250 })

        const textColor = index === tableData.length - 1 ? "#059669" : "#111827"
        doc.fillColor(textColor)
        doc.text(row[1], 300, rowY + 5, { width: 270 })
        rowY += 20
      })

      // Payment Summary
      const summaryStartY = rowY + 15
      doc.fillColor("#f1f5f9").rect(30, summaryStartY, 552, 80).fill()
      doc.strokeColor("#d1d5db").lineWidth(1).rect(30, summaryStartY, 4, 80).stroke()

      doc
        .fillColor("#2563eb")
        .fontSize(11)
        .font("Helvetica-Bold")
        .text("Payment Summary", 40, summaryStartY + 8)

      const summaryData = [
        { label: "Total Fee:", value: `₦${receiptData.fee.total_amount.toLocaleString()}` },
        { label: "Total Paid:", value: `₦${receiptData.summary.total_paid.toLocaleString()}`, color: "#059669" },
        {
          label: "Balance:",
          value: receiptData.summary.balance > 0 ? `₦${receiptData.summary.balance.toLocaleString()}` : "FULLY PAID ✓",
          color: receiptData.summary.balance > 0 ? "#dc2626" : "#059669",
        },
        {
          label: "Status:",
          value: receiptData.summary.is_fully_paid ? "PAYMENT COMPLETE" : "PARTIAL PAYMENT",
          color: "#059669",
        },
      ]

      const summaryY = summaryStartY + 28
      const colWidth = 276
      summaryData.forEach((item, index) => {
        const col = Math.floor(index / 2)
        const row = index % 2

        const x = 40 + col * colWidth
        const y = summaryY + row * 20

        doc.fillColor("#2563eb").fontSize(8).font("Helvetica-Bold").text(item.label, x, y)
        doc
          .fillColor(item.color || "#111827")
          .fontSize(8)
          .font("Helvetica-Bold")
          .text(item.value, x + 100, y)
      })

      // Footer
      const footerY = summaryStartY + 90
      doc.strokeColor("#e5e7eb").lineWidth(1).moveTo(30, footerY).lineTo(582, footerY).stroke()

      doc
        .fillColor("#2563eb")
        .fontSize(8)
        .font("Helvetica-Bold")
        .text("This is an official receipt from The Federal Polytechnic Bida", 50, footerY + 10, {
          align: "center",
          width: 512,
        })
      doc
        .fillColor("#6b7280")
        .fontSize(7)
        .font("Helvetica")
        .text(
          `Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`,
          50,
          footerY + 25,
          { align: "center", width: 512 },
        )
      doc
        .fillColor("#6b7280")
        .fontSize(7)
        .text(
          `For verification, scan the QR code or visit our portal with reference: ${receiptData.payment.reference}`,
          50,
          footerY + 38,
          { align: "center", width: 512 },
        )

      doc.end()
    } catch (error) {
      reject(error)
    }
  })
}
