package com.drcarcare.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InspectionRequest {

    @NotNull(message = "Job Card ID is required")
    private Long jobCardId;

    @NotBlank(message = "Inspection category is required")
    @Size(max = 50)
    private String inspectionCategory;

    @NotBlank(message = "Inspection item is required")
    @Size(max = 100)
    private String inspectionItem;

    @NotBlank(message = "Condition status is required")
    @Size(max = 30)
    private String conditionStatus;

    @Size(max = 500)
    private String remarks;
}