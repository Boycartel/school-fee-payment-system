import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { getStudentPayments } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    console.log("=== Student Payments API Called ===")

    // Get token from cookie
    const token = request.cookies.get("auth-token")?.value
    console.log("Token found:", !!token)

    if (!token) {
      console.log("No auth token found")
      return NextResponse.json(
        {
          success: false,
          error: "Authentication required",
        },
        { status: 401 },
      )
    }

    // Verify token
    const decoded = verifyToken(token)
    console.log("Token decoded:", !!decoded)

    if (!decoded || !decoded.studentId) {
      console.log("Invalid token or missing studentId")
      return NextResponse.json(
        {
          success: false,
          error: "Invalid token",
        },
        { status: 401 },
      )
    }

    console.log("Looking for payments for student ID:", decoded.studentId)

    // Get student payments
    const payments = await getStudentPayments(decoded.studentId)
    console.log("Payments found:", payments.length)

    return NextResponse.json({
      success: true,
      payments: payments || [],
    })
  } catch (error) {
    console.error("=== Payments API Error ===")
    console.error("Error details:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 },
    )
  }
}
