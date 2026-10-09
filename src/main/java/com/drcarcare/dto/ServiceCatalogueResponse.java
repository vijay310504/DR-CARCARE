package com.drcarcare.dto;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
public class ServiceCatalogueResponse {

    private Long id;

    private String serviceCode;

    private String serviceName;

    private String category;

    private String description;

    private BigDecimal standardPrice;

    private BigDecimal estimatedHours;

    private Boolean active;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}