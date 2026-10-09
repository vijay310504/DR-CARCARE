package com.drcarcare.repository;

import com.drcarcare.entity.JobCard;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface JobCardRepository
        extends JpaRepository<JobCard, Long> {

    boolean existsByJobCardNumber(String jobCardNumber);

    boolean existsByBookingId(Long bookingId);

    Optional<JobCard> findByJobCardNumber(
            String jobCardNumber
    );

    Optional<JobCard> findByBookingId(
            Long bookingId
    );

    List<JobCard> findByCustomerId(
            Long customerId
    );

    List<JobCard> findByVehicleId(
            Long vehicleId
    );

    List<JobCard> findByStatus(
            String status
    );
}