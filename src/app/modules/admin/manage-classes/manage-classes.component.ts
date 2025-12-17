import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { ClassesService, SchoolClass } from '../../../core/services/classes.service';

@Component({
  selector: 'app-manage-classes',
  templateUrl: './manage-classes.component.html',
  styleUrls: ['./manage-classes.component.css']
})
export class ManageClassesComponent implements OnInit {

  displayedColumns: string[] = ['className', 'classNumber', 'studentCount', 'status', 'actions'];
  dataSource!: MatTableDataSource<SchoolClass>;
  
  classes: SchoolClass[] = [];
  filteredClasses: SchoolClass[] = [];
  
  // View mode
  viewMode: 'table' | 'cards' = 'table';
  
  // Form state
  showAddForm = false;
  showEditForm = false;
  editingClass: SchoolClass | null = null;
  
  // Form inputs
  newClassName = '';
  newClassNumber: number | null = null;
  
  // Filter
  searchTerm = '';
  selectedClass: string = '';
  
  classNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  constructor(private classesService: ClassesService) {
    // Load initial data from service
    this.classes = this.classesService.getClassesArray();
    this.dataSource = new MatTableDataSource(this.classes);
  }

  ngOnInit(): void {
    this.filterClasses();
  }

  // Update class name based on class number
  updateClassName(): void {
    if (this.newClassNumber) {
      this.newClassName = `Class ${this.newClassNumber}`;
    }
  }

  // Toggle view mode
  toggleViewMode(mode: 'table' | 'cards'): void {
    this.viewMode = mode;
  }

  // Toggle add form
  toggleAddForm(): void {
    this.showAddForm = !this.showAddForm;
    if (!this.showAddForm) {
      this.resetForm();
    }
  }

  // Toggle edit form
  toggleEditForm(schoolClass?: SchoolClass): void {
    if (schoolClass) {
      this.editingClass = schoolClass;
      this.newClassName = schoolClass.className;
      this.newClassNumber = schoolClass.classNumber;
      this.showEditForm = true;
    } else {
      this.showEditForm = false;
      this.resetForm();
    }
  }

  // Add new class
  addClass(): void {
    if (!this.newClassName.trim() || !this.newClassNumber) {
      alert('Please fill all fields');
      return;
    }

    // Check for duplicate class
    if (this.classes.some(c => c.classNumber === this.newClassNumber && (!this.editingClass || c.classId !== this.editingClass.classId))) {
      alert('This class already exists!');
      return;
    }

    const newClass: SchoolClass = {
      classId: this.classes.length > 0 ? Math.max(...this.classes.map(c => c.classId)) + 1 : 1,
      className: this.newClassName.trim(),
      classNumber: this.newClassNumber!,
      studentCount: 0,
      maxCapacity: 60,
      isActive: true
    };

    this.classes.push(newClass);
    this.classesService.setClasses(this.classes);
    this.filterClasses();
    this.resetForm();
    this.showAddForm = false;
    alert('Class added successfully!');
  }

  // Update class
  updateClass(): void {
    if (!this.editingClass) return;

    if (!this.newClassName.trim() || !this.newClassNumber) {
      alert('Please fill all fields');
      return;
    }

    // Check for duplicate class
    if (this.classes.some(c => c.classNumber === this.newClassNumber && c.classId !== this.editingClass!.classId)) {
      alert('This class already exists!');
      return;
    }

    const index = this.classes.findIndex(c => c.classId === this.editingClass!.classId);
    if (index !== -1) {
      this.classes[index] = {
        ...this.editingClass,
        className: this.newClassName.trim(),
        classNumber: this.newClassNumber!
      };
      this.classesService.setClasses(this.classes);
      this.filterClasses();
      this.resetForm();
      this.showEditForm = false;
      alert('Class updated successfully!');
    }
  }

  // Delete class
  deleteClass(schoolClass: SchoolClass): void {
    if (confirm(`Delete class ${schoolClass.className}?`)) {
      this.classes = this.classes.filter(c => c.classId !== schoolClass.classId);
      this.classesService.setClasses(this.classes);
      this.filterClasses();
      alert('Class deleted successfully!');
    }
  }

  // Toggle active status
  toggleStatus(schoolClass: SchoolClass): void {
    schoolClass.isActive = !schoolClass.isActive;
    this.filterClasses();
  }

  // Filter classes based on search and class number
  filterClasses(): void {
    this.filteredClasses = this.classes.filter(c => {
      const matchesSearch = !this.searchTerm || 
        c.className.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesClass = !this.selectedClass || c.classNumber.toString() === this.selectedClass;
      
      return matchesSearch && matchesClass;
    });
    this.dataSource = new MatTableDataSource(this.filteredClasses);
  }

  // Reset form
  resetForm(): void {
    this.newClassName = '';
    this.newClassNumber = null;
    this.editingClass = null;
  }

  // Save (add or update)
  save(): void {
    if (this.editingClass) {
      this.updateClass();
    } else {
      this.addClass();
    }
  }

  // Get status badge color
  getStatusColor(isActive: boolean): string {
    return isActive ? 'accent' : 'warn';
  }

  // Get status text
  getStatusText(isActive: boolean): string {
    return isActive ? 'Active' : 'Inactive';
  }
}
