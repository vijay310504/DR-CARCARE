package com.drcarcare.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "estimates",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_estimate_number",
                        columnNames = "estimate_number"
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Estimate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(
            name = "estimate_number",
            nullable = false,
            unique = true,
            length = 30
    )
    private String estimateNumber;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "job_card_id",
            nullable = false
    )
    private JobCard jobCard;

    @Column(
            name = "estimate_date",
            nullable = false
    )
    private LocalDate estimateDate;

    @Column(name = "valid_until")
    private LocalDate validUntil;

    @Column(
            nullable = false,
            length = 30
    )
    @Builder.Default
    private String status = "DRAFT";

    @Column(
            nullable = false,
            precision = 12,
            scale = 2
    )
    @Builder.Default
    private BigDecimal subtotal = BigDecimal.ZERO;

    @Column(
            name = "discount_amount",
            nullable = false,
            precision = 12,
            scale = 2
    )
    @Builder.Default
    private BigDecimal discountAmount = BigDecimal.ZERO;

    @Column(
            name = "tax_amount",
            nullable = false,
            precision = 12,
            scale = 2
    )
    @Builder.Default
    private BigDecimal taxAmount = BigDecimal.ZERO;

    @Column(
            name = "total_amount",
            nullable = false,
            precision = 12,
            scale = 2
    )
    @Builder.Default
    private BigDecimal totalAmount = BigDecimal.ZERO;

    @Column(
            name = "customer_notes",
            length = 500
    )
    private String customerNotes;

    @Column(
            name = "internal_notes",
            length = 500
    )
    private String internalNotes;

    @Column(
            name = "rejection_reason",
            length = 500
    )
    private String rejectionReason;

    @Column(name = "approved_at")
    private LocalDateTime approvedAt;

    @Column(name = "rejected_at")
    private LocalDateTime rejectedAt;

    @Column(
            name = "created_at",
            nullable = false
    )
    private LocalDateTime createdAt;

    @Column(
            name = "updated_at",
            nullable = false
    )
    private LocalDateTime updatedAt;
}