import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
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
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    return null
  }
}

export async function authenticateAdmin(username: string, password: string) {
  try {
    const admin = await sql`
      SELECT * FROM admins 
      WHERE username = ${username} AND is_active = true
    `

    if (admin.length === 0) {
      return null
    }

    const adminData = admin[0]
    const isValidPassword = await verifyPassword(password, adminData.password)

    if (!isValidPassword) {
      return null
    }

    // Remove password from returned data
    const { password: _, ...adminInfo } = adminData
    return adminInfo
  } catch (error) {
    console.error("Admin authentication error:", error)
    return null
  }
}

export async function getAdminById(id: string) {
  try {
    const result = await sql`
      SELECT id, username, email, full_name, role, is_active, created_at, updated_at
      FROM admins 
      WHERE id = ${id} AND is_active = true
    `
    return result[0] || null
  } catch (error) {
    console.error("Get admin by ID error:", error)
    return null
  }
}

export const verifyAdminToken = verifyToken
