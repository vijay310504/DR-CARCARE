package com.drcarcare.controller;

import com.drcarcare.dto.EstimateItemRequest;
import com.drcarcare.dto.EstimateItemResponse;
import com.drcarcare.dto.EstimateRequest;
import com.drcarcare.dto.EstimateResponse;
import com.drcarcare.service.EstimateService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/estimates")
@RequiredArgsConstructor
public class EstimateController {

    private final EstimateService estimateService;

    // =========================================================
    // ESTIMATE
    // =========================================================

    @PostMapping
    public ResponseEntity<EstimateResponse> createEstimate(
            @Valid @RequestBody EstimateRequest request
    ) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        estimateService.createEstimate(
                                request
                        )
                );
    }

    @GetMapping
    public ResponseEntity<List<EstimateResponse>> getAllEstimates() {

        return ResponseEntity.ok(
                estimateService.getAllEstimates()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<EstimateResponse> getEstimateById(
            @PathVariable Long id
    ) {

        return ResponseEntity.ok(
                estimateService.getEstimateById(id)
        );
    }

    @GetMapping("/number/{estimateNumber}")
    public ResponseEntity<EstimateResponse> getByEstimateNumber(
            @PathVariable String estimateNumber
    ) {

        return ResponseEntity.ok(
                estimateService.getByEstimateNumber(
                        estimateNumber
                )
        );
    }

    @GetMapping("/job-card/{jobCardId}")
    public ResponseEntity<List<EstimateResponse>> getByJobCard(
            @PathVariable Long jobCardId
    ) {

        return ResponseEntity.ok(
                estimateService.getByJobCard(
                        jobCardId
                )
        );
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<EstimateResponse>> getByStatus(
            @PathVariable String status
    ) {

        return ResponseEntity.ok(
                estimateService.getByStatus(status)
        );
    }

    // =========================================================
    // ESTIMATE ITEMS
    // =========================================================

    @PostMapping("/{estimateId}/items")
    public ResponseEntity<EstimateItemResponse> addItem(
            @PathVariable Long estimateId,
            @Valid @RequestBody EstimateItemRequest request
    ) {

        /*
         * URL is authoritative.
         */
        request.setEstimateId(estimateId);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        estimateService.addItem(
                                request
                        )
                );
    }

    @PutMapping("/{estimateId}/items/{itemId}")
    public ResponseEntity<EstimateItemResponse> updateItem(
            @PathVariable Long estimateId,
            @PathVariable Long itemId,
            @Valid @RequestBody EstimateItemRequest request
    ) {

        request.setEstimateId(estimateId);

        return ResponseEntity.ok(
                estimateService.updateItem(
                        estimateId,
                        itemId,
                        request
                )
        );
    }

    @DeleteMapping("/{estimateId}/items/{itemId}")
    public ResponseEntity<Void> deleteItem(
            @PathVariable Long estimateId,
            @PathVariable Long itemId
    ) {

        estimateService.deleteItem(
                estimateId,
                itemId
        );

        return ResponseEntity.noContent().build();
    }

    // =========================================================
    // WORKFLOW
    // =========================================================

    @PatchMapping("/{id}/submit")
    public ResponseEntity<EstimateResponse> submitEstimate(
            @PathVariable Long id
    ) {

        return ResponseEntity.ok(
                estimateService.submitEstimate(id)
        );
    }

    @PatchMapping("/{id}/approve")
    public ResponseEntity<EstimateResponse> approveEstimate(
            @PathVariable Long id
    ) {

        return ResponseEntity.ok(
                estimateService.approveEstimate(id)
        );
    }

    @PatchMapping("/{id}/reject")
    public ResponseEntity<EstimateResponse> rejectEstimate(
            @PathVariable Long id,
            @RequestParam String reason
    ) {

        return ResponseEntity.ok(
                estimateService.rejectEstimate(
                        id,
                        reason
                )
        );
    }
    // =========================================================
    // DELETE ESTIMATE
    // =========================================================
    @PutMapping("/{id}")
    public ResponseEntity<EstimateResponse> updateEstimate(
            @PathVariable Long id,
            @Valid @RequestBody EstimateRequest request
    ) {
        return ResponseEntity.ok(
                estimateService.updateEstimate(id, request)
        );
    }
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEstimate(
            @PathVariable Long id
    ) {

        estimateService.deleteEstimate(id);

        return ResponseEntity.noContent().build();
    }
}