import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { sql } from "@/lib/database"

export async function GET(request: NextRequest, { params }: { params: { reference: string } }) {
  try {
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const { reference } = params

    if (!reference) {
      return NextResponse.json({ error: "Payment reference is required" }, { status: 400 })
    }

    // Get payment details with student and fee information
    const paymentResult = await sql`
      SELECT 
        p.*,
        u.full_name,
        u.matric_number,
        u.email,
        u.phone,
        u.level,
        u.passport_photo,
        d.name as department_name,
        s.name as school_name,
        sf.fee_name,
        sf.description as fee_description,
        sf.amount as total_fee_amount,
        sf.academic_session,
        sf.allows_installments,
        sf.first_installment_percentage,
        sf.second_installment_percentage
      FROM payments p
      JOIN users u ON p.user_id = u.id
      LEFT JOIN departments d ON u.department_id = d.id
      LEFT JOIN schools s ON u.school_id = s.id
      LEFT JOIN school_fees sf ON p.school_fee_id = sf.id
      WHERE p.reference = ${reference} AND p.status = 'verified'
    `

    if (paymentResult.length === 0) {
      return NextResponse.json({ error: "Payment not found or not verified" }, { status: 404 })
    }

    const payment = paymentResult[0]

    // Get all payments for this student and fee to calculate totals
    const allPaymentsResult = await sql`
      SELECT 
        amount,
        installment_number,
        payment_date,
        status
      FROM payments
      WHERE user_id = ${payment.user_id} 
        AND school_fee_id = ${payment.school_fee_id}
        AND status = 'verified'
      ORDER BY installment_number
    `

    // Calculate payment summary
    const totalPaid = allPaymentsResult.reduce((sum, p) => sum + Number(p.amount), 0)
    const balance = Number(payment.total_fee_amount) - totalPaid
    const isFullyPaid = balance <= 0

    // Get installment percentages
    let firstPercentage = 70
    let secondPercentage = 30

    if (payment.first_installment_percentage && payment.second_installment_percentage) {
      firstPercentage = payment.first_installment_percentage
      secondPercentage = payment.second_installment_percentage
    }

    const receiptData = {
      payment: {
        id: payment.id,
        reference: payment.reference,
        receipt_number: payment.receipt_number,
        amount: Number(payment.amount),
        payment_date: payment.payment_date,
        fee_type: payment.fee_type || "School Fee",
        academic_session: payment.academic_session,
        installment_number: payment.installment_number || 1,
        total_installments: payment.total_installments || 1,
        payment_method: payment.payment_method || "online",
      },
      student: {
        full_name: payment.full_name,
        matric_number: payment.matric_number,
        email: payment.email,
        phone: payment.phone || "",
        passport_photo: payment.passport_photo || "",
        level: payment.level,
        department_name: payment.department_name || "",
        school_name: payment.school_name || "",
      },
      fee: {
        fee_name: payment.fee_name,
        description: payment.fee_description || "",
        total_amount: Number(payment.total_fee_amount),
        allows_installments: payment.allows_installments,
        first_installment_percentage: firstPercentage,
        second_installment_percentage: secondPercentage,
      },
      summary: {
        total_paid: totalPaid,
        balance: Math.max(0, balance),
        is_fully_paid: isFullyPaid,
        all_payments: allPaymentsResult.map((p) => ({
          amount: Number(p.amount),
          installment_number: p.installment_number,
          payment_date: p.payment_date,
        })),
      },
    }

    return NextResponse.json({ success: true, receipt: receiptData })
  } catch (error) {
    console.error("Receipt fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
