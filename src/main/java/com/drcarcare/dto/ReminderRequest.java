package com.drcarcare.dto;

import jakarta.validation.constraints.*;

import lombok.*;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReminderRequest {

    @NotNull(message = "Customer ID is required")
    private Long customerId;

    private Long vehicleId;

    @NotBlank(message = "Reminder type is required")
    private String reminderType;

    @NotBlank(message = "Title is required")
    @Size(max = 200)
    private String title;

    @Size(max = 500)
    private String description;

    @NotNull(message = "Due date is required")
    private LocalDate dueDate;

    private String status;

    private String priority;

    @Size(max = 1000)
    private String notes;
}