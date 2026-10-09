package com.drcarcare.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "day_book_entries",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_day_book_entry_number",
                        columnNames = "entry_number"
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DayBookEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(
            name = "entry_number",
            nullable = false,
            unique = true,
            length = 30
    )
    private String entryNumber;

    @Column(name = "entry_date", nullable = false)
    private LocalDate entryDate;

    @Column(
            name = "entry_type",
            nullable = false,
            length = 30
    )
    private String entryType;

    @Column(name = "reference_type", length = 30)
    private String referenceType;

    @Column(name = "reference_id")
    private Long referenceId;

    @Column(nullable = false, length = 500)
    private String description;

    @Column(
            name = "debit_amount",
            nullable = false,
            precision = 15,
            scale = 2
    )
    @Builder.Default
    private BigDecimal debitAmount = BigDecimal.ZERO;

    @Column(
            name = "credit_amount",
            nullable = false,
            precision = 15,
            scale = 2
    )
    @Builder.Default
    private BigDecimal creditAmount = BigDecimal.ZERO;

    @Column(
            name = "payment_method",
            length = 30
    )
    private String paymentMethod;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}