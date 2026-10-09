package com.drcarcare.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DayBookResponse {

    private Long id;

    private String entryNumber;

    private LocalDate entryDate;

    private String entryType;

    private String referenceType;

    private Long referenceId;

    private String description;

    private BigDecimal debitAmount;

    private BigDecimal creditAmount;

    private String paymentMethod;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}