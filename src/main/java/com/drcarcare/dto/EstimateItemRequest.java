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
public class EstimateItemRequest {

    @NotNull(message = "Estimate ID is required")
    private Long estimateId;

    @NotBlank(message = "Item type is required")
    private String itemType;

    @NotBlank(message = "Description is required")
    @Size(
            max = 255,
            message = "Description cannot exceed 255 characters"
    )
    private String description;

    @NotNull(message = "Quantity is required")
    @DecimalMin(
            value = "0.01",
            message = "Quantity must be greater than 0"
    )
    private BigDecimal quantity;

    @NotNull(message = "Unit price is required")
    @DecimalMin(
            value = "0.00",
            message = "Unit price cannot be negative"
    )
    private BigDecimal unitPrice;

    @DecimalMin(
            value = "0.00",
            message = "Discount cannot be negative"
    )
    private BigDecimal discountAmount;

    @DecimalMin(
            value = "0.00",
            message = "Tax percentage cannot be negative"
    )
    private BigDecimal taxPercent;

    @Size(
            max = 500,
            message = "Notes cannot exceed 500 characters"
    )
    private String notes;
}