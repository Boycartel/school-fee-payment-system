-- Drop existing tables if they exist to start fresh
DROP TABLE IF EXISTS school_fee_levels CASCADE;
DROP TABLE IF EXISTS school_fee_assignments CASCADE;
DROP TABLE IF EXISTS school_fees CASCADE;
DROP TABLE IF EXISTS admins CASCADE;

-- Create admins table
CREATE TABLE admins (
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

-- Create school_fees table with updated structure
CREATE TABLE school_fees (
    id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
    fee_name text NOT NULL,
    description text,
    amount decimal(10,2) NOT NULL,
    academic_session text NOT NULL,
    semester text NOT NULL,
    allows_installments boolean DEFAULT false,
    installment_percentages jsonb DEFAULT '[]',
    is_active boolean DEFAULT true,
    created_by text REFERENCES admins(id),
    created_at timestamp DEFAULT NOW(),
    updated_at timestamp DEFAULT NOW()
);

-- Create school_fee_assignments table for many-to-many relationship
CREATE TABLE school_fee_assignments (
    id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
    fee_id text REFERENCES school_fees(id) ON DELETE CASCADE,
    school_id text REFERENCES schools(id) ON DELETE CASCADE,
    created_at timestamp DEFAULT NOW(),
    UNIQUE(fee_id, school_id)
);

-- Create school_fee_levels table for many-to-many relationship
CREATE TABLE school_fee_levels (
    id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
    fee_id text REFERENCES school_fees(id) ON DELETE CASCADE,
    level text NOT NULL,
    created_at timestamp DEFAULT NOW(),
    UNIQUE(fee_id, level)
);

-- Insert default admin with bcrypt hashed password for 'admin'
INSERT INTO admins (username, email, full_name, password, role, is_active)
VALUES (
    'admin',
    'admin@fpb.edu.ng',
    'System Administrator',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'admin',
    true
);

-- Create indexes for better performance
CREATE INDEX idx_admins_username ON admins(username);
CREATE INDEX idx_admins_email ON admins(email);
CREATE INDEX idx_school_fees_session ON school_fees(academic_session);
CREATE INDEX idx_school_fees_semester ON school_fees(semester);
CREATE INDEX idx_school_fees_active ON school_fees(is_active);
CREATE INDEX idx_school_fee_assignments_fee_id ON school_fee_assignments(fee_id);
CREATE INDEX idx_school_fee_assignments_school_id ON school_fee_assignments(school_id);
CREATE INDEX idx_school_fee_levels_fee_id ON school_fee_levels(fee_id);
CREATE INDEX idx_school_fee_levels_level ON school_fee_levels(level);

-- Verify admin was created
SELECT 'Admin system setup complete' as status, 
       username, email, full_name, is_active 
FROM admins WHERE username = 'admin';
