# Student Result Management System - Database Design Documentation

## Entity Relationship Diagram (ERD)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                DATABASE SCHEMA                          │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────────┐
│    USERS     │
├──────────────┤
│ user_id (PK) │
│ email        │
│ password_hash│
│ role         │
│ is_active    │
│ created_at   │
│ updated_at   │
└──────────────┘
      │
      ├─────────────────────┬─────────────────────┐
      │                     │                     │
      ▼                     ▼                     ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  STUDENTS    │  │   TEACHERS   │  │    ADMINS    │
├──────────────┤  ├──────────────┤  ├──────────────┤
│ student_id   │  │ teacher_id   │  │ admin_id     │
│ user_id (FK) │  │ user_id (FK) │  │ user_id (FK) │
│ roll_no      │  │ employee_id  │  │ first_name   │
│ first_name   │  │ first_name   │  │ last_name    │
│ last_name    │  │ last_name    │  │ contact_no   │
│ dob          │  │ contact_no   │  │ appoint_date │
│ contact_no   │  │ department   │  │ is_active    │
│ address      │  │ special_zone │  │              │
│ enroll_date  │  │ joining_date │  │              │
│ is_active    │  │ is_active    │  │              │
└──────────────┘  └──────────────┘  └──────────────┘
      │                   │                   │
      │                   │                   │
      └───────────────────┼───────────────────┘
                          │
                ┌─────────┴──────────┐
                │                    │
                ▼                    ▼
         ┌──────────────┐    ┌──────────────────┐
         │    CLASSES   │    │CLASS_SUBJECT_TEA │
         ├──────────────┤    ├──────────────────┤
         │ class_id (PK)│    │ assignment_id(PK)│
         │ class_name   │    │ class_id (FK)    │
         │ class_code   │    │ subject_id (FK)  │
         │ semester     │    │ teacher_id (FK)  │
         │ academic_yr  │    │ semester         │
         │ is_active    │    │ academic_year    │
         └──────────────┘    └──────────────────┘
         │        │                   │
         │        └───────────┬───────┘
         │                    │
         │                    ▼
         │           ┌──────────────┐
         │           │   SUBJECTS   │
         │           ├──────────────┤
         │           │ subject_id   │
         │           │ subject_code │
         │           │ subject_name │
         │           │ description  │
         │           │ credits      │
         │           │ is_active    │
         │           └──────────────┘
         │
         └──────────────┬──────────────┐
                        │              │
                        ▼              ▼
         ┌────────────────────┐  ┌──────────────┐
         │STUDENT_ENROLLMENT  │  │    MARKS     │
         ├────────────────────┤  ├──────────────┤
         │ enrollment_id (PK) │  │ mark_id (PK) │
         │ student_id (FK)    │  │ student_id   │
         │ class_id (FK)      │  │ subject_id   │
         │ semester           │  │ class_id     │
         │ academic_year      │  │ teacher_id   │
         │ enroll_status      │  │ int_marks    │
         └────────────────────┘  │ ext_marks    │
                                  │ total_marks  │
                                  │ grade        │
                                  │ grade_point  │
                                  │ semester     │
                                  │ academic_yr  │
                                  │ is_published │
                                  │ published_dt │
                                  └──────────────┘
                                  │
                                  ▼
                        ┌──────────────────┐
                        │RECHECK_REQUESTS  │
                        ├──────────────────┤
                        │ recheck_id (PK)  │
                        │ student_id (FK)  │
                        │ mark_id (FK)     │
                        │ subject_id (FK)  │
                        │ teacher_id (FK)  │
                        │ reason           │
                        │ current_marks    │
                        │ rechecked_marks  │
                        │ status           │
                        │ remarks          │
                        │ requested_date   │
                        │ reviewed_date    │
                        │ completed_date   │
                        │ reviewed_by (FK) │
                        └──────────────────┘

┌──────────────────────┐    ┌──────────────────┐
│  NOTIFICATIONS       │    │   AUDIT_LOGS     │
├──────────────────────┤    ├──────────────────┤
│ notification_id (PK) │    │ log_id (PK)      │
│ user_id (FK)         │    │ user_id (FK)     │
│ title                │    │ action_type      │
│ message              │    │ entity_type      │
│ notification_type    │    │ entity_id        │
│ is_read              │    │ old_values       │
│ created_at           │    │ new_values       │
│ read_at              │    │ ip_address       │
└──────────────────────┘    │ user_agent       │
                            │ created_at       │
                            └──────────────────┘
