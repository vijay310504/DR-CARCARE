package com.drcarcare.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobCardRequest {

    @NotNull(message = "Booking ID is required")
    private Long bookingId;

    private Integer openingMileage;

    @Size(
            max = 30,
            message = "Fuel level cannot exceed 30 characters"
    )
    private String fuelLevel;

    @Size(
            max = 500,
            message = "Customer complaint cannot exceed 500 characters"
    )
    private String customerComplaint;

    @Size(
            max = 500,
            message = "Advisor notes cannot exceed 500 characters"
    )
    private String advisorNotes;
}