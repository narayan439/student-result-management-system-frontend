# View Result Feature - Setup Guide

## Overview
The View Result feature allows students to view their academic results (marksheets) with comprehensive information including marks, grades, GPA, and various export options (PDF, Print, Share).

## Current State
The component is already partially implemented with:
- ✅ Result display with student info
- ✅ Subject-wise marks table
- ✅ GPA calculation
- ✅ QR code verification
- ✅ PDF download functionality
- ✅ Print functionality
- ✅ Recheck request routing
- ✅ Result sharing capability

## Complete Setup Steps

### Step 1: Install Required Dependencies
```bash
npm install jspdf html2canvas angularx-qrcode
```

**Versions to use:**
```json
{
  "jspdf": "^2.5.1",
  "html2canvas": "^1.4.1",
  "angularx-qrcode": "^16.0.0"
}
```

### Step 2: Update Student Module (Already Done)
The `student.module.ts` already includes:
- QRCodeModule for QR code generation
- Material modules for UI
- ViewResultComponent declaration

### Step 3: Routing Setup
Ensure `student-routing.module.ts` has:

```typescript
import { ViewResultComponent } from './view-result/view-result.component';

const routes: Routes = [
  {
    path: '',
    component: StudentDashboardComponent,
    canActivate: [StudentGuard],
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'marks', component: ViewMarksComponent },
      { path: 'profile', component: ProfileComponent },
      { path: 'request-recheck', component: RequestRecheckComponent },
      { path: 'track-recheck', component: TrackRecheckComponent },
      { path: 'view-result', component: ViewResultComponent }
    ]
  }
];

// OR Public route (no authentication required):
{
  path: 'result/:rollNo/:dob',
  component: ViewResultComponent
}
```

### Step 4: Update Marks Service
Create `marks.service.ts`:

