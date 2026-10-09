package com.drcarcare.controller;

import com.drcarcare.entity.JournalEntry;
import com.drcarcare.service.AccountingService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/accounting")
@RequiredArgsConstructor
public class AccountingController {

    private final AccountingService accountingService;

    @GetMapping("/journal-entries")
    public ResponseEntity<List<JournalEntry>> getAllEntries() {

        return ResponseEntity.ok(
                accountingService.getAllEntries()
        );
    }

    @GetMapping("/journal-entries/date-range")
    public ResponseEntity<List<JournalEntry>> getByDateRange(

            @RequestParam
            @DateTimeFormat(
                    iso = DateTimeFormat.ISO.DATE
            )
            LocalDate fromDate,

            @RequestParam
            @DateTimeFormat(
                    iso = DateTimeFormat.ISO.DATE
            )
            LocalDate toDate
    ) {

        return ResponseEntity.ok(
                accountingService.getByDateRange(
                        fromDate,
                        toDate
                )
        );
    }
}