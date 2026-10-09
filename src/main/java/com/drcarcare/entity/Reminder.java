package com.drcarcare.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "reminders")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Reminder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "customer_id",
            nullable = false
    )
    private Customer customer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "vehicle_id"
    )
    private Vehicle vehicle;

    @Column(
            name = "reminder_type",
            nullable = false,
            length = 40
    )
    private String reminderType;

    @Column(
            nullable = false,
            length = 200
    )
    private String title;

    @Column(length = 500)
    private String description;

    @Column(
            name = "due_date",
            nullable = false
    )
    private LocalDate dueDate;

    @Column(
            nullable = false,
            length = 30
    )
    @Builder.Default
    private String status = "PENDING";

    @Column(
            nullable = false,
            length = 20
    )
    @Builder.Default
    private String priority = "MEDIUM";

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(length = 1000)
    private String notes;

    @Column(
            name = "created_at",
            nullable = false
    )
    private LocalDateTime createdAt;

    @Column(
            name = "updated_at",
            nullable = false
    )
    private LocalDateTime updatedAt;
}