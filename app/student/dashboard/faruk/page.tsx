"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { QRCodeGenerator } from "@/components/qr-code-generator"
import { StudentNavbar } from "@/components/student-navbar"
import { Progress } from "@/components/ui/progress"

// Faruk's student data
const studentData = {
  name: "Faruk Ayoola Tajudeen",
  matricNumber: "2022/2/000001CW",
  department: "Software and Web Development",
  school: "School of Information and Communication Technology",
  level: "HND II",
  session: "2023/2024",
  semester: "Second Semester",
  email: "faruk.tajudeen@student.fpb.edu.ng",
  totalFee: "₦150,000.00",
  amountPaid: "₦150,000.00",
  amountOutstanding: "₦0.00",
  paymentPercentage: 100,
  lastPaymentDate: "2023-09-05",
  lastReceiptNumber: "FPB-2023-56789",
  lastRRR: "8765-4321-0987",
  paymentStatus: "Paid",
}

// Faruk's payment history
const paymentHistory = [
  {
    id: 1,
    session: "2023/2024",
    semester: "Second Semester",
    amount: "₦150,000.00",
    date: "2023-09-05",
    status: "Paid",
    receiptNumber: "FPB-2023-56789",
    rrr: "8765-4321-0987",
  },
  {
    id: 2,
    session: "2023/2024",
    semester: "First Semester",
    amount: "₦150,000.00",
    date: "2023-02-10",
    status: "Paid",
    receiptNumber: "FPB-2023-45678",
    rrr: "7654-3210-9876",
  },
  {
    id: 3,
    session: "2022/2023",
    semester: "Second Semester",
    amount: "₦130,000.00",
    date: "2022-09-15",
    status: "Paid",
    receiptNumber: "FPB-2022-34567",
    rrr: "6543-2109-8765",
  },
  {
    id: 4,
    session: "2022/2023",
    semester: "First Semester",
    amount: "₦130,000.00",
    date: "2022-02-20",
    status: "Paid",
    receiptNumber: "FPB-2022-23456",
    rrr: "5432-1098-7654",
  },
]

