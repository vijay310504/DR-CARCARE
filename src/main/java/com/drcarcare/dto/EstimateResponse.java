package com.drcarcare.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@Builder
public class EstimateResponse {

    private Long id;

    private String estimateNumber;

    private Long jobCardId;

    private String jobCardNumber;

    private Long customerId;

    private String customerName;

    private Long vehicleId;

    private String vehicleNumber;

    private String vehicleMake;

    private String vehicleModel;

    private LocalDate estimateDate;

    private LocalDate validUntil;

    private String status;

    private BigDecimal subtotal;

    private BigDecimal discountAmount;

    private BigDecimal taxAmount;

    private BigDecimal totalAmount;

    private String customerNotes;

    private String internalNotes;

    private String rejectionReason;

    private LocalDateTime approvedAt;

    private LocalDateTime rejectedAt;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private List<EstimateItemResponse> items;
}