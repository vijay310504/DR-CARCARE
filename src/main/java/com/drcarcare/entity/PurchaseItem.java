package com.drcarcare.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "purchase_items",
        indexes = {
                @Index(
                        name = "idx_purchase_items_purchase",
                        columnList = "purchase_order_id"
                ),
                @Index(
                        name = "idx_purchase_items_inventory",
                        columnList = "inventory_item_id"
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PurchaseItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "purchase_order_id",
            nullable = false,
            foreignKey = @ForeignKey(
                    name = "fk_purchase_items_purchase"
            )
    )
    private PurchaseOrder purchaseOrder;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "inventory_item_id",
            nullable = false,
            foreignKey = @ForeignKey(
                    name = "fk_purchase_items_inventory"
            )
    )
    private InventoryItem inventoryItem;

    @Column(nullable = false, precision = 15, scale = 3)
    private BigDecimal quantity;

    @Column(
            name = "received_quantity",
            nullable = false,
            precision = 15,
            scale = 3
    )
    private BigDecimal receivedQuantity;

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
    private BigDecimal discountAmount;

    @Column(
            name = "tax_percent",
            nullable = false,
            precision = 5,
            scale = 2
    )
    private BigDecimal taxPercent;

    @Column(
            name = "tax_amount",
            nullable = false,
            precision = 15,
            scale = 2
    )
    private BigDecimal taxAmount;

    @Column(
            name = "total_amount",
            nullable = false,
            precision = 15,
            scale = 2
    )
    private BigDecimal totalAmount;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
