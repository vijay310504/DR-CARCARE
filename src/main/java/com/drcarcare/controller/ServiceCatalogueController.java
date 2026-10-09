package com.drcarcare.controller;

import com.drcarcare.dto.ServiceCatalogueRequest;
import com.drcarcare.dto.ServiceCatalogueResponse;
import com.drcarcare.service.ServiceCatalogueService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/services")
@RequiredArgsConstructor
public class ServiceCatalogueController {

    private final ServiceCatalogueService serviceCatalogueService;

    @PostMapping
    public ResponseEntity<ServiceCatalogueResponse> createService(
            @Valid @RequestBody ServiceCatalogueRequest request
    ) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(serviceCatalogueService.createService(request));
    }

    @GetMapping
    public ResponseEntity<List<ServiceCatalogueResponse>> getAllServices() {

        return ResponseEntity.ok(
                serviceCatalogueService.getAllServices()
        );
    }

    @GetMapping("/active")
    public ResponseEntity<List<ServiceCatalogueResponse>> getActiveServices() {

        return ResponseEntity.ok(
                serviceCatalogueService.getActiveServices()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<ServiceCatalogueResponse> getServiceById(
            @PathVariable Long id
    ) {

        return ResponseEntity.ok(
                serviceCatalogueService.getServiceById(id)
        );
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<List<ServiceCatalogueResponse>> getServicesByCategory(
            @PathVariable String category
    ) {

        return ResponseEntity.ok(
                serviceCatalogueService
                        .getServicesByCategory(category)
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<ServiceCatalogueResponse> updateService(
            @PathVariable Long id,
            @Valid @RequestBody ServiceCatalogueRequest request
    ) {

        return ResponseEntity.ok(
                serviceCatalogueService
                        .updateService(id, request)
        );
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ServiceCatalogueResponse> updateServiceStatus(
            @PathVariable Long id,
            @RequestParam boolean active
    ) {

        return ResponseEntity.ok(
                serviceCatalogueService
                        .updateServiceStatus(id, active)
        );
    }
}