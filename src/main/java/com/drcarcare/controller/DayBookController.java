package com.drcarcare.controller;

import com.drcarcare.dto.DayBookResponse;
import com.drcarcare.dto.DayBookSummaryResponse;
import com.drcarcare.service.DayBookService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/day-book")
@RequiredArgsConstructor
public class DayBookController {

    private final DayBookService dayBookService;

    @GetMapping
    public ResponseEntity<List<DayBookResponse>> getAllEntries() {

        return ResponseEntity.ok(
                dayBookService.getAllEntries()
        );
    }

    @GetMapping("/date-range")
    public ResponseEntity<List<DayBookResponse>> getByDateRange(

            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate fromDate,

            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate toDate

    ) {

        return ResponseEntity.ok(
                dayBookService.getByDateRange(
                        fromDate,
                        toDate
                )
        );
    }

    @GetMapping("/type/{entryType}")
    public ResponseEntity<List<DayBookResponse>> getByType(
            @PathVariable String entryType
    ) {

        return ResponseEntity.ok(
                dayBookService.getByType(entryType)
        );
    }

    @GetMapping("/summary")
    public ResponseEntity<DayBookSummaryResponse> getSummary(

            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate fromDate,

            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate toDate

    ) {

        return ResponseEntity.ok(
                dayBookService.getSummary(
                        fromDate,
                        toDate
                )
        );
    }
}