"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AdminNavbar } from "@/components/admin-navbar"
import { Download, Eye } from "lucide-react"

interface Department {
  id: string
  name: string
  school_id: string
}

export default function AdminPayments() {
  const router = useRouter()
  const [admin, setAdmin] = useState<any | null>(null)
  const [analytics, setAnalytics] = useState<any | null>(null)
  const [schools, setSchools] = useState<any[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)
  const [filteredPayments, setFilteredPayments] = useState<any[]>([])
  const [filters, setFilters] = useState({
    school: "",
    department: "",
    status: "",
    installment: "",
    dateFrom: "",
    dateTo: "",
  })

  useEffect(() => {
    fetchAdminData()
    fetchSchools()
    fetchDepartments()
    fetchAnalytics()
  }, [])

  useEffect(() => {
    if (analytics?.recentPayments) {
      let filtered = analytics.recentPayments

      if (filters.status) {
        filtered = filtered.filter((p: any) => p.status === filters.status)
      }

      if (filters.installment) {
        filtered = filtered.filter((p: any) => p.installment_number.toString() === filters.installment)
      }

      if (filters.dateFrom) {
        filtered = filtered.filter((p: any) => new Date(p.payment_date) >= new Date(filters.dateFrom))
      }

      if (filters.dateTo) {
        filtered = filtered.filter((p: any) => new Date(p.payment_date) <= new Date(filters.dateTo))
      }

      setFilteredPayments(filtered)
    }
  }, [filters, analytics])

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
      router.push("/admin/login")
    }
  }

  const fetchSchools = async () => {
    try {
      const response = await fetch("/api/schools")
      if (response.ok) {
        const data = await response.json()
        setSchools(data.schools)
      }
    } catch (error) {
      console.error("Error fetching schools:", error)
    }
  }

  const fetchDepartments = async () => {
    try {
      const response = await fetch("/api/departments")
      if (response.ok) {
        const data = await response.json()
        setDepartments(data.departments)
      }
    } catch (error) {
      console.error("Error fetching departments:", error)
    }
  }

  const fetchAnalytics = async () => {
    try {
      const response = await fetch("/api/admin/analytics")
      if (response.ok) {
        const data = await response.json()
        setAnalytics(data)
        setFilteredPayments(data.recentPayments || [])
      }
    } catch (error) {
      console.error("Error fetching analytics:", error)
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
          <p className="mt-4">Loading payments...</p>
        </div>
      </div>
    )
  }

  if (!admin) {
    return null
  }

  return (
    <div className="min-h-screen flex flex-col bg-fpb-blue text-white">
      <AdminNavbar adminName={admin.full_name} onLogout={handleLogout} />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Payment Management</h1>
            <p className="text-gray-300">View and manage all payment transactions</p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Download className="w-4 h-4 mr-2" />
            Export Payments
          </Button>
        </div>

        {/* Filters */}
        <Card className="bg-fpb-blue-light border-gray-700 text-white mb-6">
          <CardHeader>
            <CardTitle>Filter Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              <div>
                <Label htmlFor="statusFilter" className="text-white">
                  Status
                </Label>
                <select
                  id="statusFilter"
                  value={filters.status}
                  onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
                  className="w-full p-2 border rounded-md bg-gray-800 border-gray-700 text-white mt-1"
                >
                  <option value="">All Status</option>
                  <option value="verified">Verified</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                </select>
              </div>

              <div>
                <Label htmlFor="installmentFilter" className="text-white">
                  Installment
                </Label>
                <select
                  id="installmentFilter"
                  value={filters.installment}
                  onChange={(e) => setFilters((prev) => ({ ...prev, installment: e.target.value }))}
                  className="w-full p-2 border rounded-md bg-gray-800 border-gray-700 text-white mt-1"
                >
                  <option value="">All Installments</option>
                  <option value="1">1st Installment</option>
                  <option value="2">2nd Installment</option>
                </select>
              </div>

              <div>
                <Label htmlFor="dateFrom" className="text-white">
                  From Date
                </Label>
                <Input
                  id="dateFrom"
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => setFilters((prev) => ({ ...prev, dateFrom: e.target.value }))}
                  className="bg-gray-800 border-gray-700 text-white mt-1"
                />
              </div>

              <div>
                <Label htmlFor="dateTo" className="text-white">
                  To Date
                </Label>
                <Input
                  id="dateTo"
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => setFilters((prev) => ({ ...prev, dateTo: e.target.value }))}
                  className="bg-gray-800 border-gray-700 text-white mt-1"
                />
              </div>

              <div className="flex items-end">
                <Button
                  onClick={() =>
                    setFilters({
                      school: "",
                      department: "",
                      status: "",
                      installment: "",
                      dateFrom: "",
                      dateTo: "",
                    })
                  }
                  variant="outline"
                  className="border-gray-600 text-white hover:bg-gray-700"
                >
                  Clear
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payments Table */}
        <Card className="bg-fpb-blue-light border-gray-700 text-white">
          <CardHeader>
            <CardTitle>All Payments ({filteredPayments.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredPayments.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-400">No payments found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left py-3 px-4">Student</th>
                      <th className="text-left py-3 px-4">Department</th>
                      <th className="text-left py-3 px-4">Amount</th>
                      <th className="text-left py-3 px-4">Installment</th>
                      <th className="text-left py-3 px-4">Session</th>
                      <th className="text-left py-3 px-4">Date</th>
                      <th className="text-left py-3 px-4">Reference</th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-left py-3 px-4">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPayments.map((payment) => (
                      <tr key={payment.id} className="border-b border-gray-700 hover:bg-gray-800">
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium">{payment.full_name}</p>
                            <p className="text-sm text-gray-400">{payment.matric_number}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div>
                            <p className="text-sm">{payment.department_name}</p>
                            <p className="text-xs text-gray-400">{payment.school_name}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4">₦{Number(payment.amount).toLocaleString()}</td>
                        <td className="py-3 px-4">
                          <Badge className="bg-blue-600">
                            {payment.installment_number === 1 ? "1st" : "2nd"} Installment
                          </Badge>
                        </td>
                        <td className="py-3 px-4">{payment.academic_session}</td>
                        <td className="py-3 px-4">{new Date(payment.payment_date).toLocaleDateString()}</td>
                        <td className="py-3 px-4">
                          <span className="font-mono text-sm">{payment.reference}</span>
                        </td>
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
      </main>

      <footer className="bg-fpb-blue-light border-t border-gray-700 py-6">
        <div className="container mx-auto px-4 text-center text-gray-300">
          <p>© {new Date().getFullYear()} The Federal Polytechnic Bida. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
