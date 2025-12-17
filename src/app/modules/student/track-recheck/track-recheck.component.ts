import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { StudentService } from '../../../core/services/student.service';
import { RecheckService } from '../../../core/services/recheck.service';
import { AuthService } from '../../../core/services/auth.service';
import { Student } from '../../../core/models/student.model';

@Component({
  selector: 'app-track-recheck',
  templateUrl: './track-recheck.component.html',
  styleUrls: ['./track-recheck.component.css']
})
export class TrackRecheckComponent implements OnInit {

  student: Student | null = null;
  columns: string[] = ['subject', 'date', 'status'];

  requests: any[] = [];

  // Statistics
  totalRequests: number = 0;
  pendingRequests: number = 0;
  completedRequests: number = 0;
  inProgressRequests: number = 0;

  constructor(
    private studentService: StudentService,
    private recheckService: RecheckService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadStudentRecheckRequests();
  }

  /**
   * Load current student's recheck requests
   */
  loadStudentRecheckRequests(): void {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser || currentUser.role !== 'STUDENT') {
      this.router.navigate(['/login']);
      return;
    }

    // Get student by email
    const students = this.studentService.getAllStudentsSync();
    this.student = students.find(s => s.email === currentUser.email) || null;

    if (this.student) {
      console.log('✓ Student loaded for recheck tracking:', this.student);

      // Load recheck requests for this student
      this.recheckService.getAllRechecks().subscribe({
        next: (allRequests: any) => {
          const requestsArray = Array.isArray(allRequests) ? allRequests : [];
          this.requests = requestsArray.filter(r => r.studentId === this.student?.studentId) || [];
          this.calculateStatistics();
          console.log('✓ Recheck requests loaded:', this.requests);
        },
        error: (err: any) => {
          console.error('Error loading recheck requests:', err);
          this.requests = [];
          this.calculateStatistics();
        }
      });
    } else {
      console.error('✗ Student not found for email:', currentUser.email);
      this.router.navigate(['/login']);
    }
  }

  calculateStatistics(): void {
    this.totalRequests = this.requests.length;
    this.pendingRequests = this.getRequestsByStatus('Pending').length;
    this.completedRequests = this.getRequestsByStatus('Completed').length;
    this.inProgressRequests = this.getRequestsByStatus('In Progress').length;
  }

  getRequestsByStatus(status: string): any[] {
    return this.requests.filter(r => r.status === status);
  }

  getStatusClass(status: string): string {
    switch(status) {
      case 'Pending': return 'pending';
      case 'Completed': return 'completed';
      case 'In Progress': return 'in-progress';
      case 'Rejected': return 'rejected';
      default: return '';
    }
  }
}