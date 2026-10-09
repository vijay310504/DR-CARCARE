package com.drcarcare.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "invoices",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_invoices_invoice_number",
                        columnNames = "invoice_number"
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Invoice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(
            name = "invoice_number",
            nullable = false,
            unique = true,
            length = 30
    )
    private String invoiceNumber;

    /*
     * Application-level relationship to the existing JobCard.
     * We intentionally don't add a DB foreign key here.
     */
    @Column(name = "job_card_id", nullable = false)
    private Long jobCardId;

    @Column(name = "invoice_date", nullable = false)
    private LocalDate invoiceDate;

    @Column(nullable = false, length = 30)
    @Builder.Default
    private String status = "DRAFT";

    @Column(
            nullable = false,
            precision = 15,
            scale = 2
    )
    @Builder.Default
    private BigDecimal subtotal = BigDecimal.ZERO;

    @Column(
            name = "discount_amount",
            nullable = false,
            precision = 15,
            scale = 2
    )
    @Builder.Default
    private BigDecimal discountAmount = BigDecimal.ZERO;

    @Column(
            name = "tax_amount",
            nullable = false,
            precision = 15,
            scale = 2
    )
    @Builder.Default
    private BigDecimal taxAmount = BigDecimal.ZERO;

    @Column(
            name = "total_amount",
            nullable = false,
            precision = 15,
            scale = 2
    )
    @Builder.Default
    private BigDecimal totalAmount = BigDecimal.ZERO;

    @Column(
            name = "paid_amount",
            nullable = false,
            precision = 15,
            scale = 2
    )
    @Builder.Default
    private BigDecimal paidAmount = BigDecimal.ZERO;

    @Column(
            name = "outstanding_amount",
            nullable = false,
            precision = 15,
            scale = 2
    )
    @Builder.Default
    private BigDecimal outstandingAmount = BigDecimal.ZERO;

    @Column(length = 1000)
    private String notes;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}