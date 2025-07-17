import { type NextRequest, NextResponse } from "next/server"
import { verifyAdminToken } from "@/lib/admin-auth"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("admin-auth-token")?.value
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = verifyAdminToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const fees = await sql`
      SELECT 
        sf.*,
        COALESCE(array_agg(DISTINCT s.name) FILTER (WHERE s.name IS NOT NULL), '{}') as school_names,
        COALESCE(array_agg(DISTINCT sfl.level) FILTER (WHERE sfl.level IS NOT NULL), '{}') as applicable_levels,
        a.full_name as created_by_name
      FROM school_fees sf
      LEFT JOIN school_fee_assignments sfa ON sf.id = sfa.fee_id
      LEFT JOIN schools s ON sfa.school_id = s.id
      LEFT JOIN school_fee_levels sfl ON sf.id = sfl.fee_id
      LEFT JOIN admins a ON sf.created_by = a.id
      GROUP BY sf.id, a.full_name
      ORDER BY sf.created_at DESC
    `

    return NextResponse.json({
      success: true,
      fees: fees || [],
    })
  } catch (error) {
    console.error("Admin fees GET error:", error)
    return NextResponse.json({ error: "Failed to fetch fees" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("admin-auth-token")?.value
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = verifyAdminToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const {
      feeName,
      description,
      amount,
      academicSession,
      levels,
      schoolIds,
      allowsInstallments,
      firstInstallmentPercentage,
      secondInstallmentPercentage,
    } = await request.json()

    if (!feeName || !amount || !academicSession || !levels?.length || !schoolIds?.length) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Create installment percentages array
    const installmentPercentages = allowsInstallments
      ? [firstInstallmentPercentage, secondInstallmentPercentage]
      : [100]

    // Create the fee
    const newFee = await sql`
      INSERT INTO school_fees (
        fee_name, description, amount, academic_session,
        allows_installments, installment_percentages, created_by
      )
      VALUES (
        ${feeName}, ${description || null}, ${Number.parseFloat(amount)}, 
        ${academicSession}, ${allowsInstallments || false}, 
        ${JSON.stringify(installmentPercentages)}, ${decoded.adminId}
      )
      RETURNING *
    `

    const feeId = newFee[0].id

    // Assign to schools
    for (const schoolId of schoolIds) {
      await sql`
        INSERT INTO school_fee_assignments (fee_id, school_id)
        VALUES (${feeId}, ${schoolId})
      `
    }

    // Assign to levels
    for (const level of levels) {
      await sql`
        INSERT INTO school_fee_levels (fee_id, level)
        VALUES (${feeId}, ${level})
      `
    }

    return NextResponse.json({
      success: true,
      message: "Fee created successfully",
      fee: newFee[0],
    })
  } catch (error) {
    console.error("Admin fees POST error:", error)
    return NextResponse.json({ error: "Failed to create fee" }, { status: 500 })
  }
}
