"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { StudentNavbar } from "@/components/student-navbar"
import { CheckCircle, Clock, CreditCard } from "lucide-react"

interface Student {
  id: string
  matric_number: string
  full_name: string
  email: string
  level: string
}

interface SchoolFee {
  id: string
  fee_name: string
  description: string
  amount: number
  academic_session: string
  allows_installments: boolean
  first_installment_percentage: number
  second_installment_percentage: number
  first_installment_paid: boolean
  second_installment_paid: boolean
}

export default function StudentPayment() {
  const router = useRouter()
  const [student, setStudent] = useState<Student | null>(null)
  const [fees, setFees] = useState<SchoolFee[]>([])
  const [loading, setLoading] = useState(true)
  const [paymentLoading, setPaymentLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchStudentData()
    fetchAvailableFees()
  }, [])

  const fetchStudentData = async () => {
    try {
      const response = await fetch("/api/student/profile")
      if (response.ok) {
        const data = await response.json()
        setStudent(data.student)
      } else {
        router.push("/student/login")
      }
    } catch (error) {
      console.error("Error fetching student data:", error)
      router.push("/student/login")
    }
  }

  const fetchAvailableFees = async () => {
    try {
      const response = await fetch("/api/student/fees")
      if (response.ok) {
        const data = await response.json()
        setFees(data.fees)
      }
    } catch (error) {
      console.error("Error fetching fees:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      router.push("/")
    } catch (error) {
      console.error("Logout error:", error)
      router.push("/")
    }
  }

  const handlePayment = async (fee: SchoolFee, installmentNumber: number, isFullPayment = false) => {
    setError("")
    setPaymentLoading(true)

    let amount: number
    let totalInstallments = 1
    let feeType: string

    if (isFullPayment) {
      // Full payment
      amount = fee.amount
      totalInstallments = 1
      installmentNumber = 1
      feeType = `${fee.fee_name} - Full Payment`
    } else if (fee.allows_installments && installmentNumber === 1) {
      amount = Math.round((fee.amount * fee.first_installment_percentage) / 100)
      totalInstallments = 2
      feeType = `${fee.fee_name} - First Installment`
    } else if (fee.allows_installments && installmentNumber === 2) {
      amount = Math.round((fee.amount * fee.second_installment_percentage) / 100)
      totalInstallments = 2
      feeType = `${fee.fee_name} - Second Installment`
    } else {
      // Default to full payment
      amount = fee.amount
      totalInstallments = 1
      installmentNumber = 1
      feeType = `${fee.fee_name} - Full Payment`
    }

    try {
      const response = await fetch("/api/payment/initialize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount,
          feeType,
          academicSession: fee.academic_session,
          semester: "All Semesters",
          schoolFeeId: fee.id,
          installmentNumber,
          totalInstallments,
          isFullPayment,
        }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        window.location.href = data.authorization_url
      } else {
        setError(data.error || "Failed to initialize payment")
      }
    } catch (error) {
      setError("Network error. Please try again.")
    } finally {
      setPaymentLoading(false)
    }
  }

  const getPaymentStatus = (fee: SchoolFee) => {
    if (!fee.allows_installments) {
      // For full payment only fees, check if first installment is paid (which represents full payment)
      return fee.first_installment_paid
        ? { status: "completed", text: "Fully Paid", color: "bg-green-500" }
        : { status: "unpaid", text: "Not Paid", color: "bg-red-500" }
    }

    // For installment fees
    if (fee.first_installment_paid && fee.second_installment_paid) {
      return { status: "completed", text: "Fully Paid", color: "bg-green-500" }
    } else if (fee.first_installment_paid) {
      return { status: "partial", text: "First Installment Paid", color: "bg-yellow-500" }
    } else {
      return { status: "unpaid", text: "Not Paid", color: "bg-red-500" }
    }
  }

  const isSessionFullyPaid = (fee: SchoolFee) => {
    if (!fee.allows_installments) {
      return fee.first_installment_paid
    }
    return fee.first_installment_paid && fee.second_installment_paid
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-fpb-blue text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto"></div>
          <p className="mt-4">Loading...</p>
        </div>
      </div>
    )
  }

  if (!student) {
    return null
  }

  return (
    <div className="min-h-screen flex flex-col bg-fpb-blue text-white">
      <StudentNavbar studentName={student.full_name} onLogout={handleLogout} />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">School Fee Payment</h1>
            <p className="text-gray-300">Pay your school fees in full or by installments</p>
            <div className="mt-2 text-sm text-gray-400">
              Level: <span className="font-medium text-white">{student.level}</span>
            </div>
          </div>

          {error && (
            <Alert className="bg-red-900 border-red-700 mb-6">
              <AlertDescription className="text-red-200">{error}</AlertDescription>
            </Alert>
          )}

          {fees.length === 0 ? (
            <Card className="bg-fpb-blue-light border-gray-700 text-white">
              <CardContent className="p-8 text-center">
                <CreditCard className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl font-semibold mb-2">No Fees Available</h3>
                <p className="text-gray-300">
                  There are currently no fees set up for your level ({student.level}) and school.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {fees.map((fee) => {
                const paymentStatus = getPaymentStatus(fee)
                const firstInstallmentAmount = Math.round((fee.amount * fee.first_installment_percentage) / 100)
                const secondInstallmentAmount = Math.round((fee.amount * fee.second_installment_percentage) / 100)

                return (
                  <Card key={fee.id} className="bg-fpb-blue-light border-gray-700 text-white">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-xl">{fee.fee_name}</CardTitle>
                          <CardDescription className="text-gray-300">{fee.academic_session}</CardDescription>
                          {fee.description && <p className="text-sm text-gray-400 mt-1">{fee.description}</p>}
                        </div>
                        <Badge className={paymentStatus.color}>{paymentStatus.text}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {/* Fee Summary */}
                        <div className="bg-gray-800 p-4 rounded-md">
                          <h4 className="font-semibold mb-3">Fee Summary</h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="text-gray-400">Total Amount:</span>
                              <p className="font-semibold text-lg">₦{fee.amount.toLocaleString()}</p>
                            </div>
                            <div>
                              <span className="text-gray-400">Academic Session:</span>
                              <p>{fee.academic_session}</p>
                            </div>
                            <div>
                              <span className="text-gray-400">Payment Options:</span>
                              <p>{fee.allows_installments ? "Full or Installments" : "Full Payment Only"}</p>
                            </div>
                          </div>
                        </div>

                        {/* Payment Status Alert for Fully Paid Sessions */}
                        {isSessionFullyPaid(fee) && (
                          <Alert className="bg-green-900 border-green-700">
                            <CheckCircle className="h-4 w-4" />
                            <AlertDescription className="text-green-200">
                              <strong>Payment Complete!</strong> You have successfully paid all fees for the{" "}
                              {fee.academic_session} session. No further payment is required for this session.
                            </AlertDescription>
                          </Alert>
                        )}

                        {/* Payment Options */}
                        <div className="space-y-4">
                          <h4 className="font-semibold">Payment Options</h4>

                          {isSessionFullyPaid(fee) ? (
                            // Show completion message when fully paid
                            <div className="bg-green-900 p-6 rounded-md border-2 border-green-600 text-center">
                              <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-400" />
                              <h5 className="font-medium text-green-400 mb-2">Session Fully Paid</h5>
                              <p className="text-green-200 mb-4">
                                You have completed all payments for {fee.academic_session}
                              </p>
                              <p className="text-2xl font-bold text-green-400">₦{fee.amount.toLocaleString()}</p>
                              <p className="text-sm text-green-300 mt-2">Total Amount Paid</p>
                            </div>
                          ) : fee.allows_installments ? (
                            <div className="space-y-4">
                              {/* Full Payment Option */}
                              <div className="bg-gray-800 p-4 rounded-md border-2 border-blue-600">
                                <div className="flex items-center justify-between mb-3">
                                  <h5 className="font-medium text-blue-400">Full Payment (Recommended)</h5>
                                  {paymentStatus.status === "completed" ? (
                                    <CheckCircle className="w-5 h-5 text-green-400" />
                                  ) : (
                                    <Clock className="w-5 h-5 text-yellow-400" />
                                  )}
                                </div>
                                <p className="text-2xl font-bold text-green-400 mb-2">₦{fee.amount.toLocaleString()}</p>
                                <p className="text-sm text-gray-400 mb-4">Pay the complete fee at once</p>
                                {paymentStatus.status === "completed" ? (
                                  <Button disabled className="w-full bg-green-600">
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Paid
                                  </Button>
                                ) : (
                                  <Button
                                    onClick={() => handlePayment(fee, 1, true)}
                                    disabled={paymentLoading}
                                    className="w-full bg-blue-600 hover:bg-blue-700"
                                  >
                                    {paymentLoading
                                      ? "Processing..."
                                      : `Pay Full Amount ₦${fee.amount.toLocaleString()}`}
                                  </Button>
                                )}
                              </div>

                              {/* Installment Options */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* First Installment */}
                                <div className="bg-gray-800 p-4 rounded-md">
                                  <div className="flex items-center justify-between mb-3">
                                    <h5 className="font-medium">First Installment</h5>
                                    {fee.first_installment_paid ? (
                                      <CheckCircle className="w-5 h-5 text-green-400" />
                                    ) : (
                                      <Clock className="w-5 h-5 text-yellow-400" />
                                    )}
                                  </div>
                                  <p className="text-2xl font-bold text-green-400 mb-2">
                                    ₦{firstInstallmentAmount.toLocaleString()}
                                  </p>
                                  <p className="text-sm text-gray-400 mb-4">
                                    {fee.first_installment_percentage}% of total fee
                                  </p>
                                  {fee.first_installment_paid || paymentStatus.status === "completed" ? (
                                    <Button disabled className="w-full bg-green-600">
                                      <CheckCircle className="w-4 h-4 mr-2" />
                                      Paid
                                    </Button>
                                  ) : (
                                    <Button
                                      onClick={() => handlePayment(fee, 1, false)}
                                      disabled={paymentLoading}
                                      className="w-full bg-blue-600 hover:bg-blue-700"
                                    >
                                      {paymentLoading
                                        ? "Processing..."
                                        : `Pay ₦${firstInstallmentAmount.toLocaleString()}`}
                                    </Button>
                                  )}
                                </div>

                                {/* Second Installment */}
                                <div className="bg-gray-800 p-4 rounded-md">
                                  <div className="flex items-center justify-between mb-3">
                                    <h5 className="font-medium">Second Installment</h5>
                                    {fee.second_installment_paid ? (
                                      <CheckCircle className="w-5 h-5 text-green-400" />
                                    ) : (
                                      <Clock className="w-5 h-5 text-yellow-400" />
                                    )}
                                  </div>
                                  <p className="text-2xl font-bold text-green-400 mb-2">
                                    ₦{secondInstallmentAmount.toLocaleString()}
                                  </p>
                                  <p className="text-sm text-gray-400 mb-4">
                                    {fee.second_installment_percentage}% of total fee
                                  </p>
                                  {fee.second_installment_paid || paymentStatus.status === "completed" ? (
                                    <Button disabled className="w-full bg-green-600">
                                      <CheckCircle className="w-4 h-4 mr-2" />
                                      Paid
                                    </Button>
                                  ) : (
                                    <Button
                                      onClick={() => handlePayment(fee, 2, false)}
                                      disabled={
                                        paymentLoading ||
                                        (!fee.first_installment_paid && paymentStatus.status !== "partial")
                                      }
                                      className="w-full bg-blue-600 hover:bg-blue-700"
                                    >
                                      {paymentLoading
                                        ? "Processing..."
                                        : !fee.first_installment_paid && paymentStatus.status !== "partial"
                                          ? "Pay First Installment First"
                                          : `Pay ₦${secondInstallmentAmount.toLocaleString()}`}
                                    </Button>
                                  )}
                                  {!fee.first_installment_paid && paymentStatus.status !== "partial" && (
                                    <p className="text-xs text-gray-400 mt-2">
                                      Complete first installment to unlock this option
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="bg-gray-800 p-4 rounded-md">
                              <h5 className="font-medium mb-3">Full Payment</h5>
                              <p className="text-2xl font-bold text-green-400 mb-4">₦{fee.amount.toLocaleString()}</p>
                              {paymentStatus.status === "completed" ? (
                                <Button disabled className="w-full bg-green-600">
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Paid
                                </Button>
                              ) : (
                                <Button
                                  onClick={() => handlePayment(fee, 1, true)}
                                  disabled={paymentLoading}
                                  className="w-full bg-blue-600 hover:bg-blue-700"
                                >
                                  {paymentLoading ? "Processing..." : `Pay ₦${fee.amount.toLocaleString()}`}
                                </Button>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="text-center text-sm text-gray-400">
                          <p>🔒 Secure payment powered by Paystack</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </main>

      <footer className="bg-fpb-blue-light border-t border-gray-700 py-6">
        <div className="container mx-auto px-4 text-center text-gray-300">
          <p>© {new Date().getFullYear()} The Federal Polytechnic Bida. All rights reserved. Developed by Soundmind Digitals</p>
        </div>
      </footer>
    </div>
  )
}
