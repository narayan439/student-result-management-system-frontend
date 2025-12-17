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
    const firstNames = [
      'Arjun', 'Priya', 'Rahul', 'Anjali', 'Vikram', 'Sneha', 'Aditya', 'Neha', 'Rohan', 'Divya',
      'Akshay', 'Pooja', 'Nikhil', 'Shreya', 'Sanjay', 'Ananya', 'Varun', 'Isha', 'Manish', 'Riya',
      'Harshit', 'Kavya', 'Aman', 'Navya', 'Shashank', 'Diya', 'Abhishek', 'Sakshi', 'Karan', 'Veda'
    ];

    const lastNames = [
      'Kumar', 'Singh', 'Patel', 'Sharma', 'Verma', 'Gupta', 'Yadav', 'Nair', 'Desai', 'Bhat',
      'Reddy', 'Rao', 'Chopra', 'Malhotra', 'Kapoor', 'Mishra', 'Agarwal', 'Jain', 'Srivastava', 'Dubey'
    ];

    const students: Student[] = [];
    let studentId = 1;

    // 5 students per class, for classes 1-10
    for (let classNum = 1; classNum <= 10; classNum++) {
      const className = `Class ${classNum}`;
      
      // 5 students per class
      for (let rollSequence = 1; rollSequence <= 5; rollSequence++) {
        const firstNameIndex = (studentId - 1) % firstNames.length;
        const lastNameIndex = (studentId - 1) % lastNames.length;
        const firstName = firstNames[firstNameIndex];
        const lastName = lastNames[lastNameIndex];
        const name = `${firstName} ${lastName}`;
        const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${studentId}@student.com`;
        
        // Roll number format: classNumber + "A" + sequence (e.g., 10A01, 10A06, 10A11)
        const rollNo = `${classNum}A${String(rollSequence).padStart(2, '0')}`;
        
        // Generate random date of birth between 2005-2012
        const year = 2005 + Math.floor(Math.random() * 8);
        const month = Math.floor(Math.random() * 12) + 1;
        const day = Math.floor(Math.random() * 28) + 1;
        const dob = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        
        const phone = `987654${String(studentId).padStart(4, '0')}`;

        students.push({
          studentId,
          name,
          email,
          className,
          rollNo,
          dob,
          phone,
          isActive: true
        });

        studentId++;
      }
    }

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
