package com.drcarcare.repository;

import com.drcarcare.entity.Estimate;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface EstimateRepository
        extends JpaRepository<Estimate, Long> {

    boolean existsByEstimateNumber(String estimateNumber);

    Optional<Estimate> findByEstimateNumber(
            String estimateNumber
    );

    List<Estimate> findByJobCardId(
            Long jobCardId
    );

    List<Estimate> findByStatus(
            String status
    );
}