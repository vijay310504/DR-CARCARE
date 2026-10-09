package com.drcarcare.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VendorPaymentRequest {

    @NotNull
    @DecimalMin("0.01")
    private BigDecimal amount;

    private LocalDate paymentDate;

    @NotBlank
    private String paymentMethod;

    private String referenceNumber;

    private String notes;
}