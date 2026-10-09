package com.drcarcare.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
public class InventoryItemResponse {

    private Long id;
    private String partCode;
    private String partName;
    private String category;
    private String brand;
    private String unit;
    private String description;
    private BigDecimal purchasePrice;
    private BigDecimal sellingPrice;
    private BigDecimal currentStock;
    private BigDecimal minimumStock;
    private BigDecimal maximumStock;
    private Boolean active;
    private Boolean lowStock;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}