import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Mark, MarkResponse, MarkListResponse } from '../models/marks.model';

@Injectable({
  providedIn: 'root'
})
export class MarksService {
  private baseUrl = 'http://localhost:8080/api/marks';
  private localKey = 'app_marks_v1';

  private marksSubject = new BehaviorSubject<Mark[]>([]);
  public marks$ = this.marksSubject.asObservable();

  // Class-specific subjects mapping
  private classSubjectsMap: { [key: number]: number[] } = {
    1: [1, 2, 3, 4, 5, 6], // Class 1: Math, Science, English, MIL Odia, Music, Drawing
    2: [1, 2, 3, 4, 5, 6], // Class 2: Math, Science, English, MIL Odia, Music, Drawing
    3: [1, 2, 3, 4, 7, 8], // Class 3: Math, Science, English, MIL Odia, History, Geography
    4: [1, 2, 3, 4, 7, 8], // Class 4: Math, Science, English, MIL Odia, History, Geography
    5: [1, 2, 3, 4, 7, 8], // Class 5: Math, Science, English, MIL Odia, History, Geography
    6: [1, 2, 3, 9, 7, 8], // Class 6: Math, Science, English, Hindi, History, Geography
    7: [1, 2, 3, 9, 7, 8], // Class 7: Math, Science, English, Hindi, History, Geography
    8: [1, 2, 3, 9, 7, 8], // Class 8: Math, Science, English, Hindi, History, Geography
    9: [1, 2, 3, 9, 7, 8], // Class 9: Math, Science, English, Hindi, History, Geography
    10: [1, 2, 3, 9, 7, 8] // Class 10: Math, Science, English, Hindi, History, Geography
  };

