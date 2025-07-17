-- Create admin table
CREATE TABLE IF NOT EXISTS admins (
    id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
    username text UNIQUE NOT NULL,
    email text UNIQUE NOT NULL,
    full_name text NOT NULL,
    password text NOT NULL,
    role text DEFAULT 'admin',
    is_active boolean DEFAULT true,
    created_at timestamp DEFAULT NOW(),
    updated_at timestamp DEFAULT NOW()
);

-- Create fees table for admin to set school fees
CREATE TABLE IF NOT EXISTS school_fees (
    id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
    fee_name text NOT NULL,
    description text,
    amount decimal(10,2) NOT NULL,
    academic_session text NOT NULL,
    semester text NOT NULL,
    level text NOT NULL, -- ND1, ND2, HND1, HND2
    school_ids text[] NOT NULL, -- Array of school IDs that this fee applies to
    is_active boolean DEFAULT true,
    allows_installments boolean DEFAULT true,
    first_installment_percentage decimal(5,2) DEFAULT 70.00,
    second_installment_percentage decimal(5,2) DEFAULT 30.00,
    created_by text REFERENCES admins(id),
    created_at timestamp DEFAULT NOW(),
    updated_at timestamp DEFAULT NOW()
);

-- Update payments table to support installments
ALTER TABLE payments ADD COLUMN IF NOT EXISTS installment_number integer DEFAULT 1;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS total_installments integer DEFAULT 1;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS school_fee_id text REFERENCES school_fees(id);

-- Create default admin account
INSERT INTO admins (username, email, full_name, password, role)
VALUES (
    'admin',
    'admin@fpb.edu.ng',
    'System Administrator',
    '$2b$10$rQZ9QmjKjKjKjKjKjKjKjOeJ9QmjKjKjKjKjKjKjKjKjKjKjKjKjK', -- "admin" hashed
    'admin'
) ON CONFLICT (username) DO NOTHING;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_school_fees_session ON school_fees(academic_session);
CREATE INDEX IF NOT EXISTS idx_school_fees_semester ON school_fees(semester);
CREATE INDEX IF NOT EXISTS idx_school_fees_level ON school_fees(level);
CREATE INDEX IF NOT EXISTS idx_school_fees_active ON school_fees(is_active);
CREATE INDEX IF NOT EXISTS idx_payments_installment ON payments(installment_number);
CREATE INDEX IF NOT EXISTS idx_payments_school_fee_id ON payments(school_fee_id);
CREATE INDEX IF NOT EXISTS idx_admins_username ON admins(username);
CREATE INDEX IF NOT EXISTS idx_admins_email ON admins(email);

-- Show created tables
SELECT 'Admins created:' as info, COUNT(*) as count FROM admins
UNION ALL
SELECT 'School fees created:', COUNT(*) FROM school_fees;
