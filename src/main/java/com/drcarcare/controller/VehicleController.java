package com.drcarcare.controller;

import com.drcarcare.dto.VehicleRequest;
import com.drcarcare.dto.VehicleResponse;
import com.drcarcare.service.VehicleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vehicles")
@RequiredArgsConstructor
public class VehicleController {

    private final VehicleService vehicleService;


    // =========================================================
    // CREATE VEHICLE
    // =========================================================

    @PostMapping
    public ResponseEntity<VehicleResponse> createVehicle(
            @Valid @RequestBody VehicleRequest request
    ) {

        VehicleResponse response =
                vehicleService.createVehicle(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }


    // =========================================================
    // GET ALL VEHICLES
    // =========================================================

    @GetMapping
    public ResponseEntity<List<VehicleResponse>> getAllVehicles() {

        return ResponseEntity.ok(
                vehicleService.getAllVehicles()
        );
    }


    // =========================================================
    // GET VEHICLE BY ID
    // =========================================================

    @GetMapping("/{id}")
    public ResponseEntity<VehicleResponse> getVehicleById(
            @PathVariable Long id
    ) {

        return ResponseEntity.ok(
                vehicleService.getVehicleById(id)
        );
    }


    // =========================================================
    // UPDATE VEHICLE
    // =========================================================

    @PutMapping("/{id}")
    public ResponseEntity<VehicleResponse> updateVehicle(
            @PathVariable Long id,
            @Valid @RequestBody VehicleRequest request
    ) {

        return ResponseEntity.ok(
                vehicleService.updateVehicle(id, request)
        );
    }


    // =========================================================
    // DEACTIVATE VEHICLE
    // =========================================================

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deactivateVehicle(
            @PathVariable Long id
    ) {

        vehicleService.deactivateVehicle(id);

        return ResponseEntity.noContent().build();
    }


    // =========================================================
    // GET VEHICLES BY CUSTOMER
    // =========================================================

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<VehicleResponse>>
    getVehiclesByCustomer(
            @PathVariable Long customerId
    ) {

        return ResponseEntity.ok(
                vehicleService.getVehiclesByCustomer(
                        customerId
                )
        );
    }


    // =========================================================
    // SEARCH VEHICLES
    // =========================================================

    @GetMapping("/search")
    public ResponseEntity<List<VehicleResponse>> searchVehicles(
            @RequestParam String keyword
    ) {

        return ResponseEntity.ok(
                vehicleService.searchVehicles(keyword)
        );
    }
}