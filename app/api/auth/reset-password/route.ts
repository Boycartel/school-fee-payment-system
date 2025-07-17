import { type NextRequest, NextResponse } from "next/server"
import { hashPassword } from "@/lib/auth"
import { sql } from "@/lib/database"

export async function POST(request: NextRequest) {
  try {
    const { matricNumber } = await request.json()

    if (!matricNumber) {
      return NextResponse.json({ error: "Matric number is required" }, { status: 400 })
    }

    // Check if user exists
    const user = await sql`
      SELECT id FROM users WHERE matric_number = ${matricNumber} AND role = 'student'
    `

    if (user.length === 0) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 })
    }

    // Reset password to "student"
    const hashedPassword = await hashPassword("student")

    await sql`
      UPDATE users 
      SET password = ${hashedPassword}, updated_at = NOW()
      WHERE matric_number = ${matricNumber}
    `

    return NextResponse.json({
      success: true,
      message: "Password reset successfully",
    })
  } catch (error) {
    console.error("Password reset error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