  // Sample subjects for filtering
  private sampleSubjects = [
    { subjectId: 1, subjectName: 'Mathematics', subjectCode: 'MATH', isActive: true },
    { subjectId: 2, subjectName: 'Science', subjectCode: 'SCI', isActive: true },
    { subjectId: 3, subjectName: 'English', subjectCode: 'ENG', isActive: true },
    { subjectId: 4, subjectName: 'MIL Odia', subjectCode: 'MIL', isActive: true },
    { subjectId: 5, subjectName: 'Music', subjectCode: 'MUS', isActive: true },
    { subjectId: 6, subjectName: 'Drawing', subjectCode: 'ART', isActive: true },
    { subjectId: 7, subjectName: 'History', subjectCode: 'HIS', isActive: true },
    { subjectId: 8, subjectName: 'Geography', subjectCode: 'GEO', isActive: true },
    { subjectId: 9, subjectName: 'Hindi', subjectCode: 'HINDI', isActive: true }
  ];
  private sampleMarks: Mark[] = [
    // Student 1 - Class 1 (Math, Science, English, MIL Odia, Music, Drawing)
    { marksId: 'M1', studentId: '1', subject: 'Mathematics', marksObtained: 85, maxMarks: 100, term: 'Term 1', year: 2024 },
    { marksId: 'M2', studentId: '1', subject: 'Science', marksObtained: 88, maxMarks: 100, term: 'Term 1', year: 2024 },
    { marksId: 'M3', studentId: '1', subject: 'English', marksObtained: 78, maxMarks: 100, term: 'Term 1', year: 2024 },
    { marksId: 'M4', studentId: '1', subject: 'MIL Odia', marksObtained: 82, maxMarks: 100, term: 'Term 1', year: 2024 },
    { marksId: 'M5', studentId: '1', subject: 'Music', marksObtained: 80, maxMarks: 100, term: 'Term 1', year: 2024 },
    { marksId: 'M5b', studentId: '1', subject: 'Drawing', marksObtained: 85, maxMarks: 100, term: 'Term 1', year: 2024 },
    
    // Student 2 - Class 1 (Math, Science, English, MIL Odia, Music, Drawing)
    { marksId: 'M6', studentId: '2', subject: 'Mathematics', marksObtained: 92, maxMarks: 100, term: 'Term 1', year: 2024 },
    { marksId: 'M7', studentId: '2', subject: 'Science', marksObtained: 95, maxMarks: 100, term: 'Term 1', year: 2024 },
    { marksId: 'M8', studentId: '2', subject: 'English', marksObtained: 88, maxMarks: 100, term: 'Term 1', year: 2024 },
    { marksId: 'M9', studentId: '2', subject: 'MIL Odia', marksObtained: 85, maxMarks: 100, term: 'Term 1', year: 2024 },
    { marksId: 'M10', studentId: '2', subject: 'Music', marksObtained: 90, maxMarks: 100, term: 'Term 1', year: 2024 },
    { marksId: 'M10b', studentId: '2', subject: 'Drawing', marksObtained: 92, maxMarks: 100, term: 'Term 1', year: 2024 },
    
    // Student 3 - Class 1 (Math, Science, English, MIL Odia, Music, Drawing)
    { marksId: 'M11', studentId: '3', subject: 'Mathematics', marksObtained: 75, maxMarks: 100, term: 'Term 1', year: 2024 },
    { marksId: 'M12', studentId: '3', subject: 'Science', marksObtained: 80, maxMarks: 100, term: 'Term 1', year: 2024 },
    { marksId: 'M13', studentId: '3', subject: 'English', marksObtained: 72, maxMarks: 100, term: 'Term 1', year: 2024 },
    { marksId: 'M14', studentId: '3', subject: 'MIL Odia', marksObtained: 76, maxMarks: 100, term: 'Term 1', year: 2024 },
    { marksId: 'M15', studentId: '3', subject: 'Music', marksObtained: 78, maxMarks: 100, term: 'Term 1', year: 2024 },
    { marksId: 'M15b', studentId: '3', subject: 'Drawing', marksObtained: 80, maxMarks: 100, term: 'Term 1', year: 2024 },
    
    // Student 4 - Class 1 (Math, Science, English, MIL Odia, Music, Drawing)
    { marksId: 'M16', studentId: '4', subject: 'Mathematics', marksObtained: 88, maxMarks: 100, term: 'Term 1', year: 2024 },
    { marksId: 'M17', studentId: '4', subject: 'Science', marksObtained: 85, maxMarks: 100, term: 'Term 1', year: 2024 },
    { marksId: 'M18', studentId: '4', subject: 'English', marksObtained: 82, maxMarks: 100, term: 'Term 1', year: 2024 },
    { marksId: 'M19', studentId: '4', subject: 'MIL Odia', marksObtained: 84, maxMarks: 100, term: 'Term 1', year: 2024 },
    { marksId: 'M20', studentId: '4', subject: 'Music', marksObtained: 86, maxMarks: 100, term: 'Term 1', year: 2024 },
    { marksId: 'M20b', studentId: '4', subject: 'Drawing', marksObtained: 88, maxMarks: 100, term: 'Term 1', year: 2024 },
    
    // Student 5 - Class 1 (Math, Science, English, MIL Odia, Music, Drawing)
    { marksId: 'M21', studentId: '5', subject: 'Mathematics', marksObtained: 78, maxMarks: 100, term: 'Term 1', year: 2024 },
    { marksId: 'M22', studentId: '5', subject: 'Science', marksObtained: 82, maxMarks: 100, term: 'Term 1', year: 2024 },
    { marksId: 'M23', studentId: '5', subject: 'English', marksObtained: 75, maxMarks: 100, term: 'Term 1', year: 2024 },
    { marksId: 'M24', studentId: '5', subject: 'MIL Odia', marksObtained: 80, maxMarks: 100, term: 'Term 1', year: 2024 },
    { marksId: 'M25', studentId: '5', subject: 'Music', marksObtained: 79, maxMarks: 100, term: 'Term 1', year: 2024 },
    { marksId: 'M25b', studentId: '5', subject: 'Drawing', marksObtained: 81, maxMarks: 100, term: 'Term 1', year: 2024 },
    
    // Student 6 - Class 2 (Math, Science, English, MIL Odia, Music, Drawing)
    { marksId: 'M26', studentId: '6', subject: 'Mathematics', marksObtained: 90, maxMarks: 100, term: 'Term 1', year: 2024 },
    { marksId: 'M27', studentId: '6', subject: 'Science', marksObtained: 92, maxMarks: 100, term: 'Term 1', year: 2024 },
    { marksId: 'M28', studentId: '6', subject: 'English', marksObtained: 86, maxMarks: 100, term: 'Term 1', year: 2024 },
    { marksId: 'M29', studentId: '6', subject: 'MIL Odia', marksObtained: 88, maxMarks: 100, term: 'Term 1', year: 2024 },
    { marksId: 'M30', studentId: '6', subject: 'Music', marksObtained: 89, maxMarks: 100, term: 'Term 1', year: 2024 },
    { marksId: 'M30b', studentId: '6', subject: 'Drawing', marksObtained: 91, maxMarks: 100, term: 'Term 1', year: 2024 },
    
    // Student 7 - Class 2 (Math, Science, English, MIL Odia, Music, Drawing)
    { marksId: 'M31', studentId: '7', subject: 'Mathematics', marksObtained: 65, maxMarks: 100, term: 'Term 1', year: 2024 },
    { marksId: 'M32', studentId: '7', subject: 'Science', marksObtained: 68, maxMarks: 100, term: 'Term 1', year: 2024 },
    { marksId: 'M33', studentId: '7', subject: 'English', marksObtained: 70, maxMarks: 100, term: 'Term 1', year: 2024 },
    { marksId: 'M34', studentId: '7', subject: 'MIL Odia', marksObtained: 72, maxMarks: 100, term: 'Term 1', year: 2024 },
    { marksId: 'M35', studentId: '7', subject: 'Music', marksObtained: 71, maxMarks: 100, term: 'Term 1', year: 2024 },
    { marksId: 'M35b', studentId: '7', subject: 'Drawing', marksObtained: 73, maxMarks: 100, term: 'Term 1', year: 2024 },
    
    // Student 8 - Class 2 (Math, Science, English, MIL Odia, Music, Drawing)
    { marksId: 'M36', studentId: '8', subject: 'Mathematics', marksObtained: 84, maxMarks: 100, term: 'Term 1', year: 2024 },
    { marksId: 'M37', studentId: '8', subject: 'Science', marksObtained: 86, maxMarks: 100, term: 'Term 1', year: 2024 },
    { marksId: 'M38', studentId: '8', subject: 'English', marksObtained: 80, maxMarks: 100, term: 'Term 1', year: 2024 },
    { marksId: 'M39', studentId: '8', subject: 'MIL Odia', marksObtained: 82, maxMarks: 100, term: 'Term 1', year: 2024 },
    { marksId: 'M40', studentId: '8', subject: 'Music', marksObtained: 83, maxMarks: 100, term: 'Term 1', year: 2024 },
    { marksId: 'M40b', studentId: '8', subject: 'Drawing', marksObtained: 85, maxMarks: 100, term: 'Term 1', year: 2024 },
    
    // Student 9 - Class 2 (Math, Science, English, MIL Odia, Music, Drawing)
    { marksId: 'M41', studentId: '9', subject: 'Mathematics', marksObtained: 79, maxMarks: 100, term: 'Term 1', year: 2024 },
    { marksId: 'M42', studentId: '9', subject: 'Science', marksObtained: 81, maxMarks: 100, term: 'Term 1', year: 2024 },
    { marksId: 'M43', studentId: '9', subject: 'English', marksObtained: 77, maxMarks: 100, term: 'Term 1', year: 2024 },
    { marksId: 'M44', studentId: '9', subject: 'MIL Odia', marksObtained: 79, maxMarks: 100, term: 'Term 1', year: 2024 },
    { marksId: 'M45', studentId: '9', subject: 'Music', marksObtained: 80, maxMarks: 100, term: 'Term 1', year: 2024 },
    { marksId: 'M45b', studentId: '9', subject: 'Drawing', marksObtained: 82, maxMarks: 100, term: 'Term 1', year: 2024 },
    
    // Student 10 - Class 2 (Math, Science, English, MIL Odia, Music, Drawing)
    { marksId: 'M46', studentId: '10', subject: 'Mathematics', marksObtained: 87, maxMarks: 100, term: 'Term 1', year: 2024 },
    { marksId: 'M47', studentId: '10', subject: 'Science', marksObtained: 89, maxMarks: 100, term: 'Term 1', year: 2024 },
    { marksId: 'M48', studentId: '10', subject: 'English', marksObtained: 84, maxMarks: 100, term: 'Term 1', year: 2024 },
    { marksId: 'M49', studentId: '10', subject: 'MIL Odia', marksObtained: 86, maxMarks: 100, term: 'Term 1', year: 2024 },
    { marksId: 'M50', studentId: '10', subject: 'Music', marksObtained: 88, maxMarks: 100, term: 'Term 1', year: 2024 },
    { marksId: 'M50b', studentId: '10', subject: 'Drawing', marksObtained: 90, maxMarks: 100, term: 'Term 1', year: 2024 },
    
    // Student 11 - Class 3 (Math, Science, English, MIL Odia, History, Geography)
    { marksId: 'M51', studentId: '11', subject: 'Mathematics', marksObtained: 81, maxMarks: 100, term: 'Term 1', year: 2024 },
    { marksId: 'M52', studentId: '11', subject: 'Science', marksObtained: 83, maxMarks: 100, term: 'Term 1', year: 2024 },
    { marksId: 'M53', studentId: '11', subject: 'English', marksObtained: 79, maxMarks: 100, term: 'Term 1', year: 2024 },
    { marksId: 'M54', studentId: '11', subject: 'MIL Odia', marksObtained: 82, maxMarks: 100, term: 'Term 1', year: 2024 },
    { marksId: 'M55', studentId: '11', subject: 'History', marksObtained: 80, maxMarks: 100, term: 'Term 1', year: 2024 },
    { marksId: 'M56', studentId: '11', subject: 'Geography', marksObtained: 84, maxMarks: 100, term: 'Term 1', year: 2024 },
    
    // Student 12 - Class 3 (Math, Science, English, MIL Odia, History, Geography)
    { marksId: 'M57', studentId: '12', subject: 'Mathematics', marksObtained: 76, maxMarks: 100, term: 'Term 1', year: 2024 },
    { marksId: 'M58', studentId: '12', subject: 'Science', marksObtained: 78, maxMarks: 100, term: 'Term 1', year: 2024 },
    { marksId: 'M59', studentId: '12', subject: 'English', marksObtained: 74, maxMarks: 100, term: 'Term 1', year: 2024 },
    { marksId: 'M60', studentId: '12', subject: 'MIL Odia', marksObtained: 77, maxMarks: 100, term: 'Term 1', year: 2024 },
    { marksId: 'M61', studentId: '12', subject: 'History', marksObtained: 75, maxMarks: 100, term: 'Term 1', year: 2024 },
    { marksId: 'M62', studentId: '12', subject: 'Geography', marksObtained: 79, maxMarks: 100, term: 'Term 1', year: 2024 },
    
    // Student 13 - Class 3 (Math, Science, English, MIL Odia, History, Geography)
    { marksId: 'M63', studentId: '13', subject: 'Mathematics', marksObtained: 89, maxMarks: 100, term: 'Term 1', year: 2024 },
    { marksId: 'M64', studentId: '13', subject: 'Science', marksObtained: 91, maxMarks: 100, term: 'Term 1', year: 2024 },
    { marksId: 'M65', studentId: '13', subject: 'English', marksObtained: 87, maxMarks: 100, term: 'Term 1', year: 2024 },
    { marksId: 'M66', studentId: '13', subject: 'MIL Odia', marksObtained: 88, maxMarks: 100, term: 'Term 1', year: 2024 },
    { marksId: 'M67', studentId: '13', subject: 'History', marksObtained: 90, maxMarks: 100, term: 'Term 1', year: 2024 },
    { marksId: 'M68', studentId: '13', subject: 'Geography', marksObtained: 89, maxMarks: 100, term: 'Term 1', year: 2024 },
    
    // Student 14 - Class 3 (Math, Science, English, MIL Odia, History, Geography)
    { marksId: 'M69', studentId: '14', subject: 'Mathematics', marksObtained: 82, maxMarks: 100, term: 'Term 1', year: 2024 },
    { marksId: 'M70', studentId: '14', subject: 'Science', marksObtained: 84, maxMarks: 100, term: 'Term 1', year: 2024 },
    { marksId: 'M71', studentId: '14', subject: 'English', marksObtained: 80, maxMarks: 100, term: 'Term 1', year: 2024 },
    { marksId: 'M72', studentId: '14', subject: 'MIL Odia', marksObtained: 83, maxMarks: 100, term: 'Term 1', year: 2024 },
    { marksId: 'M73', studentId: '14', subject: 'History', marksObtained: 81, maxMarks: 100, term: 'Term 1', year: 2024 },
    { marksId: 'M74', studentId: '14', subject: 'Geography', marksObtained: 85, maxMarks: 100, term: 'Term 1', year: 2024 },
    
    // Student 15 - Class 3 (Math, Science, English, MIL Odia, History, Geography)
    { marksId: 'M75', studentId: '15', subject: 'Mathematics', marksObtained: 77, maxMarks: 100, term: 'Term 1', year: 2024 },
    { marksId: 'M76', studentId: '15', subject: 'Science', marksObtained: 79, maxMarks: 100, term: 'Term 1', year: 2024 },
    { marksId: 'M77', studentId: '15', subject: 'English', marksObtained: 75, maxMarks: 100, term: 'Term 1', year: 2024 },
    { marksId: 'M78', studentId: '15', subject: 'MIL Odia', marksObtained: 78, maxMarks: 100, term: 'Term 1', year: 2024 },
    { marksId: 'M79', studentId: '15', subject: 'History', marksObtained: 76, maxMarks: 100, term: 'Term 1', year: 2024 },
    { marksId: 'M80', studentId: '15', subject: 'Geography', marksObtained: 80, maxMarks: 100, term: 'Term 1', year: 2024 },
    
    // Student 16 - Class 4 (Math, Science, English, MIL Odia, History, Geography)
    { marksId: 'M81', studentId: '16', subject: 'Mathematics', marksObtained: 85, maxMarks: 100, term: 'Term 1', year: 2024 },
    { marksId: 'M82', studentId: '16', subject: 'Science', marksObtained: 87, maxMarks: 100, term: 'Term 1', year: 2024 },
    { marksId: 'M83', studentId: '16', subject: 'English', marksObtained: 83, maxMarks: 100, term: 'Term 1', year: 2024 },
    { marksId: 'M84', studentId: '16', subject: 'MIL Odia', marksObtained: 84, maxMarks: 100, term: 'Term 1', year: 2024 },
    { marksId: 'M85', studentId: '16', subject: 'History', marksObtained: 86, maxMarks: 100, term: 'Term 1', year: 2024 },
    { marksId: 'M86', studentId: '16', subject: 'Geography', marksObtained: 88, maxMarks: 100, term: 'Term 1', year: 2024 },
    
    // Student 17 - Class 4 (Math, Science, English, MIL Odia, History, Geography)
    { marksId: 'M87', studentId: '17', subject: 'Mathematics', marksObtained: 73, maxMarks: 100, term: 'Term 1', year: 2024 },
    { marksId: 'M88', studentId: '17', subject: 'Science', marksObtained: 75, maxMarks: 100, term: 'Term 1', year: 2024 },
    { marksId: 'M89', studentId: '17', subject: 'English', marksObtained: 71, maxMarks: 100, term: 'Term 1', year: 2024 },
    { marksId: 'M90', studentId: '17', subject: 'MIL Odia', marksObtained: 74, maxMarks: 100, term: 'Term 1', year: 2024 },
    { marksId: 'M91', studentId: '17', subject: 'History', marksObtained: 72, maxMarks: 100, term: 'Term 1', year: 2024 },
    { marksId: 'M92', studentId: '17', subject: 'Geography', marksObtained: 76, maxMarks: 100, term: 'Term 1', year: 2024 },
    
    // Student 18 - Class 4 (Math, Science, English, MIL Odia, History, Geography)
    { marksId: 'M93', studentId: '18', subject: 'Mathematics', marksObtained: 88, maxMarks: 100, term: 'Term 1', year: 2024 },
    { marksId: 'M94', studentId: '18', subject: 'Science', marksObtained: 90, maxMarks: 100, term: 'Term 1', year: 2024 },
    { marksId: 'M95', studentId: '18', subject: 'English', marksObtained: 85, maxMarks: 100, term: 'Term 1', year: 2024 },
    { marksId: 'M96', studentId: '18', subject: 'MIL Odia', marksObtained: 87, maxMarks: 100, term: 'Term 1', year: 2024 },
    { marksId: 'M97', studentId: '18', subject: 'History', marksObtained: 89, maxMarks: 100, term: 'Term 1', year: 2024 },
    { marksId: 'M98', studentId: '18', subject: 'Geography', marksObtained: 91, maxMarks: 100, term: 'Term 1', year: 2024 },
    
    // Student 19 - Class 4 (Math, Science, English, MIL Odia, History, Geography)
    { marksId: 'M99', studentId: '19', subject: 'Mathematics', marksObtained: 80, maxMarks: 100, term: 'Term 1', year: 2024 },
    { marksId: 'M100', studentId: '19', subject: 'Science', marksObtained: 82, maxMarks: 100, term: 'Term 1', year: 2024 },
    { marksId: 'M101', studentId: '19', subject: 'English', marksObtained: 78, maxMarks: 100, term: 'Term 1', year: 2024 },
    { marksId: 'M102', studentId: '19', subject: 'MIL Odia', marksObtained: 81, maxMarks: 100, term: 'Term 1', year: 2024 },
    { marksId: 'M103', studentId: '19', subject: 'History', marksObtained: 79, maxMarks: 100, term: 'Term 1', year: 2024 },
    { marksId: 'M104', studentId: '19', subject: 'Geography', marksObtained: 83, maxMarks: 100, term: 'Term 1', year: 2024 },
    
    // Student 20 - Class 4 (Math, Science, English, MIL Odia, History, Geography)
    { marksId: 'M105', studentId: '20', subject: 'Mathematics', marksObtained: 91, maxMarks: 100, term: 'Term 1', year: 2024 },
    { marksId: 'M106', studentId: '20', subject: 'Science', marksObtained: 93, maxMarks: 100, term: 'Term 1', year: 2024 },
    { marksId: 'M107', studentId: '20', subject: 'English', marksObtained: 89, maxMarks: 100, term: 'Term 1', year: 2024 },
    { marksId: 'M108', studentId: '20', subject: 'MIL Odia', marksObtained: 90, maxMarks: 100, term: 'Term 1', year: 2024 },
    { marksId: 'M109', studentId: '20', subject: 'History', marksObtained: 92, maxMarks: 100, term: 'Term 1', year: 2024 },
    { marksId: 'M110', studentId: '20', subject: 'Geography', marksObtained: 94, maxMarks: 100, term: 'Term 1', year: 2024 }
  ];

