package com.drcarcare.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class InventoryItemRequest {

    @NotBlank(message = "Part code is required")
    @Size(max = 50, message = "Part code cannot exceed 50 characters")
    private String partCode;

    @NotBlank(message = "Part name is required")
    @Size(max = 150, message = "Part name cannot exceed 150 characters")
    private String partName;

    @Size(max = 100, message = "Category cannot exceed 100 characters")
    private String category;

    @Size(max = 100, message = "Brand cannot exceed 100 characters")
    private String brand;

    @NotBlank(message = "Unit is required")
    @Size(max = 30, message = "Unit cannot exceed 30 characters")
    private String unit;

    @Size(max = 500, message = "Description cannot exceed 500 characters")
    private String description;

    @NotNull(message = "Purchase price is required")
    @DecimalMin(value = "0.00", message = "Purchase price cannot be negative")
    private BigDecimal purchasePrice;

    @NotNull(message = "Selling price is required")
    @DecimalMin(value = "0.00", message = "Selling price cannot be negative")
    private BigDecimal sellingPrice;

    @NotNull(message = "Minimum stock is required")
    @DecimalMin(value = "0.00", message = "Minimum stock cannot be negative")
    private BigDecimal minimumStock;

    @DecimalMin(value = "0.00", message = "Maximum stock cannot be negative")
    private BigDecimal maximumStock;

    private Boolean active;
}