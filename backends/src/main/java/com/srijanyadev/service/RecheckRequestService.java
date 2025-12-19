package com.srijanyadev.service;

import com.srijanyadev.dto.RecheckRequestDTO;
import com.srijanyadev.entity.Marks;
import com.srijanyadev.entity.RecheckRequest;
import com.srijanyadev.entity.Student;
import com.srijanyadev.entity.User;
import com.srijanyadev.repository.MarksRepository;
import com.srijanyadev.repository.RecheckRequestRepository;
import com.srijanyadev.repository.StudentRepository;
import com.srijanyadev.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class RecheckRequestService {

    @Autowired
    private RecheckRequestRepository recheckRequestRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private MarksRepository marksRepository;

    @Autowired
    private UserRepository userRepository;

    /**
     * Get all recheck requests
     */
    public List<RecheckRequestDTO> getAllRecheckRequests() {
        return recheckRequestRepository.findAll()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get recheck requests by student ID
     */
    public List<RecheckRequestDTO> getRecheckRequestsByStudentId(Long studentId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found with ID: " + studentId));
        return recheckRequestRepository.findByStudentOrderByCreatedAtDesc(student)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get recheck requests by status
     */
    public List<RecheckRequestDTO> getRecheckRequestsByStatus(String status) {
        return recheckRequestRepository.findByStatus(status)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get pending recheck requests
     */
    public List<RecheckRequestDTO> getPendingRecheckRequests() {
        return getRecheckRequestsByStatus("pending");
    }

    /**
     * Create recheck request
     */
    public RecheckRequestDTO createRecheckRequest(Long studentId, Long markId, String reason) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found with ID: " + studentId));

        Marks marks = marksRepository.findById(markId)
                .orElseThrow(() -> new RuntimeException("Marks record not found with ID: " + markId));

        RecheckRequest recheckRequest = new RecheckRequest();
        recheckRequest.setStudent(student);
        recheckRequest.setMarks(marks);
        recheckRequest.setReason(reason);
        recheckRequest.setStatus("pending");

        RecheckRequest savedRequest = recheckRequestRepository.save(recheckRequest);
        return convertToDTO(savedRequest);
    }

    /**
     * Approve recheck request
     */
    public RecheckRequestDTO approveRecheckRequest(Long recheckId, Long reviewerId, String remarks) {
        RecheckRequest recheckRequest = recheckRequestRepository.findById(recheckId)
                .orElseThrow(() -> new RuntimeException("Recheck request not found with ID: " + recheckId));

        User reviewer = userRepository.findById(reviewerId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + reviewerId));

        recheckRequest.setStatus("approved");
        recheckRequest.setRemarks(remarks);
        recheckRequest.setReviewedBy(reviewer);
        recheckRequest.setReviewedDate(LocalDateTime.now());

        RecheckRequest updatedRequest = recheckRequestRepository.save(recheckRequest);
        return convertToDTO(updatedRequest);
    }

    /**
     * Reject recheck request
     */
    public RecheckRequestDTO rejectRecheckRequest(Long recheckId, Long reviewerId, String remarks) {
        RecheckRequest recheckRequest = recheckRequestRepository.findById(recheckId)
                .orElseThrow(() -> new RuntimeException("Recheck request not found with ID: " + recheckId));

        User reviewer = userRepository.findById(reviewerId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + reviewerId));

        recheckRequest.setStatus("rejected");
        recheckRequest.setRemarks(remarks);
        recheckRequest.setReviewedBy(reviewer);
        recheckRequest.setReviewedDate(LocalDateTime.now());

        RecheckRequest updatedRequest = recheckRequestRepository.save(recheckRequest);
        return convertToDTO(updatedRequest);
    }

    /**
     * Complete recheck request
     */
    public RecheckRequestDTO completeRecheckRequest(Long recheckId) {
        RecheckRequest recheckRequest = recheckRequestRepository.findById(recheckId)
                .orElseThrow(() -> new RuntimeException("Recheck request not found with ID: " + recheckId));

        recheckRequest.setStatus("completed");
        RecheckRequest updatedRequest = recheckRequestRepository.save(recheckRequest);
        return convertToDTO(updatedRequest);
    }

    /**
     * Convert RecheckRequest entity to DTO
     */
    private RecheckRequestDTO convertToDTO(RecheckRequest recheckRequest) {
        return RecheckRequestDTO.builder()
                .recheckId(recheckRequest.getRecheckId())
                .studentId(recheckRequest.getStudent().getStudentId())
                .studentName(recheckRequest.getStudent().getName())
                .rollNo(recheckRequest.getStudent().getRollNo())
                .markId(recheckRequest.getMarks().getMarkId())
                .subject(recheckRequest.getMarks().getSubject())
                .marksObtained(recheckRequest.getMarks().getMarksObtained())
                .reason(recheckRequest.getReason())
                .status(recheckRequest.getStatus())
                .remarks(recheckRequest.getRemarks())
                .reviewedBy(recheckRequest.getReviewedBy() != null ? recheckRequest.getReviewedBy().getUsername() : null)
                .createdAt(recheckRequest.getCreatedAt())
                .reviewedDate(recheckRequest.getReviewedDate())
                .updatedAt(recheckRequest.getUpdatedAt())
                .build();
    }
}
