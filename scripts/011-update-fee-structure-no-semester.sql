-- Update school_fees table to remove semester column
ALTER TABLE school_fees DROP COLUMN IF EXISTS semester;

-- Add first_installment_percentage and second_installment_percentage columns for backward compatibility
ALTER TABLE school_fees 
ADD COLUMN IF NOT EXISTS first_installment_percentage integer DEFAULT 70,
ADD COLUMN IF NOT EXISTS second_installment_percentage integer DEFAULT 30;

-- Update existing fees to have proper installment percentages
UPDATE school_fees 
SET 
  first_installment_percentage = 70,
  second_installment_percentage = 30
WHERE first_installment_percentage IS NULL OR second_installment_percentage IS NULL;

-- Update the index to remove semester reference
DROP INDEX IF EXISTS idx_school_fees_semester;
