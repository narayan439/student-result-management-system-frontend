import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { StudentService } from './student.service';

export interface SchoolClass {
  classId: number;
  className: string;
  classNumber: number;
  studentCount: number;
  maxCapacity: number;
  isActive: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ClassesService {
  
  private classesSubject = new BehaviorSubject<SchoolClass[]>(this.generateAllClasses());
  classes$ = this.classesSubject.asObservable();

  constructor(private studentService: StudentService) {}

  // Generate all classes (1-10) only = 10 classes total
  private generateAllClasses(): SchoolClass[] {
    const classes: SchoolClass[] = [];

    for (let classNum = 1; classNum <= 10; classNum++) {
      classes.push({
        classId: classNum,
        className: `Class ${classNum}`,
        classNumber: classNum,
        studentCount: this.getStudentCountInClass(classNum),
        maxCapacity: 60,
        isActive: true
      });
    }

    return classes;
  }

  // Get student count in a specific class
  private getStudentCountInClass(classNum: number): number {
    const students = this.studentService.getAllStudentsSync();
    return students.filter(s => {
      const classMatch = s.className.match(/Class\s(\d+)/);
      const studClassNum = classMatch ? parseInt(classMatch[1]) : 0;
      return studClassNum === classNum;
    }).length;
  }

  // Get all classes
  getClasses(): Observable<SchoolClass[]> {
    return this.classes$;
  }

  // Get classes as array (synchronous)
  getClassesArray(): SchoolClass[] {
    return this.classesSubject.value;
  }

  // Get a specific class by class number
  getClassByNumber(classNumber: number): SchoolClass | undefined {
    const classes = this.classesSubject.value;
    return classes.find(c => c.classNumber === classNumber);
  }

  // Get students in a specific class
  getStudentsInClass(classNumber: number): any[] {
    const students = this.studentService.getAllStudentsSync();
    return students.filter(s => {
      const classMatch = s.className.match(/Class\s(\d+)/);
      const studClassNum = classMatch ? parseInt(classMatch[1]) : 0;
      return studClassNum === classNumber;
    });
  }

  // Get class capacity and current count
  getClassCapacity(classNumber: number): { current: number; max: number } {
    const students = this.getStudentsInClass(classNumber);
    const classData = this.getClassByNumber(classNumber);
    return {
      current: students.length,
      max: classData?.maxCapacity || 60
    };
  }

  // Check if class has available seats
  hasAvailableSeats(classNumber: number): boolean {
    const capacity = this.getClassCapacity(classNumber);
    return capacity.current < capacity.max;
  }

  // Add a student to a class
  addStudentToClass(classNumber: number): boolean {
    if (!this.hasAvailableSeats(classNumber)) {
      console.warn(`Class ${classNumber} is at full capacity`);
      return false;
    }
    // Student assignment logic would be handled by StudentService
    this.updateClassCount();
    return true;
  }

  // Update class student counts
  updateClassCount(): void {
    const updatedClasses = this.generateAllClasses();
    this.classesSubject.next(updatedClasses);
  }

  // Add a new class (manual)
  addClass(schoolClass: SchoolClass): void {
    const currentClasses = this.classesSubject.value;
    const newClasses = [...currentClasses, schoolClass];
    this.classesSubject.next(newClasses);
  }

  // Update a class
  updateClass(updatedClass: SchoolClass): void {
    const currentClasses = this.classesSubject.value;
    const newClasses = currentClasses.map(c => 
      c.classId === updatedClass.classId ? updatedClass : c
    );
    this.classesSubject.next(newClasses);
  }

  // Delete a class
  deleteClass(classId: number): void {
    const currentClasses = this.classesSubject.value;
    const newClasses = currentClasses.filter(c => c.classId !== classId);
    this.classesSubject.next(newClasses);
  }

  // Set all classes
  setClasses(classes: SchoolClass[]): void {
    this.classesSubject.next(classes);
  }
}

