"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"

interface StudentNavbarProps {
  studentName: string
  onLogout: () => void
}

export function StudentNavbar({ studentName, onLogout }: StudentNavbarProps) {
  return (
    <header className="bg-fpb-blue-light border-b border-gray-700 sticky top-0 z-10">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/student/dashboard" className="flex items-center gap-3">
            <Image
              src="/images/logo.png"
              alt="The Federal Polytechnic Bida Logo"
              width={50}
              height={50}
              className="h-10 w-auto"
            />
            <div>
              <h1 className="text-lg font-bold text-white hidden sm:block">The Federal Polytechnic Bida</h1>
              <p className="text-sm text-gray-300 hidden sm:block">Student Portal</p>
            </div>
          </Link>

          <div className="flex items-center gap-4">
            <span className="text-white hidden sm:inline-block">Welcome, {studentName}</span>
            <Button
              variant="outline"
              onClick={onLogout}
              className="border-gray-600 text-white hover:bg-gray-700 bg-transparent"
            >
              Logout
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
