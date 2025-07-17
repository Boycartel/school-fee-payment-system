"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { BarChart3, CreditCard, DollarSign, Home, LogOut } from "lucide-react"

interface AdminNavbarProps {
  adminName: string
  onLogout: () => void
}

export function AdminNavbar({ adminName, onLogout }: AdminNavbarProps) {
  const pathname = usePathname()

  const navItems = [
    {
      href: "/admin/dashboard",
      label: "Dashboard",
      icon: Home,
    },
    {
      href: "/admin/fees",
      label: "Manage Fees",
      icon: DollarSign,
    },
    {
      href: "/admin/analytics",
      label: "Analytics",
      icon: BarChart3,
    },
    {
      href: "/admin/payments",
      label: "Payments",
      icon: CreditCard,
    },
  ]

  return (
    <header className="bg-fpb-blue-light border-b border-gray-700 sticky top-0 z-10">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/admin/dashboard" className="flex items-center gap-3">
            <Image
              src="/images/logo.png"
              alt="The Federal Polytechnic Bida Logo"
              width={50}
              height={50}
              className="h-10 w-auto"
            />
            <div>
              <h1 className="text-lg font-bold text-white hidden sm:block">The Federal Polytechnic Bida</h1>
              <p className="text-sm text-gray-300 hidden sm:block">Admin Portal</p>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive ? "bg-blue-600 text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              )
            })}
          </nav>

          <div className="flex items-center gap-4">
            <span className="text-white hidden sm:inline-block">Welcome, {adminName}</span>
            <Button
              variant="outline"
              onClick={onLogout}
              className="border-gray-600 text-white hover:bg-gray-700 bg-transparent"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <nav className="md:hidden mt-4">
          <div className="flex flex-wrap gap-2">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive ? "bg-blue-600 text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              )
            })}
          </div>
        </nav>
      </div>
    </header>
  )
}
