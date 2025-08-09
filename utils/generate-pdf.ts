import { renderToBuffer } from "@react-pdf/renderer"
import { ReceiptPDF } from "../components/receipt-pdf"

export async function generateReceiptPDF(receiptData: any) {
  try {
    const pdfBuffer = await renderToBuffer(<ReceiptPDF receipt={receiptData} />)
    return pdfBuffer
  } catch (error) {
    console.error("Error generating PDF:", error)
    throw new Error("Failed to generate PDF")
  }
}
