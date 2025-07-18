-- Fix payments table ID column to auto-generate UUIDs
ALTER TABLE payments ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Ensure the id column exists and is properly configured
DO $$ 
BEGIN
    -- Check if id column exists and is properly configured
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'payments' AND column_name = 'id' AND data_type = 'uuid'
    ) THEN
        -- If id column doesn't exist as UUID, add it
        ALTER TABLE payments ADD COLUMN IF NOT EXISTS id UUID PRIMARY KEY DEFAULT gen_random_uuid();
    END IF;
    
    -- Ensure id column has default value
    ALTER TABLE payments ALTER COLUMN id SET DEFAULT gen_random_uuid();
    
    -- Update any existing records that might have null ids
    UPDATE payments SET id = gen_random_uuid() WHERE id IS NULL;
END $$;

-- Ensure proper constraints
ALTER TABLE payments ALTER COLUMN id SET NOT NULL;
