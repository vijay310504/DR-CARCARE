package com.drcarcare.dto;

import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReminderResponse {

    private Long id;

    private Long customerId;

    private String customerName;

    private Long vehicleId;

    private String reminderType;

    private String title;

    private String description;

    private LocalDate dueDate;

    private String status;

    private String priority;

    private LocalDateTime completedAt;

    private String notes;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private boolean overdue;
}