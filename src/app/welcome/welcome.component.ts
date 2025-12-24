import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { StudentService } from '../core/services/student.service';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.css']
})
export class WelcomeComponent {

  rollNo: string = '';
  dob: string = '';
  rollNoError: string = '';
  dobError: string = '';
  isSearching: boolean = false;
  foundStudent: any = null;

  constructor(
    private router: Router,
    private studentService: StudentService
  ) {}

  /**
   * Auto-format DOB input so mobile users can type digits.
   * Example: 27022002 -> 27-02-2002
   */
  onDobChange(value: string): void {
    this.dob = this.formatDobForTyping(value);
  }

  hasValidDobInput(): boolean {
    return this.normalizeDobToYmd(this.dob) !== null;
  }

  private formatDobForTyping(value: string): string {
    const digits = String(value || '').replace(/\D/g, '').slice(0, 8);
    if (digits.length <= 2) {
      return digits;
    }

    const dd = digits.slice(0, 2);
    if (digits.length <= 4) {
      const mm = digits.slice(2);
      return `${dd}-${mm}`;
    }

    const mm = digits.slice(2, 4);
    const yyyy = digits.slice(4);
    return `${dd}-${mm}-${yyyy}`;
  }

  /**
   * Normalize DOB to canonical YYYY-MM-DD for comparison.
   * Accepts: YYYY-MM-DD, DD/MM/YYYY, DD-MM-YYYY, or 8 digits (DDMMYYYY).
   */
  private normalizeDobToYmd(dob: string): string | null {
    if (!dob) {
      return null;
    }

    const raw = String(dob).trim();
    if (!raw) {
      return null;
    }

    // YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
      const [yStr, mStr, dStr] = raw.split('-');
      const y = parseInt(yStr, 10);
      const m = parseInt(mStr, 10);
      const d = parseInt(dStr, 10);
      if (!this.isValidYmdParts(y, m, d)) {
        return null;
      }
      return `${yStr}-${mStr}-${dStr}`;
    }

    // Digits only (DDMMYYYY)
    const digits = raw.replace(/\D/g, '');
    if (digits.length === 8) {
      const dStr = digits.slice(0, 2);
      const mStr = digits.slice(2, 4);
      const yStr = digits.slice(4, 8);
      const y = parseInt(yStr, 10);
      const m = parseInt(mStr, 10);
      const d = parseInt(dStr, 10);
      if (!this.isValidYmdParts(y, m, d)) {
        return null;
      }
      return `${yStr}-${mStr}-${dStr}`;
    }

