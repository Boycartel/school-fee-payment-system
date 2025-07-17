"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AdminNavbar } from "@/components/admin-navbar"
import {
  ChartContainer,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Bar,
  ChartTooltip,
} from "@/components/ui/chart"
import { Filter, Download } from "lucide-react"

interface Department {
  id: string
  name: string
  school_id: string
}

export default function AdminAnalytics() {
  const router = useRouter()
  const [admin, setAdmin] = useState<any | null>(null)
  const [analytics, setAnalytics] = useState<any | null>(null)
  const [schools, setSchools] = useState<any[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)

  // Filter states
  const [filters, setFilters] = useState({
    schoolId: "",
    departmentId: "",
    startDate: "",
    endDate: "",
    academicSession: "2023/2024",
  })

  useEffect(() => {
    fetchAdminData()
    fetchSchools()
    fetchDepartments()
    fetchAnalytics()
  }, [])

  useEffect(() => {
    fetchAnalytics()
  }, [filters])

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
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value)
      })

      const response = await fetch(`/api/admin/analytics?${params}`)
      if (response.ok) {
        const data = await response.json()
        setAnalytics(data)
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

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const filteredDepartments = filters.schoolId
    ? departments.filter((dept) => dept.school_id === filters.schoolId)
    : departments

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-fpb-blue text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto"></div>
          <p className="mt-4">Loading analytics...</p>
        </div>
      </div>
    )
  }

  if (!admin || !analytics) {
    return null
  }

  return (
    <div className="min-h-screen flex flex-col bg-fpb-blue text-white">
      <AdminNavbar adminName={admin.full_name} onLogout={handleLogout} />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Analytics Dashboard</h1>
          <p className="text-gray-300">Detailed payment analytics and insights</p>
        </div>

        {/* Filters */}
        <Card className="bg-fpb-blue-light border-gray-700 text-white mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Analytics Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <Label htmlFor="schoolFilter" className="text-white">
                  School
                </Label>
                <select
                  id="schoolFilter"
                  value={filters.schoolId}
                  onChange={(e) => handleFilterChange("schoolId", e.target.value)}
                  className="w-full p-2 border rounded-md bg-gray-800 border-gray-700 text-white mt-1"
                >
                  <option value="">All Schools</option>
                  {schools.map((school) => (
                    <option key={school.id} value={school.id}>
                      {school.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="departmentFilter" className="text-white">
                  Department
                </Label>
                <select
                  id="departmentFilter"
                  value={filters.departmentId}
                  onChange={(e) => handleFilterChange("departmentId", e.target.value)}
                  disabled={!filters.schoolId}
                  className="w-full p-2 border rounded-md bg-gray-800 border-gray-700 text-white mt-1 disabled:opacity-50"
                >
                  <option value="">All Departments</option>
                  {filteredDepartments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="sessionFilter" className="text-white">
                  Academic Session
                </Label>
                <select
                  id="sessionFilter"
                  value={filters.academicSession}
                  onChange={(e) => handleFilterChange("academicSession", e.target.value)}
                  className="w-full p-2 border rounded-md bg-gray-800 border-gray-700 text-white mt-1"
                >
                  <option value="">All Sessions</option>
                  <option value="2023/2024">2023/2024</option>
                  <option value="2022/2023">2022/2023</option>
                  <option value="2021/2022">2021/2022</option>
                </select>
              </div>

              <div>
                <Label htmlFor="startDate" className="text-white">
                  Start Date
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => handleFilterChange("startDate", e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white mt-1"
                />
              </div>

              <div>
                <Label htmlFor="endDate" className="text-white">
                  End Date
                </Label>
                <Input
                  id="endDate"
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => handleFilterChange("endDate", e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white mt-1"
                />
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <Button
                onClick={() =>
                  setFilters({
                    schoolId: "",
                    departmentId: "",
                    startDate: "",
                    endDate: "",
                    academicSession: "",
                  })
                }
                variant="outline"
                className="border-gray-600 text-white hover:bg-gray-700"
              >
                Clear Filters
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Download className="w-4 h-4 mr-2" />
                Export Data
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-fpb-blue-light border-gray-700 text-white">
            <CardHeader>
              <CardTitle>Revenue by School</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.paymentsBySchool}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis
                      dataKey="school_name"
                      stroke="#9CA3AF"
                      tick={{ fill: "#9CA3AF", fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis stroke="#9CA3AF" tick={{ fill: "#9CA3AF" }} />
                    <Tooltip content={<ChartTooltip />} />
                    <Bar dataKey="total_amount" fill="#10B981" name="Total Amount" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card className="bg-fpb-blue-light border-gray-700 text-white">
            <CardHeader>
              <CardTitle>Top Departments by Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.paymentsByDepartment.slice(0, 10)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis
                      dataKey="department_name"
                      stroke="#9CA3AF"
                      tick={{ fill: "#9CA3AF", fontSize: 10 }}
                      angle={-45}
                      textAnchor="end"
                      height={100}
                    />
                    <YAxis stroke="#9CA3AF" tick={{ fill: "#9CA3AF" }} />
                    <Tooltip content={<ChartTooltip />} />
                    <Bar dataKey="total_amount" fill="#3B82F6" name="Total Amount" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
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
