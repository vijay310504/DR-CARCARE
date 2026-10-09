package com.drcarcare.controller;

import com.drcarcare.dto.InspectionRequest;
import com.drcarcare.dto.InspectionResponse;
import com.drcarcare.service.InspectionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inspections")
@RequiredArgsConstructor
public class InspectionController {

    private final InspectionService inspectionService;


    // =========================================================
    // CREATE INSPECTION
    // =========================================================

    @PostMapping
    public ResponseEntity<InspectionResponse> createInspection(
            @Valid @RequestBody InspectionRequest request
    ) {

        InspectionResponse response =
                inspectionService.createInspection(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }


    // =========================================================
    // GET ALL INSPECTIONS
    // =========================================================

    @GetMapping
    public ResponseEntity<List<InspectionResponse>> getAllInspections() {

        return ResponseEntity.ok(
                inspectionService.getAllInspections()
        );
    }


    // =========================================================
    // GET INSPECTION BY ID
    // =========================================================

    @GetMapping("/{id}")
    public ResponseEntity<InspectionResponse> getInspectionById(
            @PathVariable Long id
    ) {

        return ResponseEntity.ok(
                inspectionService.getInspectionById(id)
        );
    }


    // =========================================================
    // UPDATE INSPECTION
    // =========================================================

    @PutMapping("/{id}")
    public ResponseEntity<InspectionResponse> updateInspection(
            @PathVariable Long id,
            @Valid @RequestBody InspectionRequest request
    ) {

        return ResponseEntity.ok(
                inspectionService.updateInspection(id, request)
        );
    }


    // =========================================================
    // DELETE INSPECTION
    // =========================================================

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteInspection(
            @PathVariable Long id
    ) {

        inspectionService.deleteInspection(id);

        return ResponseEntity.noContent().build();
    }


    // =========================================================
    // GET INSPECTIONS BY JOB CARD
    // =========================================================

    @GetMapping("/job-card/{jobCardId}")
    public ResponseEntity<List<InspectionResponse>> getInspectionsByJobCard(
            @PathVariable Long jobCardId
    ) {

        return ResponseEntity.ok(
                inspectionService.getInspectionsByJobCard(jobCardId)
        );
    }


    // =========================================================
    // GET INSPECTIONS BY JOB CARD + CATEGORY
    // =========================================================

    @GetMapping("/job-card/{jobCardId}/category/{category}")
    public ResponseEntity<List<InspectionResponse>>
    getInspectionsByJobCardAndCategory(
            @PathVariable Long jobCardId,
            @PathVariable String category
    ) {

        return ResponseEntity.ok(
                inspectionService
                        .getInspectionsByJobCardAndCategory(
                                jobCardId,
                                category
                        )
        );
    }


    // =========================================================
    // GET INSPECTIONS BY CONDITION
    // =========================================================

    @GetMapping("/condition/{condition}")
    public ResponseEntity<List<InspectionResponse>>
    getInspectionsByCondition(
            @PathVariable String condition
    ) {

        return ResponseEntity.ok(
                inspectionService
                        .getInspectionsByCondition(condition)
        );
    }
}