"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, Loader2, Receipt, ArrowLeft } from "lucide-react"
import Link from "next/link"

interface PaymentResult {
  success: boolean
  message: string
  payment?: {
    reference: string
    amount: number
    status: string
    receipt_number: string
  }
  student?: {
    full_name: string
    email: string
  }
}

export default function PaymentCallback() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [result, setResult] = useState<PaymentResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [emailSending, setEmailSending] = useState(false)

  useEffect(() => {
    const reference = searchParams.get("reference")
    if (reference) {
      verifyPayment(reference)
    } else {
      setResult({
        success: false,
        message: "No payment reference provided",
      })
      setLoading(false)
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
      setResult(data)

      // If payment is successful, send email receipt
      if (data.success && data.payment?.status === "verified") {
        await sendEmailReceipt(reference)
      }
    } catch (error) {
      console.error("Payment verification error:", error)
      setResult({
        success: false,
        message: "Failed to verify payment. Please try again.",
      })
    } finally {
      setLoading(false)
    }
  }

  const sendEmailReceipt = async (reference: string) => {
    try {
      setEmailSending(true)
      const response = await fetch("/api/payment/send-receipt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reference }),
      })

      const data = await response.json()
      if (data.success) {
        console.log("Receipt email sent successfully")
      } else {
        console.error("Failed to send receipt email:", data.error)
      }
    } catch (error) {
      console.error("Error sending receipt email:", error)
    } finally {
      setEmailSending(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <Card className="w-full max-w-md bg-slate-800/50 border-slate-700">
          <CardContent className="p-8 text-center">
            <Loader2 className="w-16 h-16 animate-spin mx-auto mb-4 text-blue-400" />
            <h3 className="text-xl font-semibold mb-2 text-white">Verifying Payment</h3>
            <p className="text-gray-300">Please wait while we confirm your payment...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-slate-800/50 border-slate-700">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            {result?.success ? (
              <CheckCircle className="w-16 h-16 text-green-400" />
            ) : (
              <XCircle className="w-16 h-16 text-red-400" />
            )}
          </div>
          <CardTitle className="text-2xl text-white">
            {result?.success ? "Payment Successful!" : "Payment Failed"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <p className="text-gray-300 mb-4">{result?.message}</p>

            {result?.success && result.payment && (
              <div className="bg-slate-700/50 rounded-lg p-4 space-y-2 text-left">
                <div className="flex justify-between">
                  <span className="text-gray-400">Reference:</span>
                  <span className="text-white font-mono">{result.payment.reference}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Amount:</span>
                  <span className="text-green-400 font-semibold">₦{result.payment.amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Receipt No:</span>
                  <span className="text-white font-mono">{result.payment.receipt_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Status:</span>
                  <span className="text-green-400 capitalize">{result.payment.status}</span>
                </div>
              </div>
            )}

            {emailSending && (
              <div className="bg-blue-900/30 border border-blue-400/30 rounded-lg p-3 mt-4">
                <div className="flex items-center justify-center gap-2 text-blue-300">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Sending receipt to your email...</span>
                </div>
              </div>
            )}

            {result?.success && !emailSending && (
              <div className="bg-green-900/30 border border-green-400/30 rounded-lg p-3 mt-4">
                <div className="flex items-center justify-center gap-2 text-green-300">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm">Receipt sent to {result.student?.email}</span>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3">
            {result?.success && result.payment && (
              <Link href={`/payment/receipt/${result.payment.reference}`}>
                <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                  <Receipt className="w-4 h-4 mr-2" />
                  View Receipt
                </Button>
              </Link>
            )}

            <Link href="/student/dashboard">
              <Button
                variant="outline"
                className="w-full border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-white bg-transparent"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
