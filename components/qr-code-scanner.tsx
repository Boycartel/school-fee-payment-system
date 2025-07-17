"use client"

import { useState, useEffect } from "react"
import { Html5Qrcode } from "html5-qrcode"
import { Button } from "@/components/ui/button"

interface QRCodeScannerProps {
  onScan: (result: string) => void
}

export function QRCodeScanner({ onScan }: QRCodeScannerProps) {
  const [isScanning, setIsScanning] = useState(false)
  const [scannerInstance, setScannerInstance] = useState<Html5Qrcode | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    // Cleanup function to stop scanning when component unmounts
    return () => {
      if (scannerInstance && isScanning) {
        scannerInstance.stop().catch((error) => {
          console.error("Error stopping scanner:", error)
        })
      }
    }
  }, [scannerInstance, isScanning])

  const startScanning = async () => {
    setErrorMessage(null)
    try {
      const scanner = new Html5Qrcode("qr-reader")
      setScannerInstance(scanner)

      await scanner.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          onScan(decodedText)
          stopScanning(scanner)
        },
        (errorMessage) => {
          // Ignore the error during scanning
          console.log(errorMessage)
        },
      )

      setIsScanning(true)
    } catch (error) {
      console.error("Error starting scanner:", error)
      setErrorMessage("Could not access camera. Please ensure you have granted camera permissions.")
    }
  }

  const stopScanning = async (scanner: Html5Qrcode) => {
    try {
      await scanner.stop()
      setIsScanning(false)
    } catch (error) {
      console.error("Error stopping scanner:", error)
    }
  }

  return (
    <div className="w-full flex flex-col items-center">
      <div id="qr-reader" className="w-full max-w-sm"></div>

      {errorMessage && <div className="mt-4 p-3 bg-red-900 text-red-200 rounded-md text-sm">{errorMessage}</div>}

      <div className="mt-4">
        {!isScanning ? (
          <Button onClick={startScanning} className="bg-blue-600 hover:bg-blue-700">
            Start Scanning
          </Button>
        ) : (
          <Button
            variant="outline"
            onClick={() => scannerInstance && stopScanning(scannerInstance)}
            className="border-gray-600 text-white hover:bg-gray-700"
          >
            Stop Scanning
          </Button>
        )}
      </div>
    </div>
  )
}
