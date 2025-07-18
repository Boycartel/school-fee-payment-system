-- Add missing columns to payments table
ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS is_full_payment BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS user_email VARCHAR(255),
ADD COLUMN IF NOT EXISTS user_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS paystack_data JSONB;

-- Update existing records with default values
UPDATE payments 
SET 
  is_full_payment = FALSE,
  user_email = COALESCE(user_email, ''),
  user_name = COALESCE(user_name, '')
WHERE is_full_payment IS NULL;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_payments_reference ON payments(reference);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at);

-- Ensure payments table has all required columns
DO $$ 
BEGIN
    -- Check if payment_date column exists, if not add it
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payments' AND column_name = 'payment_date') THEN
        ALTER TABLE payments ADD COLUMN payment_date TIMESTAMP DEFAULT NOW();
    END IF;
END $$;
