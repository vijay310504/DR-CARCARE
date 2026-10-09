package com.drcarcare.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PurchaseItemRequest {

    @NotNull(message = "Inventory item ID is required")
    private Long inventoryItemId;

    @NotNull(message = "Quantity is required")
    @DecimalMin(
            value = "0.001",
            message = "Quantity must be greater than zero"
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
}