  constructor(private http: HttpClient) {
    // initialize marks from local storage or sample data
    const local = this.getMarksFromLocal();
    if (local && local.length) {
      this.marksSubject.next(local);
    } else {
      this.marksSubject.next(this.sampleMarks);
      this.saveToLocal(this.sampleMarks);
    }
  }

  // Get all marks (tries backend, falls back to local)
  getAllMarks(): Observable<Mark[]> {
    // return local copy immediately
    const local = this.getMarksFromLocal();
    this.marksSubject.next(local);

    // Try to get from backend
    return this.http.get<MarkListResponse>(this.baseUrl).pipe(
      tap(res => {
        if (res && res.data) {
          this.marksSubject.next(res.data);
          this.saveToLocal(res.data);
        }
      }),
      catchError(err => {
        // backend not available - return local
        console.warn('Marks API error, using local data', err);
        return of(local);
      }),
      // map to Mark[] in case backend returned MarkListResponse
      tap(() => {}),
      // map not used here because of varying return types; consumer should handle either array or MarkListResponse
    ) as unknown as Observable<Mark[]>;
  }

  // Get all marks synchronously (for immediate use)
  getAllMarksSync(): Mark[] {
    return this.marksSubject.value || this.getMarksFromLocal();
  }

  // Add a marks record
  addMark(mark: Mark): Observable<Mark> {
    // Try backend
    return this.http.post<MarkResponse>(this.baseUrl, mark).pipe(
      tap(res => {
        if (res && res.data) {
          const current = this.getMarksFromLocal();
          current.push(res.data);
          this.marksSubject.next(current);
          this.saveToLocal(current);
        }
      }),
      catchError(err => {
        // fallback: add locally
        console.warn('Add mark failed, saving locally', err);
        const current = this.getMarksFromLocal();
        const newMark = { ...mark, marksId: this.getNextMarkId() } as Mark;
        current.push(newMark);
        this.saveToLocal(current);
        this.marksSubject.next(current);
        return of(newMark);
      }),
      // map to Mark
    ) as unknown as Observable<Mark>;
  }

