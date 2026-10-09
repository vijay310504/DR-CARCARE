package com.drcarcare.controller;

import com.drcarcare.dto.JobCardTechnicianRequest;
import com.drcarcare.dto.JobCardTechnicianResponse;
import com.drcarcare.service.JobCardTechnicianService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/job-card-technicians")
@RequiredArgsConstructor
public class JobCardTechnicianController {

    private final JobCardTechnicianService jobCardTechnicianService;


    // =========================================================
    // CREATE
    // =========================================================

    @PostMapping
    public ResponseEntity<JobCardTechnicianResponse> assignTechnician(
            @Valid @RequestBody JobCardTechnicianRequest request
    ) {

        JobCardTechnicianResponse response =
                jobCardTechnicianService.assignTechnician(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }


    // =========================================================
    // GET ALL
    // =========================================================

    @GetMapping
    public ResponseEntity<List<JobCardTechnicianResponse>>
    getAllAssignments() {

        return ResponseEntity.ok(
                jobCardTechnicianService.getAllAssignments()
        );
    }


    // =========================================================
    // GET BY ID
    // =========================================================

    @GetMapping("/{id}")
    public ResponseEntity<JobCardTechnicianResponse>
    getAssignmentById(
            @PathVariable Long id
    ) {

        return ResponseEntity.ok(
                jobCardTechnicianService.getAssignmentById(id)
        );
    }


    // =========================================================
    // GET BY JOB CARD
    // =========================================================

    @GetMapping("/job-card/{jobCardId}")
    public ResponseEntity<List<JobCardTechnicianResponse>>
    getAssignmentsByJobCard(
            @PathVariable Long jobCardId
    ) {

        return ResponseEntity.ok(
                jobCardTechnicianService
                        .getAssignmentsByJobCard(jobCardId)
        );
    }


    // =========================================================
    // GET BY TECHNICIAN
    // =========================================================

    @GetMapping("/technician/{technicianId}")
    public ResponseEntity<List<JobCardTechnicianResponse>>
    getAssignmentsByTechnician(
            @PathVariable Long technicianId
    ) {

        return ResponseEntity.ok(
                jobCardTechnicianService
                        .getAssignmentsByTechnician(technicianId)
        );
    }


    // =========================================================
    // GET BY STATUS
    // =========================================================

    @GetMapping("/status/{status}")
    public ResponseEntity<List<JobCardTechnicianResponse>>
    getAssignmentsByStatus(
            @PathVariable String status
    ) {

        return ResponseEntity.ok(
                jobCardTechnicianService
                        .getAssignmentsByStatus(status)
        );
    }


    // =========================================================
    // UPDATE
    // =========================================================

    @PutMapping("/{id}")
    public ResponseEntity<JobCardTechnicianResponse>
    updateAssignment(
            @PathVariable Long id,
            @Valid @RequestBody JobCardTechnicianRequest request
    ) {

        return ResponseEntity.ok(
                jobCardTechnicianService
                        .updateAssignment(id, request)
        );
    }


    // =========================================================
    // UPDATE STATUS
    // =========================================================

    @PatchMapping("/{id}/status")
    public ResponseEntity<JobCardTechnicianResponse>
    updateStatus(
            @PathVariable Long id,
            @RequestParam String status
    ) {

        return ResponseEntity.ok(
                jobCardTechnicianService
                        .updateStatus(id, status)
        );
    }


    // =========================================================
    // DELETE
    // =========================================================

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAssignment(
            @PathVariable Long id
    ) {

        jobCardTechnicianService.deleteAssignment(id);

        return ResponseEntity.noContent().build();
    }
}