import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { getStudentById } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    console.log("=== Student Profile API Called ===")

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

    console.log("Looking for student with ID:", decoded.studentId)

    // Get student data
    const student = await getStudentById(decoded.studentId)
    console.log("Student found:", !!student)

    if (!student) {
      console.log("Student not found for ID:", decoded.studentId)
      return NextResponse.json(
        {
          success: false,
          error: "Student not found",
        },
        { status: 404 },
      )
    }

    console.log("Returning student data for:", student.matric_number)

    return NextResponse.json({
      success: true,
      student,
    })
  } catch (error) {
    console.error("=== Profile API Error ===")
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
