import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/database"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { searchType, searchQuery } = body

    if (!searchType || !searchQuery) {
      return NextResponse.json({ error: "Search type and query are required" }, { status: 400 })
    }

    let paymentResult

    if (searchType === "reference") {
      // Search by payment reference - check payments table directly
      paymentResult = await sql`
        SELECT 
          p.*,
          u.full_name,
          u.matric_number,
          u.email,
          u.phone,
          u.passport_photo,
          d.name as department_name,
          s.name as school_name,
          sf.fee_name,
          sf.description as fee_description,
          sf.academic_session
        FROM payments p
        JOIN users u ON p.user_id = u.id
        LEFT JOIN departments d ON u.department_id = d.id
        LEFT JOIN schools s ON u.school_id = s.id
        LEFT JOIN school_fees sf ON p.school_fee_id = sf.id
        WHERE p.reference = ${searchQuery}
        ORDER BY p.payment_date DESC
        LIMIT 1
      `
    } else if (searchType === "matricNumber") {
      // Search by matric number - get most recent verified payment
      paymentResult = await sql`
        SELECT 
          p.*,
          u.full_name,
          u.matric_number,
          u.email,
          u.phone,
          u.passport_photo,
          d.name as department_name,
          s.name as school_name,
          sf.fee_name,
          sf.description as fee_description,
          sf.academic_session
        FROM payments p
        JOIN users u ON p.user_id = u.id
        LEFT JOIN departments d ON u.department_id = d.id
        LEFT JOIN schools s ON u.school_id = s.id
        LEFT JOIN school_fees sf ON p.school_fee_id = sf.id
        WHERE UPPER(u.matric_number) = UPPER(${searchQuery})
          AND p.status = 'verified'
        ORDER BY p.payment_date DESC
        LIMIT 1
      `
    } else if (searchType === "email") {
      // Search by email - get most recent verified payment
      paymentResult = await sql`
        SELECT 
          p.*,
          u.full_name,
          u.matric_number,
          u.email,
          u.phone,
          u.passport_photo,
          d.name as department_name,
          s.name as school_name,
          sf.fee_name,
          sf.description as fee_description,
          sf.academic_session
        FROM payments p
        JOIN users u ON p.user_id = u.id
        LEFT JOIN departments d ON u.department_id = d.id
        LEFT JOIN schools s ON u.school_id = s.id
        LEFT JOIN school_fees sf ON p.school_fee_id = sf.id
        WHERE u.email = ${searchQuery}
          AND p.status = 'verified'
        ORDER BY p.payment_date DESC
        LIMIT 1
      `
    } else {
      return NextResponse.json({ error: "Invalid search type" }, { status: 400 })
    }

    if (!paymentResult || paymentResult.length === 0) {
      return NextResponse.json({ error: "No payment found" }, { status: 404 })
    }

    const payment = paymentResult[0]

    // Calculate total payments for this student and session
    const totalPaymentsResult = await sql`
      SELECT 
        COALESCE(SUM(amount), 0) as total_paid,
        COUNT(*) as payment_count
      FROM payments
      WHERE user_id = ${payment.user_id}
        AND school_fee_id = ${payment.school_fee_id}
        AND status = 'verified'
    `

    const totalPaid = Number(totalPaymentsResult[0]?.total_paid || 0)
    const paymentCount = Number(totalPaymentsResult[0]?.payment_count || 0)

    // Format the response
    const verificationResult = {
      full_name: payment.full_name,
      matric_number: payment.matric_number,
      email: payment.email,
      phone: payment.phone,
      department_name: payment.department_name,
      school_name: payment.school_name,
      amount: Number(payment.amount),
      payment_date: payment.payment_date,
      reference: payment.reference,
      receipt_number: payment.receipt_number,
      status: payment.status,
      academic_session: payment.academic_session,
      fee_name: payment.fee_name,
      fee_description: payment.fee_description,
      passport_photo: payment.passport_photo,
      total_paid: totalPaid,
      payment_count: paymentCount,
      installment_number: payment.installment_number || 1,
      total_installments: payment.total_installments || 1,
    }

    return NextResponse.json({
      success: true,
      payment: verificationResult,
    })
  } catch (error) {
    console.error("Payment verification error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
