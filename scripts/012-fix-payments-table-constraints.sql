-- Drop the problematic foreign key constraint on payments table
ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_fee_id_fkey;

-- Update the payments table structure to properly handle school fees
ALTER TABLE payments 
  ALTER COLUMN fee_id DROP NOT NULL,
  ADD COLUMN IF NOT EXISTS school_fee_id TEXT REFERENCES school_fees(id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_payments_school_fee_id ON payments(school_fee_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_reference ON payments(reference);

-- Update existing payments to have proper school_fee_id if missing
UPDATE payments 
SET school_fee_id = fee_id 
WHERE school_fee_id IS NULL 
  AND fee_id IS NOT NULL 
  AND EXISTS (SELECT 1 FROM school_fees WHERE id = payments.fee_id);
