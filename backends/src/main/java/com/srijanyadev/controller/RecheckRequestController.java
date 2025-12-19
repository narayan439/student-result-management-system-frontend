package com.srijanyadev.controller;

import com.srijanyadev.dto.ApiResponse;
import com.srijanyadev.dto.RecheckRequestDTO;
import com.srijanyadev.service.RecheckRequestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/recheck-requests")
@CrossOrigin(origins = {"http://localhost:4200", "http://localhost:3000"})
public class RecheckRequestController {

    @Autowired
    private RecheckRequestService recheckRequestService;

    /**
     * Get all recheck requests
     */
    @GetMapping("/all")
    public ResponseEntity<ApiResponse<List<RecheckRequestDTO>>> getAllRecheckRequests() {
        try {
            List<RecheckRequestDTO> requests = recheckRequestService.getAllRecheckRequests();
            return ResponseEntity.ok(
                    ApiResponse.success("Recheck requests retrieved successfully", requests)
            );
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve recheck requests", List.of(e.getMessage())));
        }
    }

    /**
     * Get recheck requests by student ID
     */
    @GetMapping("/student/{studentId}")
    public ResponseEntity<ApiResponse<List<RecheckRequestDTO>>> getRecheckRequestsByStudentId(@PathVariable Long studentId) {
        try {
            List<RecheckRequestDTO> requests = recheckRequestService.getRecheckRequestsByStudentId(studentId);
            return ResponseEntity.ok(
                    ApiResponse.success("Recheck requests retrieved successfully", requests)
            );
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve recheck requests", List.of(e.getMessage())));
        }
    }

    /**
     * Get recheck requests by status
     */
    @GetMapping("/status/{status}")
    public ResponseEntity<ApiResponse<List<RecheckRequestDTO>>> getRecheckRequestsByStatus(@PathVariable String status) {
        try {
            List<RecheckRequestDTO> requests = recheckRequestService.getRecheckRequestsByStatus(status);
            return ResponseEntity.ok(
                    ApiResponse.success("Recheck requests retrieved successfully", requests)
            );
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve recheck requests", List.of(e.getMessage())));
        }
    }

    /**
     * Get pending recheck requests
     */
    @GetMapping("/pending")
    public ResponseEntity<ApiResponse<List<RecheckRequestDTO>>> getPendingRecheckRequests() {
        try {
            List<RecheckRequestDTO> requests = recheckRequestService.getPendingRecheckRequests();
            return ResponseEntity.ok(
                    ApiResponse.success("Pending recheck requests retrieved successfully", requests)
            );
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve pending recheck requests", List.of(e.getMessage())));
        }
    }

    /**
     * Create recheck request
     */
    @PostMapping
    public ResponseEntity<ApiResponse<RecheckRequestDTO>> createRecheckRequest(
            @RequestParam Long studentId,
            @RequestParam Long markId,
            @RequestParam String reason) {
        try {
            RecheckRequestDTO createdRequest = recheckRequestService.createRecheckRequest(studentId, markId, reason);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Recheck request created successfully", createdRequest));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Failed to create recheck request", List.of(e.getMessage())));
        }
    }

    /**
     * Approve recheck request
     */
    @PutMapping("/{recheckId}/approve")
    public ResponseEntity<ApiResponse<RecheckRequestDTO>> approveRecheckRequest(
            @PathVariable Long recheckId,
            @RequestParam Long reviewerId,
            @RequestParam(required = false) String remarks) {
        try {
            RecheckRequestDTO updatedRequest = recheckRequestService.approveRecheckRequest(recheckId, reviewerId, remarks);
            return ResponseEntity.ok(
                    ApiResponse.success("Recheck request approved successfully", updatedRequest)
            );
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Failed to approve recheck request", List.of(e.getMessage())));
        }
    }

    /**
     * Reject recheck request
     */
    @PutMapping("/{recheckId}/reject")
    public ResponseEntity<ApiResponse<RecheckRequestDTO>> rejectRecheckRequest(
            @PathVariable Long recheckId,
            @RequestParam Long reviewerId,
            @RequestParam(required = false) String remarks) {
        try {
            RecheckRequestDTO updatedRequest = recheckRequestService.rejectRecheckRequest(recheckId, reviewerId, remarks);
            return ResponseEntity.ok(
                    ApiResponse.success("Recheck request rejected successfully", updatedRequest)
            );
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Failed to reject recheck request", List.of(e.getMessage())));
        }
    }

    /**
     * Complete recheck request
     */
    @PutMapping("/{recheckId}/complete")
    public ResponseEntity<ApiResponse<RecheckRequestDTO>> completeRecheckRequest(@PathVariable Long recheckId) {
        try {
            RecheckRequestDTO updatedRequest = recheckRequestService.completeRecheckRequest(recheckId);
            return ResponseEntity.ok(
                    ApiResponse.success("Recheck request completed successfully", updatedRequest)
            );
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Failed to complete recheck request", List.of(e.getMessage())));
        }
    }

    /**
     * Health check
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "UP");
        response.put("service", "Recheck Request Service");
        return ResponseEntity.ok(response);
    }
}
