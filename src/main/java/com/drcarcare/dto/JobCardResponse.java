package com.drcarcare.dto;

import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobCardResponse {

    private Long id;

    private String jobCardNumber;

    private Long bookingId;

    private String bookingCode;

    private Long customerId;

    private String customerName;

    private Long vehicleId;

    private String vehicleNumber;

    private String vehicleMake;

    private String vehicleModel;

    private Integer openingMileage;

    private String fuelLevel;

    private String customerComplaint;

    private String advisorNotes;

    private String status;

    private LocalDateTime openedAt;

    private LocalDateTime updatedAt;

    private LocalDateTime closedAt;
}