package com.drcarcare.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "job_cards")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobCard {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(
            name = "job_card_number",
            nullable = false,
            unique = true,
            length = 30
    )
    private String jobCardNumber;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "booking_id",
            nullable = false,
            unique = true
    )
    private Booking booking;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "customer_id",
            nullable = false
    )
    private Customer customer;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "vehicle_id",
            nullable = false
    )
    private Vehicle vehicle;

    @Column(name = "opening_mileage")
    private Integer openingMileage;

    @Column(name = "fuel_level", length = 30)
    private String fuelLevel;

    @Column(
            name = "customer_complaint",
            length = 500
    )
    private String customerComplaint;

    @Column(
            name = "advisor_notes",
            length = 500
    )
    private String advisorNotes;

    @Column(nullable = false, length = 30)
    @Builder.Default
    private String status = "RECEIVED";

    @Column(name = "opened_at", nullable = false)
    private LocalDateTime openedAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Column(name = "closed_at")
    private LocalDateTime closedAt;
}