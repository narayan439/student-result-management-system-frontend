import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError, of } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { Student, StudentResponse, StudentListResponse } from '../models/student.model';

@Injectable({
  providedIn: 'root'
})
export class StudentService {

  private baseUrl = 'http://localhost:8080/api/students';
  private studentsSubject = new BehaviorSubject<Student[]>([]);
  public students$ = this.studentsSubject.asObservable();

  // Sample students data - 50 students (5 per class, 10 classes)
  private sampleStudents: Student[] = this.generateSampleStudents();

  private generateSampleStudents(): Student[] {
    const students: Student[] = [
      // Class 1 (studentId: 1-5)
      { studentId: 1, name: 'Arjun Kumar', email: 'arjun.kumar1@gmail.com', className: 'Class 1', rollNo: '1A01', dob: '09/04/2011', phone: '9876540001', isActive: true },
      { studentId: 2, name: 'Priya Singh', email: 'priya.singh2@gmail.com', className: 'Class 1', rollNo: '1A02', dob: '23/08/2009', phone: '9876540002', isActive: true },
      { studentId: 3, name: 'Rahul Patel', email: 'rahul.patel3@gmail.com', className: 'Class 1', rollNo: '1A03', dob: '15/11/2010', phone: '9876540003', isActive: true },
      { studentId: 4, name: 'Anjali Sharma', email: 'anjali.sharma4@gmail.com', className: 'Class 1', rollNo: '1A04', dob: '07/03/2011', phone: '9876540004', isActive: true },
      { studentId: 5, name: 'Vikram Verma', email: 'vikram.verma5@gmail.com', className: 'Class 1', rollNo: '1A05', dob: '28/06/2010', phone: '9876540005', isActive: true },
      
      // Class 2 (studentId: 6-10)
      { studentId: 6, name: 'Sneha Gupta', email: 'sneha.gupta6@gmail.com', className: 'Class 2', rollNo: '2A01', dob: '19/01/2009', phone: '9876540006', isActive: true },
      { studentId: 7, name: 'Aditya Yadav', email: 'aditya.yadav7@gmail.com', className: 'Class 2', rollNo: '2A02', dob: '30/09/2010', phone: '9876540007', isActive: true },
      { studentId: 8, name: 'Neha Nair', email: 'neha.nair8@gmail.com', className: 'Class 2', rollNo: '2A03', dob: '11/04/2011', phone: '9876540008', isActive: true },
      { studentId: 9, name: 'Rohan Desai', email: 'rohan.desai9@gmail.com', className: 'Class 2', rollNo: '2A04', dob: '25/07/2010', phone: '9876540009', isActive: true },
      { studentId: 10, name: 'Divya Bhat', email: 'divya.bhat10@gmail.com', className: 'Class 2', rollNo: '2A05', dob: '14/12/2009', phone: '9876540010', isActive: true },
      
      // Class 3 (studentId: 11-15)
      { studentId: 11, name: 'Akshay Reddy', email: 'akshay.reddy11@gmail.com', className: 'Class 3', rollNo: '3A01', dob: '06/02/2008', phone: '9876540011', isActive: true },
      { studentId: 12, name: 'Pooja Rao', email: 'pooja.rao12@gmail.com', className: 'Class 3', rollNo: '3A02', dob: '17/05/2009', phone: '9876540012', isActive: true },
      { studentId: 13, name: 'Nikhil Chopra', email: 'nikhil.chopra13@gmail.com', className: 'Class 3', rollNo: '3A03', dob: '29/08/2008', phone: '9876540013', isActive: true },
      { studentId: 14, name: 'Shreya Malhotra', email: 'shreya.malhotra14@gmail.com', className: 'Class 3', rollNo: '3A04', dob: '10/10/2009', phone: '9876540014', isActive: true },
      { studentId: 15, name: 'Sanjay Kapoor', email: 'sanjay.kapoor15@gmail.com', className: 'Class 3', rollNo: '3A05', dob: '21/03/2008', phone: '9876540015', isActive: true },
      
      // Class 4 (studentId: 16-20)
      { studentId: 16, name: 'Ananya Mishra', email: 'ananya.mishra16@gmail.com', className: 'Class 4', rollNo: '4A01', dob: '08/07/2008', phone: '9876540016', isActive: true },
      { studentId: 17, name: 'Varun Agarwal', email: 'varun.agarwal17@gmail.com', className: 'Class 4', rollNo: '4A02', dob: '22/11/2007', phone: '9876540017', isActive: true },
      { studentId: 18, name: 'Isha Jain', email: 'isha.jain18@gmail.com', className: 'Class 4', rollNo: '4A03', dob: '13/04/2008', phone: '9876540018', isActive: true },
      { studentId: 19, name: 'Manish Srivastava', email: 'manish.srivastava19@gmail.com', className: 'Class 4', rollNo: '4A04', dob: '26/09/2007', phone: '9876540019', isActive: true },
      { studentId: 20, name: 'Riya Dubey', email: 'riya.dubey20@gmail.com', className: 'Class 4', rollNo: '4A05', dob: '05/06/2008', phone: '9876540020', isActive: true }
    ];

    return students;
  }