    // DD/MM/YYYY
    if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(raw)) {
      const [dStrRaw, mStrRaw, yStr] = raw.split('/');
      const d = parseInt(dStrRaw, 10);
      const m = parseInt(mStrRaw, 10);
      const y = parseInt(yStr, 10);
      if (!this.isValidYmdParts(y, m, d)) {
        return null;
      }
      const dd = String(d).padStart(2, '0');
      const mm = String(m).padStart(2, '0');
      return `${yStr}-${mm}-${dd}`;
    }

    // DD-MM-YYYY
    if (/^\d{1,2}-\d{1,2}-\d{4}$/.test(raw)) {
      const [dStrRaw, mStrRaw, yStr] = raw.split('-');
      const d = parseInt(dStrRaw, 10);
      const m = parseInt(mStrRaw, 10);
      const y = parseInt(yStr, 10);
      if (!this.isValidYmdParts(y, m, d)) {
        return null;
      }
      const dd = String(d).padStart(2, '0');
      const mm = String(m).padStart(2, '0');
      return `${yStr}-${mm}-${dd}`;
    }

    return null;
  }

  private isValidYmdParts(y: number, m: number, d: number): boolean {
    if (!Number.isFinite(y) || !Number.isFinite(m) || !Number.isFinite(d)) {
      return false;
    }
    if (y < 1900 || y > 2100) return false;
    if (m < 1 || m > 12) return false;
    if (d < 1 || d > 31) return false;
    return true;
  }

  /**
   * Validate DOB format (DD/MM/YYYY from text input or YYYY-MM-DD from date picker)
   */
  private isValidDobFormat(dob: string): boolean {
    return this.normalizeDobToYmd(dob) !== null;
  }

  /**
   * Search student by roll number and DOB
   */
  viewResult(): void {
    this.rollNoError = '';
    this.dobError = '';
    this.foundStudent = null;

    // Validate Roll Number
    if (!this.rollNo.trim()) {
      this.rollNoError = 'Please enter Roll Number';
      return;
    }

    // Validate DOB
    if (!this.dob) {
      this.dobError = 'Please enter Date of Birth';
      return;
    }

    // Validate DOB format
    if (!this.isValidDobFormat(this.dob)) {
      this.dobError = 'Please enter valid Date of Birth';
      return;
    }

    this.isSearching = true;

    console.log('🔍 Searching for student with roll number:', this.rollNo);
    
    // Use getAllStudents() endpoint to fetch all students and search locally
    // This avoids CORS issues with individual lookup endpoints
    this.studentService.getAllStudents().subscribe({
      next: (students) => {
        console.log('✓ Students loaded from backend:', students.length, 'students');
        
        // Search for the student in the fetched list
        const studentWithRoll = students.find(s => 
          s.rollNo && s.rollNo.toLowerCase() === this.rollNo.toLowerCase()
        );
        
        if (!studentWithRoll) {
          this.isSearching = false;
          this.rollNoError = `Roll Number "${this.rollNo}" not found in our system`;
          console.error('❌ Student not found with roll number:', this.rollNo);
          console.log('Available roll numbers:', students.map(s => s.rollNo).join(', '));
          return;
        }
        
        console.log('✓ Student found:', studentWithRoll);
        this.validateAndNavigate(studentWithRoll);
      },
      error: (err) => {
        console.error('❌ Failed to load students from backend:', err);
        console.log('Falling back to local cached data...');
        
        // Fallback: Search in local cached students
        const students = this.studentService.getAllStudentsSync();
        console.log('Total students loaded from cache:', students.length);
        console.log('Available roll numbers in cache:', students.map(s => s.rollNo).join(', '));
        
        const studentWithRoll = students.find(s => 
          s.rollNo && s.rollNo.toLowerCase() === this.rollNo.toLowerCase()
        );

        if (!studentWithRoll) {
          this.isSearching = false;
          this.rollNoError = `Roll Number "${this.rollNo}" not found in our system. Available: ${students.map(s => s.rollNo).join(', ')}`;
          console.error('❌ Student not found with roll number:', this.rollNo);
          return;
        }

        console.log('✓ Student found in cache:', studentWithRoll);
        this.validateAndNavigate(studentWithRoll);
      }
    });
  }

  /**
   * Validate DOB and navigate to view result
   */
  private validateAndNavigate(studentWithRoll: any) {
    console.log('Student to validate:', studentWithRoll);

    // Check if DOB matches - normalize both to YYYY-MM-DD
    const inputDobNormalized = this.normalizeDobToYmd(this.dob);
    const studentDobNormalized = this.normalizeDobToYmd(studentWithRoll.dob);

    if (!inputDobNormalized) {
      this.isSearching = false;
      this.dobError = 'Please enter valid Date of Birth';
      return;
    }

    if (!studentDobNormalized) {
      this.isSearching = false;
      this.dobError = 'DOB not available in student record';
      return;
    }

    console.log('Comparing DOB - Input (YYYY-MM-DD):', inputDobNormalized, 'Student DOB (YYYY-MM-DD):', studentDobNormalized);

    if (inputDobNormalized !== studentDobNormalized) {
      this.isSearching = false;
      this.dobError = 'Date of Birth does not match our records';
      console.error('DOB mismatch - Expected:', studentDobNormalized, 'Got:', inputDobNormalized);
      return;
    }

    // Both match - student found!
    this.isSearching = false;
    this.foundStudent = studentWithRoll;
    console.log('✓ Student found:', studentWithRoll);
    
    // Navigate to view result with student email
    console.log('Navigating to:', ['/student/view-result', studentWithRoll.rollNo, studentWithRoll.email]);
    this.router.navigate(['/student/view-result', studentWithRoll.rollNo, studentWithRoll.email]);
  }

  /**
   * Clear search form
   */
  clearForm(): void {
    this.rollNo = '';
    this.dob = '';
    this.rollNoError = '';
    this.dobError = '';
    this.foundStudent = null;
  }
}