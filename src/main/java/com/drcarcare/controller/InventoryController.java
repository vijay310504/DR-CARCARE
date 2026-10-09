package com.drcarcare.controller;

import com.drcarcare.dto.*;
import com.drcarcare.service.InventoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inventory")
@RequiredArgsConstructor
public class InventoryController {

    private final InventoryService inventoryService;

    // =========================
    // INVENTORY ITEMS
    // =========================

    @PostMapping("/items")
    public ResponseEntity<InventoryItemResponse> createItem(
            @Valid @RequestBody InventoryItemRequest request
    ) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(inventoryService.createItem(request));
    }

    @GetMapping("/items")
    public ResponseEntity<List<InventoryItemResponse>> getAllItems() {
        return ResponseEntity.ok(
                inventoryService.getAllItems()
        );
    }

    @GetMapping("/items/{id}")
    public ResponseEntity<InventoryItemResponse> getItem(
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(
                inventoryService.getItem(id)
        );
    }

    @GetMapping("/items/active")
    public ResponseEntity<List<InventoryItemResponse>> getActiveItems() {
        return ResponseEntity.ok(
                inventoryService.getActiveItems()
        );
    }

    @GetMapping("/items/low-stock")
    public ResponseEntity<List<InventoryItemResponse>> getLowStockItems() {
        return ResponseEntity.ok(
                inventoryService.getLowStockItems()
        );
    }

    @PutMapping("/items/{id}")
    public ResponseEntity<InventoryItemResponse> updateItem(
            @PathVariable Long id,
            @Valid @RequestBody InventoryItemRequest request
    ) {
        return ResponseEntity.ok(
                inventoryService.updateItem(id, request)
        );
    }

    // =========================
    // STOCK
    // =========================


    @PatchMapping("/items/{id}/stock")
    public ResponseEntity<InventoryTransactionResponse> adjustStock(
            @PathVariable Long id,
            @Valid @RequestBody StockAdjustmentRequest request
    ) {
        return ResponseEntity.ok(
                inventoryService.adjustStock(id, request)
        );
    }

    @GetMapping("/items/{id}/transactions")
    public ResponseEntity<List<InventoryTransactionResponse>>
    getTransactions(
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(
                inventoryService.getTransactions(id)
        );
    }

    // =========================
    // JOB CARD PARTS
    // =========================

    @PostMapping("/job-card-parts")
    public ResponseEntity<JobCardPartResponse> addPartToJobCard(
            @Valid @RequestBody JobCardPartRequest request
    ) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(inventoryService.addPartToJobCard(request));
    }

    @GetMapping("/job-card-parts/job-card/{jobCardId}")
    public ResponseEntity<List<JobCardPartResponse>> getPartsByJobCard(
            @PathVariable Long jobCardId
    ) {
        return ResponseEntity.ok(
                inventoryService.getPartsByJobCard(jobCardId)
        );
    }

    @GetMapping("/job-card-parts/inventory-item/{inventoryItemId}")
    public ResponseEntity<List<JobCardPartResponse>>
    getPartsByInventoryItem(
            @PathVariable Long inventoryItemId
    ) {
        return ResponseEntity.ok(
                inventoryService.getPartsByInventoryItem(inventoryItemId)
        );
    }
}