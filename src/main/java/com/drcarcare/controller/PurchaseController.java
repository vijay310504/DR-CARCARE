package com.drcarcare.controller;

import com.drcarcare.dto.PurchaseOrderRequest;
import com.drcarcare.dto.PurchaseOrderResponse;
import com.drcarcare.service.PurchaseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/purchases")
@RequiredArgsConstructor
public class PurchaseController {

    private final PurchaseService purchaseService;

    // =========================================================
    // CREATE
    // =========================================================

    @PostMapping
    public ResponseEntity<PurchaseOrderResponse> createPurchase(
            @Valid @RequestBody PurchaseOrderRequest request
    ) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        purchaseService.createPurchaseOrder(
                                request
                        )
                );
    }

    // =========================================================
    // GET ALL
    // =========================================================

    @GetMapping
    public ResponseEntity<List<PurchaseOrderResponse>> getAllPurchases() {

        return ResponseEntity.ok(
                purchaseService.getAllPurchases()
        );
    }

    // =========================================================
    // GET BY ID
    // =========================================================

    @GetMapping("/{id}")
    public ResponseEntity<PurchaseOrderResponse> getPurchase(
            @PathVariable Long id
    ) {

        return ResponseEntity.ok(
                purchaseService.getPurchase(id)
        );
    }

    // =========================================================
    // BY VENDOR
    // =========================================================

    @GetMapping("/vendor/{vendorId}")
    public ResponseEntity<List<PurchaseOrderResponse>>
    getPurchasesByVendor(
            @PathVariable Long vendorId
    ) {

        return ResponseEntity.ok(
                purchaseService.getPurchasesByVendor(
                        vendorId
                )
        );
    }

    // =========================================================
    // BY STATUS
    // =========================================================

    @GetMapping("/status/{status}")
    public ResponseEntity<List<PurchaseOrderResponse>>
    getPurchasesByStatus(
            @PathVariable String status
    ) {

        return ResponseEntity.ok(
                purchaseService.getPurchasesByStatus(
                        status
                )
        );
    }

    // =========================================================
    // MARK ORDERED
    // =========================================================

    @PatchMapping("/{id}/order")
    public ResponseEntity<PurchaseOrderResponse>
    markOrdered(
            @PathVariable Long id
    ) {

        return ResponseEntity.ok(
                purchaseService.markOrdered(id)
        );
    }

    // =========================================================
    // RECEIVE
    // =========================================================

    @PatchMapping("/{id}/receive")
    public ResponseEntity<PurchaseOrderResponse>
    receivePurchase(
            @PathVariable Long id
    ) {

        return ResponseEntity.ok(
                purchaseService.receivePurchase(id)
        );
    }

    // =========================================================
    // CANCEL
    // =========================================================

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<PurchaseOrderResponse>
    cancelPurchase(
            @PathVariable Long id
    ) {

        return ResponseEntity.ok(
                purchaseService.cancelPurchase(id)
        );
    }
}