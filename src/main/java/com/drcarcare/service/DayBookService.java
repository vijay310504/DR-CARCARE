package com.drcarcare.service;

import com.drcarcare.dto.DayBookResponse;
import com.drcarcare.dto.DayBookSummaryResponse;
import com.drcarcare.entity.DayBookEntry;
import com.drcarcare.repository.DayBookEntryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DayBookService {

    private final DayBookEntryRepository dayBookEntryRepository;

    // =========================================================
    // EXPENSE ENTRY
    // =========================================================

    @Transactional
    public DayBookEntry createExpenseEntry(
            Long expenseId,
            LocalDate date,
            String description,
            BigDecimal amount,
            String paymentMethod
    ) {

        return createEntry(
                date,
                "EXPENSE",
                "EXPENSE",
                expenseId,
                description,
                amount,
                BigDecimal.ZERO,
                paymentMethod
        );
    }

    // =========================================================
    // CUSTOMER PAYMENT ENTRY
    // =========================================================

    @Transactional
    public DayBookEntry createPaymentEntry(
            Long paymentId,
            LocalDate date,
            String description,
            BigDecimal amount,
            String paymentMethod
    ) {

        return createEntry(
                date,
                "PAYMENT",
                "PAYMENT",
                paymentId,
                description,
                BigDecimal.ZERO,
                amount,
                paymentMethod
        );
    }

    // =========================================================
    // GENERIC ENTRY
    // =========================================================

    @Transactional
    public DayBookEntry createEntry(
            LocalDate entryDate,
            String entryType,
            String referenceType,
            Long referenceId,
            String description,
            BigDecimal debitAmount,
            BigDecimal creditAmount,
            String paymentMethod
    ) {

        validateAmounts(
                debitAmount,
                creditAmount
        );

        LocalDateTime now = LocalDateTime.now();

        DayBookEntry entry = DayBookEntry.builder()
                .entryNumber(generateEntryNumber())
                .entryDate(entryDate)
                .entryType(entryType)
                .referenceType(referenceType)
                .referenceId(referenceId)
                .description(description)
                .debitAmount(debitAmount)
                .creditAmount(creditAmount)
                .paymentMethod(paymentMethod)
                .createdAt(now)
                .updatedAt(now)
                .build();

        return dayBookEntryRepository.save(entry);
    }

    // =========================================================
    // GET ALL
    // =========================================================

    @Transactional(readOnly = true)
    public List<DayBookResponse> getAllEntries() {

        return dayBookEntryRepository
                .findAllByOrderByEntryDateDescIdDesc()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // =========================================================
    // GET BY DATE RANGE
    // =========================================================

    @Transactional(readOnly = true)
    public List<DayBookResponse> getByDateRange(
            LocalDate fromDate,
            LocalDate toDate
    ) {

        validateDateRange(fromDate, toDate);

        return dayBookEntryRepository
                .findByEntryDateBetweenOrderByEntryDateDescIdDesc(
                        fromDate,
                        toDate
                )
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // =========================================================
    // GET BY TYPE
    // =========================================================

    @Transactional(readOnly = true)
    public List<DayBookResponse> getByType(
            String entryType
    ) {

        if (entryType == null || entryType.isBlank()) {
            throw new RuntimeException(
                    "Entry type is required"
            );
        }

        return dayBookEntryRepository
                .findByEntryTypeOrderByEntryDateDescIdDesc(
                        entryType.toUpperCase()
                )
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // =========================================================
    // SUMMARY
    // =========================================================

    @Transactional(readOnly = true)
    public DayBookSummaryResponse getSummary(
            LocalDate fromDate,
            LocalDate toDate
    ) {

        validateDateRange(fromDate, toDate);

        List<DayBookEntry> entries =
                dayBookEntryRepository
                        .findByEntryDateBetweenOrderByEntryDateDescIdDesc(
                                fromDate,
                                toDate
                        );

        BigDecimal totalDebit =
                entries.stream()
                        .map(DayBookEntry::getDebitAmount)
                        .reduce(
                                BigDecimal.ZERO,
                                BigDecimal::add
                        );

        BigDecimal totalCredit =
                entries.stream()
                        .map(DayBookEntry::getCreditAmount)
                        .reduce(
                                BigDecimal.ZERO,
                                BigDecimal::add
                        );

        BigDecimal netAmount =
                totalCredit.subtract(totalDebit);

        return DayBookSummaryResponse.builder()
                .fromDate(fromDate)
                .toDate(toDate)
                .totalDebit(totalDebit)
                .totalCredit(totalCredit)
                .netAmount(netAmount)
                .transactionCount(entries.size())
                .build();
    }

    // =========================================================
    // HELPERS
    // =========================================================

    private String generateEntryNumber() {

        long nextNumber =
                dayBookEntryRepository.count() + 1;

        String entryNumber;

        do {
            entryNumber =
                    String.format(
                            "DB-%06d",
                            nextNumber++
                    );
        } while (
                dayBookEntryRepository
                        .existsByEntryNumber(entryNumber)
        );

        return entryNumber;
    }

    private void validateAmounts(
            BigDecimal debit,
            BigDecimal credit
    ) {

        if (debit == null) {
            debit = BigDecimal.ZERO;
        }

        if (credit == null) {
            credit = BigDecimal.ZERO;
        }

        if (debit.compareTo(BigDecimal.ZERO) < 0
                || credit.compareTo(BigDecimal.ZERO) < 0) {

            throw new RuntimeException(
                    "Debit and credit amounts cannot be negative"
            );
        }

        if (debit.compareTo(BigDecimal.ZERO) == 0
                && credit.compareTo(BigDecimal.ZERO) == 0) {

            throw new RuntimeException(
                    "Either debit or credit amount is required"
            );
        }

        if (debit.compareTo(BigDecimal.ZERO) > 0
                && credit.compareTo(BigDecimal.ZERO) > 0) {

            throw new RuntimeException(
                    "An entry cannot have both debit and credit"
            );
        }
    }

    private void validateDateRange(
            LocalDate fromDate,
            LocalDate toDate
    ) {

        if (fromDate == null || toDate == null) {
            throw new RuntimeException(
                    "From date and to date are required"
            );
        }

        if (fromDate.isAfter(toDate)) {
            throw new RuntimeException(
                    "From date cannot be after to date"
            );
        }
    }

    private DayBookResponse mapToResponse(
            DayBookEntry entry
    ) {

        return DayBookResponse.builder()
                .id(entry.getId())
                .entryNumber(entry.getEntryNumber())
                .entryDate(entry.getEntryDate())
                .entryType(entry.getEntryType())
                .referenceType(entry.getReferenceType())
                .referenceId(entry.getReferenceId())
                .description(entry.getDescription())
                .debitAmount(entry.getDebitAmount())
                .creditAmount(entry.getCreditAmount())
                .paymentMethod(entry.getPaymentMethod())
                .createdAt(entry.getCreatedAt())
                .updatedAt(entry.getUpdatedAt())
                .build();
    }
}