import { type NextRequest, NextResponse } from "next/server"
import { verifyAdminToken, getAdminById } from "@/lib/admin-auth"

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("admin-auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "No authentication token" }, { status: 401 })
    }

    const decoded = verifyAdminToken(token)
    if (!decoded || !decoded.adminId) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const admin = await getAdminById(decoded.adminId)
    if (!admin) {
      return NextResponse.json({ error: "Admin not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      admin,
    })
  } catch (error) {
    console.error("Admin profile error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
