-- Clear existing data
DELETE FROM departments;
DELETE FROM schools;

-- Insert Schools
INSERT INTO schools (id, name, created_at, updated_at) VALUES
(gen_random_uuid()::text, 'School of Basic and General Studies', NOW(), NOW()),
(gen_random_uuid()::text, 'School of Applied and Natural Sciences', NOW(), NOW()),
(gen_random_uuid()::text, 'School of Information and Communication Technology', NOW(), NOW()),
(gen_random_uuid()::text, 'School of Engineering Technology', NOW(), NOW()),
(gen_random_uuid()::text, 'School of Environmental Design and Construction Technology', NOW(), NOW()),
(gen_random_uuid()::text, 'School of Financial Studies', NOW(), NOW()),
(gen_random_uuid()::text, 'School of Business Administration and Management', NOW(), NOW());

-- Insert Departments for School of Basic and General Studies
INSERT INTO departments (id, name, school_id, created_at, updated_at)
SELECT 
  gen_random_uuid()::text,
  dept_name,
  s.id,
  NOW(),
  NOW()
FROM (
  VALUES 
    ('Languages'),
    ('Social Sciences'),
    ('Legal Studies'),
    ('Basic Studies'),
    ('Mathematics')
) AS dept(dept_name)
CROSS JOIN schools s
WHERE s.name = 'School of Basic and General Studies';

-- Insert Departments for School of Applied and Natural Sciences
INSERT INTO departments (id, name, school_id, created_at, updated_at)
SELECT 
  gen_random_uuid()::text,
  dept_name,
  s.id,
  NOW(),
  NOW()
FROM (
  VALUES 
    ('Biological Sciences'),
    ('Chemical Sciences'),
    ('Physics'),
    ('Hospitality Management'),
    ('Statistics'),
    ('Nutrition and Dietetics'),
    ('Tourism Management Technology')
) AS dept(dept_name)
CROSS JOIN schools s
WHERE s.name = 'School of Applied and Natural Sciences';

-- Insert Departments for School of Information and Communication Technology
INSERT INTO departments (id, name, school_id, created_at, updated_at)
SELECT 
  gen_random_uuid()::text,
  dept_name,
  s.id,
  NOW(),
  NOW()
FROM (
  VALUES 
    ('Computer Science'),
    ('Library and Information Science'),
    ('Office Technology and Management'),
    ('Mass Communication'),
    ('Software and Web Development'),
    ('Artificial Intelligence'),
    ('Networking and Cloud Computing'),
    ('Cyber Security'),
    ('Journalism and Media Studies')
) AS dept(dept_name)
CROSS JOIN schools s
WHERE s.name = 'School of Information and Communication Technology';

-- Insert Departments for School of Engineering Technology
INSERT INTO departments (id, name, school_id, created_at, updated_at)
SELECT 
  gen_random_uuid()::text,
  dept_name,
  s.id,
  NOW(),
  NOW()
FROM (
  VALUES 
    ('Agricultural and Bio-Environmental Engineering Technology'),
    ('Chemical Engineering Technology'),
    ('Civil Engineering Technology'),
    ('Electrical Engineering Technology'),
    ('Mechanical Engineering Technology')
) AS dept(dept_name)
CROSS JOIN schools s
WHERE s.name = 'School of Engineering Technology';

-- Insert Departments for School of Environmental Design and Construction Technology
INSERT INTO departments (id, name, school_id, created_at, updated_at)
SELECT 
  gen_random_uuid()::text,
  dept_name,
  s.id,
  NOW(),
  NOW()
FROM (
  VALUES 
    ('Architectural Technology'),
    ('Building Technology'),
    ('Estate Management & Valuation'),
    ('Quantity Surveying'),
    ('Surveying & Geo-Informatics'),
    ('Urban & Regional Planning')
) AS dept(dept_name)
CROSS JOIN schools s
WHERE s.name = 'School of Environmental Design and Construction Technology';

-- Insert Departments for School of Financial Studies
INSERT INTO departments (id, name, school_id, created_at, updated_at)
SELECT 
  gen_random_uuid()::text,
  dept_name,
  s.id,
  NOW(),
  NOW()
FROM (
  VALUES 
    ('Accountancy'),
    ('Banking & Finance')
) AS dept(dept_name)
CROSS JOIN schools s
WHERE s.name = 'School of Financial Studies';

-- Insert Departments for School of Business Administration and Management
INSERT INTO departments (id, name, school_id, created_at, updated_at)
SELECT 
  gen_random_uuid()::text,
  dept_name,
  s.id,
  NOW(),
  NOW()
FROM (
  VALUES 
    ('Business Administration & Management'),
    ('Public Administration'),
    ('Marketing')
) AS dept(dept_name)
CROSS JOIN schools s
WHERE s.name = 'School of Business Administration and Management';

-- Verify the data
SELECT 
  s.name as school_name,
  COUNT(d.id) as department_count
FROM schools s
LEFT JOIN departments d ON s.id = d.school_id
GROUP BY s.id, s.name
ORDER BY s.name;

-- Show all departments by school
SELECT 
  s.name as school_name,
  d.name as department_name
FROM schools s
JOIN departments d ON s.id = d.school_id
ORDER BY s.name, d.name;