```

## Database Schema Description

### Core Tables

#### 1. **USERS** (Base user authentication)
- Stores login credentials and user roles
- Roles: admin, teacher, student
- All other user types reference this table

#### 2. **STUDENTS**
- Student profile information
- Linked to USERS table via user_id
- Unique roll_no for identification
- Enrollment tracking

#### 3. **TEACHERS**
- Teacher profile and department information
- Linked to USERS table via user_id
- Unique employee_id for identification
- Department and specialization tracking

#### 4. **ADMINS**
- Administrator profile information
- Linked to USERS table via user_id
- Manages system operations and recheck approvals

### Academic Structure

#### 5. **CLASSES**
- Represents semesters/courses
- Identified by class_code
- Tracks semester and academic year

#### 6. **SUBJECTS**
- Course/subject information
- Unique subject_code
- Credit tracking

#### 7. **CLASS_SUBJECT_TEACHER**
- Maps subjects to classes with assigned teachers
- Enables tracking which teacher teaches what subject in which class
- Key relationship table for the system

#### 8. **STUDENT_ENROLLMENT**
- Records student enrollment in classes
- Tracks enrollment status (active, inactive, withdrawn)
- Identifies students in each class per semester

### Academic Records

#### 9. **MARKS**
- Student marks/grades for each subject
- Internal and external mark components
- Calculated total marks, grade, and GPA
- Published flag for marks release
- One record per student-subject-semester combination

#### 10. **RECHECK_REQUESTS**
- Student requests to recheck their marks
- Status tracking (pending, approved, rejected, completed)
- Links to marks, subject, teacher
- Admin review tracking

### Support Tables

#### 11. **NOTIFICATIONS**
- System notifications to users
- Types: recheck_status, marks_published, system_alert, general
- Read status tracking

#### 12. **AUDIT_LOGS**
- Complete audit trail of all changes
- Tracks who made what changes and when
- Stores old and new values for changes
- Security and compliance tracking

## Key Relationships

### One-to-Many Relationships
- User → Student (1 user : 1 student)
- User → Teacher (1 user : 1 teacher)
- User → Admin (1 user : 1 admin)
- User → Notification (1 user : many notifications)
- Class → Student Enrollment (1 class : many enrollments)
- Class → Class Subject Teacher (1 class : many assignments)
- Subject → Class Subject Teacher (1 subject : many assignments)
- Subject → Marks (1 subject : many marks)
- Teacher → Class Subject Teacher (1 teacher : many assignments)
- Teacher → Marks (1 teacher : many marks)
- Student → Student Enrollment (1 student : many enrollments)
- Student → Marks (1 student : many marks)
- Student → Recheck Requests (1 student : many requests)
- Marks → Recheck Requests (1 mark : many recheck requests)

## Constraints and Validations

### Unique Constraints
- USERS.email - Ensure unique email addresses
- STUDENTS.roll_no - Unique student identification
- STUDENTS.user_id - One user per student
- TEACHERS.employee_id - Unique employee identification
- TEACHERS.user_id - One user per teacher
- SUBJECTS.subject_code - Unique subject identification
- CLASSES.class_code - Unique class identification
- MARKS (student_id, subject_id, class_id, semester, academic_year)
- STUDENT_ENROLLMENT (student_id, class_id, semester, academic_year)

### Foreign Key Constraints
- ON DELETE CASCADE for most relationships
- ON DELETE SET NULL for audit log user references
- Maintains referential integrity

## Indexes for Performance

Indexes created on:
- User email and role
- Student roll number and user_id
- Teacher user_id and employee_id
- Marks by student, subject, teacher, semester/year
- Recheck requests by student, status, mark
- Student enrollment by student and class
- Notifications by user and read status
- Audit logs by user and timestamp

## Database Normalization

The database follows **3NF (Third Normal Form)**:
- No partial dependencies
- No transitive dependencies
- All non-key attributes are fully functional dependent on primary keys

## Typical Workflow

1. **User Registration**
   - Create USERS record
   - Create STUDENTS/TEACHERS/ADMINS record linked to USER

2. **Class Setup**
   - Create CLASSES
   - Create SUBJECTS
   - Map SUBJECTS to CLASSES with TEACHERS via CLASS_SUBJECT_TEACHER

3. **Student Enrollment**
   - Create STUDENT_ENROLLMENT records for each student in each class

4. **Marks Entry**
   - Teachers enter MARKS for students
   - Marks are published when ready

5. **Recheck Process**
   - Students request RECHECK_REQUESTS
   - Admin reviews and updates status
   - May update MARKS if rechecked

6. **Notifications**
   - System creates NOTIFICATIONS for important events
   - Users can view and mark as read

## Sample Queries

```sql
-- Get all marks for a student in a semester
SELECT m.*, s.subject_name, t.first_name, t.last_name
FROM marks m
JOIN subjects s ON m.subject_id = s.subject_id
JOIN teachers t ON m.teacher_id = t.teacher_id
WHERE m.student_id = ? AND m.semester = ? AND m.academic_year = ?
ORDER BY s.subject_name;

-- Get class composition
SELECT st.*, s.roll_no, s.first_name, s.last_name
FROM student_enrollment st
JOIN students s ON st.student_id = s.student_id
WHERE st.class_id = ? AND st.semester = ? AND st.academic_year = ?;

-- Get pending recheck requests for a teacher
SELECT rr.*, st.first_name, st.last_name, st.roll_no, s.subject_name
FROM recheck_requests rr
JOIN students st ON rr.student_id = st.student_id
JOIN subjects s ON rr.subject_id = s.subject_id
WHERE rr.teacher_id = ? AND rr.status = 'pending'
ORDER BY rr.requested_date DESC;

-- Get student result card
SELECT m.semester, m.academic_year, 
       s.subject_code, s.subject_name, s.credits,
       m.internal_marks, m.external_marks, m.total_marks, m.grade, m.grade_point
FROM marks m
JOIN subjects s ON m.subject_id = s.subject_id
WHERE m.student_id = ? AND m.is_published = TRUE
ORDER BY m.semester DESC, s.subject_name;
```
