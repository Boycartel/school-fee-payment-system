"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, Loader2, Mail } from "lucide-react"

export default function PaymentCallback() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState<"loading" | "success" | "failed">("loading")
  const [paymentData, setPaymentData] = useState<any>(null)
  const [emailStatus, setEmailStatus] = useState<"idle" | "sending" | "sent" | "failed">("idle")

  useEffect(() => {
    const reference = searchParams.get("reference")
    const trxref = searchParams.get("trxref")

    if (reference || trxref) {
      verifyPayment(reference || trxref)
    } else {
      setStatus("failed")
    }
  }, [searchParams])

  const verifyPayment = async (reference: string) => {
    try {
      const response = await fetch("/api/payment/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reference }),
      })

      const data = await response.json()

      if (data.success && data.payment?.status === "success") {
        setStatus("success")
        setPaymentData(data.payment)

        // Automatically send receipt email
        sendReceiptEmail(reference)
      } else {
        setStatus("failed")
      }
    } catch (error) {
      console.error("Payment verification failed:", error)
      setStatus("failed")
    }
  }

  const sendReceiptEmail = async (reference: string) => {
    setEmailStatus("sending")

    try {
      const response = await fetch("/api/payment/send-receipt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reference }),
      })

      const data = await response.json()

      if (data.success) {
        setEmailStatus("sent")
      } else {
        setEmailStatus("failed")
      }
    } catch (error) {
      console.error("Failed to send receipt email:", error)
      setEmailStatus("failed")
    }
  }

  const handleReturnToDashboard = () => {
    router.push("/student/dashboard")
  }

  const handleViewReceipt = () => {
    if (paymentData?.reference) {
      router.push(`/payment/receipt/${paymentData.reference}`)
    }
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-fpb-blue flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Verifying Payment</h2>
            <p className="text-gray-600 text-center">Please wait while we confirm your payment...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (status === "failed") {
    return (
      <div className="min-h-screen bg-fpb-blue flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <CardTitle className="text-red-600">Payment Failed</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">Your payment could not be processed. Please try again or contact support.</p>
            <Button onClick={handleReturnToDashboard} className="w-full">
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-fpb-blue flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <CardTitle className="text-green-600">Payment Successful!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center space-y-2">
            <p className="text-gray-600">Your payment has been processed successfully.</p>
            {paymentData && (
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <p>
                  <strong>Amount:</strong> ₦{paymentData.amount?.toLocaleString()}
                </p>
                <p>
                  <strong>Reference:</strong> {paymentData.reference}
                </p>
                <p>
                  <strong>Date:</strong> {new Date(paymentData.created_at).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>

          {/* Email Status */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Mail className="h-5 w-5 text-blue-600" />
              <span className="font-medium text-blue-800">Receipt Email</span>
            </div>
            {emailStatus === "sending" && (
              <div className="flex items-center space-x-2 text-blue-600">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Sending receipt to your email...</span>
              </div>
            )}
            {emailStatus === "sent" && (
              <p className="text-sm text-green-600">✓ Receipt sent to your email successfully!</p>
            )}
            {emailStatus === "failed" && (
              <p className="text-sm text-red-600">
                ✗ Failed to send receipt email. You can download it from your dashboard.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Button onClick={handleViewReceipt} className="w-full bg-transparent" variant="outline">
              View Receipt
            </Button>
            <Button onClick={handleReturnToDashboard} className="w-full">
              Return to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
