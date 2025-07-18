"use client"

import { useEffect, useRef } from "react"
import QRCode from "qrcode"

interface QRCodeGeneratorProps {
  data: string
  size?: number
  className?: string
}

export function QRCodeGenerator({ data, size = 200, className = "" }: QRCodeGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (canvasRef.current && data) {
      QRCode.toCanvas(
        canvasRef.current,
        data,
        {
          width: size,
          margin: 2,
          color: {
            dark: "#000000",
            light: "#FFFFFF",
          },
        },
        (error) => {
          if (error) {
            console.error("QR Code generation error:", error)
          }
        },
      )
    }
  }, [data, size])

  return (
    <div className={`inline-block ${className}`}>
      <canvas ref={canvasRef} className="border border-gray-300 rounded" />
    </div>
  )
}
