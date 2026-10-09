package com.drcarcare.controller;

import com.drcarcare.dto.ExpenseReportResponse;
import com.drcarcare.dto.InventoryReportResponse;
import com.drcarcare.dto.JobCardReportResponse;
import com.drcarcare.dto.OutstandingReportResponse;
import com.drcarcare.dto.PaymentReportResponse;
import com.drcarcare.dto.PurchaseReportResponse;
import com.drcarcare.dto.ReportSummaryResponse;
import com.drcarcare.dto.RevenueReportResponse;
import com.drcarcare.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    // =========================================================
    // SUMMARY
    // =========================================================

    @GetMapping("/summary")
    public ResponseEntity<ReportSummaryResponse> getSummary(

            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate from,

            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate to
    ) {

        return ResponseEntity.ok(
                reportService.getSummary(from, to)
        );
    }

    // =========================================================
    // REVENUE
    // =========================================================

    @GetMapping("/revenue")
    public ResponseEntity<RevenueReportResponse> getRevenueReport(

            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate from,

            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate to
    ) {

        return ResponseEntity.ok(
                reportService.getRevenueReport(from, to)
        );
    }

    // =========================================================
    // PAYMENTS
    // =========================================================

    @GetMapping("/payments")
    public ResponseEntity<PaymentReportResponse> getPaymentReport(

            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate from,

            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate to
    ) {

        return ResponseEntity.ok(
                reportService.getPaymentReport(from, to)
        );
    }

    // =========================================================
    // EXPENSES
    // =========================================================

    @GetMapping("/expenses")
    public ResponseEntity<ExpenseReportResponse> getExpenseReport(

            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate from,

            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate to
    ) {

        return ResponseEntity.ok(
                reportService.getExpenseReport(from, to)
        );
    }

    // =========================================================
    // OUTSTANDING
    // =========================================================

    @GetMapping("/outstanding")
    public ResponseEntity<OutstandingReportResponse>
    getOutstandingReport() {

        return ResponseEntity.ok(
                reportService.getOutstandingReport()
        );
    }

    // =========================================================
    // JOB CARDS
    // =========================================================

    @GetMapping("/job-cards")
    public ResponseEntity<JobCardReportResponse>
    getJobCardReport(

            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate from,

            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate to
    ) {

        return ResponseEntity.ok(
                reportService.getJobCardReport(from, to)
        );
    }

    // =========================================================
    // INVENTORY
    // =========================================================

    @GetMapping("/inventory")
    public ResponseEntity<InventoryReportResponse>
    getInventoryReport() {

        return ResponseEntity.ok(
                reportService.getInventoryReport()
        );
    }

    // =========================================================
    // PURCHASES
    // =========================================================

    @GetMapping("/purchases")
    public ResponseEntity<PurchaseReportResponse>
    getPurchaseReport(

            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate from,

            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate to
    ) {

        return ResponseEntity.ok(
                reportService.getPurchaseReport(from, to)
        );
    }
}