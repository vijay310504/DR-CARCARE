package com.drcarcare.repository;

import com.drcarcare.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface BookingRepository
        extends JpaRepository<Booking, Long> {

    boolean existsByBookingCode(String bookingCode);

    Optional<Booking> findByBookingCode(String bookingCode);

    List<Booking> findByCustomerId(Long customerId);

    List<Booking> findByVehicleId(Long vehicleId);

    List<Booking> findByBookingDate(LocalDate bookingDate);

    List<Booking> findByStatus(String status);

    List<Booking> findByBookingDateAndStatus(
            LocalDate bookingDate,
            String status
    );
}