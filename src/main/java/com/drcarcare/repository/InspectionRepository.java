package com.drcarcare.repository;

import com.drcarcare.entity.Inspection;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface InspectionRepository
        extends JpaRepository<Inspection, Long> {

    List<Inspection> findByJobCardId(Long jobCardId);

    List<Inspection> findByJobCardIdAndInspectionCategory(
            Long jobCardId,
            String inspectionCategory
    );

    List<Inspection> findByConditionStatus(String conditionStatus);
}