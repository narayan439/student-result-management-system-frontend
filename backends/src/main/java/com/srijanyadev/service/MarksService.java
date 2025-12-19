package com.srijanyadev.service;

import com.srijanyadev.dto.MarksDTO;
import com.srijanyadev.entity.Marks;
import com.srijanyadev.entity.Student;
import com.srijanyadev.repository.MarksRepository;
import com.srijanyadev.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class MarksService {

    @Autowired
    private MarksRepository marksRepository;

    @Autowired
    private StudentRepository studentRepository;

    /**
     * Get all marks
     */
    public List<MarksDTO> getAllMarks() {
        return marksRepository.findAll()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get marks by student ID
     */
    public List<MarksDTO> getMarksByStudentId(Long studentId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found with ID: " + studentId));
        return marksRepository.findByStudentAndIsActiveTrue(student)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get marks by year
     */
    public List<MarksDTO> getMarksByYear(Integer year) {
        return marksRepository.findByYear(year)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get marks by term
     */
    public List<MarksDTO> getMarksByTerm(String term) {
        return marksRepository.findByTerm(term)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Create marks record
     */
    public MarksDTO createMarks(Long studentId, MarksDTO marksDTO) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found with ID: " + studentId));

        Marks marks = new Marks();
        marks.setStudent(student);
        marks.setSubject(marksDTO.getSubject());
        marks.setMarksObtained(marksDTO.getMarksObtained());
        marks.setMaxMarks(marksDTO.getMaxMarks());
        marks.setTerm(marksDTO.getTerm());
        marks.setYear(marksDTO.getYear());
        marks.setIsActive(true);

        Marks savedMarks = marksRepository.save(marks);
        return convertToDTO(savedMarks);
    }

    /**
     * Update marks record
     */
    public MarksDTO updateMarks(Long markId, MarksDTO marksDTO) {
        Marks marks = marksRepository.findById(markId)
                .orElseThrow(() -> new RuntimeException("Marks record not found with ID: " + markId));

        marks.setMarksObtained(marksDTO.getMarksObtained());
        marks.setMaxMarks(marksDTO.getMaxMarks());
        marks.setTerm(marksDTO.getTerm());
        marks.setYear(marksDTO.getYear());

        Marks updatedMarks = marksRepository.save(marks);
        return convertToDTO(updatedMarks);
    }

    /**
     * Delete marks record (soft delete)
     */
    public void deleteMarks(Long markId) {
        Marks marks = marksRepository.findById(markId)
                .orElseThrow(() -> new RuntimeException("Marks record not found with ID: " + markId));
        marks.setIsActive(false);
        marksRepository.save(marks);
    }

    /**
     * Convert Marks entity to DTO
     */
    private MarksDTO convertToDTO(Marks marks) {
        return MarksDTO.builder()
                .markId(marks.getMarkId())
                .studentId(marks.getStudent().getStudentId())
                .studentName(marks.getStudent().getName())
                .rollNo(marks.getStudent().getRollNo())
                .subject(marks.getSubject())
                .marksObtained(marks.getMarksObtained())
                .maxMarks(marks.getMaxMarks())
                .term(marks.getTerm())
                .year(marks.getYear())
                .isActive(marks.getIsActive())
                .createdAt(marks.getCreatedAt())
                .updatedAt(marks.getUpdatedAt())
                .build();
    }
}
