-- Create admin table if not exists
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

-- Create school_fees table with updated structure
CREATE TABLE IF NOT EXISTS school_fees (
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

-- Create default admin account with hashed password
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
CREATE INDEX IF NOT EXISTS idx_school_fees_active ON school_fees(is_active);
CREATE INDEX IF NOT EXISTS idx_admins_username ON admins(username);
CREATE INDEX IF NOT EXISTS idx_admins_email ON admins(email);

SELECT 'Default admin created successfully' as message;
