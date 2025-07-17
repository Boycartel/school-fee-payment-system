-- Create a test student account for login testing
-- First, get a school and department ID
DO $$
DECLARE
    school_id_var text;
    dept_id_var text;
    hashed_password text := '$2b$10$rQZ9QmjKjKjKjKjKjKjKjOeJ9QmjKjKjKjKjKjKjKjKjKjKjKjKjK'; -- This is "student" hashed
BEGIN
    -- Get School of Information and Communication Technology ID
    SELECT id INTO school_id_var 
    FROM schools 
    WHERE name = 'School of Information and Communication Technology' 
    LIMIT 1;
    
    -- Get Computer Science department ID
    SELECT id INTO dept_id_var 
    FROM departments 
    WHERE name = 'Computer Science' AND school_id = school_id_var 
    LIMIT 1;
    
    -- Insert test student if not exists
    INSERT INTO users (
        id, full_name, matric_number, email, phone, school_id, department_id, 
        level, password, role, created_at, updated_at
    )
    SELECT 
        gen_random_uuid()::text, 
        'Test Student', 
        '2023/1/123456CS', 
        'test.student@fpb.edu.ng', 
        '08012345678',
        school_id_var, 
        dept_id_var, 
        'ND1', 
        hashed_password, 
        'student', 
        NOW(), 
        NOW()
    WHERE NOT EXISTS (
        SELECT 1 FROM users WHERE matric_number = '2023/1/123456CS'
    );
    
    -- Also create another test student
    INSERT INTO users (
        id, full_name, matric_number, email, phone, school_id, department_id, 
        level, password, role, created_at, updated_at
    )
    SELECT 
        gen_random_uuid()::text, 
        'John Doe', 
        '2023/2/654321SW', 
        'john.doe@fpb.edu.ng', 
        '08087654321',
        school_id_var, 
        (SELECT id FROM departments WHERE name = 'Software and Web Development' AND school_id = school_id_var LIMIT 1), 
        'HND1', 
        hashed_password, 
        'student', 
        NOW(), 
        NOW()
    WHERE NOT EXISTS (
        SELECT 1 FROM users WHERE matric_number = '2023/2/654321SW'
    );
END $$;

-- Verify the test students were created
SELECT 
    full_name, 
    matric_number, 
    email, 
    level,
    CASE WHEN password IS NOT NULL THEN 'Has Password' ELSE 'No Password' END as password_status,
    d.name as department_name,
    s.name as school_name
FROM users u
LEFT JOIN departments d ON u.department_id = d.id
LEFT JOIN schools s ON u.school_id = s.id
WHERE u.matric_number IN ('2023/1/123456CS', '2023/2/654321SW');

-- Fix any users with missing passwords
UPDATE users 
SET password = '$2b$10$rQZ9QmjKjKjKjKjKjKjKjOeJ9QmjKjKjKjKjKjKjKjKjKjKjKjKjK'
WHERE password IS NULL OR password = '' AND role = 'student';

-- Ensure all student users have proper role
UPDATE users 
SET role = 'student' 
WHERE role IS NULL OR role = '' AND matric_number IS NOT NULL;

-- Show all students for verification
SELECT 
    COUNT(*) as total_students,
    COUNT(CASE WHEN password IS NOT NULL AND password != '' THEN 1 END) as students_with_password
FROM users 
WHERE role = 'student';
