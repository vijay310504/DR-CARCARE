package com.drcarcare.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "vehicles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Vehicle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "vehicle_number", nullable = false, unique = true, length = 20)
    private String vehicleNumber;

    @Column(nullable = false, length = 100)
    private String make;

    @Column(nullable = false, length = 100)
    private String model;

    @Column(length = 100)
    private String variant;

    @Column(name = "manufacturing_year")
    private Integer manufacturingYear;

    @Column(length = 50)
    private String color;

    @Column(name = "fuel_type", length = 30)
    private String fuelType;

    @Column(length = 100)
    private String vin;

    @Column(name = "engine_number", length = 100)
    private String engineNumber;

    @Column(name = "current_mileage")
    private Integer currentMileage;

    // Vehicle belongs to one customer
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "customer_id",
            nullable = false
    )
    private Customer customer;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean active = true;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}