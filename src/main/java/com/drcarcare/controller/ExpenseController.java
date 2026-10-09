package com.drcarcare.controller;

import com.drcarcare.dto.ExpenseRequest;
import com.drcarcare.dto.ExpenseResponse;
import com.drcarcare.service.ExpenseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/expenses")
@RequiredArgsConstructor
public class ExpenseController {

    private final ExpenseService expenseService;

    @PostMapping
    public ResponseEntity<ExpenseResponse> createExpense(
            @Valid @RequestBody ExpenseRequest request
    ) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        expenseService.createExpense(request)
                );
    }

    @GetMapping
    public ResponseEntity<List<ExpenseResponse>> getAllExpenses() {

        return ResponseEntity.ok(
                expenseService.getAllExpenses()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<ExpenseResponse> getExpenseById(
            @PathVariable Long id
    ) {

        return ResponseEntity.ok(
                expenseService.getExpenseById(id)
        );
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<List<ExpenseResponse>> getByCategory(
            @PathVariable String category
    ) {

        return ResponseEntity.ok(
                expenseService.getByCategory(category)
        );
    }

    @GetMapping("/date-range")
    public ResponseEntity<List<ExpenseResponse>> getByDateRange(

            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate fromDate,

            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate toDate

    ) {

        return ResponseEntity.ok(
                expenseService.getByDateRange(
                        fromDate,
                        toDate
                )
        );
    }
}