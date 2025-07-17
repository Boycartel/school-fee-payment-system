-- Add passport photo column to users table if it doesn't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS passport_photo text;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_matric_number ON users(matric_number);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_reference ON payments(reference);
CREATE INDEX IF NOT EXISTS idx_payments_receipt_number ON payments(receipt_number);
