"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"

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
  const [searchQuery, setSearchQuery] = useState("")
  const [searchType, setSearchType] = useState("rrr")
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState("")

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
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
          searchType,
          searchQuery,
        }),
      })

      const data = await response.json()

      if (response.ok) {
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

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "verified":
        return "bg-green-500"
      case "pending":
        return "bg-yellow-500"
      case "failed":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-fpb-blue text-white">
      <header className="bg-fpb-blue-light border-b border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/images/logo.png"
              alt="The Federal Polytechnic Bida Logo"
              width={60}
              height={60}
              className="h-12 w-auto"
            />
            <h1 className="text-xl font-bold text-white hidden sm:block">The Federal Polytechnic Bida</h1>
          </Link>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <Card className="bg-fpb-blue-light border-gray-700 text-white mb-8">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Payment Verification Portal</CardTitle>
              <CardDescription className="text-gray-300">
                Verify payment status using Remita RRR, Matric Number, or Email
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSearch} className="space-y-4">
                {error && (
                  <Alert className="bg-red-900 border-red-700">
                    <AlertDescription className="text-red-200">{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="searchType" className="text-white">
                    Verify By
                  </Label>
                  <select
                    id="searchType"
                    className="w-full p-2 border rounded-md bg-gray-800 border-gray-700 text-white"
                    value={searchType}
                    onChange={(e) => setSearchType(e.target.value)}
                  >
                    <option value="reference">Payment Reference</option>
                    <option value="matricNumber">Matric Number</option>
                    <option value="email">Email Address</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="search" className="text-white">
                    {searchType === "matricNumber"
                      ? "Matric Number"
                      : searchType === "email"
                        ? "Email Address"
                        : "Remita RRR"}
                  </Label>
                  <Input
                    id="search"
                    placeholder={
                      searchType === "matricNumber"
                        ? "e.g. 2023/1/123456CS"
                        : searchType === "email"
                          ? "e.g. student@fpb.edu.ng"
                          : "e.g. REF123456789"
                    }
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-gray-800 border-gray-700 text-white"
                    required
                  />
                </div>

                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isSearching}>
                  {isSearching ? "Verifying..." : "Verify Payment"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {verificationResult && (
            <Card className="bg-fpb-blue-light border-gray-700 text-white">
              <CardHeader>
                <CardTitle>Verification Result</CardTitle>
                <CardDescription className="text-gray-300">
                  Payment information for {verificationResult.full_name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      {verificationResult.passport_photo && (
                        <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-700">
                          <img
                            src={verificationResult.passport_photo || "/placeholder.svg"}
                            alt="Student Passport"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div>
                        <h4 className="font-bold text-lg">{verificationResult.full_name}</h4>
                        <p className="text-gray-300">{verificationResult.matric_number}</p>
                        <p className="text-gray-300 text-sm">{verificationResult.email}</p>
                      </div>
                    </div>
                    <Badge className={getStatusBadgeColor(verificationResult.status)}>
                      {verificationResult.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-400">Department</p>
                      <p>{verificationResult.department_name}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">School</p>
                      <p>{verificationResult.school_name}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Session</p>
                      <p>{verificationResult.academic_session}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Fee</p>
                      <p>{verificationResult.fee_name}</p>
                    </div>
                  </div>

                  <div className="border-t border-gray-700 pt-4">
                    <h4 className="font-semibold mb-3">Payment Details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-gray-400">Amount Paid</p>
                        <p className="font-semibold text-green-400">
                          ₦{Number(verificationResult.amount).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400">Payment Date</p>
                        <p>{new Date(verificationResult.payment_date).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Reference</p>
                        <p className="font-mono">{verificationResult.reference}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Receipt Number</p>
                        <p>{verificationResult.receipt_number}</p>
                      </div>
                    </div>
                  </div>

                  {/* {verificationResult.receipt_file_url && (
                    <div className="border-t border-gray-700 pt-4">
                      <h4 className="font-semibold mb-3">Receipt</h4>
                      <Button
                        className="bg-blue-600 hover:bg-blue-700"
                        onClick={() => window.open(verificationResult.receipt_file_url, "_blank")}
                      >
                        View Receipt
                      </Button>
                    </div>
                  )} */}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <footer className="bg-fpb-blue-light border-t border-gray-700 py-6">
        <div className="container mx-auto px-4 text-center text-gray-300">
          <p>© {new Date().getFullYear()} The Federal Polytechnic Bida. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
