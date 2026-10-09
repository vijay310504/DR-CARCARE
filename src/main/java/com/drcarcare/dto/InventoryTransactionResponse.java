package com.drcarcare.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
public class InventoryTransactionResponse {

    private Long id;

    private Long inventoryItemId;
    private String partCode;
    private String partName;

    private String transactionType;
    private BigDecimal quantity;

    private BigDecimal stockBefore;
    private BigDecimal stockAfter;

    private String referenceType;
    private Long referenceId;

    private String notes;

    private LocalDateTime transactionDate;
    private LocalDateTime createdAt;
}