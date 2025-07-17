"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AdminNavbar } from "@/components/admin-navbar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus } from "lucide-react"

export default function AdminFees() {
  const router = useRouter()
  const [admin, setAdmin] = useState<any | null>(null)
  const [fees, setFees] = useState<any[]>([])
  const [schools, setSchools] = useState<any[]>([])
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    feeName: "",
    description: "",
    amount: "",
    academicSession: "2023/2024",
    levels: [] as string[],
    schoolIds: [] as string[],
    allowsInstallments: true,
    firstInstallmentPercentage: 70,
    secondInstallmentPercentage: 30,
  })
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const availableLevels = ["ND1", "ND2", "HND1", "HND2"]

  useEffect(() => {
    fetchAdminData()
    fetchSchools()
    fetchFees()
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

  const fetchFees = async () => {
    try {
      const response = await fetch("/api/admin/fees")
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
      await fetch("/api/admin/auth/logout", { method: "POST" })
      router.push("/admin/login")
    } catch (error) {
      console.error("Logout error:", error)
      router.push("/admin/login")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (formData.schoolIds.length === 0) {
      setError("Please select at least one school")
      return
    }

    if (formData.levels.length === 0) {
      setError("Please select at least one level")
      return
    }

    try {
      const response = await fetch("/api/admin/fees", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess("Fee created successfully!")
        setShowCreateForm(false)
        setFormData({
          feeName: "",
          description: "",
          amount: "",
          academicSession: "2023/2024",
          levels: [],
          schoolIds: [],
          allowsInstallments: true,
          firstInstallmentPercentage: 70,
          secondInstallmentPercentage: 30,
        })
        fetchFees()
      } else {
        setError(data.error || "Failed to create fee")
      }
    } catch (error) {
      setError("Network error. Please try again.")
    }
  }

  const handleSchoolToggle = (schoolId: string) => {
    setFormData((prev) => ({
      ...prev,
      schoolIds: prev.schoolIds.includes(schoolId)
        ? prev.schoolIds.filter((id) => id !== schoolId)
        : [...prev.schoolIds, schoolId],
    }))
  }

  const handleLevelToggle = (level: string) => {
    setFormData((prev) => ({
      ...prev,
      levels: prev.levels.includes(level) ? prev.levels.filter((l) => l !== level) : [...prev.levels, level],
    }))
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

  if (!admin) {
    return null
  }

  return (
    <div className="min-h-screen flex flex-col bg-fpb-blue text-white">
      <AdminNavbar adminName={admin.full_name} onLogout={handleLogout} />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Fee Management</h1>
            <p className="text-gray-300">Create and manage school fees</p>
          </div>
          <Button onClick={() => setShowCreateForm(!showCreateForm)} className="bg-green-600 hover:bg-green-700">
            <Plus className="w-4 h-4 mr-2" />
            Create New Fee
          </Button>
        </div>

        {error && (
          <Alert className="bg-red-900 border-red-700 mb-6">
            <AlertDescription className="text-red-200">{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="bg-green-900 border-green-700 mb-6">
            <AlertDescription className="text-green-200">{success}</AlertDescription>
          </Alert>
        )}

        {showCreateForm && (
          <Card className="bg-fpb-blue-light border-gray-700 text-white mb-8">
            <CardHeader>
              <CardTitle>Create New Fee</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="feeName" className="text-white">
                      Fee Name *
                    </Label>
                    <Input
                      id="feeName"
                      value={formData.feeName}
                      onChange={(e) => setFormData((prev) => ({ ...prev, feeName: e.target.value }))}
                      className="bg-gray-800 border-gray-700 text-white"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="amount" className="text-white">
                      Amount (₦) *
                    </Label>
                    <Input
                      id="amount"
                      type="number"
                      value={formData.amount}
                      onChange={(e) => setFormData((prev) => ({ ...prev, amount: e.target.value }))}
                      className="bg-gray-800 border-gray-700 text-white"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description" className="text-white">
                    Description
                  </Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>

                <div>
                  <Label htmlFor="academicSession" className="text-white">
                    Academic Session *
                  </Label>
                  <select
                    id="academicSession"
                    value={formData.academicSession}
                    onChange={(e) => setFormData((prev) => ({ ...prev, academicSession: e.target.value }))}
                    className="w-full p-2 border rounded-md bg-gray-800 border-gray-700 text-white"
                    required
                  >
                    <option value="2023/2024">2023/2024</option>
                    <option value="2024/2025">2024/2025</option>
                  </select>
                </div>

                <div>
                  <Label className="text-white">Applicable Levels *</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                    {availableLevels.map((level) => (
                      <label key={level} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.levels.includes(level)}
                          onChange={() => handleLevelToggle(level)}
                          className="rounded"
                        />
                        <span className="text-sm">{level}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-white">Applicable Schools *</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                    {schools.map((school) => (
                      <label key={school.id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.schoolIds.includes(school.id)}
                          onChange={() => handleSchoolToggle(school.id)}
                          className="rounded"
                        />
                        <span className="text-sm">{school.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.allowsInstallments}
                      onChange={(e) => setFormData((prev) => ({ ...prev, allowsInstallments: e.target.checked }))}
                      className="rounded"
                    />
                    <span className="text-white">Allow Installment Payments</span>
                  </label>
                </div>

                {formData.allowsInstallments && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstInstallment" className="text-white">
                        First Installment (%)
                      </Label>
                      <Input
                        id="firstInstallment"
                        type="number"
                        min="1"
                        max="99"
                        value={formData.firstInstallmentPercentage}
                        onChange={(e) => {
                          const value = Number(e.target.value)
                          setFormData((prev) => ({
                            ...prev,
                            firstInstallmentPercentage: value,
                            secondInstallmentPercentage: 100 - value,
                          }))
                        }}
                        className="bg-gray-800 border-gray-700 text-white"
                      />
                    </div>

                    <div>
                      <Label htmlFor="secondInstallment" className="text-white">
                        Second Installment (%)
                      </Label>
                      <Input
                        id="secondInstallment"
                        type="number"
                        value={formData.secondInstallmentPercentage}
                        disabled
                        className="bg-gray-800 border-gray-700 text-white opacity-50"
                      />
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                    Create Fee
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCreateForm(false)}
                    className="border-gray-600 text-white hover:bg-gray-700"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Fees List */}
        <Card className="bg-fpb-blue-light border-gray-700 text-white">
          <CardHeader>
            <CardTitle>Existing Fees</CardTitle>
          </CardHeader>
          <CardContent>
            {fees.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-400">No fees created yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left py-3 px-4">Fee Name</th>
                      <th className="text-left py-3 px-4">Amount</th>
                      <th className="text-left py-3 px-4">Session</th>
                      <th className="text-left py-3 px-4">Levels</th>
                      <th className="text-left py-3 px-4">Schools</th>
                      <th className="text-left py-3 px-4">Installments</th>
                      <th className="text-left py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fees.map((fee) => (
                      <tr key={fee.id} className="border-b border-gray-700 hover:bg-gray-800">
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium">{fee.fee_name}</p>
                            {fee.description && <p className="text-sm text-gray-400">{fee.description}</p>}
                          </div>
                        </td>
                        <td className="py-3 px-4">₦{Number(fee.amount).toLocaleString()}</td>
                        <td className="py-3 px-4">{fee.academic_session}</td>
                        <td className="py-3 px-4">
                          <div className="flex flex-wrap gap-1">
                            {fee.applicable_levels?.map((level: string, index: number) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {level}
                              </Badge>
                            ))}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm">
                            {fee.school_names?.slice(0, 2).map((name: string, index: number) => (
                              <p key={index}>{name}</p>
                            ))}
                            {fee.school_names?.length > 2 && (
                              <p className="text-gray-400">+{fee.school_names.length - 2} more</p>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          {fee.allows_installments ? (
                            <div className="text-sm">
                              <p>1st: {fee.first_installment_percentage}%</p>
                              <p>2nd: {fee.second_installment_percentage}%</p>
                            </div>
                          ) : (
                            <span className="text-gray-400">Full payment only</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <Badge className={fee.is_active ? "bg-green-500" : "bg-red-500"}>
                            {fee.is_active ? "Active" : "Inactive"}
                          </Badge>
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
