-- Sample Seed Data for Student Result Management System

-- Insert sample users (passwords should be hashed in production)
INSERT INTO users (email, password_hash, role) VALUES
('admin@university.edu', 'hashed_password_1', 'admin'),
('teacher1@university.edu', 'hashed_password_2', 'teacher'),
('teacher2@university.edu', 'hashed_password_3', 'teacher'),
('student1@university.edu', 'hashed_password_4', 'student'),
('student2@university.edu', 'hashed_password_5', 'student'),
('student3@university.edu', 'hashed_password_6', 'student');

-- Insert sample admins
INSERT INTO admins (user_id, first_name, last_name, appointment_date) VALUES
(1, 'John', 'Admin', '2023-01-15');

-- Insert sample teachers
INSERT INTO teachers (user_id, employee_id, first_name, last_name, department, specialization, joining_date) VALUES
(2, 'EMP001', 'Robert', 'Smith', 'Computer Science', 'Data Structures', '2022-06-01'),
(3, 'EMP002', 'Sarah', 'Johnson', 'Computer Science', 'Database Systems', '2022-08-01');

-- Insert sample students
INSERT INTO students (user_id, roll_no, first_name, last_name, enrollment_date) VALUES
(4, 'CSE001', 'Alice', 'Williams', '2023-08-01'),
(5, 'CSE002', 'Bob', 'Brown', '2023-08-01'),
(6, 'CSE003', 'Charlie', 'Davis', '2023-08-01');

-- Insert sample subjects
INSERT INTO subjects (subject_code, subject_name, subject_description, credits) VALUES
('CS101', 'Data Structures', 'Fundamental data structures and algorithms', 4),
('CS102', 'Database Systems', 'Relational databases and SQL', 4),
('CS103', 'Web Development', 'Frontend and backend web technologies', 3),
('CS104', 'Operating Systems', 'OS concepts and principles', 4);

-- Insert sample classes
INSERT INTO classes (class_name, class_code, semester, academic_year) VALUES
('B.Tech CSE Semester 3', 'CSE-3-2024', 3, '2023-2024'),
('B.Tech CSE Semester 4', 'CSE-4-2024', 4, '2023-2024');

-- Assign subjects to classes with teachers
INSERT INTO class_subject_teacher (class_id, subject_id, teacher_id, semester, academic_year) VALUES
(1, 1, 1, 3, '2023-2024'),
(1, 2, 2, 3, '2023-2024'),
(1, 3, 1, 3, '2023-2024'),
(2, 4, 2, 4, '2023-2024');

-- Enroll students in classes
INSERT INTO student_enrollment (student_id, class_id, semester, academic_year) VALUES
(1, 1, 3, '2023-2024'),
(2, 1, 3, '2023-2024'),
(3, 1, 3, '2023-2024');

-- Insert sample marks
INSERT INTO marks (student_id, subject_id, class_id, teacher_id, internal_marks, external_marks, total_marks, grade, grade_point, semester, academic_year, is_published) VALUES
(1, 1, 1, 1, 45, 75, 85, 'A', 4.0, 3, '2023-2024', TRUE),
(1, 2, 1, 2, 40, 70, 80, 'A', 4.0, 3, '2023-2024', TRUE),
(1, 3, 1, 1, 38, 65, 78, 'B+', 3.5, 3, '2023-2024', TRUE),
(2, 1, 1, 1, 35, 60, 73, 'B', 3.0, 3, '2023-2024', TRUE),
(2, 2, 1, 2, 32, 58, 70, 'B', 3.0, 3, '2023-2024', TRUE),
(2, 3, 1, 1, 30, 55, 68, 'B-', 2.5, 3, '2023-2024', TRUE),
(3, 1, 1, 1, 42, 72, 83, 'A', 4.0, 3, '2023-2024', TRUE),
(3, 2, 1, 2, 38, 68, 79, 'A', 4.0, 3, '2023-2024', TRUE),
(3, 3, 1, 1, 35, 60, 72, 'B', 3.0, 3, '2023-2024', TRUE);

-- Insert sample recheck requests
INSERT INTO recheck_requests (student_id, mark_id, subject_id, teacher_id, reason, current_marks, status) VALUES
(2, 4, 1, 1, 'Student believes there was an error in evaluation', 73, 'pending'),
(2, 5, 2, 2, 'Request to review the answer sheet', 70, 'pending');

-- Insert sample notifications
INSERT INTO notifications (user_id, title, message, notification_type, is_read) VALUES
(4, 'Marks Published', 'Your marks for Semester 3 have been published', 'marks_published', FALSE),
(5, 'Recheck Status', 'Your recheck request for Data Structures is under review', 'recheck_status', TRUE),
(5, 'Marks Published', 'Your marks for Semester 3 have been published', 'marks_published', FALSE);
