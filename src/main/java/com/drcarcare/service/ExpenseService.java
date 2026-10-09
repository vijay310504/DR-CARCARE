package com.drcarcare.service;

import com.drcarcare.dto.ExpenseRequest;
import com.drcarcare.dto.ExpenseResponse;
import com.drcarcare.entity.Expense;
import com.drcarcare.repository.ExpenseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final DayBookService dayBookService;
    private final AccountingService accountingService;
    private final AuditLogService auditLogService;


    // =========================================================
    // CREATE EXPENSE
    // =========================================================

    @Transactional
    public ExpenseResponse createExpense(
            ExpenseRequest request
    ) {

        validatePaymentMethod(
                request.getPaymentMethod()
        );

        LocalDate expenseDate =
                request.getExpenseDate() != null
                        ? request.getExpenseDate()
                        : LocalDate.now();

        BigDecimal amount =
                request.getAmount();

        if (amount == null
                || amount.compareTo(BigDecimal.ZERO) <= 0) {

            throw new RuntimeException(
                    "Expense amount must be greater than zero"
            );
        }

        LocalDateTime now =
                LocalDateTime.now();

        Expense expense =
                Expense.builder()
                        .expenseNumber(
                                generateExpenseNumber()
                        )
                        .expenseDate(
                                expenseDate
                        )
                        .category(
                                request.getCategory()
                                        .trim()
                                        .toUpperCase()
                        )
                        .description(
                                request.getDescription()
                                        .trim()
                        )
                        .amount(
                                amount
                        )
                        .paymentMethod(
                                request.getPaymentMethod()
                                        .trim()
                                        .toUpperCase()
                        )
                        .referenceNumber(
                                request.getReferenceNumber()
                        )
                        .notes(
                                request.getNotes()
                        )
                        .createdAt(
                                now
                        )
                        .updatedAt(
                                now
                        )
                        .build();


        // ---------------------------------------------------------
        // 1. SAVE EXPENSE
        // ---------------------------------------------------------

        Expense savedExpense =
                expenseRepository.save(expense);


        // ---------------------------------------------------------
        // 2. CREATE DAY BOOK ENTRY
        // ---------------------------------------------------------

        dayBookService.createExpenseEntry(
                savedExpense.getId(),
                savedExpense.getExpenseDate(),
                savedExpense.getDescription(),
                savedExpense.getAmount(),
                savedExpense.getPaymentMethod()
        );


        // ---------------------------------------------------------
        // 3. CREATE ACCOUNTING JOURNAL ENTRY
        // ---------------------------------------------------------

        accountingService.createJournalEntry(
                savedExpense.getExpenseDate(),
                "EXPENSE",
                "EXPENSE",
                savedExpense.getId(),
                savedExpense.getDescription(),

                List.of(

                        new AccountingService.JournalLineData(
                                getExpenseAccountCode(
                                        savedExpense.getCategory()
                                ),
                                savedExpense.getAmount(),
                                BigDecimal.ZERO,
                                savedExpense.getDescription()
                        ),

                        new AccountingService.JournalLineData(
                                accountingService
                                        .getPaymentAccountCode(
                                                savedExpense
                                                        .getPaymentMethod()
                                        ),
                                BigDecimal.ZERO,
                                savedExpense.getAmount(),
                                savedExpense.getDescription()
                        )
                )
        );


        // ---------------------------------------------------------
        // 4. AUDIT
        // ---------------------------------------------------------

        auditLogService.log(
                "EXPENSE_CREATED",
                "EXPENSE",
                savedExpense.getId(),
                "Expense created: "
                        + savedExpense.getExpenseNumber(),
                null,
                "Category: " + savedExpense.getCategory()
                        + ", Amount: " + savedExpense.getAmount()
                        + ", Payment Method: "
                        + savedExpense.getPaymentMethod()
        );

        return mapToResponse(
                savedExpense
        );
    }


    // =========================================================
    // GET ALL EXPENSES
    // =========================================================

    @Transactional(readOnly = true)
    public List<ExpenseResponse> getAllExpenses() {

        return expenseRepository
                .findAllByOrderByExpenseDateDesc()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }


    // =========================================================
    // GET EXPENSE BY ID
    // =========================================================

    @Transactional(readOnly = true)
    public ExpenseResponse getExpenseById(
            Long id
    ) {

        return mapToResponse(
                getEntityById(id)
        );
    }


    // =========================================================
    // GET BY CATEGORY
    // =========================================================

    @Transactional(readOnly = true)
    public List<ExpenseResponse> getByCategory(
            String category
    ) {

        if (category == null
                || category.isBlank()) {

            throw new RuntimeException(
                    "Category is required"
            );
        }

        return expenseRepository
                .findByCategoryOrderByExpenseDateDesc(
                        category
                                .trim()
                                .toUpperCase()
                )
                .stream()
                .map(this::mapToResponse)
                .toList();
    }


    // =========================================================
    // GET BY DATE RANGE
    // =========================================================

    @Transactional(readOnly = true)
    public List<ExpenseResponse> getByDateRange(
            LocalDate fromDate,
            LocalDate toDate
    ) {

        if (fromDate == null
                || toDate == null) {

            throw new RuntimeException(
                    "From date and to date are required"
            );
        }

        if (fromDate.isAfter(toDate)) {

            throw new RuntimeException(
                    "From date cannot be after to date"
            );
        }

        return expenseRepository
                .findByExpenseDateBetweenOrderByExpenseDateDesc(
                        fromDate,
                        toDate
                )
                .stream()
                .map(this::mapToResponse)
                .toList();
    }


    // =========================================================
    // GET ENTITY
    // =========================================================

    private Expense getEntityById(
            Long id
    ) {

        return expenseRepository
                .findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Expense not found with id: "
                                        + id
                        )
                );
    }


    // =========================================================
    // GENERATE EXPENSE NUMBER
    // =========================================================

    private String generateExpenseNumber() {

        long nextNumber =
                expenseRepository.count() + 1;

        String expenseNumber;

        do {

            expenseNumber =
                    String.format(
                            "EXP-%06d",
                            nextNumber++
                    );

        } while (
                expenseRepository
                        .existsByExpenseNumber(
                                expenseNumber
                        )
        );

        return expenseNumber;
    }


    // =========================================================
    // EXPENSE ACCOUNT MAPPING
    // =========================================================

    private String getExpenseAccountCode(
            String category
    ) {

        if (category == null) {

            throw new RuntimeException(
                    "Expense category is required"
            );
        }

        return switch (
                category.trim().toUpperCase()
                ) {

            case "ELECTRICITY" ->
                    "5000";

            case "SALARY",
                 "SALARIES",
                 "WAGES" ->
                    "5010";

            case "RENT" ->
                    "5020";

            case "TOOLS",
                 "TOOL" ->
                    "5030";

            default ->
                    "5040";
        };
    }


    // =========================================================
    // PAYMENT METHOD VALIDATION
    // =========================================================

    private void validatePaymentMethod(
            String paymentMethod
    ) {

        if (paymentMethod == null
                || paymentMethod.isBlank()) {

            throw new RuntimeException(
                    "Payment method is required"
            );
        }

        String method =
                paymentMethod
                        .trim()
                        .toUpperCase();

        if (!method.equals("CASH")
                && !method.equals("UPI")
                && !method.equals("CARD")
                && !method.equals("BANK_TRANSFER")) {

            throw new RuntimeException(
                    "Invalid expense payment method: "
                            + paymentMethod
            );
        }
    }


    // =========================================================
    // MAP RESPONSE
    // =========================================================

    private ExpenseResponse mapToResponse(
            Expense expense
    ) {

        return ExpenseResponse.builder()
                .id(
                        expense.getId()
                )
                .expenseNumber(
                        expense.getExpenseNumber()
                )
                .expenseDate(
                        expense.getExpenseDate()
                )
                .category(
                        expense.getCategory()
                )
                .description(
                        expense.getDescription()
                )
                .amount(
                        expense.getAmount()
                )
                .paymentMethod(
                        expense.getPaymentMethod()
                )
                .referenceNumber(
                        expense.getReferenceNumber()
                )
                .notes(
                        expense.getNotes()
                )
                .createdAt(
                        expense.getCreatedAt()
                )
                .updatedAt(
                        expense.getUpdatedAt()
                )
                .build();
    }
}