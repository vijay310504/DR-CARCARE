package com.drcarcare.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "job_card_services")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobCardServiceItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "job_card_id",
            nullable = false
    )
    private JobCard jobCard;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "service_id",
            nullable = false
    )
    private ServiceCatalogue service;

    /*
     * Technician assigned specifically to this service.
     *
     * The technician must also be assigned to the
     * same Job Card through JobCardTechnician.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "technician_id"
    )
    private Technician technician;

    @Column(length = 255)
    private String description;

    @Column(
            nullable = false,
            precision = 10,
            scale = 2
    )
    @Builder.Default
    private BigDecimal quantity = BigDecimal.ONE;

    @Column(
            name = "unit_price",
            nullable = false,
            precision = 12,
            scale = 2
    )
    @Builder.Default
    private BigDecimal unitPrice = BigDecimal.ZERO;

    @Column(
            name = "discount_amount",
            nullable = false,
            precision = 12,
            scale = 2
    )
    @Builder.Default
    private BigDecimal discountAmount = BigDecimal.ZERO;

    @Column(
            name = "tax_percent",
            nullable = false,
            precision = 5,
            scale = 2
    )
    @Builder.Default
    private BigDecimal taxPercent = BigDecimal.ZERO;

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
            nullable = false,
            length = 30
    )
    @Builder.Default
    private String status = "PENDING";

    @Column(name = "started_at")
    private LocalDateTime startedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(length = 500)
    private String notes;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}