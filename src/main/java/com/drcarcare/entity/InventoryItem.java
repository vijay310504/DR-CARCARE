package com.drcarcare.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "inventory_items",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_inventory_part_code", columnNames = "part_code")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventoryItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "part_code", nullable = false, unique = true, length = 50)
    private String partCode;

    @Column(name = "part_name", nullable = false, length = 150)
    private String partName;

    @Column(length = 100)
    private String category;

    @Column(length = 100)
    private String brand;

    @Column(nullable = false, length = 30)
    @Builder.Default
    private String unit = "PCS";

    @Column(length = 500)
    private String description;

    @Column(name = "purchase_price", nullable = false, precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal purchasePrice = BigDecimal.ZERO;

    @Column(name = "selling_price", nullable = false, precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal sellingPrice = BigDecimal.ZERO;

    @Column(name = "current_stock", nullable = false, precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal currentStock = BigDecimal.ZERO;

    @Column(name = "minimum_stock", nullable = false, precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal minimumStock = BigDecimal.ZERO;

    @Column(name = "maximum_stock", precision = 12, scale = 2)
    private BigDecimal maximumStock;

    @Column(nullable = false)
    @Builder.Default
    private Boolean active = true;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}