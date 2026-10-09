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
public class ExpenseResponse {

    private Long id;

    private String expenseNumber;

    private LocalDate expenseDate;

    private String category;

    private String description;

    private BigDecimal amount;

    private String paymentMethod;

    private String referenceNumber;

    private String notes;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}