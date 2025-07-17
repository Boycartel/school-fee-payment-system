-- Fix any users with null passwords by setting them to hashed "student"
UPDATE users 
SET password = '$2b$10$rQZ9QmjKjKjKjKjKjKjKjOeJ9QmjKjKjKjKjKjKjKjKjKjKjKjKjK'
WHERE password IS NULL OR password = '';

-- Ensure all users have the student role if not set
UPDATE users 
SET role = 'student' 
WHERE role IS NULL OR role = '';
