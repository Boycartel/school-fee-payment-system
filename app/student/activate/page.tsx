"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface School {
  id: string
  name: string
}

interface Department {
  id: string
  name: string
  school_id: string
}

export default function StudentActivation() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    fullName: "",
    matricNumber: "",
    email: "",
    phone: "",
    schoolId: "",
    departmentId: "",
    level: "",
    password: "",
    confirmPassword: "",
  })
  const [schools, setSchools] = useState<School[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [filteredDepartments, setFilteredDepartments] = useState<Department[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    fetchSchools()
    fetchDepartments()
  }, [])

  useEffect(() => {
    if (formData.schoolId) {
      const filtered = departments.filter((dept) => dept.school_id === formData.schoolId)
      setFilteredDepartments(filtered)
      setFormData((prev) => ({ ...prev, departmentId: "" }))
    } else {
      setFilteredDepartments([])
    }
  }, [formData.schoolId, departments])

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setError("")
    setSuccess("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess("")

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long")
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch("/api/student/activate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess("Account activated successfully! You can now login.")
        setTimeout(() => {
          router.push("/student/login")
        }, 2000)
      } else {
        setError(data.error || "Activation failed")
      }
    } catch (error) {
      setError("Network error. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-fpb-blue text-white">
      <header className="border-b border-gray-700">
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

      <main className="flex-1 container mx-auto px-4 py-12 flex items-center justify-center">
        <Card className="w-full max-w-2xl bg-fpb-blue-light border-gray-700 text-white">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Activate Student Account</CardTitle>
            <CardDescription className="text-center text-gray-300">
              Create your account to access the fee confirmation system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert className="bg-red-900 border-red-700">
                  <AlertDescription className="text-red-200">{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="bg-green-900 border-green-700">
                  <AlertDescription className="text-green-200">{success}</AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-white">
                    Full Name *
                  </Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    placeholder="Enter your full name"
                    required
                    value={formData.fullName}
                    onChange={handleChange}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="matricNumber" className="text-white">
                    Matric Number *
                  </Label>
                  <Input
                    id="matricNumber"
                    name="matricNumber"
                    placeholder="e.g. 2023/1/123456CS"
                    required
                    value={formData.matricNumber}
                    onChange={handleChange}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white">
                    Email Address *
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="your.email@student.fpb.edu.ng"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-white">
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    name="phone"
                    placeholder="08012345678"
                    value={formData.phone}
                    onChange={handleChange}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="schoolId" className="text-white">
                    School *
                  </Label>
                  <select
                    id="schoolId"
                    name="schoolId"
                    required
                    value={formData.schoolId}
                    onChange={handleChange}
                    className="w-full p-2 border rounded-md bg-gray-800 border-gray-700 text-white"
                  >
                    <option value="">Select School</option>
                    {schools.map((school) => (
                      <option key={school.id} value={school.id}>
                        {school.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="departmentId" className="text-white">
                    Department *
                  </Label>
                  <select
                    id="departmentId"
                    name="departmentId"
                    required
                    value={formData.departmentId}
                    onChange={handleChange}
                    disabled={!formData.schoolId}
                    className="w-full p-2 border rounded-md bg-gray-800 border-gray-700 text-white disabled:opacity-50"
                  >
                    <option value="">Select Department</option>
                    {filteredDepartments.map((department) => (
                      <option key={department.id} value={department.id}>
                        {department.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="level" className="text-white">
                  Level *
                </Label>
                <select
                  id="level"
                  name="level"
                  required
                  value={formData.level}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md bg-gray-800 border-gray-700 text-white"
                >
                  <option value="">Select Level</option>
                  <option value="ND1">ND 1</option>
                  <option value="ND2">ND 2</option>
                  <option value="HND1">HND 1</option>
                  <option value="HND2">HND 2</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-white">
                    Password *
                  </Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Enter password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-white">
                    Confirm Password *
                  </Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="Confirm password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
              </div>

              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
                {isLoading ? "Activating Account..." : "Activate Account"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-300">
                Already have an account?{" "}
                <Link href="/student/login" className="text-blue-400 hover:underline">
                  Login here
                </Link>
              </p>
            </div>
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
