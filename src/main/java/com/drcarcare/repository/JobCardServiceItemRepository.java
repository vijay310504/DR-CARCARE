package com.drcarcare.repository;

import com.drcarcare.entity.JobCardServiceItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface JobCardServiceItemRepository
        extends JpaRepository<JobCardServiceItem, Long> {

    List<JobCardServiceItem> findByJobCardId(Long jobCardId);

    List<JobCardServiceItem> findByStatus(String status);
}