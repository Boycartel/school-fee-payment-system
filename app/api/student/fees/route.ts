import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { sql } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    // Get student info
    const student = await sql`
      SELECT * FROM users WHERE id = ${decoded.studentId} AND role = 'student'
    `

    if (student.length === 0) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 })
    }

    const studentData = student[0]

    // Get applicable fees for this student based on their level and school
    const fees = await sql`
      SELECT 
        sf.*,
        sf.installment_percentages,
        CASE 
          WHEN EXISTS (
            SELECT 1 FROM payments p 
            WHERE p.user_id = ${studentData.id} 
              AND p.school_fee_id = sf.id 
              AND p.status = 'verified'
              AND p.installment_number = 1
          ) THEN true 
          ELSE false 
        END as first_installment_paid,
        CASE 
          WHEN EXISTS (
            SELECT 1 FROM payments p 
            WHERE p.user_id = ${studentData.id} 
              AND p.school_fee_id = sf.id 
              AND p.status = 'verified'
              AND p.installment_number = 2
          ) THEN true 
          ELSE false 
        END as second_installment_paid
      FROM school_fees sf
      JOIN school_fee_assignments sfa ON sf.id = sfa.fee_id
      JOIN school_fee_levels sfl ON sf.id = sfl.fee_id
      WHERE sf.is_active = true
        AND sfl.level = ${studentData.level}
        AND sfa.school_id = ${studentData.school_id}
      GROUP BY sf.id
      ORDER BY sf.academic_session DESC
    `

    // Process fees to add installment percentages for backward compatibility
    const processedFees = fees.map((fee) => {
      let firstPercentage = 70
      let secondPercentage = 30

      // Try to get from installment_percentages JSON first
      if (fee.installment_percentages && Array.isArray(fee.installment_percentages)) {
        firstPercentage = fee.installment_percentages[0] || 70
        secondPercentage = fee.installment_percentages[1] || 30
      } else if (fee.first_installment_percentage && fee.second_installment_percentage) {
        // Fallback to individual columns
        firstPercentage = fee.first_installment_percentage
        secondPercentage = fee.second_installment_percentage
      }

      return {
        ...fee,
        first_installment_percentage: firstPercentage,
        second_installment_percentage: secondPercentage,
        semester: "All Semesters", // For backward compatibility
      }
    })

    return NextResponse.json({ fees: processedFees })
  } catch (error) {
    console.error("Get student fees error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
