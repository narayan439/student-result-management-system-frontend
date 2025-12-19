package com.srijanyadev.service;

import com.srijanyadev.dto.StudentDTO;
import com.srijanyadev.entity.Student;
import com.srijanyadev.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class StudentService {

    @Autowired
    private StudentRepository studentRepository;

    /**
     * Get all students
     */
    public List<StudentDTO> getAllStudents() {
        return studentRepository.findAll()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get active students
     */
    public List<StudentDTO> getActiveStudents() {
        return studentRepository.findByIsActiveTrue()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get student by ID
     */
    public Optional<StudentDTO> getStudentById(Long id) {
        return studentRepository.findById(id)
                .map(this::convertToDTO);
    }

    /**
     * Get student by email
     */
    public Optional<StudentDTO> getStudentByEmail(String email) {
        return studentRepository.findByEmail(email)
                .map(this::convertToDTO);
    }

    /**
     * Get student by roll number
     */
    public Optional<StudentDTO> getStudentByRollNo(String rollNo) {
        return studentRepository.findByRollNo(rollNo)
                .map(this::convertToDTO);
    }

    /**
     * Get students by class
     */
    public List<StudentDTO> getStudentsByClass(String className) {
        return studentRepository.findByClassName(className)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Create new student
     */
    public StudentDTO createStudent(StudentDTO studentDTO) {
        // Check if email already exists
        if (studentRepository.findByEmail(studentDTO.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists: " + studentDTO.getEmail());
        }

        // Check if roll number already exists
        if (studentRepository.findByRollNo(studentDTO.getRollNo()).isPresent()) {
            throw new RuntimeException("Roll number already exists: " + studentDTO.getRollNo());
        }

        Student student = new Student();
        student.setName(studentDTO.getName());
        student.setEmail(studentDTO.getEmail());
        student.setRollNo(studentDTO.getRollNo());
        student.setClassName(studentDTO.getClassName());
        student.setDateOfBirth(studentDTO.getDateOfBirth());
        student.setPhone(studentDTO.getPhone());
        student.setAddress(studentDTO.getAddress());
        student.setIsActive(true);

        Student savedStudent = studentRepository.save(student);
        return convertToDTO(savedStudent);
    }

    /**
     * Update student
     */
    public StudentDTO updateStudent(Long id, StudentDTO studentDTO) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not found with ID: " + id));

        student.setName(studentDTO.getName());
        student.setPhone(studentDTO.getPhone());
        student.setAddress(studentDTO.getAddress());
        student.setIsActive(studentDTO.getIsActive());

        Student updatedStudent = studentRepository.save(student);
        return convertToDTO(updatedStudent);
    }

    /**
     * Delete student (soft delete)
     */
    public void deleteStudent(Long id) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not found with ID: " + id));
        student.setIsActive(false);
        studentRepository.save(student);
    }

    /**
     * Convert Student entity to DTO
     */
    private StudentDTO convertToDTO(Student student) {
        return StudentDTO.builder()
                .studentId(student.getStudentId())
                .name(student.getName())
                .email(student.getEmail())
                .rollNo(student.getRollNo())
                .className(student.getClassName())
                .dateOfBirth(student.getDateOfBirth())
                .phone(student.getPhone())
                .address(student.getAddress())
                .isActive(student.getIsActive())
                .createdAt(student.getCreatedAt())
                .updatedAt(student.getUpdatedAt())
                .build();
    }
}
