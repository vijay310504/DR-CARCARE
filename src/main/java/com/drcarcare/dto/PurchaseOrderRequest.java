package com.drcarcare.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PurchaseOrderRequest {

    @NotNull(message = "Vendor ID is required")
    private Long vendorId;

    private LocalDate purchaseDate;

    private LocalDate expectedDate;

    private String invoiceNumber;

    private LocalDate invoiceDate;

    private String notes;

    @NotEmpty(message = "At least one purchase item is required")
    @Valid
    private List<PurchaseItemRequest> items;
}