package com.drcarcare.repository;

import com.drcarcare.entity.JobCardPart;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface JobCardPartRepository extends JpaRepository<JobCardPart, Long> {

    List<JobCardPart> findByJobCardId(Long jobCardId);

    List<JobCardPart> findByInventoryItemId(Long inventoryItemId);

    List<JobCardPart> findByStatus(String status);
}