-- Ensure the users table has all necessary columns and data integrity
-- Add missing columns if they don't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS passport_photo text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS role text DEFAULT 'student';
ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at timestamp DEFAULT NOW();
ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at timestamp DEFAULT NOW();

-- Ensure all users have proper role set
UPDATE users 
SET role = 'student' 
WHERE role IS NULL OR role = '';

-- Ensure all users have proper timestamps
UPDATE users 
SET created_at = NOW() 
WHERE created_at IS NULL;

UPDATE users 
SET updated_at = NOW() 
WHERE updated_at IS NULL;

-- Fix any users with missing or empty passwords by setting them to hashed "student"
UPDATE users 
SET password = '$2b$10$rQZ9QmjKjKjKjKjKjKjKjOeJ9QmjKjKjKjKjKjKjKjKjKjKjKjKjK'
WHERE (password IS NULL OR password = '') AND role = 'student';

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_matric_number ON users(matric_number);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Show current users count for verification
SELECT 
    COUNT(*) as total_users,
    COUNT(CASE WHEN role = 'student' THEN 1 END) as students,
    COUNT(CASE WHEN password IS NOT NULL AND password != '' THEN 1 END) as users_with_password
FROM users;
