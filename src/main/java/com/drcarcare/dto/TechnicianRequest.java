package com.drcarcare.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class TechnicianRequest {

    @NotBlank(message = "Technician code is required")
    @Size(
            max = 30,
            message = "Technician code cannot exceed 30 characters"
    )
    private String technicianCode;

    @NotBlank(message = "Technician name is required")
    @Size(
            max = 100,
            message = "Technician name cannot exceed 100 characters"
    )
    private String name;

    @Size(
            max = 20,
            message = "Phone cannot exceed 20 characters"
    )
    private String phone;

    @Email(message = "Invalid email format")
    @Size(
            max = 100,
            message = "Email cannot exceed 100 characters"
    )
    private String email;

    @Size(
            max = 100,
            message = "Specialization cannot exceed 100 characters"
    )
    private String specialization;

    @Min(
            value = 0,
            message = "Experience years cannot be negative"
    )
    @Max(
            value = 60,
            message = "Experience years cannot exceed 60"
    )
    private Integer experienceYears;

    @Size(
            max = 30,
            message = "Skill level cannot exceed 30 characters"
    )
    private String skillLevel;

    @Size(
            max = 30,
            message = "Status cannot exceed 30 characters"
    )
    private String status;

    private LocalDate joiningDate;

    @Size(
            max = 500,
            message = "Address cannot exceed 500 characters"
    )
    private String address;

    @Size(
            max = 500,
            message = "Notes cannot exceed 500 characters"
    )
    private String notes;
}