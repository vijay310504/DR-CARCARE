package com.drcarcare.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "job_card_technicians")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobCardTechnician {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "job_card_id",
            nullable = false
    )
    private JobCard jobCard;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "technician_id",
            nullable = false
    )
    private Technician technician;

    @Column(name = "assigned_at", nullable = false)
    private LocalDateTime assignedAt;

    @Column(name = "started_at")
    private LocalDateTime startedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(
            nullable = false,
            length = 30
    )
    @Builder.Default
    private String status = "ASSIGNED";

    @Column(
            name = "estimated_hours",
            precision = 6,
            scale = 2
    )
    private BigDecimal estimatedHours;

    @Column(
            name = "actual_hours",
            precision = 6,
            scale = 2
    )
    private BigDecimal actualHours;

    @Column(length = 500)
    private String notes;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}