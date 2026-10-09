package com.drcarcare.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingRequest {

    @NotNull(message = "Customer ID is required")
    private Long customerId;

    @NotNull(message = "Vehicle ID is required")
    private Long vehicleId;

    @NotNull(message = "Booking date is required")
    private LocalDate bookingDate;

    private LocalTime expectedArrivalTime;

    @NotBlank(message = "Service type is required")
    @Size(
            max = 100,
            message = "Service type cannot exceed 100 characters"
    )
    private String serviceType;

    @Size(
            max = 500,
            message = "Customer complaint cannot exceed 500 characters"
    )
    private String customerComplaint;

    @Size(
            max = 500,
            message = "Notes cannot exceed 500 characters"
    )
    private String notes;
}