  constructor(private http: HttpClient) {
    this.studentsSubject.next(this.sampleStudents);
  }

  /**
   * Get all students
   */
  getAllStudents(): Observable<Student[]> {
    return this.http.get<StudentListResponse>(`${this.baseUrl}/all`)
      .pipe(
        map(response => response.data || []),
        tap(students => this.studentsSubject.next(students)),
        catchError(err => {
          console.warn('API call failed, returning sample data');
          const sampleStudents = this.generateSampleStudents();
          this.studentsSubject.next(sampleStudents);
          return of(sampleStudents);
        })
      );
  }

  /**
   * Get all students synchronously (for authentication)
   */
  getAllStudentsSync(): Student[] {
    return this.studentsSubject.value || this.sampleStudents;
  }

  /**
   * Get students from local data (for offline support)
   */
  getStudentsFromLocal(): Student[] {
    return this.studentsSubject.value;
  }

  /**
   * Get single student by ID
   */
  getStudentById(studentId: number): Observable<Student> {
    return this.http.get<StudentResponse>(`${this.baseUrl}/${studentId}`)
      .pipe(
        map(response => response.data as Student),
        catchError(this.handleError)
      );
  }

  /**
   * Add/Create new student
   */
  addStudent(student: Student): Observable<StudentResponse> {
    // Validate student data
    const validationError = this.validateStudent(student);
    if (validationError) {
      return throwError(() => ({
        success: false,
        message: validationError,
        errors: [validationError]
      }));
    }

    // Try to post to backend, fallback to local storage
    return this.http.post<StudentResponse>(`${this.baseUrl}/add`, student)
      .pipe(
        tap(response => {
          if (response.success && response.data) {
            // Add to local data
            const currentStudents = this.studentsSubject.value;
            this.studentsSubject.next([...currentStudents, response.data]);
          }
        }),
        catchError((error) => {
          // If backend fails, add to local storage instead
          const currentStudents = this.studentsSubject.value;
          const nextId = currentStudents.length > 0 
            ? Math.max(...currentStudents.map(s => s.studentId || 0)) + 1 
            : 1;
          
          const newStudent: Student = {
            ...student,
            studentId: nextId
          };
          
          this.studentsSubject.next([...currentStudents, newStudent]);
          
          return new Observable<StudentResponse>(observer => {
            observer.next({
              success: true,
              message: 'Student added successfully (Local)',
              data: newStudent,
              errors: []
            });
            observer.complete();
          });
        })
      );
  }

  /**
   * Save student (create or update)
   */
  saveStudent(student: Student): Observable<StudentResponse> {
    if (student.studentId) {
      return this.updateStudent(student.studentId, student);
    } else {
      return this.addStudent(student);
    }
  }

  /**
   * Update student information by ID
   */
  updateStudent(studentId: number, student: Student): Observable<StudentResponse> {
    if (!studentId && studentId !== 0) {
      return throwError(() => ({
        success: false,
        message: 'Student ID is required for update',
        errors: ['Student ID is required']
      }));
    }

    // Validate student data
    const validationError = this.validateStudent(student);
    if (validationError) {
      return throwError(() => ({
        success: false,
        message: validationError,
        errors: [validationError]
      }));
    }

    return this.http.put<StudentResponse>(`${this.baseUrl}/${studentId}`, student)
      .pipe(
        tap(response => {
          if (response.success && response.data) {
            // Update in local data
            const currentStudents = this.studentsSubject.value;
            const updatedStudents = currentStudents.map(s =>
              s.studentId === studentId ? response.data as Student : s
            );
            this.studentsSubject.next(updatedStudents);
          }
        }),
        catchError((error) => {
          // If backend fails, update in local storage instead
          const currentStudents = this.studentsSubject.value;
          const updatedStudents = currentStudents.map(s =>
            s.studentId === studentId ? { ...student, studentId } : s
          );
          this.studentsSubject.next(updatedStudents);
          
          return new Observable<StudentResponse>(observer => {
            observer.next({
              success: true,
              message: 'Student updated successfully (Local)',
              data: { ...student, studentId },
              errors: []
            });
            observer.complete();
          });
        })
      );
  }

