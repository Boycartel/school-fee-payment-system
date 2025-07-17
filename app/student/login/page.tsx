"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export default function StudentLogin() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    matricNumber: "",
    password: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [newPassword, setNewPassword] = useState("")
  const [confirmNewPassword, setConfirmNewPassword] = useState("")
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [passwordChangeError, setPasswordChangeError] = useState("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setError("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          matricNumber: formData.matricNumber.trim().toUpperCase(),
          password: formData.password,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        // Check if password is default "student"
        if (data.isDefaultPassword) {
          setShowPasswordModal(true)
        } else {
          router.push("/student/dashboard")
        }
      } else {
        setError(data.error || "Login failed")
      }
    } catch (error) {
      setError("Network error. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordChange = async () => {
    setPasswordChangeError("")

    if (newPassword !== confirmNewPassword) {
      setPasswordChangeError("Passwords do not match")
      return
    }

    if (newPassword.length < 6) {
      setPasswordChangeError("Password must be at least 6 characters long")
      return
    }

    if (newPassword === "student") {
      setPasswordChangeError("Please choose a different password than 'student'")
      return
    }

    setIsChangingPassword(true)

    try {
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          newPassword,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        // Logout user after password change
        await fetch("/api/auth/logout", { method: "POST" })
        setShowPasswordModal(false)
        alert("Password changed successfully! Please login again with your new password.")
        setFormData({ matricNumber: formData.matricNumber, password: "" })
        setNewPassword("")
        setConfirmNewPassword("")
      } else {
        setPasswordChangeError(data.error || "Password change failed")
      }
    } catch (error) {
      setPasswordChangeError("Network error. Please try again.")
    } finally {
      setIsChangingPassword(false)
    }
  }

  const handleForgotPassword = async () => {
    if (!formData.matricNumber) {
      setError("Please enter your matric number first")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          matricNumber: formData.matricNumber,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        alert("Password reset successfully! Your password has been reset to 'student'. Please login.")
        setFormData((prev) => ({ ...prev, password: "" }))
      } else {
        setError(data.error || "Password reset failed")
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
        <Card className="w-full max-w-md bg-fpb-blue-light border-gray-700 text-white">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Student Login</CardTitle>
            <CardDescription className="text-center text-gray-300">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert className="bg-red-900 border-red-700">
                  <AlertDescription className="text-red-200">{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="matricNumber" className="text-white">
                  Matric Number
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
                <p className="text-xs text-gray-400">Format: Year/Level/NumberDept (e.g. 2023/1/123456CS)</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-white">
                  Password
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Enter your password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
                {isLoading ? "Logging in..." : "Login"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <div className="text-sm text-center text-gray-400 space-y-2">
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-blue-400 hover:underline block"
                disabled={isLoading}
              >
                Forgot password?
              </button>
              <div>
                Don't have an account?{" "}
                <Link href="/student/activate" className="text-blue-400 hover:underline">
                  Activate here
                </Link>
              </div>
            </div>
          </CardFooter>
        </Card>
      </main>

      {/* Password Change Modal */}
      <Dialog open={showPasswordModal} onOpenChange={() => {}}>
        <DialogContent className="bg-fpb-blue-light border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle>Change Default Password</DialogTitle>
            <DialogDescription className="text-gray-300">
              For security reasons, please change your default password before continuing.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {passwordChangeError && (
              <Alert className="bg-red-900 border-red-700">
                <AlertDescription className="text-red-200">{passwordChangeError}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="newPassword" className="text-white">
                New Password
              </Label>
              <Input
                id="newPassword"
                type="password"
                placeholder="Enter new password (min 6 characters)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmNewPassword" className="text-white">
                Confirm New Password
              </Label>
              <Input
                id="confirmNewPassword"
                type="password"
                placeholder="Confirm new password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>
            <Button
              onClick={handlePasswordChange}
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={isChangingPassword}
            >
              {isChangingPassword ? "Changing Password..." : "Change Password"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <footer className="bg-fpb-blue-light border-t border-gray-700 py-6">
        <div className="container mx-auto px-4 text-center text-gray-300">
          <p>© {new Date().getFullYear()} The Federal Polytechnic Bida. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
