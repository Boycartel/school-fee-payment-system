"use client"

import { notFound } from "next/navigation"
import Image from "next/image"
import { sql } from "@/lib/database"
import { QRCodeGenerator } from "@/components/qr-code-generator"

interface ReceiptPageProps {
  params: {
    reference: string
  }
}

export default async function ReceiptPage({ params }: ReceiptPageProps) {
  try {
    // Get payment details with student and fee information
    const paymentResult = await sql`
      SELECT 
        p.*,
        u.full_name,
        u.matric_number,
        u.email,
        u.phone,
        u.level,
        u.passport_photo,
        d.name as department_name,
        s.name as school_name,
        sf.fee_name,
        sf.description as fee_description,
        sf.amount as total_fee_amount,
        sf.academic_session
      FROM payments p
      JOIN users u ON p.user_id = u.id
      LEFT JOIN departments d ON u.department_id = d.id
      LEFT JOIN schools s ON u.school_id = s.id
      LEFT JOIN school_fees sf ON p.school_fee_id = sf.id
      WHERE p.reference = ${params.reference}
      AND p.status = 'verified'
    `

    if (paymentResult.length === 0) {
      notFound()
    }

    const payment = paymentResult[0]

    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          {/* Print Button */}
          <div className="mb-6 text-center print:hidden">
            <button
              onClick={() => window.print()}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Print Receipt
            </button>
          </div>

          {/* Receipt */}
          <div className="bg-white shadow-lg rounded-lg overflow-hidden print:shadow-none print:rounded-none">
            {/* Header */}
            <div className="bg-fpb-blue text-white p-6 text-center">
              <div className="flex items-center justify-center gap-4 mb-4">
                <Image
                  src="/images/bida-logo.png"
                  alt="Federal Polytechnic Bida Logo"
                  width={80}
                  height={80}
                  className="h-20 w-auto"
                />
                <div className="text-left">
                  <h1 className="text-2xl font-bold">THE FEDERAL POLYTECHNIC BIDA</h1>
                  <p className="text-blue-100">Niger State, Nigeria</p>
                </div>
              </div>
              <h2 className="text-xl font-semibold text-black">PAYMENT RECEIPT</h2>
            </div>

            {/* Receipt Content */}
            <div className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Student Information */}
                <div className="lg:col-span-2 space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Student Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Full Name</p>
                        <p className="font-semibold">{payment.full_name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Matric Number</p>
                        <p className="font-semibold">{payment.matric_number}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Email</p>
                        <p className="font-semibold">{payment.email}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Phone</p>
                        <p className="font-semibold">{payment.phone || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Department</p>
                        <p className="font-semibold">{payment.department_name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Level</p>
                        <p className="font-semibold">{payment.level}</p>
                      </div>
                    </div>
                  </div>

                  {/* Payment Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Payment Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Receipt Number</p>
                        <p className="font-semibold">{payment.receipt_number}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Payment Reference</p>
                        <p className="font-semibold font-mono">{payment.reference}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Fee Type</p>
                        <p className="font-semibold">{payment.fee_name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Academic Session</p>
                        <p className="font-semibold">{payment.academic_session}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Amount Paid</p>
                        <p className="font-semibold text-green-600 text-lg">
                          ₦{Number(payment.amount).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Payment Date</p>
                        <p className="font-semibold">
                          {new Date(payment.payment_date).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* QR Code and Student Photo */}
                <div className="space-y-6">
                  {/* Student Photo */}
                  {payment.passport_photo && (
                    <div className="text-center">
                      <div className="w-32 h-32 mx-auto rounded-lg overflow-hidden border-2 border-gray-300">
                        <img
                          src={payment.passport_photo || "/placeholder.svg"}
                          alt="Student Passport"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  )}

                  {/* QR Code */}
                  <div className="text-center">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Verification QR Code</h4>
                    <div className="flex justify-center">
                      <QRCodeGenerator data={payment.reference} size={150} paymentReference={payment.reference} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="text-center text-sm text-gray-600">
                  <p className="mb-2">This is an official receipt from The Federal Polytechnic Bida</p>
                  <p className="mb-2">
                    Generated on:{" "}
                    {new Date().toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                  <p className="text-xs">For verification, scan the QR code or visit: fpb.edu.ng/verify</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  } catch (error) {
    console.error("Error fetching receipt:", error)
    notFound()
  }
}
