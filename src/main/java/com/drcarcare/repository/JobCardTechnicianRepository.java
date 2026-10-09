package com.drcarcare.repository;

import com.drcarcare.entity.JobCardTechnician;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface JobCardTechnicianRepository
        extends JpaRepository<JobCardTechnician, Long> {

    List<JobCardTechnician> findByJobCardId(Long jobCardId);

    List<JobCardTechnician> findByTechnicianId(Long technicianId);

    List<JobCardTechnician> findByStatus(String status);

    boolean existsByJobCardIdAndTechnicianIdAndStatusNot(
            Long jobCardId,
            Long technicianId,
            String status
    );
}