-- Add missing columns to payments table
ALTER TABLE payments ADD COLUMN IF NOT EXISTS is_full_payment boolean DEFAULT false;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS user_email text;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS user_name text;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS paystack_data jsonb;

-- Update existing payments to have proper values
UPDATE payments 
SET is_full_payment = true
WHERE is_full_payment IS NULL;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_payments_is_full_payment ON payments(is_full_payment);
CREATE INDEX IF NOT EXISTS idx_payments_user_email ON payments(user_email);
