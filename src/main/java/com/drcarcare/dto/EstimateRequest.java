package com.drcarcare.dto;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class EstimateRequest {

    @NotNull(message = "Job card ID is required")
    private Long jobCardId;

    private LocalDate estimateDate;

    @FutureOrPresent(
            message = "Valid until date cannot be in the past"
    )
    private LocalDate validUntil;

    @Size(
            max = 500,
            message = "Customer notes cannot exceed 500 characters"
    )
    private String customerNotes;

    @Size(
            max = 500,
            message = "Internal notes cannot exceed 500 characters"
    )
    private String internalNotes;
}