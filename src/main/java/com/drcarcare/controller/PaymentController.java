package com.drcarcare.controller;

import com.drcarcare.dto.PaymentRequest;
import com.drcarcare.dto.PaymentResponse;
import com.drcarcare.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;


    // =========================================================
    // CREATE PAYMENT FOR INVOICE
    // =========================================================

    @PostMapping("/invoice/{invoiceId}")
    public ResponseEntity<PaymentResponse> createPayment(
            @PathVariable Long invoiceId,
            @Valid @RequestBody PaymentRequest request
    ) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        paymentService.createPayment(
                                invoiceId,
                                request
                        )
                );
    }


    // =========================================================
    // GET ALL PAYMENTS
    // =========================================================

    @GetMapping
    public ResponseEntity<List<PaymentResponse>> getAllPayments() {

        return ResponseEntity.ok(
                paymentService.getAllPayments()
        );
    }


    // =========================================================
    // GET PAYMENT BY ID
    // =========================================================

    @GetMapping("/{id}")
    public ResponseEntity<PaymentResponse> getPaymentById(
            @PathVariable Long id
    ) {

        return ResponseEntity.ok(
                paymentService.getPaymentById(id)
        );
    }


    // =========================================================
    // GET PAYMENTS BY INVOICE
    // =========================================================

    @GetMapping("/invoice/{invoiceId}")
    public ResponseEntity<List<PaymentResponse>> getPaymentsByInvoice(
            @PathVariable Long invoiceId
    ) {

        return ResponseEntity.ok(
                paymentService.getPaymentsByInvoice(invoiceId)
        );
    }
}