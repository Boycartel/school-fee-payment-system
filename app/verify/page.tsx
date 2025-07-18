"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { QRCodeScanner } from "@/components/qr-code-scanner"
import { Search, CheckCircle, XCircle, Clock, User, Receipt, Calendar } from "lucide-react"

interface PaymentData {
  id: string
  reference: string
  receipt_number: string
  amount: number
  payment_date: string
  status: string
  fee_type: string
  academic_session: string
  installment_number?: number
  total_installments?: number
  student: {
    full_name: string
    matric_number: string
    email: string
    phone: string
    level: string
    department_name: string
    school_name: string
    passport_photo?: string
  }
  fee: {
    fee_name: string
    total_amount: number
  }
  summary: {
    total_paid: number
    balance: number
    is_fully_paid: boolean
    payment_count: number
  }
}

export default function VerifyPayment() {
  const searchParams = useSearchParams()
  const [searchTerm, setSearchTerm] = useState("")
  const [payments, setPayments] = useState<PaymentData[]>([])
  const [summary, setSummary] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [showScanner, setShowScanner] = useState(false)

  // Check for URL parameters on component mount
  useEffect(() => {
    const reference = searchParams.get("reference")
    const auto = searchParams.get("auto")

    if (reference && auto === "true") {
      setSearchTerm(reference)
      handleSearch(reference)
    }
  }, [searchParams])

  const handleSearch = async (term?: string) => {
    const searchValue = term || searchTerm
    if (!searchValue.trim()) {
      setError("Please enter a matric number, email, or payment reference")
      return
    }

    setLoading(true)
    setError("")
    setPayments([])
    setSummary(null)

    try {
      const response = await fetch("/api/verify/payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ searchTerm: searchValue }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setPayments(data.payments || [])
        setSummary(data.summary || null)
        if (data.payments.length === 0) {
          setError("No payments found for the provided information")
        }
      } else {
        setError(data.error || "Failed to verify payment")
      }
    } catch (error) {
      console.error("Verification error:", error)
      setError("Failed to verify payment. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleQRScan = (data: string) => {
    try {
      // Check if it's a URL with reference parameter
      const url = new URL(data)
      const reference = url.searchParams.get("reference")
      if (reference) {
        setSearchTerm(reference)
        handleSearch(reference)
        setShowScanner(false)
        return
      }
    } catch {
      // If not a URL, treat as direct reference
      setSearchTerm(data)
      handleSearch(data)
    }
    setShowScanner(false)
  }

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "verified":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            <CheckCircle className="w-3 h-3 mr-1" />
            Verified
          </Badge>
        )
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        )
      case "failed":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            <XCircle className="w-3 h-3 mr-1" />
            Failed
          </Badge>
        )
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const formatPaymentType = (payment: PaymentData) => {
    if (payment.installment_number && payment.total_installments && payment.total_installments > 1) {
      return `${payment.fee_type} (${payment.installment_number}/${payment.total_installments})`
    }
    return payment.fee_type || "School Fee"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Payment Verification</h1>
            <p className="text-gray-300">
              Verify student payment status using matric number, email, or payment reference
            </p>
          </div>

          {/* Search Form */}
          <Card className="bg-slate-800/50 border-slate-700 mb-8">
            <CardHeader>
              <CardTitle className="text-white">Search Payment</CardTitle>
              <CardDescription className="text-gray-400">
                Enter matric number, email address, or payment reference to verify payment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="search" className="text-gray-300">
                  Matric Number / Email / Payment Reference
                </Label>
                <Input
                  id="search"
                  type="text"
                  placeholder="e.g., FPB/2023/001, student@example.com, or payment reference"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white placeholder:text-gray-400"
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                />
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => handleSearch()}
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 flex-1"
                >
                  <Search className="w-4 h-4 mr-2" />
                  {loading ? "Searching..." : "Search"}
                </Button>
                <Button
                  onClick={() => setShowScanner(!showScanner)}
                  variant="outline"
                  className="border-slate-600 text-gray-300 hover:bg-slate-700"
                >
                  Scan QR
                </Button>
              </div>

              {showScanner && (
                <div className="mt-4">
                  <QRCodeScanner onScan={handleQRScan} onError={(err) => setError(err)} />
                </div>
              )}

              {error && (
                <div className="bg-red-900/50 border border-red-700 rounded-lg p-4">
                  <p className="text-red-300 text-sm">{error}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Summary Card */}
          {summary && (
            <Card className="bg-slate-800/50 border-slate-700 mb-6">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Student Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-400">₦{summary.total_paid?.toLocaleString() || 0}</p>
                    <p className="text-gray-400 text-sm">Total Paid</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-400">{summary.payment_count || 0}</p>
                    <p className="text-gray-400 text-sm">Total Payments</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-semibold text-white">{summary.student?.full_name || "N/A"}</p>
                    <p className="text-gray-400 text-sm">{summary.student?.matric_number || "N/A"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Payment Results */}
          {payments.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white mb-4">Payment Records ({payments.length})</h2>

              {payments.map((payment) => (
                <Card key={payment.id} className="bg-slate-800/50 border-slate-700">
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Student Info */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 mb-3">
                          <User className="w-4 h-4 text-blue-400" />
                          <h3 className="font-semibold text-white">Student Information</h3>
                        </div>
                        <div className="space-y-2 text-sm">
                          <p className="text-gray-300">
                            <span className="font-medium">Name:</span> {payment.student.full_name}
                          </p>
                          <p className="text-gray-300">
                            <span className="font-medium">Matric:</span> {payment.student.matric_number}
                          </p>
                          <p className="text-gray-300">
                            <span className="font-medium">Level:</span> {payment.student.level}
                          </p>
                          <p className="text-gray-300">
                            <span className="font-medium">Department:</span> {payment.student.department_name}
                          </p>
                        </div>
                      </div>

                      {/* Payment Info */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 mb-3">
                          <Receipt className="w-4 h-4 text-green-400" />
                          <h3 className="font-semibold text-white">Payment Details</h3>
                        </div>
                        <div className="space-y-2 text-sm">
                          <p className="text-gray-300">
                            <span className="font-medium">Fee Type:</span> {formatPaymentType(payment)}
                          </p>
                          <p className="text-gray-300">
                            <span className="font-medium">Amount:</span>{" "}
                            <span className="text-green-400 font-semibold">₦{payment.amount.toLocaleString()}</span>
                          </p>
                          <p className="text-gray-300">
                            <span className="font-medium">Reference:</span>{" "}
                            <code className="bg-slate-700 px-2 py-1 rounded text-xs">{payment.reference}</code>
                          </p>
                          <p className="text-gray-300">
                            <span className="font-medium">Receipt:</span> {payment.receipt_number}
                          </p>
                        </div>
                      </div>

                      {/* Status & Date */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 mb-3">
                          <Calendar className="w-4 h-4 text-yellow-400" />
                          <h3 className="font-semibold text-white">Status & Date</h3>
                        </div>
                        <div className="space-y-3">
                          <div>
                            <p className="text-gray-400 text-xs mb-1">Payment Status</p>
                            {getStatusBadge(payment.status)}
                          </div>
                          <div>
                            <p className="text-gray-400 text-xs mb-1">Payment Date</p>
                            <p className="text-gray-300 text-sm">
                              {new Date(payment.payment_date).toLocaleDateString("en-GB", {
                                day: "2-digit",
                                month: "long",
                                year: "numeric",
                              })}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-400 text-xs mb-1">Academic Session</p>
                            <p className="text-gray-300 text-sm">{payment.academic_session}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