```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MarksService {

  private apiUrl = '/api/marks'; // Update with your backend URL

  constructor(private http: HttpClient) { }

  // Get marks for a student
  getStudentMarks(studentId: number, semester?: number, academicYear?: string): Observable<any> {
    let url = `${this.apiUrl}/student/${studentId}`;
    let params = {};
    if (semester) params['semester'] = semester;
    if (academicYear) params['academicYear'] = academicYear;
    return this.http.get<any>(url, { params });
  }

  // Get marks for current semester
  getCurrentSemesterMarks(studentId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/student/${studentId}/current`);
  }

  // Get marks for specific subject
  getSubjectMarks(studentId: number, subjectId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/student/${studentId}/subject/${subjectId}`);
  }

  // Get all results (with multiple semesters)
  getAllResults(studentId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/student/${studentId}/all`);
  }

  // Get result by roll no and DOB (for public access)
  getResultByRollNo(rollNo: string, dob: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/public/result/${rollNo}/${dob}`);
  }

  // Calculate GPA
  calculateGPA(marks: any[]): number {
    if (!marks || marks.length === 0) return 0;
    const totalGP = marks.reduce((sum, mark) => sum + (mark.grade_point || 0), 0);
    return parseFloat((totalGP / marks.length).toFixed(2));
  }

  // Get grade based on marks
  getGrade(marks: number, gradeScale?: string): string {
    // Default grading scale (10-point)
    if (marks >= 90) return 'A+';
    if (marks >= 80) return 'A';
    if (marks >= 70) return 'B+';
    if (marks >= 60) return 'B';
    if (marks >= 50) return 'C';
    if (marks >= 40) return 'D';
    return 'F';
  }
}
```

### Step 5: Update Student Service
Create `student.service.ts`:

```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StudentService {

  private apiUrl = '/api/students'; // Update with your backend URL

  constructor(private http: HttpClient) { }

  // Get student profile
  getStudentProfile(studentId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${studentId}`);
  }

  // Get student by roll number
  getStudentByRollNo(rollNo: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/roll/${rollNo}`);
  }

  // Get current logged-in student
  getCurrentStudent(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/current`);
  }

  // Get all enrollments
  getEnrollments(studentId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${studentId}/enrollments`);
  }
}
```

### Step 6: Update View Result Component

Update `view-result.component.ts`:

```typescript
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { MarksService } from '../../../core/services/marks.service';
import { StudentService } from '../../../core/services/student.service';

@Component({
  selector: 'app-view-result',
  templateUrl: './view-result.component.html',
  styleUrls: ['./view-result.component.css']
})
export class ViewResultComponent implements OnInit {

  result: any = {
    marks: [],
    subjects: [],
    semesters: []
  };
  qrData: string = '';
  loading: boolean = true;
  error: string = '';
  selectedSemester: number = 1;
  selectedAcademicYear: string = '';
  
  allSemesters: number[] = [1, 2, 3, 4, 5, 6, 7, 8];
  allAcademicYears: string[] = ['2023-2024', '2022-2023', '2021-2022'];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private marksService: MarksService,
    private studentService: StudentService
  ) {}

  ngOnInit() {
    const rollNo = this.route.snapshot.paramMap.get('rollNo');
    const dob = this.route.snapshot.paramMap.get('dob');

    if (rollNo && dob) {
      this.loadResultByRollNo(rollNo, dob);
    } else {
      this.loadCurrentStudentResult();
    }
  }

  // Load result for public access (by roll no)
  loadResultByRollNo(rollNo: string, dob: string): void {
    this.marksService.getResultByRollNo(rollNo, dob).subscribe({
      next: (data) => {
        this.processResultData(data, rollNo, dob);
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Result not found. Please check Roll No and DOB.';
        this.loading = false;
        console.error('Error loading result:', error);
      }
    });
  }

  // Load result for logged-in student
  loadCurrentStudentResult(): void {
    this.studentService.getCurrentStudent().subscribe({
      next: (student) => {
        const currentYear = new Date().getFullYear();
        const academicYear = `${currentYear}-${currentYear + 1}`;
        const semester = this.getCurrentSemester();
        
        this.marksService.getStudentMarks(student.student_id, semester, academicYear)
          .subscribe({
            next: (data) => {
              this.processResultData(data, student.roll_no, '');
              this.loading = false;
            },
            error: (error) => {
              this.error = 'Error loading marks.';
              this.loading = false;
              console.error('Error:', error);
            }
          });
      },
      error: (error) => {
        this.error = 'Error loading student profile.';
        this.loading = false;
        console.error('Error:', error);
      }
    });
  }

  // Process result data
  private processResultData(data: any, rollNo: string, dob: string): void {
    const marks = data.marks || [];
    const totalMarks = marks.reduce((sum: number, mark: any) => sum + (mark.total_marks || 0), 0);
    const maxMarks = marks.length * 100; // Assuming 100 per subject
    const percentage = maxMarks > 0 ? ((totalMarks / maxMarks) * 100).toFixed(2) : '0.00';

    this.result = {
      name: data.name || `${data.first_name} ${data.last_name}`,
      rollNo: rollNo || data.roll_no,
      dob: dob || data.date_of_birth,
      className: data.class_name || data.semester,
      marks: marks,
      subjects: marks.map((m: any) => ({
        subject_name: m.subject_name,
        subject_code: m.subject_code,
        internal_marks: m.internal_marks,
        external_marks: m.external_marks,
        total: m.total_marks,
        grade: m.grade,
        grade_point: m.grade_point
      })),
      total: totalMarks,
      maxMarks: maxMarks,
      percentage: percentage,
      gpa: this.calculateGPA(marks),
      status: parseFloat(percentage) >= 33 ? "PASS" : "FAIL",
      semester: data.semester || this.selectedSemester,
      academicYear: data.academic_year || this.selectedAcademicYear
    };

    this.qrData = `ROLL:${this.result.rollNo},DOB:${this.result.dob},GPA:${this.result.gpa},RESULT:VERIFIED`;
  }

  // Calculate GPA
  calculateGPA(marks: any[]): number {
    if (!marks || marks.length === 0) return 0;
    const totalGP = marks.reduce((sum: number, mark: any) => sum + (mark.grade_point || 0), 0);
    return parseFloat((totalGP / marks.length).toFixed(2));
  }

  // Get current semester
  getCurrentSemester(): number {
    const month = new Date().getMonth();
    // Assume semester changes every 6 months
    // Adjust based on your academic calendar
    return Math.ceil((month + 1) / 6);
  }

  // Change semester
  onSemesterChange(): void {
    this.loading = true;
    this.studentService.getCurrentStudent().subscribe({
      next: (student) => {
        this.marksService.getStudentMarks(
          student.student_id,
          this.selectedSemester,
          this.selectedAcademicYear
        ).subscribe({
          next: (data) => {
            this.processResultData(data, student.roll_no, '');
            this.loading = false;
          },
          error: (error) => {
            this.error = 'Error loading marks.';
            this.loading = false;
          }
        });
      }
    });
  }

  // Download PDF
  downloadPDF(): void {
    const DATA: any = document.querySelector('.result-container');
    
    if (!DATA) {
      alert('Result data not found');
      return;
    }

    html2canvas(DATA, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowHeight: DATA.scrollHeight
    }).then(canvas => {
      const imgWidth = 208; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const position = 0;
      
      pdf.addImage(
        canvas.toDataURL('image/png', 1.0),
        'PNG',
        0,
        position,
        imgWidth,
        imgHeight
      );
      
      pdf.setProperties({
        title: `Marksheet - ${this.result.name}`,
        subject: 'Student Result',
        author: 'University Management System'
      });
      
      pdf.save(`${this.result.name}_${this.result.rollNo}_Marksheet.pdf`);
    }).catch(error => {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    });
  }

  // Print result
  printResult(): void {
    window.print();
  }

  // Share result
  shareResult(): void {
    if (navigator.share) {
      navigator.share({
        title: `Result - ${this.result.name}`,
        text: `Check out my result! GPA: ${this.result.gpa}, Percentage: ${this.result.percentage}%`,
        url: window.location.href
      });
    } else {
      const textToCopy = `Name: ${this.result.name}\nRoll No: ${this.result.rollNo}\nGPA: ${this.result.gpa}\nPercentage: ${this.result.percentage}%\nStatus: ${this.result.status}`;
      navigator.clipboard.writeText(textToCopy).then(() => {
        alert('Result details copied to clipboard!');
      });
    }
  }

  // Request recheck
  goToLoginForRecheck(): void {
    this.router.navigate(['/student/request-recheck'], {
      queryParams: { rollNo: this.result.rollNo }
    });
  }

  // Get current date
  getCurrentDate(): string {
    const now = new Date();
    return now.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  }

  // Performance category
  getPerformanceCategory(): string {
    const percentage = parseFloat(this.result.percentage);
    if (percentage >= 90) return 'Excellent';
    if (percentage >= 75) return 'Good';
    if (percentage >= 60) return 'Average';
    return 'Poor';
  }

  // Performance checks
  isPerformanceExcellent(): boolean {
    return parseFloat(this.result.percentage) >= 90;
  }

  isPerformanceGood(): boolean {
    const percentage = parseFloat(this.result.percentage);
    return percentage >= 75 && percentage < 90;
  }

  isPerformanceAverage(): boolean {
    const percentage = parseFloat(this.result.percentage);
    return percentage >= 60 && percentage < 75;
  }

  isPerformancePoor(): boolean {
    return parseFloat(this.result.percentage) < 60;
  }

  // Grade color
  getGradeColor(grade: string): string {
    switch(grade) {
      case 'A+':
      case 'A':
        return '#4caf50'; // Green
      case 'B+':
      case 'B':
        return '#2196f3'; // Blue
      case 'C':
        return '#ff9800'; // Orange
      case 'D':
        return '#f44336'; // Red
      default:
        return '#999'; // Gray
    }
  }
}
```

### Step 7: Update HTML Template

The HTML template is already complete. Key sections:

1. **Header** - School/University info
2. **Student Info** - Name, Roll No, DOB, Class
3. **Marks Table** - Subject-wise breakdown
4. **Summary Cards** - Total, Percentage, Status
5. **QR Code** - For verification
6. **Action Buttons** - PDF, Print, Recheck, Share

### Step 8: Update CSS for Styling
The CSS file is already well-structured with:
- Print styles
- Responsive design
- Grade color coding
- Professional marksheet formatting

### Step 9: Create Backend API Endpoints

Create these endpoints in your backend:

```sql
-- GET /api/marks/student/:studentId
-- Returns student marks for current semester

-- GET /api/marks/student/:studentId/current
-- Returns current semester marks

-- GET /api/marks/public/result/:rollNo/:dob
-- Returns result for public access (no authentication)

-- GET /api/marks/student/:studentId/semester/:semester
-- Returns marks for specific semester

-- GET /api/students/current
-- Returns current logged-in student profile
```

### Step 10: Import HttpClientModule

Update `app.module.ts`:

```typescript
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { JwtInterceptor } from './core/interceptors/jwt.interceptor';

@NgModule({
  imports: [
    HttpClientModule,
    // ... other imports
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: JwtInterceptor,
      multi: true
    }
  ]
})
export class AppModule { }
```

## Testing the Feature

### Public Access (Without Authentication)
```
Navigate to: /result/CSE001/1990-05-15
This shows result for student with roll no CSE001 and DOB 1990-05-15
```

### Authenticated Access (Student Login)
```
Navigate to: /student/view-result
This shows result for currently logged-in student
```

### Actions to Test
1. ✅ View marks for different subjects
2. ✅ Download as PDF
3. ✅ Print the result
4. ✅ Share via social media or clipboard
5. ✅ Scan QR code for verification
6. ✅ Request recheck
7. ✅ Select different semesters

## Features Included

1. **Comprehensive Result Display**
   - Student information
   - Subject-wise marks (internal, external, total)
   - Grades and GPA calculation
   - Performance category

2. **Export Options**
   - PDF download with proper formatting
   - Browser print functionality
   - Share via native share or clipboard

3. **Verification**
   - QR code generation
   - Digital signature/stamp

4. **Multi-semester Support**
   - Dropdown to select semester
   - Multiple academic years support

5. **Responsive Design**
   - Works on desktop, tablet, mobile
   - Print-friendly layout

6. **Security**
   - JWT authentication for student dashboard
   - Public access with roll no + DOB verification

## Troubleshooting

### QR Code Not Displaying
- Ensure `angularx-qrcode` is installed
- Check QRCodeModule is imported in StudentModule
- Verify `qrdata` property is set correctly

### PDF Download Issues
- Check browser console for errors
- Ensure `html2canvas` and `jspdf` are installed
- Try using different browser

### Styling Issues
- Clear browser cache
- Verify CSS file is linked correctly
- Check media queries for responsive layout

### API Errors
- Verify backend endpoints are running
- Check CORS headers are configured
- Ensure JWT token is included in requests

## Next Steps

1. Integrate with actual backend APIs
2. Implement caching for performance
3. Add signature verification using PKI
4. Implement audit logging
5. Add email delivery of results
6. Create result analytics dashboard
