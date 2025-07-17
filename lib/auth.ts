import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { getStudentByMatricNumber } from "./database"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  // Check if hashedPassword is valid
  if (!hashedPassword || typeof hashedPassword !== "string") {
    return false
  }

  try {
    return await bcrypt.compare(password, hashedPassword)
  } catch (error) {
    console.error("Password verification error:", error)
    return false
  }
}

export function generateToken(payload: any): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "24h" })
}

export function verifyToken(token: string): any {
  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    console.log("Token verification successful")
    return decoded
  } catch (error) {
    console.error("Token verification failed:", error)
    return null
  }
}

export async function authenticateStudent(matricNumber: string, password: string) {
  try {
    console.log("Attempting to authenticate student:", matricNumber)

    const student = await getStudentByMatricNumber(matricNumber)
    console.log("Student found:", student ? "Yes" : "No")

    if (!student) {
      console.log("No student found with matric number:", matricNumber)
      return null
    }

    // Check if password hash exists
    if (!student.password) {
      console.log("Student has no password set")
      return null
    }

    console.log("Verifying password...")
    const isValidPassword = await verifyPassword(password, student.password)
    console.log("Password valid:", isValidPassword)

    if (!isValidPassword) {
      return null
    }

    // Remove password hash from returned data
    const { password: _, ...studentData } = student
    return studentData
  } catch (error) {
    console.error("Authentication error:", error)
    return null
  }
}
