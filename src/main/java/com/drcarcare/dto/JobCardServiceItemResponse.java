package com.drcarcare.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
public class JobCardServiceItemResponse {

    private Long id;

    private Long jobCardId;

    private String jobCardNumber;

    private Long serviceId;

    private String serviceCode;

    private String serviceName;

    // Technician information
    private Long technicianId;

    private String technicianCode;

    private String technicianName;

    private String description;

    private BigDecimal quantity;

    private BigDecimal unitPrice;

    private BigDecimal discountAmount;

    private BigDecimal taxPercent;

    private BigDecimal taxAmount;

    private BigDecimal totalAmount;

    private String status;

    private LocalDateTime startedAt;

    private LocalDateTime completedAt;

    private String notes;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}