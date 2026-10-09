package com.drcarcare.dto;

import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InspectionResponse {

    private Long id;

    private Long jobCardId;
    private String jobCardNumber;

    private String inspectionCategory;
    private String inspectionItem;
    private String conditionStatus;
    private String remarks;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}