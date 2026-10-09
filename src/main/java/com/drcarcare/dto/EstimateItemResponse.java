package com.drcarcare.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
public class EstimateItemResponse {

    private Long id;

    private Long estimateId;

    private String estimateNumber;

    private String itemType;

    private String description;

    private BigDecimal quantity;

    private BigDecimal unitPrice;

    private BigDecimal discountAmount;

    private BigDecimal taxPercent;

    private BigDecimal taxAmount;

    private BigDecimal totalAmount;

    private String notes;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}