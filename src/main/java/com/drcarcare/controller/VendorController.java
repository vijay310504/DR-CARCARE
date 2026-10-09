package com.drcarcare.controller;

import com.drcarcare.dto.VendorRequest;
import com.drcarcare.dto.VendorResponse;
import com.drcarcare.service.VendorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vendors")
@RequiredArgsConstructor
public class VendorController {

    private final VendorService vendorService;

    @PostMapping
    public ResponseEntity<VendorResponse> createVendor(
            @Valid @RequestBody VendorRequest request
    ) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(vendorService.createVendor(request));
    }

    @GetMapping
    public ResponseEntity<List<VendorResponse>> getAllVendors() {

        return ResponseEntity.ok(
                vendorService.getAllVendors()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<VendorResponse> getVendor(
            @PathVariable Long id
    ) {

        return ResponseEntity.ok(
                vendorService.getVendor(id)
        );
    }

    @GetMapping("/active")
    public ResponseEntity<List<VendorResponse>> getActiveVendors() {

        return ResponseEntity.ok(
                vendorService.getActiveVendors()
        );
    }

    @GetMapping("/search")
    public ResponseEntity<List<VendorResponse>> searchVendors(
            @RequestParam String name
    ) {

        return ResponseEntity.ok(
                vendorService.searchVendors(name)
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<VendorResponse> updateVendor(
            @PathVariable Long id,
            @Valid @RequestBody VendorRequest request
    ) {

        return ResponseEntity.ok(
                vendorService.updateVendor(id, request)
        );
    }

    @PatchMapping("/{id}/deactivate")
    public ResponseEntity<VendorResponse> deactivateVendor(
            @PathVariable Long id
    ) {

        return ResponseEntity.ok(
                vendorService.deactivateVendor(id)
        );
    }
}