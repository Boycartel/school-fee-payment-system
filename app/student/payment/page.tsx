"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, CreditCard, AlertCircle } from "lucide-react"
import { StudentNavbar } from "@/components/student-navbar"

interface SchoolFee {
  id: string
  fee_name: string
  amount: number
  academic_session: string
  fee_type: string
  description?: string
}

interface Student {
  id: string
  full_name: string
  email: string
  matric_number: string
  department: string
  level: string
}

export default function PaymentPage() {
  const [student, setStudent] = useState<Student | null>(null)
  const [fees, setFees] = useState<SchoolFee[]>([])
  const [selectedFee, setSelectedFee] = useState<SchoolFee | null>(null)
  const [paymentType, setPaymentType] = useState<"full" | "installment">("full")
  const [installmentAmount, setInstallmentAmount] = useState("")
  const [installmentNumber, setInstallmentNumber] = useState(1)
  const [totalInstallments, setTotalInstallments] = useState(2)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  useEffect(() => {
    fetchStudentData()
    fetchFees()
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
      setError("Failed to load student information")
    }
  }

  const fetchFees = async () => {
    try {
      const response = await fetch("/api/student/fees")
      if (response.ok) {
        const data = await response.json()
        setFees(data.fees)
      } else {
        setError("Failed to load fees")
      }
    } catch (error) {
      console.error("Error fetching fees:", error)
      setError("Failed to load fees")
    } finally {
      setLoading(false)
    }
  }

  const handleFeeSelection = (feeId: string) => {
    const fee = fees.find((f) => f.id === feeId)
    setSelectedFee(fee || null)
    setError("")
  }

  const calculateAmount = () => {
    if (!selectedFee) return 0
    if (paymentType === "full") return selectedFee.amount
    return Number.parseFloat(installmentAmount) || 0
  }

  const handlePayment = async () => {
    if (!selectedFee || !student) {
      setError("Please select a fee to pay")
      return
    }

    const amount = calculateAmount()
    if (amount <= 0) {
      setError("Please enter a valid amount")
      return
    }

    if (paymentType === "installment" && amount > selectedFee.amount) {
      setError("Installment amount cannot exceed total fee amount")
      return
    }

    setProcessing(true)
    setError("")

    try {
      const response = await fetch("/api/payment/initialize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount,
          feeType: selectedFee.fee_type,
          academicSession: selectedFee.academic_session,
          schoolFeeId: selectedFee.id,
          installmentNumber: paymentType === "installment" ? installmentNumber : 1,
          totalInstallments: paymentType === "installment" ? totalInstallments : 1,
          isFullPayment: paymentType === "full",
        }),
      })

      const data = await response.json()

      if (data.success) {
        // Redirect to Paystack payment page
        window.location.href = data.authorization_url
      } else {
        setError(data.error || "Payment initialization failed")
      }
    } catch (error) {
      console.error("Payment error:", error)
      setError("Payment initialization failed")
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <StudentNavbar />
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <StudentNavbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Make Payment
              </CardTitle>
              <CardDescription>Select a fee and proceed with payment</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {student && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-900">Student Information</h3>
                  <p className="text-blue-700">{student.full_name}</p>
                  <p className="text-blue-600 text-sm">
                    {student.matric_number} • {student.department} • Level {student.level}
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="fee-select">Select Fee</Label>
                <Select onValueChange={handleFeeSelection}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a fee to pay" />
                  </SelectTrigger>
                  <SelectContent>
                    {fees.map((fee) => (
                      <SelectItem key={fee.id} value={fee.id}>
                        {fee.fee_name} - ₦{fee.amount.toLocaleString()} ({fee.academic_session})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedFee && (
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold">{selectedFee.fee_name}</h4>
                    <p className="text-gray-600">{selectedFee.description}</p>
                    <p className="text-lg font-bold text-green-600">₦{selectedFee.amount.toLocaleString()}</p>
                    <p className="text-sm text-gray-500">{selectedFee.academic_session}</p>
                  </div>

                  <div className="space-y-2">
                    <Label>Payment Type</Label>
                    <Select
                      value={paymentType}
                      onValueChange={(value: "full" | "installment") => setPaymentType(value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full">Full Payment</SelectItem>
                        <SelectItem value="installment">Installment Payment</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {paymentType === "installment" && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="installment-number">Installment Number</Label>
                          <Select
                            value={installmentNumber.toString()}
                            onValueChange={(value) => setInstallmentNumber(Number.parseInt(value))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.from({ length: totalInstallments }, (_, i) => (
                                <SelectItem key={i + 1} value={(i + 1).toString()}>
                                  {i + 1} of {totalInstallments}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="total-installments">Total Installments</Label>
                          <Select
                            value={totalInstallments.toString()}
                            onValueChange={(value) => setTotalInstallments(Number.parseInt(value))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="2">2 Installments</SelectItem>
                              <SelectItem value="3">3 Installments</SelectItem>
                              <SelectItem value="4">4 Installments</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="installment-amount">Amount to Pay</Label>
                        <Input
                          id="installment-amount"
                          type="number"
                          placeholder="Enter amount"
                          value={installmentAmount}
                          onChange={(e) => setInstallmentAmount(e.target.value)}
                          max={selectedFee.amount}
                        />
                      </div>
                    </div>
                  )}

                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">Amount to Pay:</span>
                      <span className="text-xl font-bold text-green-600">₦{calculateAmount().toLocaleString()}</span>
                    </div>
                  </div>

                  <Button
                    onClick={handlePayment}
                    disabled={processing || calculateAmount() <= 0}
                    className="w-full"
                    size="lg"
                  >
                    {processing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CreditCard className="mr-2 h-4 w-4" />
                        Pay ₦{calculateAmount().toLocaleString()}
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
