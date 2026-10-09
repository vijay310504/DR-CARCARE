package com.drcarcare.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
public class TechnicianResponse {

    private Long id;

    private String technicianCode;

    private String name;

    private String phone;

    private String email;

    private String specialization;

    private Integer experienceYears;

    private String skillLevel;

    private String status;

    private LocalDate joiningDate;

    private String address;

    private String notes;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}