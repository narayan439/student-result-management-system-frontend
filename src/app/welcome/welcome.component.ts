import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { MarksService } from '../core/services/marks.service';
import { StudentService } from '../core/services/student.service';
import { SubjectService } from '../core/services/subject.service';

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

  // Result Bot
  botOpen = false;
  botLoading = false;
  botInput = '';
  botStep: 'roll' | 'dob' = 'roll';
  botStudent: any = null;
  botRollNo = '';
  botDob = '';
  botMessages: Array<{ from: 'bot' | 'user'; text: string }> = [];

  constructor(
    private router: Router,
    private studentService: StudentService,
    private marksService: MarksService,
    private subjectService: SubjectService
  ) {}

  toggleBot(): void {
    this.botOpen = !this.botOpen;

    if (this.botOpen && this.botMessages.length === 0) {
      this.resetBot();
    }
  }

  resetBot(): void {
    this.botLoading = false;
    this.botInput = '';
    this.botStep = 'roll';
    this.botStudent = null;
    this.botRollNo = '';
    this.botDob = '';
    this.botMessages = [
      { from: 'bot', text: 'Hi! Enter your Roll Number to check result.' }
    ];
  }

  sendBot(): void {
    const rawInput = (this.botInput || '').trim();
    if (!rawInput || this.botLoading) return;

    const inputForStep = this.botStep === 'dob' ? this.formatDobForTyping(rawInput) : rawInput;

    this.botMessages.push({ from: 'user', text: inputForStep });
    this.botInput = '';

    if (this.botStep === 'roll') {
      this.handleBotRoll(inputForStep);
      return;
    }

    if (this.botStep === 'dob') {
      this.handleBotDob(inputForStep);
      return;
    }
  }

  private handleBotRoll(rollNo: string): void {
    this.botLoading = true;
    this.botRollNo = rollNo;
    this.botStudent = null;

    const lookup = (students: any[]) => {
      const student = (students || []).find((s: any) =>
        s?.rollNo && String(s.rollNo).toLowerCase() === rollNo.toLowerCase()
      );

      if (!student) {
        this.botLoading = false;
        this.botMessages.push({ from: 'bot', text: `Roll Number "${rollNo}" not found. Please re-check and try again.` });
        this.botMessages.push({ from: 'bot', text: 'Enter your Roll Number:' });
        return;
      }

      this.botStudent = student;
      this.botLoading = false;
      this.botStep = 'dob';
      this.botMessages.push({ from: 'bot', text: `Student Name: ${student.name}` });
      this.botMessages.push({ from: 'bot', text: 'Now enter your Date of Birth (DD-MM-YYYY).' });
    };

    this.studentService.getAllStudents().subscribe({
      next: (students: any) => {
        lookup(students);
      },
      error: () => {
        const cached = this.studentService.getAllStudentsSync();
        lookup(cached);
      }
    });
  }

  private handleBotDob(dobInput: string): void {
    if (!this.botStudent) {
      this.botMessages.push({ from: 'bot', text: 'Please enter your Roll Number first.' });
      this.botStep = 'roll';
      return;
    }

    const normalizedInput = this.normalizeDobToYmd(dobInput);
    const normalizedStudent = this.normalizeDobToYmd(this.botStudent?.dob);

    if (!normalizedInput) {
      this.botMessages.push({ from: 'bot', text: 'DOB format is incorrect. Please enter DOB in DD-MM-YYYY (Example: 27-02-2004).' });
      return;
    }

    if (!normalizedStudent) {
      this.botMessages.push({ from: 'bot', text: 'DOB not available in student record. Please contact admin.' });
      this.botStep = 'roll';
      return;
    }

    if (normalizedInput !== normalizedStudent) {
      this.botMessages.push({ from: 'bot', text: 'DOB incorrect. Please enter correct DOB (DD-MM-YYYY).' });
      return;
    }

    // DOB verified -> show marks directly (no confirmation step)
    this.botDob = normalizedInput;
    this.fetchAndShowBotResult();
  }

  private fetchAndShowBotResult(): void {
    if (!this.botStudent) {
      this.resetBot();
      return;
    }

    const student = this.botStudent;
    this.botLoading = true;
    this.botMessages.push({ from: 'bot', text: 'Fetching your marks...' });

    const classMatch = String(student?.className || '').match(/Class\s(\d+)/);
    const classNumber = classMatch ? parseInt(classMatch[1], 10) : 1;

    forkJoin({
      marks: this.marksService.getMarksByStudentId(student.studentId),
      subjects: this.subjectService.getSubjectsByClass(classNumber)
    }).subscribe({
      next: (data) => {
        const result = this.buildBotResult(student, data.marks, data.subjects);
        this.emitBotResultMessages(result);

        // Reset for next query
        this.botLoading = false;
        this.botStep = 'roll';
        this.botStudent = null;
        this.botRollNo = '';
        this.botDob = '';
        this.botMessages.push({ from: 'bot', text: 'You can check another student. Enter Roll Number:' });
      },
      error: () => {
        this.botLoading = false;
        this.botStep = 'roll';
        this.botStudent = null;
        this.botRollNo = '';
        this.botDob = '';
        this.botMessages.push({ from: 'bot', text: 'Unable to fetch marks right now. Please try again later.' });
        this.botMessages.push({ from: 'bot', text: 'Enter Roll Number:' });
      }
    });
  }

  private buildBotResult(student: any, marksResponse: any, subjectsResponse: any): any {
    // Extract marks array from response (same shapes as ViewResultComponent)
    let marksArray: any[] = [];
    if (Array.isArray(marksResponse)) {
      marksArray = marksResponse;
    } else if (marksResponse?.data && Array.isArray(marksResponse.data)) {
      marksArray = marksResponse.data;
    }

    // Extract subjects array
    let classSubjects: any[] = [];
    if (Array.isArray(subjectsResponse)) {
      classSubjects = subjectsResponse;
    } else if (subjectsResponse?.data && Array.isArray(subjectsResponse.data)) {
      classSubjects = subjectsResponse.data;
    }

    // Validate and extract marks
    let validMarks = (marksArray || []).filter((m: any) => {
      const hasMarks = m?.marksObtained !== undefined && m?.marksObtained !== null;
      const hasSubject = m?.subject || m?.subjectName;
      return hasMarks && hasSubject;
    });

    // If class subjects exist, filter + dedupe + sort using subject list order
    if (classSubjects && classSubjects.length > 0) {
      const allowedSubjects = new Set(
        classSubjects
          .map((s: any) => (s?.subjectName || s?.name || '').toString().trim().toLowerCase())
          .filter((s: string) => !!s)
      );

      const subjectOrder = new Map<string, number>();
      classSubjects.forEach((s: any, idx: number) => {
        const key = (s?.subjectName || s?.name || '').toString().trim().toLowerCase();
        if (key) subjectOrder.set(key, idx);
      });

      if (allowedSubjects.size > 0) {
        const beforeCount = validMarks.length;
        const filteredBySubjects = validMarks.filter((m: any) => {
          const subjectName = (m?.subject || m?.subjectName || '').toString().trim().toLowerCase();
          return allowedSubjects.has(subjectName);
        });

        // If filtering removes everything but we do have marks, keep unfiltered marks
        if (!(filteredBySubjects.length === 0 && beforeCount > 0)) {
          validMarks = filteredBySubjects;
        }

        // De-duplicate by subject (keep the latest/highest marksId)
        const bySubject = new Map<string, any>();
        for (const m of validMarks) {
          const key = (m?.subject || m?.subjectName || '').toString().trim().toLowerCase();
          if (!key) continue;
          const existing = bySubject.get(key);
          const existingId = Number(existing?.marksId) || -1;
          const currentId = Number(m?.marksId) || -1;
          if (!existing || currentId >= existingId) {
            bySubject.set(key, m);
          }
        }
        validMarks = Array.from(bySubject.values());

        if (subjectOrder.size > 0) {
          validMarks.sort((a: any, b: any) => {
            const ak = (a?.subject || a?.subjectName || '').toString().trim().toLowerCase();
            const bk = (b?.subject || b?.subjectName || '').toString().trim().toLowerCase();
            const ai = subjectOrder.has(ak) ? (subjectOrder.get(ak) as number) : 9999;
            const bi = subjectOrder.has(bk) ? (subjectOrder.get(bk) as number) : 9999;
            return ai - bi;
          });
        }
      }
    }

    const passMark = 33;

    // Subject code mapping (by subject name)
    const subjectCodeByName = new Map<string, string>();
    for (const s of classSubjects || []) {
      const nameKey = (s?.subjectName || s?.name || '').toString().trim().toLowerCase();
      const code = (s?.code || s?.subjectCode || '').toString().trim();
      if (nameKey && code) {
        subjectCodeByName.set(nameKey, code);
      }
    }

    const rows = validMarks.map((m: any) => {
      const subjectName = (m?.subject || m?.subjectName || 'Unknown').toString();
      const key = subjectName.trim().toLowerCase();
      const subjectCode = subjectCodeByName.get(key)
        || (m?.code || m?.subjectCode || '').toString().trim()
        || '-';
      return {
        subjectCode,
        subject: subjectName,
        marksObtained: parseInt(m?.marksObtained, 10) || 0,
        maxMarks: parseInt(m?.maxMarks, 10) || 100
      };
    });

    const totalMarks = rows.reduce((sum: number, r: any) => sum + (Number(r?.marksObtained) || 0), 0);
    const maxTotal = rows.reduce((sum: number, r: any) => sum + (Number(r?.maxMarks) || 0), 0);
    const percentage = maxTotal > 0 ? ((totalMarks / maxTotal) * 100).toFixed(2) : '0.00';

    let status = 'PENDING';
    if (rows.length > 0) {
      const hasAnyFailedSubject = rows.some((r: any) => (Number(r?.marksObtained) || 0) < passMark);
      status = hasAnyFailedSubject ? 'FAIL' : 'PASS';
    }

    const failedSubjects = rows
      .filter((r: any) => (Number(r?.marksObtained) || 0) < passMark)
      .map((r: any) => r.subject);

    return {
      name: student?.name,
      rollNo: student?.rollNo,
      className: student?.className,
      rows,
      total: totalMarks,
      maxTotal,
      percentage,
      status,
      failedSubjects,
      hasMarks: rows.length > 0
    };
  }

  private emitBotResultMessages(result: any): void {
    if (!result) {
      this.botMessages.push({ from: 'bot', text: 'No result data available.' });
      return;
    }

    this.botMessages.push({
      from: 'bot',
      text: `Result for ${result.name} (Roll: ${result.rollNo})\nClass: ${result.className}`
    });

    if (!result.hasMarks) {
      this.botMessages.push({ from: 'bot', text: 'Marks not available yet (PENDING).' });
      return;
    }

    for (const r of result.rows) {
      this.botMessages.push({
        from: 'bot',
        text: `${r.subject} = ${r.marksObtained}/${r.maxMarks}`
      });
    }

    const failedList = Array.isArray(result.failedSubjects) ? result.failedSubjects.filter(Boolean) : [];
    const failedText = result.status === 'FAIL' && failedList.length > 0
      ? `\nFailed Subject = ${failedList.join(' , ')}`
      : '';

    this.botMessages.push({
      from: 'bot',
      text: `TOTAL: ${result.total}/${result.maxTotal}\nPERCENTAGE: ${result.percentage}%\nResult: ${result.status}${failedText}`
    });
  }

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