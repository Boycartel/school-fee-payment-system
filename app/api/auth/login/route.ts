import { type NextRequest, NextResponse } from "next/server"
import { authenticateStudent, generateToken } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { matricNumber, password } = body

    console.log("Login attempt for:", matricNumber)

    if (!matricNumber || !password) {
      return NextResponse.json({ error: "Matric number and password are required" }, { status: 400 })
    }

    // Clean up matric number (remove spaces, convert to uppercase)
    const cleanMatricNumber = matricNumber.trim().toUpperCase()

    const student = await authenticateStudent(cleanMatricNumber, password)

    if (!student) {
      console.log("Authentication failed for:", cleanMatricNumber)
      return NextResponse.json({ error: "Invalid matric number or password" }, { status: 401 })
    }

    console.log("Authentication successful for:", student.matric_number)

    const token = generateToken({
      studentId: student.id,
      matricNumber: student.matric_number,
    })

    const response = NextResponse.json({
      success: true,
      student,
      token,
      isDefaultPassword: password === "student",
    })

    // Set HTTP-only cookie
    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 86400, // 24 hours
      path: "/",
    })

    return response
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
