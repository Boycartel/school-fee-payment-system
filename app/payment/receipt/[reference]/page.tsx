"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { QRCodeGenerator } from "@/components/qr-code-generator"
import { Printer, ArrowLeft, CheckCircle, Loader2 } from "lucide-react"

interface ReceiptData {
  payment: {
    id: string
    reference: string
    receipt_number: string
    amount: number
    payment_date: string
    fee_type: string
    academic_session: string
    installment_number: number
    total_installments: number
    payment_method: string
  }
  student: {
    full_name: string
    matric_number: string
    email: string
    phone: string
    passport_photo: string
    level: string
    department_name: string
    school_name: string
  }
  fee: {
    fee_name: string
    description: string
    total_amount: number
    allows_installments: boolean
    first_installment_percentage: number
    second_installment_percentage: number
  }
  summary: {
    total_paid: number
    balance: number
    is_fully_paid: boolean
    all_payments: Array<{
      amount: number
      installment_number: number
      payment_date: string
    }>
  }
}

export default function PaymentReceipt() {
  const params = useParams()
  const reference = params.reference as string
  const [receipt, setReceipt] = useState<ReceiptData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (reference) {
      fetchReceipt()
    }
  }, [reference])

  const fetchReceipt = async () => {
    try {
      const response = await fetch(`/api/payment/receipt/${reference}`)
      const data = await response.json()

      if (response.ok && data.success) {
        setReceipt(data.receipt)
      } else {
        setError(data.error || "Receipt not found")
      }
    } catch (error) {
      console.error("Error fetching receipt:", error)
      setError("Failed to load receipt")
    } finally {
      setLoading(false)
    }
  }

  const printReceipt = () => {
    window.print()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" />
          <p className="mt-4">Loading receipt...</p>
        </div>
      </div>
    )
  }

  if (error || !receipt) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
        <Card className="w-full max-w-md bg-slate-800/50 border-slate-700 text-white">
          <CardContent className="p-8 text-center">
            <h3 className="text-xl font-semibold mb-4 text-red-400">Receipt Not Found</h3>
            <p className="text-gray-300 mb-6">{error}</p>
            <Link href="/student/dashboard">
              <Button className="bg-blue-600 hover:bg-blue-700">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Create verification URL for QR code
  const verificationUrl = `${process.env.NEXT_PUBLIC_BASE_URL || "https://your-domain.com"}/verify?reference=${receipt.payment.reference}&auto=true`

  return (
    <>
      <style jsx global>{`
        @media print {
          * {
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
            height: auto !important;
          }
          
          .print-page-container {
            background: white !important;
            margin: 0 !important;
            padding: 0 !important;
            min-height: auto !important;
          }
          
          .print-wrapper {
            background: white !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          
          .print-container {
            max-width: none !important;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
            border: none !important;
            box-shadow: none !important;
            border-radius: 0 !important;
            page-break-inside: avoid;
            transform: scale(0.85);
            transform-origin: top left;
            width: 118% !important;
          }
          
          .print-header {
            background: #e5e7eb !important;
            color: black !important;
            padding: 15px !important;
          }
          
          .print-content {
            background: white !important;
            color: black !important;
            padding: 15px !important;
          }
          
          .print-student-card {
            background: #f8fafc !important;
            border: 2px solid #d1d5db !important;
            color: black !important;
          }
          
          .print-table {
            background: white !important;
            color: black !important;
          }
          
          .print-table th {
            background: #000000 !important;
            color: white !important;
          }
          
          .print-table td {
            color: black !important;
            border-bottom: 1px solid #e5e7eb !important;
          }
          
          .print-summary {
            background: #f1f5f9 !important;
            color: black !important;
            border-left: 4px solid #d1d5db !important;
          }
          
          .no-print {
            display: none !important;
          }
          
          .print-text-blue {
            color: #000000 !important;
          }
          
          .print-text-green {
            color: #059669 !important;
          }
          
          .print-text-red {
            color: #dc2626 !important;
          }
        }
      `}</style>

      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 print-page-container">
        {/* Header */}
        <div className="bg-slate-800/50 text-white py-4 print:hidden no-print">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between">
              <Link href="/student/dashboard" className="flex items-center gap-2 text-white hover:text-gray-200">
                <ArrowLeft className="w-5 h-5" />
                Back to Dashboard
              </Link>
              <h1 className="text-xl font-semibold">Payment Receipt</h1>
              <Button onClick={printReceipt} className="bg-green-600 hover:bg-green-700">
                <Printer className="w-4 h-4 mr-2" />
                Print
              </Button>
            </div>
          </div>
        </div>

        {/* Receipt Content */}
        <div className="container mx-auto px-4 py-8 print:p-0 print-wrapper">
          <div className="max-w-4xl mx-auto bg-white border-2 border-gray-300 rounded-lg overflow-hidden shadow-lg print-container">
            {/* Header */}
            <div className="bg-gray-200 text-black text-center py-6 print-header">
              <div className="w-16 h-16 mx-auto mb-3 bg-white rounded-full flex items-center justify-center">
                <Image
                  src="/images/bida-logo.png"
                  alt="The Federal Polytechnic Bida Logo"
                  width={50}
                  height={50}
                  className="h-12 w-auto"
                />
              </div>
              <h1 className="text-xl font-bold mb-1">The Federal Polytechnic Bida</h1>
              <p className="text-xs opacity-90 mb-3">
                Niger State, North Central, Nigeria
                <br />
                KM 1.5, Doko Road, Bida Niger State
              </p>
              <div className="bg-white text-black px-4 py-2 rounded-full inline-block">
                <h2 className="text-lg font-bold">PAYMENT RECEIPT</h2>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 bg-white print-content">
              {/* Student Information Card */}
              <div className="bg-gray-50 border border-gray-300 rounded-xl p-6 mb-6 print-student-card">
                <div className="flex items-start gap-6">
                  {/* Student Photo */}
                  <div className="flex-shrink-0">
                    <div className="w-24 h-32 border-2 border-blue-400 rounded-lg overflow-hidden bg-slate-600">
                      {receipt.student.passport_photo ? (
                        <img
                          src={receipt.student.passport_photo || "/placeholder.svg"}
                          alt="Student Passport"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-600 flex items-center justify-center">
                          <span className="text-gray-400 text-xs">No Photo</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Student Details */}
                  <div className="flex-1">
                    <div className="border-b border-blue-400/30 pb-3 mb-4">
                      <h3 className="text-lg font-bold text-blue-600">STUDENT INFORMATION</h3>
                    </div>

                    <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                      <div className="space-y-3">
                        <div>
                          <label className="text-xs font-medium text-blue-600 uppercase tracking-wide">Full Name</label>
                          <p className="text-sm font-semibold text-gray-900 mt-1">{receipt.student.full_name}</p>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-blue-600 uppercase tracking-wide">
                            Matric Number
                          </label>
                          <p className="text-sm font-semibold text-gray-900 mt-1 font-mono">
                            {receipt.student.matric_number}
                          </p>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-blue-600 uppercase tracking-wide">Level</label>
                          <p className="text-sm font-semibold text-gray-900 mt-1">{receipt.student.level}</p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="text-xs font-medium text-blue-600 uppercase tracking-wide">School</label>
                          <p className="text-sm font-semibold text-gray-900 mt-1">{receipt.student.school_name}</p>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-blue-600 uppercase tracking-wide">
                            Department
                          </label>
                          <p className="text-sm font-semibold text-gray-900 mt-1">{receipt.student.department_name}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* QR Code */}
                  <div className="flex-shrink-0">
                    <div className="bg-white p-3 border-2 border-blue-400 rounded-lg">
                      <QRCodeGenerator data={verificationUrl} size={120} />
                    </div>
                    <p className="text-xs text-gray-300 print:text-black text-center mt-2">Scan to verify</p>
                  </div>
                </div>
              </div>

              {/* Payment Details Table */}
              <div className="mb-6">
                <table className="w-full border-2 border-blue-400 rounded-lg overflow-hidden print-table">
                  <thead>
                    <tr className="bg-black text-white">
                      <th className="px-3 py-2 text-left font-semibold text-sm">Description</th>
                      <th className="px-3 py-2 text-left font-semibold text-sm">Details</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    <tr className="border-b border-gray-200">
                      <td className="px-3 py-2 font-medium text-gray-900 text-sm">Fee Type</td>
                      <td className="px-3 py-2 text-gray-900 text-sm">{receipt.fee.fee_name}</td>
                    </tr>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <td className="px-3 py-2 font-medium text-gray-900 text-sm">Academic Session</td>
                      <td className="px-3 py-2 text-gray-900 text-sm">{receipt.payment.academic_session}</td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="px-3 py-2 font-medium text-gray-900 text-sm">Payment Type</td>
                      <td className="px-3 py-2 text-gray-900 text-sm">{receipt.payment.fee_type}</td>
                    </tr>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <td className="px-3 py-2 font-medium text-gray-900 text-sm">Payment Date</td>
                      <td className="px-3 py-2 text-gray-900 text-sm">
                        {new Date(receipt.payment.payment_date).toLocaleDateString()}
                      </td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="px-3 py-2 font-medium text-gray-900 text-sm">Reference Number</td>
                      <td className="px-3 py-2 font-mono text-sm text-gray-900">{receipt.payment.reference}</td>
                    </tr>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <td className="px-3 py-2 font-medium text-gray-900 text-sm">Receipt Number</td>
                      <td className="px-3 py-2 font-mono text-sm text-gray-900">{receipt.payment.receipt_number}</td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="px-3 py-2 font-medium text-gray-900 text-sm">Payment Method</td>
                      <td className="px-3 py-2 capitalize text-gray-900 text-sm">{receipt.payment.payment_method}</td>
                    </tr>
                    <tr className="bg-gray-100">
                      <td className="px-3 py-2 font-bold text-black text-sm">Amount Paid</td>
                      <td className="px-3 py-2 font-bold text-green-400 text-lg print-text-green">
                        ₦{receipt.payment.amount.toLocaleString()}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Payment Summary */}
              <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-gray-300 print-summary">
                <h3 className="text-base font-semibold text-blue-600 mb-3">Payment Summary</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium text-blue-600 text-sm">Total Fee:</span>
                      <span className="font-semibold text-gray-900 text-sm">
                        ₦{receipt.fee.total_amount.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-blue-600 text-sm">Total Paid:</span>
                      <span className="font-semibold text-green-400 print-text-green text-sm">
                        ₦{receipt.summary.total_paid.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium text-blue-600 text-sm">Balance:</span>
                      <span
                        className={`font-semibold text-sm ${receipt.summary.balance > 0 ? "text-red-400 print-text-red" : "text-green-400 print-text-green"}`}
                      >
                        {receipt.summary.balance > 0 ? `₦${receipt.summary.balance.toLocaleString()}` : "FULLY PAID ✓"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-blue-600 text-sm">Status:</span>
                      <span className="font-semibold text-green-400 print-text-green flex items-center gap-1 text-sm">
                        <CheckCircle className="w-3 h-3" />
                        {receipt.summary.is_fully_paid ? "PAYMENT COMPLETE" : "PARTIAL PAYMENT"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="text-center mt-6 pt-4 border-t-2 border-gray-200">
                <p className="font-semibold text-blue-600 mb-1 text-sm">
                  This is an official receipt from The Federal Polytechnic Bida
                </p>
                <p className="text-xs text-gray-600">
                  Generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  For verification, scan the QR code or visit our portal with reference: {receipt.payment.reference}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
