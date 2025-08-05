// utils/generate-pdf.ts
import { ReactElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { JSDOM } from "jsdom"
import { Readable } from "stream"
import { render } from "@react-pdf/renderer"
import { ReceiptPDF } from "@/components/receipt-pdf"

export async function generateReceiptPDF(receiptData: any) {
  try {
    // Create a PDF document using react-pdf
    const pdfStream = await render(<ReceiptPDF receipt={receiptData} />)
    
    // Convert to buffer
    const chunks: Uint8Array[] = []
    for await (const chunk of pdfStream) {
      chunks.push(chunk)
    }
    return Buffer.concat(chunks)
  } catch (error) {
    console.error("Error generating PDF:", error)
    throw error
  }
}
