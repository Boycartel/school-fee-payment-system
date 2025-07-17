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

    // Get basic statistics
    const statistics = await sql`
      SELECT 
        COUNT(DISTINCT p.user_id) as total_students_paid,
        COUNT(p.id) as total_payments,
        COALESCE(SUM(p.amount), 0) as total_revenue,
        COUNT(CASE WHEN p.installment_number = 1 THEN 1 END) as first_installments,
        COUNT(CASE WHEN p.installment_number = 2 THEN 1 END) as second_installments
      FROM payments p
      JOIN users u ON p.user_id = u.id
      WHERE p.status = 'verified' AND u.role = 'student'
    `

    // Get payments by school
    const paymentsBySchool = await sql`
      SELECT 
        s.name as school_name,
        COUNT(p.id) as payment_count,
        COALESCE(SUM(p.amount), 0) as total_amount
      FROM payments p
      JOIN users u ON p.user_id = u.id
      JOIN departments d ON u.department_id = d.id
      JOIN schools s ON d.school_id = s.id
      WHERE p.status = 'verified' AND u.role = 'student'
      GROUP BY s.id, s.name
      ORDER BY total_amount DESC
    `

    // Get payments by department
    const paymentsByDepartment = await sql`
      SELECT 
        d.name as department_name,
        s.name as school_name,
        COUNT(p.id) as payment_count,
        COALESCE(SUM(p.amount), 0) as total_amount
      FROM payments p
      JOIN users u ON p.user_id = u.id
      JOIN departments d ON u.department_id = d.id
      JOIN schools s ON d.school_id = s.id
      WHERE p.status = 'verified' AND u.role = 'student'
      GROUP BY d.id, d.name, s.name
      ORDER BY total_amount DESC
      LIMIT 20
    `

    // Get payments by date (last 30 days)
    const paymentsByDate = await sql`
      SELECT 
        DATE(p.payment_date) as payment_date,
        COUNT(p.id) as payment_count,
        COALESCE(SUM(p.amount), 0) as total_amount
      FROM payments p
      JOIN users u ON p.user_id = u.id
      WHERE p.status = 'verified' 
        AND u.role = 'student'
        AND p.payment_date >= CURRENT_DATE - INTERVAL '30 days'
      GROUP BY DATE(p.payment_date)
      ORDER BY payment_date DESC
    `

    // Get recent payments
    const recentPayments = await sql`
      SELECT 
        p.id,
        p.amount,
        p.payment_date,
        p.reference,
        p.status,
        p.installment_number,
        p.academic_session,
        u.full_name,
        u.matric_number,
        u.email,
        d.name as department_name,
        s.name as school_name
      FROM payments p
      JOIN users u ON p.user_id = u.id
      LEFT JOIN departments d ON u.department_id = d.id
      LEFT JOIN schools s ON d.school_id = s.id
      WHERE p.status = 'verified' AND u.role = 'student'
      ORDER BY p.payment_date DESC
      LIMIT 50
    `

    return NextResponse.json({
      statistics: statistics[0] || {
        total_students_paid: 0,
        total_payments: 0,
        total_revenue: 0,
        first_installments: 0,
        second_installments: 0,
      },
      paymentsBySchool: paymentsBySchool || [],
      paymentsByDepartment: paymentsByDepartment || [],
      paymentsByDate: paymentsByDate || [],
      recentPayments: recentPayments || [],
    })
  } catch (error) {
    console.error("Analytics error:", error)
    return NextResponse.json({ error: "Failed to fetch analytics data" }, { status: 500 })
  }
}
