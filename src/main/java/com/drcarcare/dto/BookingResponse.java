package com.drcarcare.dto;

import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingResponse {

    private Long id;

    private String bookingCode;

    private Long customerId;

    private String customerName;

    private Long vehicleId;

    private String vehicleNumber;

    private String vehicleMake;

    private String vehicleModel;

    private LocalDate bookingDate;

    private LocalTime expectedArrivalTime;

    private String serviceType;

    private String customerComplaint;

    private String status;

    private String notes;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}