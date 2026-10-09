package com.drcarcare.controller;

import com.drcarcare.dto.InvoiceRequest;
import com.drcarcare.dto.InvoiceResponse;
import com.drcarcare.service.InvoiceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/invoices")
@RequiredArgsConstructor
public class InvoiceController {

    private final InvoiceService invoiceService;

    /**
     * Create customer invoice from an APPROVED estimate.
     */
    @PostMapping("/from-estimate")
    public ResponseEntity<InvoiceResponse> createInvoiceFromEstimate(
            @Valid @RequestBody InvoiceRequest request
    ) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(invoiceService.createInvoiceFromEstimate(request));
    }

    @GetMapping
    public ResponseEntity<List<InvoiceResponse>> getAllInvoices() {
        return ResponseEntity.ok(invoiceService.getAllInvoices());
    }

    @GetMapping("/{id}")
    public ResponseEntity<InvoiceResponse> getInvoice(
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(invoiceService.getInvoice(id));
    }

    @GetMapping("/job-card/{jobCardId}")
    public ResponseEntity<InvoiceResponse> getByJobCard(
            @PathVariable Long jobCardId
    ) {
        return ResponseEntity.ok(
                invoiceService.getByJobCard(jobCardId)
        );
    }

    @PatchMapping("/{id}/issue")
    public ResponseEntity<InvoiceResponse> issueInvoice(
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(
                invoiceService.issueInvoice(id)
        );
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<InvoiceResponse> cancelInvoice(
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(
                invoiceService.cancelInvoice(id)
        );
    }
}