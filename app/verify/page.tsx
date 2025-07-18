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

interface VerificationResult {
  full_name: string
  matric_number: string
  email: string
  phone?: string
  department_name?: string
  school_name?: string
  amount: number
  payment_date: string
  reference: string
  receipt_number: string
  status: string
  academic_session: string
  fee_name?: string
  fee_description?: string
  passport_photo?: string
}

export default function VerifyPayment() {
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState("")
  const [searchType, setSearchType] = useState("reference")
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState("")
  const [showScanner, setShowScanner] = useState(false)

  // Auto-search if URL parameters are present
  useEffect(() => {
    const reference = searchParams.get("reference")
    const auto = searchParams.get("auto")

    if (reference && auto === "true") {
      setSearchQuery(reference)
      setSearchType("reference")
      // Trigger automatic search
      handleAutoSearch(reference)
    }
  }, [searchParams])

  const handleAutoSearch = async (reference: string) => {
    setIsSearching(true)
    setError("")
    setVerificationResult(null)

    try {
      const response = await fetch("/api/verify/payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          searchType: "reference",
          searchQuery: reference,
        }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setVerificationResult(data.payment)
      } else {
        setError(data.error || "Verification failed")
      }
    } catch (error) {
      setError("Network error. Please try again.")
    } finally {
      setIsSearching(false)
    }
  }

  const handleSearch = async (term?: string) => {
    const searchValue = term || searchQuery
    if (!searchValue.trim()) {
      setError("Please enter a matric number, email, or payment reference")
      return
    }

    setIsSearching(true)
    setError("")
    setVerificationResult(null)

    try {
      const response = await fetch("/api/verify/payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          searchType: searchType, // Use the actual searchType state
          searchQuery: searchValue,
        }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setVerificationResult(data.payment)
      } else {
        setError(data.error || "Verification failed")
      }
    } catch (error) {
      console.error("Verification error:", error)
      setError("Failed to verify payment. Please try again.")
    } finally {
      setIsSearching(false)
    }
  }

  const handleQRScan = (data: string) => {
    try {
      // Check if it's a URL with reference parameter
      const url = new URL(data)
      const reference = url.searchParams.get("reference")
      if (reference) {
        setSearchQuery(reference)
        handleSearch(reference)
        setShowScanner(false)
        return
      }
    } catch {
      // If not a URL, treat as direct reference
      setSearchQuery(data)
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

  const formatPaymentType = (payment: any) => {
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
                <Label htmlFor="searchType" className="text-gray-300">
                  Search By
                </Label>
                <select
                  id="searchType"
                  className="w-full p-2 border rounded-md bg-slate-700 border-slate-600 text-white"
                  value={searchType}
                  onChange={(e) => setSearchType(e.target.value)}
                >
                  <option value="reference">Payment Reference</option>
                  <option value="matricNumber">Matric Number</option>
                  <option value="email">Email Address</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="search" className="text-gray-300">
                  Matric Number / Email / Payment Reference
                </Label>
                <Input
                  id="search"
                  type="text"
                  placeholder={
                    searchType === "matricNumber"
                      ? "e.g. 2023/1/123456CS"
                      : searchType === "email"
                        ? "e.g. student@fpb.edu.ng"
                        : "e.g. REF123456789"
                  }
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white placeholder:text-gray-400"
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                />
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => handleSearch()}
                  disabled={isSearching}
                  className="bg-blue-600 hover:bg-blue-700 flex-1"
                >
                  <Search className="w-4 h-4 mr-2" />
                  {isSearching ? "Searching..." : "Search"}
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
          {verificationResult && (
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
                    <p className="text-2xl font-bold text-green-400">
                      ₦{verificationResult.amount?.toLocaleString() || 0}
                    </p>
                    <p className="text-gray-400 text-sm">Amount Paid</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-400">{verificationResult.reference || "N/A"}</p>
                    <p className="text-gray-400 text-sm">Reference Number</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-semibold text-white">{verificationResult.full_name || "N/A"}</p>
                    <p className="text-gray-400 text-sm">{verificationResult.matric_number || "N/A"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Payment Results */}
          {verificationResult && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white mb-4">Payment Records</h2>

              <Card className="bg-slate-800/50 border-slate-700">
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
                          <span className="font-medium">Name:</span> {verificationResult.full_name}
                        </p>
                        <p className="text-gray-300">
                          <span className="font-medium">Matric:</span> {verificationResult.matric_number}
                        </p>
                        <p className="text-gray-300">
                          <span className="font-medium">Level:</span> {verificationResult.level}
                        </p>
                        <p className="text-gray-300">
                          <span className="font-medium">Department:</span> {verificationResult.department_name}
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
                          <span className="font-medium">Fee Type:</span> {verificationResult.fee_name}
                        </p>
                        <p className="text-gray-300">
                          <span className="font-medium">Amount:</span>{" "}
                          <span className="text-green-400 font-semibold">
                            ₦{verificationResult.amount.toLocaleString()}
                          </span>
                        </p>
                        <p className="text-gray-300">
                          <span className="font-medium">Reference:</span>{" "}
                          <code className="bg-slate-700 px-2 py-1 rounded text-xs">{verificationResult.reference}</code>
                        </p>
                        <p className="text-gray-300">
                          <span className="font-medium">Receipt:</span> {verificationResult.receipt_number}
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
                          {getStatusBadge(verificationResult.status)}
                        </div>
                        <div>
                          <p className="text-gray-400 text-xs mb-1">Payment Date</p>
                          <p className="text-gray-300 text-sm">
                            {new Date(verificationResult.payment_date).toLocaleDateString("en-GB", {
                              day: "2-digit",
                              month: "long",
                              year: "numeric",
                            })}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-xs mb-1">Academic Session</p>
                          <p className="text-gray-300 text-sm">{verificationResult.academic_session}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
