package com.drcarcare.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "technicians",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_technician_code",
                        columnNames = "technician_code"
                ),
                @UniqueConstraint(
                        name = "uk_technician_email",
                        columnNames = "email"
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Technician {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(
            name = "technician_code",
            nullable = false,
            unique = true,
            length = 30
    )
    private String technicianCode;

    @Column(
            nullable = false,
            length = 100
    )
    private String name;

    @Column(length = 20)
    private String phone;

    @Column(length = 100)
    private String email;

    @Column(length = 100)
    private String specialization;

    @Column(name = "experience_years")
    private Integer experienceYears;

    @Column(length = 30)
    private String skillLevel;

    @Column(
            nullable = false,
            length = 30
    )
    @Builder.Default
    private String status = "ACTIVE";

    @Column(name = "joining_date")
    private LocalDate joiningDate;

    @Column(length = 500)
    private String address;

    @Column(length = 500)
    private String notes;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}