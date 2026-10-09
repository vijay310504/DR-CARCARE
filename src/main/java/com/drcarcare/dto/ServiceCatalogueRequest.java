package com.drcarcare.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class ServiceCatalogueRequest {

    @NotBlank(message = "Service name is required")
    @Size(max = 150, message = "Service name cannot exceed 150 characters")
    private String serviceName;

    @Size(max = 100, message = "Category cannot exceed 100 characters")
    private String category;

    @Size(max = 500, message = "Description cannot exceed 500 characters")
    private String description;

    @NotNull(message = "Standard price is required")
    @DecimalMin(value = "0.00", message = "Standard price cannot be negative")
    private BigDecimal standardPrice;

    @DecimalMin(value = "0.00", message = "Estimated hours cannot be negative")
    private BigDecimal estimatedHours;
}