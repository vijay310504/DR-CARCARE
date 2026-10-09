package com.drcarcare.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VehicleRequest {

    @NotBlank(message = "Vehicle number is required")
    @Size(max = 20, message = "Vehicle number cannot exceed 20 characters")
    private String vehicleNumber;

    @NotBlank(message = "Vehicle make is required")
    @Size(max = 100, message = "Make cannot exceed 100 characters")
    private String make;

    @NotBlank(message = "Vehicle model is required")
    @Size(max = 100, message = "Model cannot exceed 100 characters")
    private String model;

    @Size(max = 100, message = "Variant cannot exceed 100 characters")
    private String variant;

    private Integer manufacturingYear;

    @Size(max = 50, message = "Color cannot exceed 50 characters")
    private String color;

    @Size(max = 30, message = "Fuel type cannot exceed 30 characters")
    private String fuelType;

    @Size(max = 100, message = "VIN cannot exceed 100 characters")
    private String vin;

    @Size(max = 100, message = "Engine number cannot exceed 100 characters")
    private String engineNumber;

    private Integer currentMileage;

    @NotNull(message = "Customer ID is required")
    private Long customerId;
}