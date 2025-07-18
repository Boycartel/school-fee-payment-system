"use client"

import { useEffect, useRef } from "react"
import QRCode from "qrcode"

interface QRCodeGeneratorProps {
  data: string
  size?: number
  paymentReference?: string
}

export function QRCodeGenerator({ data, size = 200, paymentReference }: QRCodeGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (canvasRef.current) {
      // If paymentReference is provided, create a verification URL
      const qrData = paymentReference
        ? `${window.location.origin}/verify?reference=${paymentReference}&auto=true`
        : data

      QRCode.toCanvas(
        canvasRef.current,
        qrData,
        {
          width: size,
          margin: 2,
          color: {
            dark: "#000000",
            light: "#ffffff",
          },
        },
        (error) => {
          if (error) console.error("Error generating QR code:", error)
        },
      )
    }
  }, [data, size, paymentReference])

  return (
    <div className="flex flex-col items-center">
      <canvas ref={canvasRef} />
      {paymentReference && <p className="text-xs text-gray-500 mt-2 text-center">Scan to verify payment</p>}
    </div>
  )
}
