import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { sql } from "@/lib/database"

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const { schoolFeeId, firstInstallmentPaid, secondInstallmentPaid } = await request.json()

    if (!schoolFeeId) {
      return NextResponse.json({ error: "School fee ID is required" }, { status: 400 })
    }

    // Update the school fee payment status
    await sql`
      UPDATE school_fees 
      SET 
        first_installment_paid = ${firstInstallmentPaid || false},
        second_installment_paid = ${secondInstallmentPaid || false},
        updated_at = NOW()
      WHERE id = ${schoolFeeId} AND user_id = ${decoded.studentId}
    `

    return NextResponse.json({
      success: true,
      message: "Fee status updated successfully",
    })
  } catch (error) {
    console.error("Update fee status error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
