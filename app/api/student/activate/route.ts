import { type NextRequest, NextResponse } from "next/server"
import { hashPassword } from "@/lib/auth"
import { sql } from "@/lib/database"

export async function POST(request: NextRequest) {
  try {
    const { fullName, matricNumber, email, phone, schoolId, departmentId, level, password } = await request.json()

    // Validation
    if (!fullName || !matricNumber || !email || !schoolId || !departmentId || !level || !password) {
      return NextResponse.json({ error: "All required fields must be filled" }, { status: 400 })
    }

    // Validate matric number format (basic validation)
    const matricRegex = /^\d{4}\/\d\/\d+[A-Z]{2}$/
    if (!matricRegex.test(matricNumber)) {
      return NextResponse.json({ error: "Invalid matric number format. Use format: 2023/1/123456CS" }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await sql`
      SELECT id FROM users WHERE matric_number = ${matricNumber} OR email = ${email}
    `

    if (existingUser.length > 0) {
      return NextResponse.json({ error: "User with this matric number or email already exists" }, { status: 400 })
    }

    // Verify school and department exist
    const schoolExists = await sql`
      SELECT id FROM schools WHERE id = ${schoolId}
    `

    const departmentExists = await sql`
      SELECT id FROM departments WHERE id = ${departmentId} AND school_id = ${schoolId}
    `

    if (schoolExists.length === 0) {
      return NextResponse.json({ error: "Invalid school selected" }, { status: 400 })
    }

    if (departmentExists.length === 0) {
      return NextResponse.json({ error: "Invalid department selected for this school" }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create user
    const result = await sql`
      INSERT INTO users (
        id, full_name, matric_number, email, phone, school_id, department_id, 
        level, password, role, created_at, updated_at
      )
      VALUES (
        gen_random_uuid()::text, ${fullName}, ${matricNumber}, ${email}, ${phone || null}, 
        ${schoolId}, ${departmentId}, ${level}, ${hashedPassword}, 'student', NOW(), NOW()
      )
      RETURNING id, full_name, matric_number, email
    `

    return NextResponse.json({
      success: true,
      message: "Account activated successfully",
      user: result[0],
    })
  } catch (error) {
    console.error("Activation error:", error)

    // Handle unique constraint violations
    if (error.message && error.message.includes("duplicate key")) {
      return NextResponse.json({ error: "User with this matric number or email already exists" }, { status: 400 })
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