export default function FarukStudentDashboard() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("overview")

  const handleLogout = () => {
    router.push("/")
  }

  return (
    <div className="min-h-screen flex flex-col bg-fpb-blue text-white">
      <StudentNavbar studentName={studentData.name} onLogout={handleLogout} />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-1">
            <Card className="bg-fpb-blue-light border-gray-700 text-white">
              <CardContent className="p-6">
                <div className="flex flex-col items-center">
                  <div className="w-24 h-24 rounded-full bg-gray-700 flex items-center justify-center mb-4">
                    <span className="text-2xl font-bold text-white">
                      {studentData.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold">{studentData.name}</h2>
                  <p className="text-gray-300 mb-1">{studentData.matricNumber}</p>
                  <p className="text-gray-300 mb-4 text-sm">{studentData.email}</p>
                  <div className="w-full space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">School:</span>
                      <span className="font-medium text-right">{studentData.school}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Department:</span>
                      <span className="font-medium">{studentData.department}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Level:</span>
                      <span className="font-medium">{studentData.level}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Session:</span>
                      <span className="font-medium">{studentData.session}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Semester:</span>
                      <span className="font-medium">{studentData.semester}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-3">
            <Tabs defaultValue="overview" className="w-full" onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-3 mb-6 bg-fpb-blue-light">
                <TabsTrigger value="overview" className="data-[state=active]:bg-blue-600 text-white">
                  Overview
                </TabsTrigger>
                <TabsTrigger value="payments" className="data-[state=active]:bg-blue-600 text-white">
                  Payment History
                </TabsTrigger>
                <TabsTrigger value="qrcode" className="data-[state=active]:bg-blue-600 text-white">
                  QR Code
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                <Card className="bg-fpb-blue-light border-gray-700 text-white">
                  <CardHeader>
                    <CardTitle>Current Session Payment Status</CardTitle>
                    <CardDescription className="text-gray-300">
                      {studentData.session} - {studentData.semester}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300">Payment Status:</span>
                        <Badge className="bg-green-500">{studentData.paymentStatus}</Badge>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-300">Payment Progress:</span>
                          <span>{studentData.paymentPercentage}%</span>
                        </div>
                        <Progress value={studentData.paymentPercentage} className="h-2 bg-gray-700" />
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-gray-300">Total Fee:</span>
                        <span className="font-semibold">{studentData.totalFee}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-gray-300">Amount Paid:</span>
                        <span className="font-semibold text-green-400">{studentData.amountPaid}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-gray-300">Outstanding Balance:</span>
                        <span className="font-semibold text-green-400">{studentData.amountOutstanding}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-gray-300">Last Payment Date:</span>
                        <span>{studentData.lastPaymentDate}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-gray-300">Remita RRR:</span>
                        <span className="font-mono">{studentData.lastRRR}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-gray-300">Receipt Number:</span>
                        <span>{studentData.lastReceiptNumber}</span>
                      </div>

                      <div className="pt-4">
                        <Button className="w-full bg-blue-600 hover:bg-blue-700">Download Receipt</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="payments">
                <Card className="bg-fpb-blue-light border-gray-700 text-white">
                  <CardHeader>
                    <CardTitle>Payment History</CardTitle>
                    <CardDescription className="text-gray-300">View all your previous payments</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="border-b border-gray-700">
                            <th className="text-left py-3 px-4">Session</th>
                            <th className="text-left py-3 px-4">Semester</th>
                            <th className="text-left py-3 px-4">Amount</th>
                            <th className="text-left py-3 px-4">Date</th>
                            <th className="text-left py-3 px-4">RRR</th>
                            <th className="text-left py-3 px-4">Status</th>
                            <th className="text-left py-3 px-4">Receipt</th>
                          </tr>
                        </thead>
                        <tbody>
                          {paymentHistory.map((payment) => (
                            <tr key={payment.id} className="border-b border-gray-700 hover:bg-gray-800">
                              <td className="py-3 px-4">{payment.session}</td>
                              <td className="py-3 px-4">{payment.semester}</td>
                              <td className="py-3 px-4">{payment.amount}</td>
                              <td className="py-3 px-4">{payment.date}</td>
                              <td className="py-3 px-4 font-mono">{payment.rrr}</td>
                              <td className="py-3 px-4">
                                <Badge className="bg-green-500">{payment.status}</Badge>
                              </td>
                              <td className="py-3 px-4">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="border-gray-600 text-white hover:bg-gray-700"
                                >
                                  View
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="qrcode">
                <Card className="bg-fpb-blue-light border-gray-700 text-white">
                  <CardHeader>
                    <CardTitle>Payment Verification QR Code</CardTitle>
                    <CardDescription className="text-gray-300">
                      Use this QR code for quick verification of your payment status
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center">
                    <div className="bg-white p-4 rounded-md">
                      <QRCodeGenerator
                        data={JSON.stringify({
                          matricNumber: studentData.matricNumber,
                          name: studentData.name,
                          email: studentData.email,
                          session: studentData.session,
                          semester: studentData.semester,
                          paymentStatus: studentData.paymentStatus,
                          amountPaid: studentData.amountPaid,
                          amountOutstanding: studentData.amountOutstanding,
                          lastRRR: studentData.lastRRR,
                          receiptNumber: studentData.lastReceiptNumber,
                          verificationCode: "FPB-VER-2023-56789",
                        })}
                        size={250}
                      />
                    </div>
                    <div className="mt-6 text-center">
                      <p className="text-gray-300 mb-4">
                        Present this QR code to verify your payment status. This code contains your payment information
                        for the current semester.
                      </p>
                      <Button className="bg-blue-600 hover:bg-blue-700">Download QR Code</Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
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
