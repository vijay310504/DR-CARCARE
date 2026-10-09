package com.drcarcare.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PurchaseItemResponse {

    private Long id;

    private Long inventoryItemId;
    private String partCode;
    private String partName;

    private BigDecimal quantity;
    private BigDecimal receivedQuantity;
    private BigDecimal pendingQuantity;

    private BigDecimal unitPrice;

    private BigDecimal discountAmount;

    private BigDecimal taxPercent;
    private BigDecimal taxAmount;

    private BigDecimal totalAmount;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}