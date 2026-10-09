package com.drcarcare.repository;

import com.drcarcare.entity.EstimateItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EstimateItemRepository
        extends JpaRepository<EstimateItem, Long> {

    List<EstimateItem> findByEstimateId(
            Long estimateId
    );
}