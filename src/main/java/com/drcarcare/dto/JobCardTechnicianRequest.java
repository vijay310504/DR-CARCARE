package com.drcarcare.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class JobCardTechnicianRequest {

    @NotNull(message = "Job card ID is required")
    private Long jobCardId;

    @NotNull(message = "Technician ID is required")
    private Long technicianId;

    @DecimalMin(
            value = "0.01",
            message = "Estimated hours must be greater than 0"
    )
    private BigDecimal estimatedHours;

    @DecimalMin(
            value = "0.00",
            message = "Actual hours cannot be negative"
    )
    private BigDecimal actualHours;

    @Size(
            max = 500,
            message = "Notes cannot exceed 500 characters"
    )
    private String notes;
}