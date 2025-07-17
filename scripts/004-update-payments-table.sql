-- Add new columns to payments table for Paystack integration
ALTER TABLE payments ADD COLUMN IF NOT EXISTS fee_type text;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS semester text;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS gateway_response jsonb;

-- Update existing payments to have proper fee_type
UPDATE payments 
SET fee_type = 'School Fee'
WHERE fee_type IS NULL;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_academic_session ON payments(academic_session);
CREATE INDEX IF NOT EXISTS idx_payments_fee_type ON payments(fee_type);
