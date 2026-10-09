package com.drcarcare.controller;

import com.drcarcare.dto.ReminderRequest;
import com.drcarcare.dto.ReminderResponse;
import com.drcarcare.service.ReminderService;

import jakarta.validation.Valid;

import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reminders")
@RequiredArgsConstructor
public class ReminderController {

    private final ReminderService reminderService;

    // =========================================================
    // CREATE
    // =========================================================

    @PostMapping
    public ResponseEntity<ReminderResponse> createReminder(
            @Valid @RequestBody ReminderRequest request
    ) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        reminderService.createReminder(
                                request
                        )
                );
    }

    // =========================================================
    // GET ALL
    // =========================================================

    @GetMapping
    public ResponseEntity<List<ReminderResponse>>
    getAllReminders() {

        return ResponseEntity.ok(
                reminderService.getAllReminders()
        );
    }

    // =========================================================
    // GET BY ID
    // =========================================================

    @GetMapping("/{id}")
    public ResponseEntity<ReminderResponse>
    getReminderById(
            @PathVariable Long id
    ) {

        return ResponseEntity.ok(
                reminderService.getReminderById(id)
        );
    }

    // =========================================================
    // UPDATE
    // =========================================================

    @PutMapping("/{id}")
    public ResponseEntity<ReminderResponse>
    updateReminder(
            @PathVariable Long id,
            @Valid @RequestBody ReminderRequest request
    ) {

        return ResponseEntity.ok(
                reminderService.updateReminder(
                        id,
                        request
                )
        );
    }

    // =========================================================
    // COMPLETE
    // =========================================================

    @PatchMapping("/{id}/complete")
    public ResponseEntity<ReminderResponse>
    completeReminder(
            @PathVariable Long id
    ) {

        return ResponseEntity.ok(
                reminderService.completeReminder(id)
        );
    }

    // =========================================================
    // CANCEL
    // =========================================================

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<ReminderResponse>
    cancelReminder(
            @PathVariable Long id
    ) {

        return ResponseEntity.ok(
                reminderService.cancelReminder(id)
        );
    }

    // =========================================================
    // PENDING
    // =========================================================

    @GetMapping("/pending")
    public ResponseEntity<List<ReminderResponse>>
    getPendingReminders() {

        return ResponseEntity.ok(
                reminderService.getPendingReminders()
        );
    }

    // =========================================================
    // TODAY
    // =========================================================

    @GetMapping("/today")
    public ResponseEntity<List<ReminderResponse>>
    getTodayReminders() {

        return ResponseEntity.ok(
                reminderService.getTodayReminders()
        );
    }

    // =========================================================
    // OVERDUE
    // =========================================================

    @GetMapping("/overdue")
    public ResponseEntity<List<ReminderResponse>>
    getOverdueReminders() {

        return ResponseEntity.ok(
                reminderService.getOverdueReminders()
        );
    }

    // =========================================================
    // BY CUSTOMER
    // =========================================================

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<ReminderResponse>>
    getByCustomer(
            @PathVariable Long customerId
    ) {

        return ResponseEntity.ok(
                reminderService.getByCustomer(
                        customerId
                )
        );
    }

    // =========================================================
    // BY VEHICLE
    // =========================================================

    @GetMapping("/vehicle/{vehicleId}")
    public ResponseEntity<List<ReminderResponse>>
    getByVehicle(
            @PathVariable Long vehicleId
    ) {

        return ResponseEntity.ok(
                reminderService.getByVehicle(
                        vehicleId
                )
        );
    }

    // =========================================================
    // DELETE
    // =========================================================

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReminder(
            @PathVariable Long id
    ) {

        reminderService.deleteReminder(id);

        return ResponseEntity.noContent().build();
    }
}