import { Injectable } from '@angular/core';
import { StudentService } from './student.service';
import { TeacherService } from './teacher.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly ADMIN_EMAIL = 'admin@gmail.com';
  private readonly PASSWORD = '123456';

  constructor(
    private studentService: StudentService,
    private teacherService: TeacherService
  ) {}

  /**
   * Authenticate user with email and password
   * @param email User email
   * @param password User password
   * @returns User role (ADMIN, TEACHER, STUDENT) or empty string if invalid
   */
  fakeLogin(email: string, password: string): string {
    // Validate password
    if (password !== this.PASSWORD) {
      return '';
    }

    // Check if admin
    if (email === this.ADMIN_EMAIL) {
      return 'ADMIN';
    }

    // Check if teacher - match against teacher emails
    const teachers = this.teacherService.getAllTeachersSync();
    if (teachers.some(t => t.email === email)) {
      return 'TEACHER';
    }

    // Check if student - match against student emails
    const students = this.studentService.getAllStudentsSync();
    if (students.some(s => s.email === email)) {
      return 'STUDENT';
    }

    return '';
  }

  /**
   * Store user session info in localStorage
   */
  saveUserSession(email: string, role: string): void {
    localStorage.setItem('currentUser', JSON.stringify({
      email,
      role,
      loginTime: new Date().toISOString()
    }));
  }

  /**
   * Get current user session
   */
  getCurrentUser(): any {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
  }

  /**
   * Logout user
   */
  logout(): void {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('teacherToken');
    localStorage.clear();
  }
}
