"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AdminNavbar } from "@/components/admin-navbar"
import {
  ChartContainer,
  LineChart,
  PieChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Line,
  Pie,
  Cell,
  COLORS,
  ChartTooltip,
} from "@/components/ui/chart"
import { Users, DollarSign, CreditCard, TrendingUp, Eye } from "lucide-react"

interface Analytics {
  statistics: {
    total_students_paid: number
    total_payments: number
    total_revenue: number
    first_installments: number
    second_installments: number
  }
  paymentsBySchool: Array<{
    school_name: string
    payment_count: number
    total_amount: number
  }>
  paymentsByDepartment: Array<{
    department_name: string
    school_name: string
    payment_count: number
    total_amount: number
  }>
  paymentsByDate: Array<{
    payment_date: string
    payment_count: number
    total_amount: number
  }>
  recentPayments: Array<{
    id: string
    amount: number
    payment_date: string
    reference: string
    status: string
    full_name: string
    matric_number: string
    department_name: string
    school_name: string
    installment_number: number
    academic_session: string
  }>
}

export default function AdminDashboard() {
  const router = useRouter()
  const [admin, setAdmin] = useState<any | null>(null)
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchAdminData()
    fetchAnalytics()
  }, [])

  const fetchAdminData = async () => {
    try {
      const response = await fetch("/api/admin/profile")
      if (response.ok) {
        const data = await response.json()
        setAdmin(data.admin)
      } else {
        router.push("/admin/login")
      }
    } catch (error) {
      console.error("Error fetching admin data:", error)
      setError("Failed to load admin data")
      router.push("/admin/login")
    }
  }

  const fetchAnalytics = async () => {
    try {
      const response = await fetch("/api/admin/analytics")
      if (response.ok) {
        const data = await response.json()
        setAnalytics(data)
      } else {
        setError("Failed to load analytics data")
      }
    } catch (error) {
      console.error("Error fetching analytics:", error)
      setError("Failed to load analytics data")
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/auth/logout", { method: "POST" })
      router.push("/admin/login")
    } catch (error) {
      console.error("Logout error:", error)
      router.push("/admin/login")
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-fpb-blue text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto"></div>
          <p className="mt-4">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-fpb-blue text-white">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()} className="bg-blue-600 hover:bg-blue-700">
            Retry
          </Button>
        </div>
      </div>
    )
  }

  if (!admin) {
    return null
  }

  // Default analytics if none loaded
  const defaultAnalytics: Analytics = {
    statistics: {
      total_students_paid: 0,
      total_payments: 0,
      total_revenue: 0,
      first_installments: 0,
      second_installments: 0,
    },
    paymentsBySchool: [],
    paymentsByDepartment: [],
    paymentsByDate: [],
    recentPayments: [],
  }

  const currentAnalytics = analytics || defaultAnalytics

  return (
    <div className="min-h-screen flex flex-col bg-fpb-blue text-white">
      <AdminNavbar adminName={admin.full_name} onLogout={handleLogout} />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-gray-300">Welcome back, {admin.full_name}</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-fpb-blue-light border-gray-700 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-300">Students Paid</p>
                  <h3 className="text-2xl font-bold mt-2">{currentAnalytics.statistics.total_students_paid}</h3>
                </div>
                <Users className="w-8 h-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-fpb-blue-light border-gray-700 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-300">Total Payments</p>
                  <h3 className="text-2xl font-bold mt-2">{currentAnalytics.statistics.total_payments}</h3>
                </div>
                <CreditCard className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-fpb-blue-light border-gray-700 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-300">Total Revenue</p>
                  <h3 className="text-2xl font-bold mt-2">
                    ₦{Number(currentAnalytics.statistics.total_revenue).toLocaleString()}
                  </h3>
                </div>
                <DollarSign className="w-8 h-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-fpb-blue-light border-gray-700 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-300">Installments</p>
                  <h3 className="text-2xl font-bold mt-2">
                    {currentAnalytics.statistics.first_installments + currentAnalytics.statistics.second_installments}
                  </h3>
                  <p className="text-xs text-gray-400">
                    1st: {currentAnalytics.statistics.first_installments} | 2nd:{" "}
                    {currentAnalytics.statistics.second_installments}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        {currentAnalytics.paymentsBySchool.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card className="bg-fpb-blue-light border-gray-700 text-white">
              <CardHeader>
                <CardTitle>Payments by School</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={currentAnalytics.paymentsBySchool}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name.split(" ").slice(-1)[0]} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="total_amount"
                      >
                        {currentAnalytics.paymentsBySchool.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<ChartTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card className="bg-fpb-blue-light border-gray-700 text-white">
              <CardHeader>
                <CardTitle>Payment Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={currentAnalytics.paymentsByDate}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="payment_date" stroke="#9CA3AF" tick={{ fill: "#9CA3AF" }} />
                      <YAxis stroke="#9CA3AF" tick={{ fill: "#9CA3AF" }} />
                      <Tooltip content={<ChartTooltip />} />
                      <Legend />
                      <Line type="monotone" dataKey="total_amount" stroke="#10B981" strokeWidth={2} name="Amount" />
                      <Line type="monotone" dataKey="payment_count" stroke="#3B82F6" strokeWidth={2} name="Count" />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Recent Payments */}
        <Card className="bg-fpb-blue-light border-gray-700 text-white">
          <CardHeader>
            <CardTitle>Recent Payments</CardTitle>
            <CardDescription className="text-gray-300">Latest payment transactions</CardDescription>
          </CardHeader>
          <CardContent>
            {currentAnalytics.recentPayments.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-400">No recent payments found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left py-3 px-4">Student</th>
                      <th className="text-left py-3 px-4">Amount</th>
                      <th className="text-left py-3 px-4">Installment</th>
                      <th className="text-left py-3 px-4">Date</th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-left py-3 px-4">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentAnalytics.recentPayments.slice(0, 10).map((payment) => (
                      <tr key={payment.id} className="border-b border-gray-700 hover:bg-gray-800">
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium">{payment.full_name}</p>
                            <p className="text-sm text-gray-400">{payment.matric_number}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4">₦{Number(payment.amount).toLocaleString()}</td>
                        <td className="py-3 px-4">
                          <Badge className="bg-blue-600">
                            {payment.installment_number === 1 ? "1st" : "2nd"} Installment
                          </Badge>
                        </td>
                        <td className="py-3 px-4">{new Date(payment.payment_date).toLocaleDateString()}</td>
                        <td className="py-3 px-4">
                          <Badge className={getStatusBadgeColor(payment.status)}>{payment.status}</Badge>
                        </td>
                        <td className="py-3 px-4">
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-gray-600 text-white hover:bg-gray-700 bg-transparent"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <Card className="bg-fpb-blue-light border-gray-700 text-white">
            <CardContent className="p-6 text-center">
              <h3 className="text-lg font-semibold mb-2">Manage Fees</h3>
              <p className="text-gray-300 mb-4">Create and configure school fees</p>
              <Button onClick={() => router.push("/admin/fees")} className="bg-green-600 hover:bg-green-700">
                Go to Fees
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-fpb-blue-light border-gray-700 text-white">
            <CardContent className="p-6 text-center">
              <h3 className="text-lg font-semibold mb-2">View Analytics</h3>
              <p className="text-gray-300 mb-4">Detailed payment analytics and reports</p>
              <Button onClick={() => router.push("/admin/analytics")} className="bg-blue-600 hover:bg-blue-700">
                View Analytics
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-fpb-blue-light border-gray-700 text-white">
            <CardContent className="p-6 text-center">
              <h3 className="text-lg font-semibold mb-2">Manage Payments</h3>
              <p className="text-gray-300 mb-4">View and manage all payments</p>
              <Button onClick={() => router.push("/admin/payments")} className="bg-purple-600 hover:bg-purple-700">
                View Payments
              </Button>
            </CardContent>
          </Card>
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
