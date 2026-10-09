package com.drcarcare.controller;
//technician controller

import com.drcarcare.dto.TechnicianRequest;
import com.drcarcare.dto.TechnicianResponse;
import com.drcarcare.service.TechnicianService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/technicians")
@RequiredArgsConstructor
public class TechnicianController {

    private final TechnicianService technicianService;


    // =========================================================
    // CREATE
    // =========================================================

    @PostMapping
    public ResponseEntity<TechnicianResponse> createTechnician(
            @Valid @RequestBody TechnicianRequest request
    ) {

        TechnicianResponse response =
                technicianService.createTechnician(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }


    // =========================================================
    // GET ALL
    // =========================================================

    @GetMapping
    public ResponseEntity<List<TechnicianResponse>>
    getAllTechnicians() {

        return ResponseEntity.ok(
                technicianService.getAllTechnicians()
        );
    }


    // =========================================================
    // GET BY ID
    // =========================================================

    @GetMapping("/{id}")
    public ResponseEntity<TechnicianResponse>
    getTechnicianById(
            @PathVariable Long id
    ) {

        return ResponseEntity.ok(
                technicianService.getTechnicianById(id)
        );
    }


    // =========================================================
    // GET BY TECHNICIAN CODE
    // =========================================================

    @GetMapping("/code/{technicianCode}")
    public ResponseEntity<TechnicianResponse>
    getTechnicianByCode(
            @PathVariable String technicianCode
    ) {

        return ResponseEntity.ok(
                technicianService.getTechnicianByCode(
                        technicianCode
                )
        );
    }


    // =========================================================
    // GET BY STATUS
    // =========================================================

    @GetMapping("/status/{status}")
    public ResponseEntity<List<TechnicianResponse>>
    getTechniciansByStatus(
            @PathVariable String status
    ) {

        return ResponseEntity.ok(
                technicianService.getTechniciansByStatus(
                        status
                )
        );
    }


    // =========================================================
    // GET BY SPECIALIZATION
    // =========================================================

    @GetMapping("/specialization/{specialization}")
    public ResponseEntity<List<TechnicianResponse>>
    getTechniciansBySpecialization(
            @PathVariable String specialization
    ) {

        return ResponseEntity.ok(
                technicianService
                        .getTechniciansBySpecialization(
                                specialization
                        )
        );
    }


    // =========================================================
    // GET BY SKILL LEVEL
    // =========================================================

    @GetMapping("/skill-level/{skillLevel}")
    public ResponseEntity<List<TechnicianResponse>>
    getTechniciansBySkillLevel(
            @PathVariable String skillLevel
    ) {

        return ResponseEntity.ok(
                technicianService
                        .getTechniciansBySkillLevel(
                                skillLevel
                        )
        );
    }


    // =========================================================
    // UPDATE
    // =========================================================

    @PutMapping("/{id}")
    public ResponseEntity<TechnicianResponse>
    updateTechnician(
            @PathVariable Long id,
            @Valid @RequestBody TechnicianRequest request
    ) {

        return ResponseEntity.ok(
                technicianService.updateTechnician(
                        id,
                        request
                )
        );
    }


    // =========================================================
    // CHANGE STATUS
    // =========================================================

    @PatchMapping("/{id}/status")
    public ResponseEntity<TechnicianResponse>
    updateStatus(
            @PathVariable Long id,
            @RequestParam String status
    ) {

        return ResponseEntity.ok(
                technicianService.updateStatus(
                        id,
                        status
                )
        );
    }


    // =========================================================
    // ACTIVATE
    // =========================================================

    @PatchMapping("/{id}/activate")
    public ResponseEntity<TechnicianResponse>
    activateTechnician(
            @PathVariable Long id
    ) {

        return ResponseEntity.ok(
                technicianService.activateTechnician(id)
        );
    }


    // =========================================================
    // DEACTIVATE
    // =========================================================

    @PatchMapping("/{id}/deactivate")
    public ResponseEntity<TechnicianResponse>
    deactivateTechnician(
            @PathVariable Long id
    ) {

        return ResponseEntity.ok(
                technicianService.deactivateTechnician(id)
        );
    }


    // =========================================================
    // DELETE
    // =========================================================

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTechnician(
            @PathVariable Long id
    ) {

        technicianService.deleteTechnician(id);

        return ResponseEntity.noContent().build();
    }
}