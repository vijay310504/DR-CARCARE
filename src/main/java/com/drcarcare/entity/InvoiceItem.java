package com.drcarcare.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "invoice_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InvoiceItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "invoice_id",
            nullable = false
    )
    private Invoice invoice;

    /*
     * SERVICE or PART
     */
    @Column(
            name = "item_type",
            nullable = false,
            length = 20
    )
    private String itemType;

    /*
     * SERVICE -> JobCardServiceItem ID
     * PART    -> JobCardPart ID
     */
    @Column(name = "source_id")
    private Long sourceId;

    @Column(
            nullable = false,
            length = 500
    )
    private String description;

    @Column(
            nullable = false,
            precision = 15,
            scale = 3
    )
    private BigDecimal quantity;

    @Column(
            name = "unit_price",
            nullable = false,
            precision = 15,
            scale = 2
    )
    private BigDecimal unitPrice;

    @Column(
            name = "discount_amount",
            nullable = false,
            precision = 15,
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

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}