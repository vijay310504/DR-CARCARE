package com.drcarcare.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
public class JobCardTechnicianResponse {

    private Long id;

    private Long jobCardId;
    private String jobCardNumber;

    private Long technicianId;
    private String technicianCode;
    private String technicianName;

    private LocalDateTime assignedAt;
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;

    private String status;

    private BigDecimal estimatedHours;
    private BigDecimal actualHours;

    private String notes;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}