  /**
   * Delete student by ID
   */
  deleteStudent(studentId: number): Observable<StudentResponse> {
    return this.http.delete<StudentResponse>(`${this.baseUrl}/${studentId}`)
      .pipe(
        tap(response => {
          if (response.success) {
            // Remove from local data
            const currentStudents = this.studentsSubject.value;
            const filteredStudents = currentStudents.filter(s => s.studentId !== studentId);
            this.studentsSubject.next(filteredStudents);
          }
        }),
        catchError((error) => {
          // If backend fails, delete from local storage instead
          const currentStudents = this.studentsSubject.value;
          const filteredStudents = currentStudents.filter(s => s.studentId !== studentId);
          this.studentsSubject.next(filteredStudents);
          
          return new Observable<StudentResponse>(observer => {
            observer.next({
              success: true,
              message: 'Student deleted successfully (Local)',
              errors: []
            });
            observer.complete();
          });
        })
      );
  }

  /**
   * Search students by name
   */
  searchStudents(name: string): Observable<Student[]> {
    return this.http.get<StudentListResponse>(`${this.baseUrl}/search?name=${name}`)
      .pipe(
        map(response => response.data || []),
        catchError(this.handleError)
      );
  }

  /**
   * Get students by class
   */
  getStudentsByClass(className: string): Observable<Student[]> {
    return this.http.get<StudentListResponse>(`${this.baseUrl}/class/${className}`)
      .pipe(
        map(response => response.data || []),
        catchError(this.handleError)
      );
  }

  /**
   * Validate student data
   */
  private validateStudent(student: Student): string | null {
    if (!student.name || !student.name.trim()) {
      return 'Student name is required';
    }

    if (!student.email || !student.email.trim()) {
      return 'Email address is required';
    }

    if (!this.isValidEmail(student.email)) {
      return 'Invalid email format';
    }

    if (!student.className || !student.className.trim()) {
      return 'Class name is required';
    }

    if (!student.rollNo || !student.rollNo.trim()) {
      return 'Roll number is required';
    }

    if (!student.dob) {
      return 'Date of birth is required';
    }

    // Check if email already exists (excluding current student)
    const existingStudent = this.studentsSubject.value.find(
      s => s.email === student.email && s.studentId !== student.studentId
    );
    if (existingStudent) {
      return 'Email already exists';
    }

    // Check if roll number already exists for the same class
    const existingRollNo = this.studentsSubject.value.find(
      s => s.rollNo === student.rollNo && 
      s.className === student.className &&
      s.studentId !== student.studentId
    );
    if (existingRollNo) {
      return `Roll number ${student.rollNo} is already assigned to another student in ${student.className}. Roll numbers must be unique per class.`;
    }

    return null;
  }

  /**
   * Email validation helper
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Error handling
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An error occurred';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = error.error.message;
    } else {
      // Server-side error
      errorMessage = error.error?.message || error.statusText || 'Server error';
    }

    console.error('StudentService Error:', errorMessage);
    return throwError(() => ({
      success: false,
      message: errorMessage,
      errors: [errorMessage]
    }));
  }

  /**
   * Get next available roll number for a class
   * Roll number format: classNumberSectionSequential (e.g., 10A01, 10A02)
   * Roll numbers must be unique per class
   */
  getNextRollNumberForClass(className: string): string {
    const classStudents = this.studentsSubject.value.filter(s => s.className === className);
    
    // Extract class number and section from className (e.g., "Class 10 - A" -> 10, A)
    const classMatch = className.match(/Class\s(\d+)\s-\s([A-E])/);
    if (!classMatch) {
      return '01';
    }

    const classNumber = classMatch[1];
    const section = classMatch[2];

    if (classStudents.length === 0) {
      return `${classNumber}${section}01`;
    }

    // Get the highest sequential number in the class
    const sequentialNumbers = classStudents
      .map(s => {
        const match = s.rollNo.match(new RegExp(`^${classNumber}${section}(\\d+)$`));
        return match ? parseInt(match[1], 10) : 0;
      })
      .filter(num => num > 0)
      .sort((a, b) => a - b);

    const nextSeq = sequentialNumbers.length > 0 ? sequentialNumbers[sequentialNumbers.length - 1] + 1 : 1;
    return `${classNumber}${section}${String(nextSeq).padStart(2, '0')}`;
  }

  /**
   * Get all roll numbers for a specific class
   */
  getRollNumbersInClass(className: string): string[] {
    return this.studentsSubject.value
      .filter(s => s.className === className)
      .map(s => s.rollNo)
      .sort((a, b) => parseInt(a, 10) - parseInt(b, 10));
  }

  /**
   * Check if roll number exists in a class
   */
  isRollNumberExistsInClass(className: string, rollNo: string, excludeStudentId?: number): boolean {
    return this.studentsSubject.value.some(s =>
      s.className === className &&
      s.rollNo === rollNo &&
      s.studentId !== excludeStudentId
    );
  }

  /**
   * Clear all students (for testing)
   */
  clearStudents(): void {
    this.studentsSubject.next([]);
  }

  /**
   * Reset to sample data (for testing)
   */
  resetToSampleData(): void {
    this.studentsSubject.next([...this.sampleStudents]);
  }
}
