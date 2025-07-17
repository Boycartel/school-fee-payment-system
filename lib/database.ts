import { neon } from "@neondatabase/serverless"

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set")
}

export const sql = neon(process.env.DATABASE_URL)

// Database helper functions - all pointing to users table
export async function getStudentByMatricNumber(matricNumber: string) {
  try {
    console.log("Getting student by matric number:", matricNumber)
    const result = await sql`
      SELECT u.*, d.name as department_name, s.name as school_name
      FROM users u
      LEFT JOIN departments d ON u.department_id = d.id
      LEFT JOIN schools s ON u.school_id = s.id
      WHERE UPPER(u.matric_number) = UPPER(${matricNumber}) AND u.role = 'student'
    `
    console.log("Student query result:", result.length)
    return result[0] || null
  } catch (error) {
    console.error("Database error in getStudentByMatricNumber:", error)
    return null
  }
}

export async function getStudentById(id: string) {
  try {
    console.log("Getting student by ID:", id)
    const result = await sql`
      SELECT u.*, d.name as department_name, s.name as school_name
      FROM users u
      LEFT JOIN departments d ON u.department_id = d.id
      LEFT JOIN schools s ON u.school_id = s.id
      WHERE u.id = ${id} AND u.role = 'student'
    `
    console.log("Student by ID query result:", result.length)
    return result[0] || null
  } catch (error) {
    console.error("Database error in getStudentById:", error)
    return null
  }
}

export async function getStudentByEmail(email: string) {
  try {
    const result = await sql`
      SELECT u.*, d.name as department_name, s.name as school_name
      FROM users u
      LEFT JOIN departments d ON u.department_id = d.id
      LEFT JOIN schools s ON u.school_id = s.id
      WHERE u.email = ${email} AND u.role = 'student'
    `
    return result[0] || null
  } catch (error) {
    console.error("Database error in getStudentByEmail:", error)
    return null
  }
}

export async function getStudentPayments(userId: string) {
  try {
    console.log("Getting payments for user ID:", userId)
    const result = await sql`
      SELECT p.*, f.name as fee_name, f.description as fee_description,
             f.type as fee_type_old
      FROM payments p
      LEFT JOIN fees f ON p.fee_id = f.id
      WHERE p.user_id = ${userId}
      ORDER BY p.payment_date DESC
    `
    console.log("Payments query result:", result.length)
    return result
  } catch (error) {
    console.error("Database error in getStudentPayments:", error)
    return []
  }
}

export async function createPayment(paymentData: {
  userId: string
  feeId: string
  amount: number
  reference: string
  receiptNumber: string
  paymentMethod: string
  academicSession: string
  feeType?: string
  semester?: string
  schoolFeeId?: string
  installmentNumber?: number
  totalInstallments?: number
}) {
  const result = await sql`
    INSERT INTO payments (
      id, user_id, fee_id, amount, payment_date, reference, 
      receipt_number, payment_method, academic_session, fee_type, semester, 
      school_fee_id, installment_number, total_installments, status, created_at, updated_at
    )
    VALUES (
      gen_random_uuid()::text, ${paymentData.userId}, ${paymentData.feeId}, 
      ${paymentData.amount}, NOW(), ${paymentData.reference}, 
      ${paymentData.receiptNumber}, ${paymentData.paymentMethod}, 
      ${paymentData.academicSession}, ${paymentData.feeType || "School Fee"}, 
      ${paymentData.semester || "First Semester"}, ${paymentData.schoolFeeId || null},
      ${paymentData.installmentNumber || 1}, ${paymentData.totalInstallments || 1},
      'pending', NOW(), NOW()
    )
    RETURNING *
  `
  return result[0]
}

