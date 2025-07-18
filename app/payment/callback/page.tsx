"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, Loader2, Mail, Receipt, ArrowLeft } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface PaymentResult {
  success: boolean
  message: string
  payment?: {
    reference: string
    amount: number
    status: string
    receipt_number: string
    created_at: string
    fee_type: string
    academic_session: string
  }
  student?: {
    email: string
    full_name: string
  }
}

export default function PaymentCallback() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [result, setResult] = useState<PaymentResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const reference = searchParams.get("reference")
        const trxref = searchParams.get("trxref")
        const paymentRef = reference || trxref

        console.log("Payment callback - Reference:", paymentRef)

        if (!paymentRef) {
          setError("No payment reference found")
          setLoading(false)
          return
        }

        console.log("Verifying payment...")
        const response = await fetch("/api/payment/verify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ reference: paymentRef }),
        })

        const data = await response.json()
        console.log("Verification response:", data)

        if (response.ok) {
          setResult(data)
        } else {
          setError(data.message || "Payment verification failed")
        }
      } catch (err) {
        console.error("Payment verification error:", err)
        setError("Failed to verify payment. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    verifyPayment()
  }, [searchParams])

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-NG", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
            <h2 className="text-lg font-semibold mb-2">Verifying Payment</h2>
            <p className="text-gray-600 text-center">Please wait while we confirm your payment...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !result) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <CardTitle className="text-red-600">Payment Failed</CardTitle>
            <CardDescription>Your payment could not be processed.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertDescription>{error || "Unknown error occurred"}</AlertDescription>
            </Alert>
            <div className="flex flex-col gap-2">
              <Button onClick={() => router.push("/student/payment")} className="w-full">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Try Again
              </Button>
              <Button variant="outline" onClick={() => router.push("/student/dashboard")} className="w-full">
                Back to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (result.success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-lg">
          <CardHeader className="text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <CardTitle className="text-green-600">Payment Successful!</CardTitle>
            <CardDescription>Your payment has been processed successfully.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {result.payment && (
              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <h3 className="font-semibold text-gray-900">Payment Details</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-gray-600">Amount:</div>
                  <div className="font-medium">{formatAmount(result.payment.amount)}</div>
                  <div className="text-gray-600">Reference:</div>
                  <div className="font-mono text-xs">{result.payment.reference}</div>
                  <div className="text-gray-600">Receipt No:</div>
                  <div className="font-mono text-xs">{result.payment.receipt_number}</div>
                  <div className="text-gray-600">Fee Type:</div>
                  <div>{result.payment.fee_type}</div>
                  <div className="text-gray-600">Session:</div>
                  <div>{result.payment.academic_session}</div>
                  <div className="text-gray-600">Date:</div>
                  <div>{formatDate(result.payment.created_at)}</div>
                </div>
              </div>
            )}

            {result.student && (
              <Alert>
                <Mail className="h-4 w-4" />
                <AlertDescription>
                  A payment receipt has been sent to <strong>{result.student.email}</strong>
                </AlertDescription>
              </Alert>
            )}

            <div className="flex flex-col gap-2">
              {result.payment && (
                <Button onClick={() => router.push(`/payment/receipt/${result.payment!.reference}`)} className="w-full">
                  <Receipt className="h-4 w-4 mr-2" />
                  View Receipt
                </Button>
              )}
              <Button variant="outline" onClick={() => router.push("/student/dashboard")} className="w-full">
                Back to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <CardTitle className="text-red-600">Payment Failed</CardTitle>
          <CardDescription>Your payment could not be processed.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertDescription>{result.message}</AlertDescription>
          </Alert>
          <div className="flex flex-col gap-2">
            <Button onClick={() => router.push("/student/payment")} className="w-full">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Try Again
            </Button>
            <Button variant="outline" onClick={() => router.push("/student/dashboard")} className="w-full">
              Back to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
