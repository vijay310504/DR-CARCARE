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
public class PaymentResponse {

    private Long id;

    private String paymentNumber;

    private Long invoiceId;

    private String invoiceNumber;

    private LocalDate paymentDate;

    private BigDecimal amount;

    private String paymentMethod;

    private String referenceNumber;

    private String notes;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}