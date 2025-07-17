"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { StudentNavbar } from "@/components/student-navbar"
import {
  CreditCard,
  User,
  GraduationCap,
  Receipt,
  Calendar,
  DollarSign,
  CheckCircle,
  Clock,
  AlertCircle,
  Upload,
} from "lucide-react"

interface Student {
  id: string
  full_name: string
  matric_number: string
  email: string
  phone: string
  level: string
  department_name: string
  school_name: string
  passport_photo?: string
  is_activated: boolean
}

interface Payment {
  id: string
  amount: number
  payment_date: string
  reference: string
  receipt_number: string
  status: string
  fee_type: string
  academic_session: string
  installment_number?: number
  total_installments?: number
  fee_name?: string
}

export default function StudentDashboard() {
  const router = useRouter()
  const [student, setStudent] = useState<Student | null>(null)
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState("")

  useEffect(() => {
    console.log("Dashboard component mounted")
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      console.log("=== Loading Dashboard Data ===")
      setLoading(true)
      setError("")

      // First, fetch student profile
      console.log("Fetching student profile...")
      const profileResponse = await fetch("/api/student/profile", {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      })

      console.log("Profile response status:", profileResponse.status)
      const profileData = await profileResponse.json()
      console.log("Profile response data:", profileData)

      if (!profileResponse.ok) {
        console.error("Profile fetch failed:", profileData.error)
        if (profileResponse.status === 401) {
          console.log("Unauthorized - redirecting to login")
          router.push("/student/login")
          return
        }
        throw new Error(profileData.error || "Failed to load profile")
      }

      if (!profileData.success || !profileData.student) {
        console.error("Invalid profile response:", profileData)
        throw new Error("Invalid profile data received")
      }

      console.log("Student profile loaded successfully:", profileData.student.matric_number)
      setStudent(profileData.student)

      // Then, fetch payments
      console.log("Fetching student payments...")
      const paymentsResponse = await fetch("/api/student/payments", {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      })

      console.log("Payments response status:", paymentsResponse.status)
      const paymentsData = await paymentsResponse.json()
      console.log("Payments response data:", paymentsData)

      if (paymentsResponse.ok && paymentsData.success) {
        console.log("Payments loaded successfully:", paymentsData.payments.length)
        setPayments(paymentsData.payments || [])
      } else {
        console.error("Failed to load payments:", paymentsData.error)
        // Don't fail the entire dashboard for payments
        setPayments([])
      }

      console.log("Dashboard data loaded successfully")
    } catch (error) {
      console.error("Dashboard loading error:", error)
      setError(error instanceof Error ? error.message : "Failed to load dashboard")
    } finally {
      setLoading(false)
    }
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
            <AlertCircle className="w-3 h-3 mr-1" />
            Failed
          </Badge>
        )
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const formatPaymentType = (payment: Payment) => {
    if (payment.installment_number && payment.total_installments && payment.total_installments > 1) {
      return `${payment.fee_type} (${payment.installment_number}/${payment.total_installments})`
    }
    return payment.fee_type || "School Fee"
  }

  const handlePassportUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      setUploadError("File size must be less than 5MB")
      return
    }

    if (!file.type.startsWith("image/")) {
      setUploadError("Please select an image file")
      return
    }

    setUploading(true)
    setUploadError("")

    const formData = new FormData()
    formData.append("passport", file)

    try {
      const response = await fetch("/api/upload/passport", {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        // Refresh the page to show the new photo
        window.location.reload()
      } else {
        const data = await response.json()
        setUploadError(data.error || "Upload failed")
      }
    } catch (error) {
      setUploadError("Upload failed. Please try again.")
    } finally {
      setUploading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto"></div>
          <p className="mt-4">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
        <Card className="w-full max-w-md bg-slate-800/50 border-slate-700 text-white">
          <CardContent className="p-8 text-center">
            <h3 className="text-xl font-semibold mb-4 text-red-400">Error Loading Dashboard</h3>
            <p className="text-gray-300 mb-6 text-sm">{error}</p>
            <div className="space-y-3">
              <Button
                onClick={() => {
                  console.log("Retrying dashboard load...")
                  loadDashboardData()
                }}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Retry
              </Button>
              <Link href="/student/login">
                <Button className="w-full bg-gray-600 hover:bg-gray-700">Login Again</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!student) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
        <Card className="w-full max-w-md bg-slate-800/50 border-slate-700 text-white">
          <CardContent className="p-8 text-center">
            <h3 className="text-xl font-semibold mb-4 text-red-400">No Student Data</h3>
            <p className="text-gray-300 mb-6">Unable to load student information</p>
            <Link href="/student/login">
              <Button className="w-full bg-blue-600 hover:bg-blue-700">Login Again</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const totalPaid = payments.filter((p) => p.status === "verified").reduce((sum, p) => sum + Number(p.amount), 0)
  const pendingPayments = payments.filter((p) => p.status === "pending").length
  const verifiedPayments = payments.filter((p) => p.status === "verified").length

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <StudentNavbar />

      <main className="container mx-auto px-4 py-8">
        {/* Student Profile Section */}
        <div className="mb-8">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center gap-6">
                {/* Profile Picture */}
                <div className="flex-shrink-0">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-blue-400">
                      {student.passport_photo ? (
                        <img
                          src={student.passport_photo || "/placeholder.svg"}
                          alt="Student Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-600 flex items-center justify-center">
                          <User className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                    {/* Upload Button */}
                    <div className="mt-2">
                      <label htmlFor="passport-upload" className="cursor-pointer">
                        <div className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300">
                          <Upload className="w-3 h-3" />
                          {uploading ? "Uploading..." : "Upload Photo"}
                        </div>
                        <input
                          id="passport-upload"
                          type="file"
                          accept="image/*"
                          onChange={handlePassportUpload}
                          disabled={uploading}
                          className="hidden"
                        />
                      </label>
                      {uploadError && <p className="text-red-400 text-xs mt-1">{uploadError}</p>}
                    </div>
                  </div>
                </div>

                {/* Student Info */}
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-white mb-2">{student.full_name}</h1>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-gray-300">
                    <p>
                      <span className="font-medium">Matric Number:</span> {student.matric_number}
                    </p>
                    <p>
                      <span className="font-medium">Level:</span> {student.level}
                    </p>
                    <p>
                      <span className="font-medium">Email:</span> {student.email}
                    </p>
                    <p>
                      <span className="font-medium">Phone:</span> {student.phone}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Total Paid</CardTitle>
              <DollarSign className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">₦{totalPaid.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Verified Payments</CardTitle>
              <CheckCircle className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-400">{verifiedPayments}</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Pending Payments</CardTitle>
              <Clock className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-400">{pendingPayments}</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Total Transactions</CardTitle>
              <Receipt className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-300">{payments.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-slate-800/50 border-slate-700 hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <CreditCard className="h-5 w-5" />
                Make Payment
              </CardTitle>
              <CardDescription className="text-gray-400">Pay your school fees online</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/student/payment">
                <Button className="w-full bg-green-600 hover:bg-green-700">Pay Now</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <User className="h-5 w-5" />
                Profile
              </CardTitle>
              <CardDescription className="text-gray-400">View and update your profile</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p className="text-gray-300">
                  <span className="font-medium">School:</span> {student.school_name || "Not Set"}
                </p>
                <p className="text-gray-300">
                  <span className="font-medium">Department:</span> {student.department_name || "Not Set"}
                </p>
                <p className="text-gray-300">
                  <span className="font-medium">Status:</span>
                  <Badge
                    className={`ml-2 ${student.is_activated ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                  >
                    {student.is_activated ? "Active" : "Inactive"}
                  </Badge>
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <GraduationCap className="h-5 w-5" />
                Academic Info
              </CardTitle>
              <CardDescription className="text-gray-400">Your academic information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p className="text-gray-300">
                  <span className="font-medium">Level:</span> {student.level}
                </p>
                <p className="text-gray-300">
                  <span className="font-medium">Email:</span> {student.email}
                </p>
                <p className="text-gray-300">
                  <span className="font-medium">Phone:</span> {student.phone}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payment History */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Receipt className="h-5 w-5" />
              Payment History
            </CardTitle>
            <CardDescription className="text-gray-400">Your recent payment transactions</CardDescription>
          </CardHeader>
          <CardContent>
            {payments.length === 0 ? (
              <div className="text-center py-8">
                <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400 mb-4">No payments found</p>
                <Link href="/student/payment">
                  <Button className="bg-green-600 hover:bg-green-700">Make Your First Payment</Button>
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-600">
                      <th className="text-left py-3 px-4 font-medium text-gray-300">Date</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-300">Fee Type</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-300">Amount</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-300">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-300">Reference</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((payment) => (
                      <tr key={payment.id} className="border-b border-slate-700 hover:bg-slate-700/30">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2 text-gray-300">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            {new Date(payment.payment_date).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium text-gray-300">{formatPaymentType(payment)}</p>
                            {payment.academic_session && (
                              <p className="text-sm text-gray-400">{payment.academic_session}</p>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-semibold text-green-400">
                            ₦{Number(payment.amount).toLocaleString()}
                          </span>
                        </td>
                        <td className="py-3 px-4">{getStatusBadge(payment.status)}</td>
                        <td className="py-3 px-4">
                          <code className="text-xs bg-slate-700 text-gray-300 px-2 py-1 rounded">
                            {payment.reference}
                          </code>
                        </td>
                        <td className="py-3 px-4">
                          {payment.status === "verified" ? (
                            <Link href={`/payment/receipt/${payment.reference}`}>
                              <Button
                                size="sm"
                                variant="outline"
                                className="flex items-center gap-1 bg-transparent border-slate-600 text-gray-300 hover:bg-slate-700"
                              >
                                <Receipt className="h-3 w-3" />
                                Receipt
                              </Button>
                            </Link>
                          ) : (
                            <span className="text-gray-500 text-sm">N/A</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
