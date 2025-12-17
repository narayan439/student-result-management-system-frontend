import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Recheck } from '../models/recheck.model';

@Injectable({
  providedIn: 'root'
})
export class RecheckService {

  private recheckSubject = new BehaviorSubject<Recheck[]>([]);
  private sampleRechecks: Recheck[] = this.generateSampleRechecks();

  constructor() {
    this.recheckSubject.next(this.sampleRechecks);
  }

  /**
   * Generate sample recheck data
   */
  private generateSampleRechecks(): Recheck[] {
    return [
      {
        recheckId: 1,
        studentId: 1,
        subject: 'Mathematics',
        reason: 'Question 5 calculation seems wrong',
        status: 'pending',
        requestDate: new Date().toISOString()
      },
      {
        recheckId: 2,
        studentId: 2,
        subject: 'Science',
        reason: 'Want to review answer key',
        status: 'completed',
        requestDate: new Date().toISOString()
      }
    ];
  }

  /**
   * Get all recheck requests
   */
  getAllRechecks(): Observable<Recheck[]> {
    return of(this.recheckSubject.value || this.sampleRechecks);
  }

  /**
   * Get recheck requests for a specific student
   */
  getRechecksByStudent(studentId: number): Observable<Recheck[]> {
    const rechecks = (this.recheckSubject.value || []).filter(r => r.studentId === studentId);
    return of(rechecks);
  }

  /**
   * Add new recheck request
   */
  addRecheck(recheck: Recheck): Observable<Recheck> {
    const currentRechecks = this.recheckSubject.value || [];
    const maxId = Math.max(...currentRechecks.map(r => r.recheckId || 0), 0);
    const newRecheck = {
      ...recheck,
      recheckId: maxId + 1
    };
    const updated = [...currentRechecks, newRecheck];
    this.recheckSubject.next(updated);
    return of(newRecheck);
  }

  /**
   * Update recheck request
   */
  updateRecheck(recheck: Recheck): Observable<Recheck> {
    const currentRechecks = this.recheckSubject.value || [];
    const updated = currentRechecks.map(r => r.recheckId === recheck.recheckId ? recheck : r);
    this.recheckSubject.next(updated);
    return of(recheck);
  }

  /**
   * Delete recheck request
   */
  deleteRecheck(recheckId: number): Observable<boolean> {
    const currentRechecks = this.recheckSubject.value || [];
    const updated = currentRechecks.filter(r => r.recheckId !== recheckId);
    this.recheckSubject.next(updated);
    return of(true);
  }
}
