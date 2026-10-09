package com.drcarcare.controller;

import com.drcarcare.dto.JobCardRequest;
import com.drcarcare.dto.JobCardResponse;
import com.drcarcare.service.JobCardService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/job-cards")
@RequiredArgsConstructor
public class JobCardController {

    private final JobCardService jobCardService;

    @PostMapping
    public ResponseEntity<JobCardResponse> createJobCard(
            @Valid @RequestBody JobCardRequest request
    ) {

        JobCardResponse response =
                jobCardService.createJobCard(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    @GetMapping
    public ResponseEntity<List<JobCardResponse>>
    getAllJobCards() {

        return ResponseEntity.ok(
                jobCardService.getAllJobCards()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<JobCardResponse>
    getJobCardById(
            @PathVariable Long id
    ) {

        return ResponseEntity.ok(
                jobCardService.getJobCardById(id)
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<JobCardResponse>
    updateJobCard(
            @PathVariable Long id,
            @Valid @RequestBody JobCardRequest request
    ) {

        return ResponseEntity.ok(
                jobCardService.updateJobCard(
                        id,
                        request
                )
        );
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<JobCardResponse>
    updateJobCardStatus(
            @PathVariable Long id,
            @RequestParam String status
    ) {

        return ResponseEntity.ok(
                jobCardService.updateJobCardStatus(
                        id,
                        status
                )
        );
    }

    @GetMapping("/booking/{bookingId}")
    public ResponseEntity<JobCardResponse>
    getJobCardByBooking(
            @PathVariable Long bookingId
    ) {

        return ResponseEntity.ok(
                jobCardService.getJobCardByBooking(
                        bookingId
                )
        );
    }

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<JobCardResponse>>
    getJobCardsByCustomer(
            @PathVariable Long customerId
    ) {

        return ResponseEntity.ok(
                jobCardService.getJobCardsByCustomer(
                        customerId
                )
        );
    }

    @GetMapping("/vehicle/{vehicleId}")
    public ResponseEntity<List<JobCardResponse>>
    getJobCardsByVehicle(
            @PathVariable Long vehicleId
    ) {

        return ResponseEntity.ok(
                jobCardService.getJobCardsByVehicle(
                        vehicleId
                )
        );
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<JobCardResponse>>
    getJobCardsByStatus(
            @PathVariable String status
    ) {

        return ResponseEntity.ok(
                jobCardService.getJobCardsByStatus(
                        status
                )
        );
    }
}