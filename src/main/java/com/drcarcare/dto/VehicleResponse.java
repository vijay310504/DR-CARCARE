package com.drcarcare.dto;

import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VehicleResponse {

    private Long id;

    private String vehicleNumber;

    private String make;

    private String model;

    private String variant;

    private Integer manufacturingYear;

    private String color;

    private String fuelType;

    private String vin;

    private String engineNumber;

    private Integer currentMileage;

    private Long customerId;

    private String customerName;

    private Boolean active;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}