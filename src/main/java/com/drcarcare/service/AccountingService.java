package com.drcarcare.service;

import com.drcarcare.entity.Account;
import com.drcarcare.entity.JournalEntry;
import com.drcarcare.entity.JournalEntryLine;
import com.drcarcare.repository.AccountRepository;
import com.drcarcare.repository.JournalEntryLineRepository;
import com.drcarcare.repository.JournalEntryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AccountingService {

    private final AccountRepository accountRepository;
    private final JournalEntryRepository journalEntryRepository;
    private final JournalEntryLineRepository journalEntryLineRepository;

    @Transactional
    public JournalEntry createJournalEntry(
            LocalDate date,
            String entryType,
            String referenceType,
            Long referenceId,
            String description,
            List<JournalLineData> lines
    ) {

        if (lines == null || lines.size() < 2) {
            throw new RuntimeException(
                    "At least two journal lines are required"
            );
        }

        BigDecimal totalDebit =
                lines.stream()
                        .map(JournalLineData::debit)
                        .reduce(
                                BigDecimal.ZERO,
                                BigDecimal::add
                        );

        BigDecimal totalCredit =
                lines.stream()
                        .map(JournalLineData::credit)
                        .reduce(
                                BigDecimal.ZERO,
                                BigDecimal::add
                        );

        if (totalDebit.compareTo(totalCredit) != 0) {
            throw new RuntimeException(
                    "Journal entry is not balanced. Debit="
                            + totalDebit
                            + ", Credit="
                            + totalCredit
            );
        }

        if (referenceType != null
                && referenceId != null
                && journalEntryRepository
                .findByReferenceTypeAndReferenceId(
                        referenceType,
                        referenceId
                )
                .isPresent()) {

            throw new RuntimeException(
                    "Accounting entry already exists for "
                            + referenceType
                            + " ID "
                            + referenceId
            );
        }

        LocalDateTime now =
                LocalDateTime.now();

        JournalEntry entry =
                JournalEntry.builder()
                        .entryNumber(
                                generateEntryNumber()
                        )
                        .entryDate(date)
                        .entryType(
                                entryType.toUpperCase()
                        )
                        .referenceType(
                                referenceType
                        )
                        .referenceId(
                                referenceId
                        )
                        .description(
                                description
                        )
                        .createdAt(now)
                        .updatedAt(now)
                        .build();

        JournalEntry savedEntry =
                journalEntryRepository.save(entry);

        for (JournalLineData data : lines) {

            Account account =
                    accountRepository
                            .findByAccountCode(
                                    data.accountCode()
                            )
                            .orElseThrow(() ->
                                    new RuntimeException(
                                            "Account not found: "
                                                    + data.accountCode()
                                    )
                            );

            JournalEntryLine line =
                    JournalEntryLine.builder()
                            .journalEntry(savedEntry)
                            .account(account)
                            .debitAmount(
                                    defaultZero(
                                            data.debit()
                                    )
                            )
                            .creditAmount(
                                    defaultZero(
                                            data.credit()
                                    )
                            )
                            .description(
                                    data.description()
                            )
                            .build();

            validateLine(line);

            journalEntryLineRepository.save(line);
        }

        return savedEntry;
    }

    @Transactional(readOnly = true)
    public List<JournalEntry> getAllEntries() {

        return journalEntryRepository
                .findAllByOrderByEntryDateDescIdDesc();
    }

    @Transactional(readOnly = true)
    public List<JournalEntry> getByDateRange(
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

        return journalEntryRepository
                .findByEntryDateBetweenOrderByEntryDateDescIdDesc(
                        fromDate,
                        toDate
                );
    }

    private String generateEntryNumber() {

        long next =
                journalEntryRepository.count() + 1;

        String number;

        do {

            number =
                    String.format(
                            "JE-%06d",
                            next++
                    );

        } while (
                journalEntryRepository
                        .existsByEntryNumber(number)
        );

        return number;
    }

    private void validateLine(
            JournalEntryLine line
    ) {

        BigDecimal debit =
                defaultZero(
                        line.getDebitAmount()
                );

        BigDecimal credit =
                defaultZero(
                        line.getCreditAmount()
                );

        if (debit.compareTo(BigDecimal.ZERO) < 0
                || credit.compareTo(BigDecimal.ZERO) < 0) {

            throw new RuntimeException(
                    "Debit and credit cannot be negative"
            );
        }

        if (debit.compareTo(BigDecimal.ZERO) > 0
                && credit.compareTo(BigDecimal.ZERO) > 0) {

            throw new RuntimeException(
                    "A journal line cannot have both debit and credit"
            );
        }

        if (debit.compareTo(BigDecimal.ZERO) == 0
                && credit.compareTo(BigDecimal.ZERO) == 0) {

            throw new RuntimeException(
                    "Journal line must contain debit or credit"
            );
        }
    }

    private BigDecimal defaultZero(
            BigDecimal value
    ) {

        return value == null
                ? BigDecimal.ZERO
                : value;
    }

    public record JournalLineData(
            String accountCode,
            BigDecimal debit,
            BigDecimal credit,
            String description
    ) {
    }public String getPaymentAccountCode(
            String paymentMethod
    ) {

        if (paymentMethod == null) {
            throw new RuntimeException(
                    "Payment method is required"
            );
        }

        return switch (
                paymentMethod.trim().toUpperCase()
                ) {

            case "CASH" ->
                    "1000";

            case "BANK_TRANSFER" ->
                    "1010";

            case "UPI" ->
                    "1020";

            case "CARD" ->
                    "1010";

            default ->
                    throw new RuntimeException(
                            "Unsupported payment method: "
                                    + paymentMethod
                    );
        };
    }
}