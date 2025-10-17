export async function generateReceiptPDF(receiptData: any): Promise<Buffer> {
  try {
    // Create a simple but valid PDF with the receipt content
    const pdf = createSimplePDF(receiptData)
    return Buffer.from(pdf, "binary")
  } catch (error) {
    console.error("Error generating PDF:", error)
    throw error
  }
}

function createSimplePDF(receiptData: any): string {
  // Create a simple PDF structure without external dependencies
  const lines: string[] = []

  // PDF Header
  lines.push("%PDF-1.4")
  lines.push("1 0 obj")
  lines.push("<< /Type /Catalog /Pages 2 0 R >>")
  lines.push("endobj")

  lines.push("2 0 obj")
  lines.push("<< /Type /Pages /Kids [3 0 R] /Count 1 >>")
  lines.push("endobj")

  // Page object
  lines.push("3 0 obj")
  lines.push(
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> >>",
  )
  lines.push("endobj")

  // Content stream
  const contentLines: string[] = []
  contentLines.push("BT")
  contentLines.push("/F2 14 Tf")
  contentLines.push("50 750 Td")
  contentLines.push("(The Federal Polytechnic Bida) Tj")
  contentLines.push("0 -20 Td")
  contentLines.push("/F1 10 Tf")
  contentLines.push("(PAYMENT RECEIPT) Tj")
  contentLines.push("0 -30 Td")
  contentLines.push("/F2 11 Tf")
  contentLines.push("(Student Information) Tj")
  contentLines.push("0 -15 Td")
  contentLines.push("/F1 9 Tf")
  contentLines.push(`(Full Name: ${receiptData.student.full_name}) Tj`)
  contentLines.push("0 -12 Td")
  contentLines.push(`(Matric Number: ${receiptData.student.matric_number}) Tj`)
  contentLines.push("0 -12 Td")
  contentLines.push(`(Department: ${receiptData.student.department_name}) Tj`)
  contentLines.push("0 -12 Td")
  contentLines.push(`(Level: ${receiptData.student.level}) Tj`)
  contentLines.push("0 -25 Td")
  contentLines.push("/F2 11 Tf")
  contentLines.push("(Payment Information) Tj")
  contentLines.push("0 -15 Td")
  contentLines.push("/F1 9 Tf")
  contentLines.push(`(Fee Type: ${receiptData.fee.fee_name}) Tj`)
  contentLines.push("0 -12 Td")
  contentLines.push(`(Amount Paid: N${receiptData.payment.amount.toLocaleString()}) Tj`)
  contentLines.push("0 -12 Td")
  contentLines.push(`(Payment Date: ${new Date(receiptData.payment.payment_date).toLocaleDateString()}) Tj`)
  contentLines.push("0 -12 Td")
  contentLines.push(`(Reference: ${receiptData.payment.reference}) Tj`)
  contentLines.push("0 -12 Td")
  contentLines.push(`(Receipt Number: ${receiptData.payment.receipt_number}) Tj`)
  contentLines.push("0 -25 Td")
  contentLines.push("/F2 11 Tf")
  contentLines.push("(Payment Summary) Tj")
  contentLines.push("0 -15 Td")
  contentLines.push("/F1 9 Tf")
  contentLines.push(`(Total Fee: N${receiptData.fee.total_amount.toLocaleString()}) Tj`)
  contentLines.push("0 -12 Td")
  contentLines.push(`(Total Paid: N${receiptData.summary.total_paid.toLocaleString()}) Tj`)
  contentLines.push("0 -12 Td")
  contentLines.push(
    `(Balance: ${receiptData.summary.balance > 0 ? `N${receiptData.summary.balance.toLocaleString()}` : "FULLY PAID"}) Tj`,
  )
  contentLines.push("0 -12 Td")
  contentLines.push(`(Status: ${receiptData.summary.is_fully_paid ? "PAYMENT COMPLETE" : "PARTIAL PAYMENT"}) Tj`)
  contentLines.push("0 -25 Td")
  contentLines.push("/F1 8 Tf")
  contentLines.push("(This is an official receipt from The Federal Polytechnic Bida) Tj")
  contentLines.push("ET")

  const contentStream = contentLines.join("\n")

  lines.push("4 0 obj")
  lines.push(`<< /Length ${contentStream.length} >>`)
  lines.push("stream")
  lines.push(contentStream)
  lines.push("endstream")
  lines.push("endobj")

  // Font 1 (Helvetica)
  lines.push("5 0 obj")
  lines.push("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>")
  lines.push("endobj")

  // Font 2 (Helvetica-Bold)
  lines.push("6 0 obj")
  lines.push("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>")
  lines.push("endobj")

  // xref table
  const xrefPosition = lines.join("\n").length
  lines.push("xref")
  lines.push("0 7")
  lines.push("0000000000 65535 f")

  let position = 9
  for (let i = 1; i < 7; i++) {
    lines.push(`${position.toString().padStart(10, "0")} 00000 n`)
    position += lines.slice(0, i + 1).join("\n").length + 1
  }

  lines.push("trailer")
  lines.push("<< /Size 7 /Root 1 0 R >>")
  lines.push("startxref")
  lines.push(xrefPosition.toString())
  lines.push("%%EOF")

  return lines.join("\n")
}