  // Update a marks record
  updateMark(mark: Mark): Observable<Mark> {
    if (!mark.marksId) {
      return throwError(() => new Error('marksId is required'));
    }

    const url = `${this.baseUrl}/${mark.marksId}`;
    return this.http.put<MarkResponse>(url, mark).pipe(
      tap(res => {
        if (res && res.data) {
          const current = this.getMarksFromLocal();
          const idx = current.findIndex(m => m.marksId === res.data!.marksId);
          if (idx > -1) {
            current[idx] = res.data!;
            this.saveToLocal(current);
            this.marksSubject.next(current);
          }
        }
      }),
      catchError(err => {
        // fallback: update locally
        console.warn('Update mark failed, updating locally', err);
        const current = this.getMarksFromLocal();
        const idx = current.findIndex(m => m.marksId === mark.marksId);
        if (idx > -1) {
          current[idx] = mark;
          this.saveToLocal(current);
          this.marksSubject.next(current);
        }
        return of(mark);
      })
    ) as unknown as Observable<Mark>;
  }

  // Delete a marks record
  deleteMark(marksId: string): Observable<any> {
    const url = `${this.baseUrl}/${marksId}`;
    return this.http.delete<any>(url).pipe(
      tap(() => {
        const current = this.getMarksFromLocal().filter(m => m.marksId !== marksId);
        this.saveToLocal(current);
        this.marksSubject.next(current);
      }),
      catchError(err => {
        console.warn('Delete mark failed, deleting locally', err);
        const current = this.getMarksFromLocal().filter(m => m.marksId !== marksId);
        this.saveToLocal(current);
        this.marksSubject.next(current);
        return of({ success: true });
      })
    );
  }

