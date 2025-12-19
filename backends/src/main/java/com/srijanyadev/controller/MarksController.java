package com.srijanyadev.controller;

import com.srijanyadev.dto.ApiResponse;
import com.srijanyadev.dto.MarksDTO;
import com.srijanyadev.service.MarksService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/marks")
@CrossOrigin(origins = {"http://localhost:4200", "http://localhost:3000"})
public class MarksController {

    @Autowired
    private MarksService marksService;

    /**
     * Get all marks
     */
    @GetMapping("/all")
    public ResponseEntity<ApiResponse<List<MarksDTO>>> getAllMarks() {
        try {
            List<MarksDTO> marks = marksService.getAllMarks();
            return ResponseEntity.ok(
                    ApiResponse.success("Marks retrieved successfully", marks)
            );
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve marks", List.of(e.getMessage())));
        }
    }

    /**
     * Get marks by student ID
     */
    @GetMapping("/student/{studentId}")
    public ResponseEntity<ApiResponse<List<MarksDTO>>> getMarksByStudentId(@PathVariable Long studentId) {
        try {
            List<MarksDTO> marks = marksService.getMarksByStudentId(studentId);
            return ResponseEntity.ok(
                    ApiResponse.success("Marks retrieved successfully", marks)
            );
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve marks", List.of(e.getMessage())));
        }
    }

    /**
     * Get marks by year
     */
    @GetMapping("/year/{year}")
    public ResponseEntity<ApiResponse<List<MarksDTO>>> getMarksByYear(@PathVariable Integer year) {
        try {
            List<MarksDTO> marks = marksService.getMarksByYear(year);
            return ResponseEntity.ok(
                    ApiResponse.success("Marks retrieved successfully", marks)
            );
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve marks", List.of(e.getMessage())));
        }
    }

    /**
     * Get marks by term
     */
    @GetMapping("/term/{term}")
    public ResponseEntity<ApiResponse<List<MarksDTO>>> getMarksByTerm(@PathVariable String term) {
        try {
            List<MarksDTO> marks = marksService.getMarksByTerm(term);
            return ResponseEntity.ok(
                    ApiResponse.success("Marks retrieved successfully", marks)
            );
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve marks", List.of(e.getMessage())));
        }
    }

    /**
     * Create marks record
     */
    @PostMapping("/student/{studentId}")
    public ResponseEntity<ApiResponse<MarksDTO>> createMarks(
            @PathVariable Long studentId,
            @RequestBody MarksDTO marksDTO) {
        try {
            MarksDTO createdMarks = marksService.createMarks(studentId, marksDTO);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Marks created successfully", createdMarks));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Failed to create marks", List.of(e.getMessage())));
        }
    }

    /**
     * Update marks record
     */
    @PutMapping("/{markId}")
    public ResponseEntity<ApiResponse<MarksDTO>> updateMarks(
            @PathVariable Long markId,
            @RequestBody MarksDTO marksDTO) {
        try {
            MarksDTO updatedMarks = marksService.updateMarks(markId, marksDTO);
            return ResponseEntity.ok(
                    ApiResponse.success("Marks updated successfully", updatedMarks)
            );
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Failed to update marks", List.of(e.getMessage())));
        }
    }

    /**
     * Delete marks record
     */
    @DeleteMapping("/{markId}")
    public ResponseEntity<ApiResponse<Void>> deleteMarks(@PathVariable Long markId) {
        try {
            marksService.deleteMarks(markId);
            return ResponseEntity.ok(
                    ApiResponse.success("Marks deleted successfully", null)
            );
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Failed to delete marks", List.of(e.getMessage())));
        }
    }
}
