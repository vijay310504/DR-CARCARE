package com.drcarcare.dto;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InvoiceItemResponse {

    private Long id;

    private String itemType;

    private Long sourceId;

    private String description;

    private BigDecimal quantity;

    private BigDecimal unitPrice;

    private BigDecimal discountAmount;

    private BigDecimal taxPercent;

    private BigDecimal taxAmount;

    private BigDecimal totalAmount;
}