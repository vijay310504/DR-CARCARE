package com.drcarcare.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PurchaseOrderResponse {

    private Long id;

    private String purchaseNumber;

    private Long vendorId;
    private String vendorCode;
    private String vendorName;

    private LocalDate purchaseDate;
    private LocalDate expectedDate;

    private String status;

    private BigDecimal subtotal;
    private BigDecimal discountAmount;
    private BigDecimal taxAmount;
    private BigDecimal totalAmount;

    private BigDecimal paidAmount;
    private BigDecimal outstandingAmount;

    private String invoiceNumber;
    private LocalDate invoiceDate;

    private String notes;

    private List<PurchaseItemResponse> items;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}