import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { StudentService } from '../../../core/services/student.service';
import { SubjectService } from '../../../core/services/subject.service';
import { AuthService } from '../../../core/services/auth.service';
import { Student } from '../../../core/models/student.model';

@Component({
  selector: 'app-request-recheck',
  templateUrl: './request-recheck.component.html',
  styleUrls: ['./request-recheck.component.css']
})
export class RequestRecheckComponent implements OnInit {

  student: Student | null = null;
  subjects: string[] = [];
  
  recheck = {
    rollNo: '',
    subject: '',
    reason: ''
  };

  constructor(
    private studentService: StudentService,
    private subjectService: SubjectService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadStudentAndSubjects();
  }

  /**
   * Load current student and available subjects
   */
  loadStudentAndSubjects(): void {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser || currentUser.role !== 'STUDENT') {
      this.router.navigate(['/login']);
      return;
    }

    // Get student by email
    const students = this.studentService.getAllStudentsSync();
    this.student = students.find(s => s.email === currentUser.email) || null;

    if (this.student) {
      this.recheck.rollNo = this.student.rollNo;
      console.log('✓ Student loaded for recheck:', this.student);
    } else {
      console.error('✗ Student not found for email:', currentUser.email);
      alert('Student profile not found. Please login again.');
      this.router.navigate(['/login']);
      return;
    }

    // Load subjects
    this.subjectService.getAllSubjects().subscribe({
      next: (subjects: any) => {
        const subjectsArray = Array.isArray(subjects) ? subjects : [];
        this.subjects = subjectsArray.map((s: any) => s.subjectName || s);
        console.log('✓ Subjects loaded:', this.subjects);
      },
      error: (err) => {
        console.error('Error loading subjects:', err);
        this.subjects = ['Mathematics', 'Science', 'English', 'History', 'Geography'];
      }
    });
  }

  submitRecheck() {
    if (!this.recheck.rollNo) {
      alert('Student information missing. Please reload the page.');
      return;
    }
    if (!this.recheck.subject) {
      alert('Please select a subject');
      return;
    }
    if (!this.recheck.reason || this.recheck.reason.trim().length === 0) {
      alert('Please provide a reason for recheck');
      return;
    }

    // Submit recheck request
    const recheckRequest = {
      studentId: this.student?.studentId,
      rollNo: this.recheck.rollNo,
      subject: this.recheck.subject,
      reason: this.recheck.reason,
      status: 'pending',
      requestDate: new Date().toISOString()
    };

    console.log('Submitting recheck request:', recheckRequest);
    alert(`✓ Recheck request for ${this.recheck.subject} submitted successfully!`);
    this.recheck = { rollNo: this.student?.rollNo || '', subject: '', reason: '' };
  }
}