  // Helper: get marks for a specific student
  getMarksByStudent(studentId: string): Mark[] {
    return this.getMarksFromLocal().filter(m => m.studentId === studentId);
  }

  // Helper: get marks for a specific student and class
  getMarksByStudentAndClass(studentId: string, classNumber: number): Mark[] {
    const allSubjects = this.sampleSubjects;
    const subjectIds = this.classSubjectsMap[classNumber] || [];
    const allowedSubjectNames = allSubjects
      .filter(s => subjectIds.includes(s.subjectId || 0))
      .map(s => s.subjectName);
    
    return this.getMarksByStudent(studentId)
      .filter(m => allowedSubjectNames.includes(m.subject));
  }

  // Helper: calculate average marks for a student
  getAverageForStudent(studentId: string): number {
    const marks = this.getMarksByStudent(studentId);
    if (!marks.length) return 0;
    const total = marks.reduce((s, m) => s + (m.marksObtained || 0), 0);
    return Math.round((total / marks.length) * 100) / 100;
  }

  // local storage helpers
  private getMarksFromLocal(): Mark[] {
    try {
      const raw = localStorage.getItem(this.localKey);
      if (!raw) {
        // If not in localStorage, save sample marks and return them
        this.saveToLocal(this.sampleMarks);
        return this.sampleMarks;
      }
      const parsed = JSON.parse(raw) as Mark[];
      return parsed.length > 0 ? parsed : this.sampleMarks;
    } catch (e) {
      console.error('Failed to read marks from local storage', e);
      return this.sampleMarks;
    }
  }

  private saveToLocal(marks: Mark[]) {
    try {
      localStorage.setItem(this.localKey, JSON.stringify(marks));
    } catch (e) {
      console.error('Failed to save marks to local storage', e);
    }
  }

  private getNextMarkId(): string {
    const current = this.getMarksFromLocal();
    const maxN = current.reduce((max, m) => {
      const num = parseInt((m.marksId || '').replace(/[^0-9]/g, ''), 10) || 0;
      return Math.max(max, num);
    }, 0);
    return `M${(maxN + 1)}`;
  }
}
