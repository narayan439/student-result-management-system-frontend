import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { StudentService } from '../../core/services/student.service';
import { AuthService } from '../../core/services/auth.service';
import { Student } from '../../core/models/student.model';

@Component({
  selector: 'app-student-dashboard',
  templateUrl: './student-dashboard.component.html',
  styleUrls: ['./student-dashboard.component.css']
})
export class StudentDashboardComponent implements OnInit {

  mobileMenuOpen = false;
  currentStudent: Student | null = null;
  studentName: string = 'Student';
  studentClass: string = '';
  studentRoll: string = '';

  constructor(
    private router: Router,
    private studentService: StudentService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadCurrentStudent();
  }

  /**
   * Load current logged-in student's data
   */
  loadCurrentStudent(): void {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser || currentUser.role !== 'STUDENT') {
      this.router.navigate(['/login']);
      return;
    }

    // Get student by email
    const students = this.studentService.getAllStudentsSync();
    this.currentStudent = students.find(s => s.email === currentUser.email) || null;

    if (this.currentStudent) {
      this.studentName = this.currentStudent.name;
      this.studentClass = this.currentStudent.className;
      this.studentRoll = this.currentStudent.rollNo;
      console.log('✓ Student loaded:', this.currentStudent);
    } else {
      console.error('✗ Student not found for email:', currentUser.email);
    }
  }

  // Toggle mobile menu
  toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  // Close mobile menu
  closeMobileMenu() {
    this.mobileMenuOpen = false;
  }

  // Logout function
  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  // Navigation methods
  goToViewMarks() {
    this.router.navigate(['/student/view-marks']);
    this.closeMobileMenu();
  }

  goToRequestRecheck() {
    this.router.navigate(['/student/request-recheck']);
    this.closeMobileMenu();
  }

  goToTrackRecheck() {
    this.router.navigate(['/student/track-recheck']);
    this.closeMobileMenu();
  }

  goToProfile() {
    this.router.navigate(['/student/profile']);
    this.closeMobileMenu();
  }
}