export async function verifyPaymentByReference(reference: string) {
  const result = await sql`
    SELECT p.*, u.full_name, u.matric_number, u.email, u.phone, u.passport_photo,
           d.name as department_name, s.name as school_name,
           f.name as fee_name, f.description as fee_description
    FROM payments p
    JOIN users u ON p.user_id = u.id
    LEFT JOIN departments d ON u.department_id = d.id
    LEFT JOIN schools s ON u.school_id = s.id
    LEFT JOIN fees f ON p.fee_id = f.id
    WHERE p.reference = ${reference}
  `
  return result[0] || null
}

export async function verifyPaymentByEmail(email: string) {
  const result = await sql`
    SELECT p.*, u.full_name, u.matric_number, u.email, u.phone, u.passport_photo,
           d.name as department_name, s.name as school_name,
           f.name as fee_name, f.description as fee_description
    FROM payments p
    JOIN users u ON p.user_id = u.id
    LEFT JOIN departments d ON u.department_id = d.id
    LEFT JOIN schools s ON u.school_id = s.id
    LEFT JOIN fees f ON p.fee_id = f.id
    WHERE u.email = ${email}
    ORDER BY p.payment_date DESC
    LIMIT 1
  `
  return result[0] || null
}

export async function verifyPaymentByMatricNumber(matricNumber: string) {
  const result = await sql`
    SELECT p.*, u.full_name, u.matric_number, u.email, u.phone, u.passport_photo,
           d.name as department_name, s.name as school_name,
           f.name as fee_name, f.description as fee_description
    FROM payments p
    JOIN users u ON p.user_id = u.id
    LEFT JOIN departments d ON u.department_id = d.id
    LEFT JOIN schools s ON u.school_id = s.id
    LEFT JOIN fees f ON p.fee_id = f.id
    WHERE u.matric_number = ${matricNumber}
    ORDER BY p.payment_date DESC
    LIMIT 1
  `
  return result[0] || null
}

export async function getAllSchools() {
  const result = await sql`
    SELECT * FROM schools ORDER BY name
  `
  return result
}

export async function getDepartmentsBySchool(schoolId: string) {
  const result = await sql`
    SELECT * FROM departments WHERE school_id = ${schoolId} ORDER BY name
  `
  return result
}

export async function getAllDepartments() {
  const result = await sql`
    SELECT d.*, s.name as school_name 
    FROM departments d
    LEFT JOIN schools s ON d.school_id = s.id
    ORDER BY s.name, d.name
  `
  return result
}

export async function updateUserPassportPhoto(userId: string, photoUrl: string) {
  const result = await sql`
    UPDATE users 
    SET passport_photo = ${photoUrl}, updated_at = NOW()
    WHERE id = ${userId}
    RETURNING *
  `
  return result[0]
}

export async function getRecentPayments(limit = 10) {
  const result = await sql`
    SELECT p.*, u.full_name, u.matric_number, u.email,
           d.name as department_name, s.name as school_name,
           f.name as fee_name
    FROM payments p
    JOIN users u ON p.user_id = u.id
    LEFT JOIN departments d ON u.department_id = d.id
    LEFT JOIN schools s ON u.school_id = s.id
    LEFT JOIN fees f ON p.fee_id = f.id
    WHERE u.role = 'student'
    ORDER BY p.payment_date DESC
    LIMIT ${limit}
  `
  return result
}

export async function getPaymentStatistics() {
  const result = await sql`
    SELECT 
      COUNT(DISTINCT u.id) as total_students,
      COUNT(CASE WHEN p.status = 'verified' THEN 1 END) as verified_payments,
      COUNT(CASE WHEN p.status = 'pending' THEN 1 END) as pending_payments,
      COALESCE(SUM(CASE WHEN p.status = 'verified' THEN p.amount ELSE 0 END), 0) as total_revenue
    FROM users u
    LEFT JOIN payments p ON u.id = p.user_id
    WHERE u.role = 'student'
  `
  return (
    result[0] || {
      total_students: 0,
      verified_payments: 0,
      pending_payments: 0,
      total_revenue: 0,
    }
  )
}
