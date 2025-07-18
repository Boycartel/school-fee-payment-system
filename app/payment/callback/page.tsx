"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, Loader2, Receipt, Mail, ArrowLeft } from "lucide-react"
import Link from "next/link"

interface PaymentResult {
  success: boolean
  message: string
  payment?: {
    reference: string
    amount: number
    status: string
    receipt_number: string
    created_at: string
    fee_type?: string
    academic_session?: string
  }
  student?: {
    email: string
    full_name: string
  }
}

export default function PaymentCallback() {
  const searchParams = useSearchParams()
  const [result, setResult] = useState<PaymentResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const reference = searchParams.get("reference")
    const trxref = searchParams.get("trxref")
    const paymentRef = reference || trxref

    console.log("Payment callback - Reference:", paymentRef)

    if (!paymentRef) {
      setResult({
        success: false,
        message: "No payment reference found in URL",
      })
      setLoading(false)
      return
    }

    verifyPayment(paymentRef)
  }, [searchParams])

  const verifyPayment = async (reference: string) => {
    try {
      console.log("Starting payment verification for:", reference)
      setLoading(true)
      setError(null)

      const response = await fetch("/api/payment/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reference }),
      })

      console.log("Verification response status:", response.status)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      console.log("Verification response data:", data)

      setResult(data)

      // Log the final result for debugging
      if (data.success) {
        console.log("✅ Payment verification successful")
      } else {
        console.log("❌ Payment verification failed:", data.message)
      }
    } catch (error) {
      console.error("Payment verification error:", error)
      setError(error instanceof Error ? error.message : "Unknown error occurred")
      setResult({
        success: false,
        message: "Network error during payment verification. Please try again.",
      })
    } finally {
      setLoading(false)
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-fpb-blue text-white">
        <Card className="w-full max-w-md bg-fpb-blue-light border-gray-700 text-white">
          <CardContent className="p-8 text-center">
            <Loader2 className="w-16 h-16 mx-auto mb-4 text-blue-400 animate-spin" />
            <h3 className="text-xl font-semibold mb-2">Verifying Payment</h3>
            <p className="text-gray-300">Please wait while we confirm your payment...</p>
            {error && (
              <div className="mt-4 p-3 bg-red-900/30 border border-red-400/30 rounded text-red-300 text-sm">
                Error: {error}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  // Success state
  if (result?.success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-fpb-blue text-white p-4">
        <Card className="w-full max-w-md bg-fpb-blue-light border-gray-700 text-white">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle className="w-16 h-16 text-green-400" />
            </div>
            <CardTitle className="text-xl text-green-400">Payment Successful!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-center text-gray-300">{result.message}</p>

            {result.payment && (
              <div className="bg-gray-800 p-4 rounded-md space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Reference:</span>
                  <span className="font-mono text-sm">{result.payment.reference}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Receipt:</span>
                  <span className="font-mono text-sm">{result.payment.receipt_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Amount:</span>
                  <span className="font-semibold text-green-400">
                    ₦{Number(result.payment.amount).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Date:</span>
                  <span>{new Date(result.payment.created_at).toLocaleDateString()}</span>
                </div>
                {result.payment.fee_type && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Fee Type:</span>
                    <span>{result.payment.fee_type}</span>
                  </div>
                )}
                {result.payment.academic_session && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Session:</span>
                    <span>{result.payment.academic_session}</span>
                  </div>
                )}
              </div>
            )}

            {result.student && (
              <div className="bg-blue-900/30 border border-blue-400/30 rounded-lg p-3">
                <div className="flex items-center gap-2 text-blue-300">
                  <Mail className="w-4 h-4" />
                  <span className="text-sm">Receipt sent to {result.student.email}</span>
                </div>
                <p className="text-xs text-blue-200 mt-1">Student: {result.student.full_name}</p>
              </div>
            )}

            <div className="space-y-3">
              {result.payment && (
                <Link href={`/payment/receipt/${result.payment.reference}`}>
                  <Button className="w-full bg-green-600 hover:bg-green-700">
                    <Receipt className="w-4 h-4 mr-2" />
                    View Receipt
                  </Button>
                </Link>
              )}
              <Link href="/student/dashboard">
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <Link href="/student/payment">
                <Button
                  variant="outline"
                  className="w-full border-gray-600 text-gray-300 hover:bg-gray-700 bg-transparent"
                >
                  Make Another Payment
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Failure state
  return (
    <div className="min-h-screen flex items-center justify-center bg-fpb-blue text-white p-4">
      <Card className="w-full max-w-md bg-fpb-blue-light border-gray-700 text-white">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <XCircle className="w-16 h-16 text-red-400" />
          </div>
          <CardTitle className="text-xl text-red-400">Payment Failed</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-gray-300">
            {result?.message || "Your payment could not be processed. Please try again or contact support."}
          </p>

          {error && (
            <div className="bg-red-900/30 border border-red-400/30 rounded-lg p-3">
              <p className="text-red-300 text-sm">Technical Error: {error}</p>
            </div>
          )}

          <div className="space-y-3">
            <Link href="/student/dashboard">
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <Link href="/student/payment">
              <Button
                variant="outline"
                className="w-full border-gray-600 text-gray-300 hover:bg-gray-700 bg-transparent"
              >
                Try Again
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
