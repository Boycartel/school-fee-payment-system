-- Ensure the admins table exists with correct structure
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

-- Create school_fees table if it doesn't exist
CREATE TABLE IF NOT EXISTS school_fees (
    id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
    fee_name text NOT NULL,
    description text,
    amount decimal(10,2) NOT NULL,
    academic_session text NOT NULL,
    semester text NOT NULL,
    level text NOT NULL, -- ND1, ND2, HND1, HND2
    is_active boolean DEFAULT true,
    allows_installments boolean DEFAULT true,
    first_installment_percentage decimal(5,2) DEFAULT 70.00,
    second_installment_percentage decimal(5,2) DEFAULT 30.00,
    created_by text REFERENCES admins(id),
    created_at timestamp DEFAULT NOW(),
    updated_at timestamp DEFAULT NOW()
);

-- Create school_fee_assignments table for many-to-many relationship
CREATE TABLE IF NOT EXISTS school_fee_assignments (
    id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
    fee_id text REFERENCES school_fees(id) ON DELETE CASCADE,
    school_id text REFERENCES schools(id) ON DELETE CASCADE,
    created_at timestamp DEFAULT NOW(),
    UNIQUE(fee_id, school_id)
);

-- Update payments table to support school fees
ALTER TABLE payments ADD COLUMN IF NOT EXISTS school_fee_id text REFERENCES school_fees(id);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS installment_number integer DEFAULT 1;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS total_installments integer DEFAULT 1;

-- Insert default admin user (password is 'admin' hashed with bcrypt)
INSERT INTO admins (username, password, email, full_name, role) 
VALUES (
    'admin', 
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 
    'admin@fedpolybida.edu.ng', 
    'System Administrator',
    'super_admin'
) ON CONFLICT (username) DO UPDATE SET
    password = EXCLUDED.password,
    updated_at = NOW();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_admins_username ON admins(username);
CREATE INDEX IF NOT EXISTS idx_admins_email ON admins(email);
CREATE INDEX IF NOT EXISTS idx_school_fees_session ON school_fees(academic_session);
CREATE INDEX IF NOT EXISTS idx_school_fees_level ON school_fees(level);
CREATE INDEX IF NOT EXISTS idx_school_fee_assignments_fee ON school_fee_assignments(fee_id);
CREATE INDEX IF NOT EXISTS idx_school_fee_assignments_school ON school_fee_assignments(school_id);

-- Show the admin user was created
SELECT 'Admin user created/updated:' as info, username, email, full_name 
FROM admins WHERE username = 'admin';
