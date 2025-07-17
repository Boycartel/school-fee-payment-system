-- Update school_fees table structure
ALTER TABLE school_fees DROP COLUMN IF EXISTS level;
ALTER TABLE school_fees DROP COLUMN IF EXISTS first_installment_percentage;
ALTER TABLE school_fees DROP COLUMN IF EXISTS second_installment_percentage;
ALTER TABLE school_fees DROP COLUMN IF EXISTS school_ids;

-- Add new columns
ALTER TABLE school_fees ADD COLUMN IF NOT EXISTS installment_percentages jsonb DEFAULT '[]';

-- Create school_fee_assignments table for many-to-many relationship
CREATE TABLE IF NOT EXISTS school_fee_assignments (
    id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
    fee_id text REFERENCES school_fees(id) ON DELETE CASCADE,
    school_id text REFERENCES schools(id) ON DELETE CASCADE,
    created_at timestamp DEFAULT NOW(),
    UNIQUE(fee_id, school_id)
);

-- Create school_fee_levels table for many-to-many relationship
CREATE TABLE IF NOT EXISTS school_fee_levels (
    id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
    fee_id text REFERENCES school_fees(id) ON DELETE CASCADE,
    level text NOT NULL,
    created_at timestamp DEFAULT NOW(),
    UNIQUE(fee_id, level)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_school_fee_assignments_fee_id ON school_fee_assignments(fee_id);
CREATE INDEX IF NOT EXISTS idx_school_fee_assignments_school_id ON school_fee_assignments(school_id);
CREATE INDEX IF NOT EXISTS idx_school_fee_levels_fee_id ON school_fee_levels(fee_id);
CREATE INDEX IF NOT EXISTS idx_school_fee_levels_level ON school_fee_levels(level);

-- Update existing data if any
-- This will need to be done manually based on existing data structure

SELECT 'Fee structure updated successfully' as message;
