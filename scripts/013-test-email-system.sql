-- Test script to verify email system is working
-- This script doesn't modify the database, just provides test queries

-- Check recent payments that should have triggered emails
SELECT 
  p.reference,
  p.receipt_number,
  p.amount,
  p.payment_date,
  p.status,
  u.full_name,
  u.email,
  sf.fee_name
FROM payments p
JOIN users u ON p.user_id = u.id
LEFT JOIN school_fees sf ON p.school_fee_id = sf.id
WHERE p.status = 'verified'
  AND p.payment_date >= NOW() - INTERVAL '24 hours'
ORDER BY p.payment_date DESC;

-- Check for any pending payments
SELECT 
  p.reference,
  p.amount,
  p.created_at,
  u.full_name,
  u.email
FROM payments p
JOIN users u ON p.user_id = u.id
WHERE p.status = 'pending'
ORDER BY p.created_at DESC;
