package com.drcarcare.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
public class JobCardPartResponse {

    private Long id;

    private Long jobCardId;
    private String jobCardNumber;

    private Long inventoryItemId;
    private String partCode;
    private String partName;

    private BigDecimal quantity;
    private BigDecimal unitPrice;
    private BigDecimal totalAmount;

    private String status;
    private String notes;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}