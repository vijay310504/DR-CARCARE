package com.drcarcare.controller;

import com.drcarcare.dto.JobCardServiceItemRequest;
import com.drcarcare.dto.JobCardServiceItemResponse;
import com.drcarcare.service.JobCardServiceItemService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/job-card-services")
@RequiredArgsConstructor
public class JobCardServiceItemController {

    private final JobCardServiceItemService jobCardServiceItemService;


    // =========================================================
    // CREATE
    // =========================================================

    @PostMapping
    public ResponseEntity<JobCardServiceItemResponse> createServiceItem(
            @Valid @RequestBody JobCardServiceItemRequest request
    ) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        jobCardServiceItemService
                                .createServiceItem(request)
                );
    }


    // =========================================================
    // GET ALL
    // =========================================================

    @GetMapping
    public ResponseEntity<List<JobCardServiceItemResponse>>
    getAllServiceItems() {

        return ResponseEntity.ok(
                jobCardServiceItemService
                        .getAllServiceItems()
        );
    }


    // =========================================================
    // GET BY ID
    // =========================================================

    @GetMapping("/{id}")
    public ResponseEntity<JobCardServiceItemResponse>
    getServiceItemById(
            @PathVariable Long id
    ) {

        return ResponseEntity.ok(
                jobCardServiceItemService
                        .getServiceItemById(id)
        );
    }


    // =========================================================
    // GET BY JOB CARD
    // =========================================================

    @GetMapping("/job-card/{jobCardId}")
    public ResponseEntity<List<JobCardServiceItemResponse>>
    getServiceItemsByJobCard(
            @PathVariable Long jobCardId
    ) {

        return ResponseEntity.ok(
                jobCardServiceItemService
                        .getServiceItemsByJobCard(jobCardId)
        );
    }


    // =========================================================
    // GET BY STATUS
    // =========================================================

    @GetMapping("/status/{status}")
    public ResponseEntity<List<JobCardServiceItemResponse>>
    getServiceItemsByStatus(
            @PathVariable String status
    ) {

        return ResponseEntity.ok(
                jobCardServiceItemService
                        .getServiceItemsByStatus(status)
        );
    }


    // =========================================================
    // UPDATE
    // =========================================================

    @PutMapping("/{id}")
    public ResponseEntity<JobCardServiceItemResponse>
    updateServiceItem(
            @PathVariable Long id,
            @Valid @RequestBody JobCardServiceItemRequest request
    ) {

        return ResponseEntity.ok(
                jobCardServiceItemService
                        .updateServiceItem(id, request)
        );
    }


    // =========================================================
    // ASSIGN TECHNICIAN
    // =========================================================

    @PatchMapping("/{id}/technician/{technicianId}")
    public ResponseEntity<JobCardServiceItemResponse>
    assignTechnician(
            @PathVariable Long id,
            @PathVariable Long technicianId
    ) {

        return ResponseEntity.ok(
                jobCardServiceItemService
                        .assignTechnician(
                                id,
                                technicianId
                        )
        );
    }


    // =========================================================
    // REMOVE TECHNICIAN
    // =========================================================

    @PatchMapping("/{id}/technician/remove")
    public ResponseEntity<JobCardServiceItemResponse>
    removeTechnician(
            @PathVariable Long id
    ) {

        return ResponseEntity.ok(
                jobCardServiceItemService
                        .removeTechnician(id)
        );
    }


    // =========================================================
    // UPDATE STATUS
    // =========================================================

    @PatchMapping("/{id}/status")
    public ResponseEntity<JobCardServiceItemResponse>
    updateStatus(
            @PathVariable Long id,
            @RequestParam String status
    ) {

        return ResponseEntity.ok(
                jobCardServiceItemService
                        .updateStatus(
                                id,
                                status
                        )
        );
    }


    // =========================================================
    // DELETE
    // =========================================================

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteServiceItem(
            @PathVariable Long id
    ) {

        jobCardServiceItemService
                .deleteServiceItem(id);

        return ResponseEntity.noContent().build();
    }
}