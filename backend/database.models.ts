/**
 * Database Models for Student Result Management System
 * These interfaces represent the database tables
 */

// User Model
export interface User {
  user_id: number;
  email: string;
  password_hash: string;
  role: 'admin' | 'teacher' | 'student';
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

// Student Model
export interface Student {
  student_id: number;
  user_id: number;
  roll_no: string;
  first_name: string;
  last_name: string;
  date_of_birth?: Date;
  contact_number?: string;
  address?: string;
  enrollment_date: Date;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

// Teacher Model
export interface Teacher {
  teacher_id: number;
  user_id: number;
  employee_id: string;
  first_name: string;
  last_name: string;
  contact_number?: string;
  department?: string;
  specialization?: string;
  joining_date: Date;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

// Admin Model
export interface Admin {
  admin_id: number;
  user_id: number;
  first_name: string;
  last_name: string;
  contact_number?: string;
  appointment_date: Date;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

// Subject Model
export interface Subject {
  subject_id: number;
  subject_code: string;
  subject_name: string;
  subject_description?: string;
  credits?: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

// Class/Course Model
export interface Class {
  class_id: number;
  class_name: string;
  class_code: string;
  semester: number;
  academic_year: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

// Class-Subject-Teacher Mapping
export interface ClassSubjectTeacher {
  assignment_id: number;
  class_id: number;
  subject_id: number;
  teacher_id: number;
  semester: number;
  academic_year: string;
  created_at: Date;
  updated_at: Date;
}

// Student Enrollment Model
export interface StudentEnrollment {
  enrollment_id: number;
  student_id: number;
  class_id: number;
  semester: number;
  academic_year: string;
  enrollment_status: 'active' | 'inactive' | 'withdrawn';
  created_at: Date;
  updated_at: Date;
}

// Marks Model
export interface Marks {
  mark_id: number;
  student_id: number;
  subject_id: number;
  class_id: number;
  teacher_id: number;
  internal_marks?: number;
  external_marks?: number;
  total_marks?: number;
  grade?: string;
  grade_point?: number;
  semester: number;
  academic_year: string;
  is_published: boolean;
  published_date?: Date;
  created_at: Date;
  updated_at: Date;
}

// Recheck Request Model
export interface RecheckRequest {
  recheck_id: number;
  student_id: number;
  mark_id: number;
  subject_id: number;
  teacher_id: number;
  reason: string;
  current_marks?: number;
  rechecked_marks?: number;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  remarks?: string;
  requested_date: Date;
  reviewed_date?: Date;
  completed_date?: Date;
  reviewed_by?: number;
  created_at: Date;
  updated_at: Date;
}

// Notification Model
export interface Notification {
  notification_id: number;
  user_id: number;
  title: string;
  message: string;
  notification_type: 'recheck_status' | 'marks_published' | 'system_alert' | 'general';
  is_read: boolean;
  created_at: Date;
  read_at?: Date;
}

// Audit Log Model
export interface AuditLog {
  log_id: number;
  user_id?: number;
  action_type: string;
  entity_type: string;
  entity_id?: number;
  old_values?: Record<string, any>;
  new_values?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  created_at: Date;
}

// View Models / DTOs for API responses
export interface StudentProfile extends Student {
  user?: User;
}

export interface TeacherProfile extends Teacher {
  user?: User;
}

export interface MarksDetail extends Marks {
  student?: Student;
  subject?: Subject;
  teacher?: Teacher;
}

export interface RecheckRequestDetail extends RecheckRequest {
  student?: Student;
  mark?: Marks;
  subject?: Subject;
  teacher?: Teacher;
  reviewer?: Admin;
}

export interface StudentResult {
  student_id: number;
  roll_no: string;
  student_name: string;
  semester: number;
  academic_year: string;
  subjects: Array<{
    subject_id: number;
    subject_name: string;
    subject_code: string;
    internal_marks?: number;
    external_marks?: number;
    total_marks?: number;
    grade?: string;
    grade_point?: number;
  }>;
  gpa?: number;
  total_credits?: number;
}

export interface GradeDistribution {
  semester: number;
  academic_year: string;
  grade_distribution: {
    'A': number;
    'B+': number;
    'B': number;
    'B-': number;
    'C': number;
    'F': number;
  };
  average_gpa: number;
}
