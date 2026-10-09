package com.drcarcare.service;

import com.drcarcare.dto.InspectionRequest;
import com.drcarcare.dto.InspectionResponse;
import com.drcarcare.entity.Inspection;
import com.drcarcare.entity.JobCard;
import com.drcarcare.repository.InspectionRepository;
import com.drcarcare.repository.JobCardRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class InspectionService {

    private final InspectionRepository inspectionRepository;
    private final JobCardRepository jobCardRepository;
    private final AuditLogService auditLogService;


    // =========================================================
    // CREATE INSPECTION
    // =========================================================

    @Transactional
    public InspectionResponse createInspection(
            InspectionRequest request
    ) {

        JobCard jobCard = jobCardRepository
                .findById(request.getJobCardId())
                .orElseThrow(() ->
                        new RuntimeException(
                                "Job Card not found with id: "
                                        + request.getJobCardId()
                        )
                );

        LocalDateTime now = LocalDateTime.now();

        Inspection inspection = Inspection.builder()
                .jobCard(jobCard)
                .inspectionCategory(
                        request.getInspectionCategory()
                )
                .inspectionItem(
                        request.getInspectionItem()
                )
                .conditionStatus(
                        request.getConditionStatus()
                )
                .remarks(
                        request.getRemarks()
                )
                .createdAt(now)
                .updatedAt(now)
                .build();

        Inspection savedInspection =
                inspectionRepository.save(inspection);

        // =====================================================
        // AUDIT LOG
        // =====================================================

        auditLogService.log(
                "INSPECTION_CREATED",
                "INSPECTION",
                savedInspection.getId(),
                "Inspection created for job card: "
                        + jobCard.getJobCardNumber(),
                null,
                "Inspection ID: "
                        + savedInspection.getId()
                        + ", Job Card ID: "
                        + jobCard.getId()
                        + ", Category: "
                        + savedInspection.getInspectionCategory()
                        + ", Item: "
                        + savedInspection.getInspectionItem()
        );

        return mapToResponse(savedInspection);
    }


    // =========================================================
    // GET ALL INSPECTIONS
    // =========================================================

    @Transactional(readOnly = true)
    public List<InspectionResponse> getAllInspections() {

        return inspectionRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }


    // =========================================================
    // GET INSPECTION BY ID
    // =========================================================

    @Transactional(readOnly = true)
    public InspectionResponse getInspectionById(
            Long id
    ) {

        Inspection inspection =
                inspectionRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Inspection not found with id: "
                                                + id
                                )
                        );

        return mapToResponse(inspection);
    }


    // =========================================================
    // UPDATE INSPECTION
    // =========================================================

    @Transactional
    public InspectionResponse updateInspection(
            Long id,
            InspectionRequest request
    ) {

        Inspection inspection =
                inspectionRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Inspection not found with id: "
                                                + id
                                )
                        );

        /*
         * Normally an inspection should remain attached
         * to the same Job Card.
         *
         * Therefore we don't change the Job Card during
         * a normal update.
         */

        // Capture old values
        String oldValues =
                "inspectionCategory="
                        + inspection.getInspectionCategory()
                        + ", inspectionItem="
                        + inspection.getInspectionItem()
                        + ", conditionStatus="
                        + inspection.getConditionStatus()
                        + ", remarks="
                        + inspection.getRemarks();

        inspection.setInspectionCategory(
                request.getInspectionCategory()
        );

        inspection.setInspectionItem(
                request.getInspectionItem()
        );

        inspection.setConditionStatus(
                request.getConditionStatus()
        );

        inspection.setRemarks(
                request.getRemarks()
        );

        inspection.setUpdatedAt(
                LocalDateTime.now()
        );

        Inspection updatedInspection =
                inspectionRepository.save(inspection);

        // Capture new values
        String newValues =
                "inspectionCategory="
                        + updatedInspection.getInspectionCategory()
                        + ", inspectionItem="
                        + updatedInspection.getInspectionItem()
                        + ", conditionStatus="
                        + updatedInspection.getConditionStatus()
                        + ", remarks="
                        + updatedInspection.getRemarks();

        // =====================================================
        // AUDIT LOG
        // =====================================================

        auditLogService.log(
                "INSPECTION_UPDATED",
                "INSPECTION",
                updatedInspection.getId(),
                "Inspection updated for job card: "
                        + updatedInspection.getJobCard()
                        .getJobCardNumber(),
                oldValues,
                newValues
        );

        return mapToResponse(updatedInspection);
    }


    // =========================================================
    // DELETE INSPECTION
    // =========================================================

    @Transactional
    public void deleteInspection(Long id) {

        Inspection inspection =
                inspectionRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Inspection not found with id: "
                                                + id
                                )
                        );

        // Preserve identifying information before deletion
        Long inspectionId = inspection.getId();
        Long jobCardId = inspection.getJobCard().getId();
        String category = inspection.getInspectionCategory();
        String item = inspection.getInspectionItem();

        inspectionRepository.delete(inspection);

        // =====================================================
        // AUDIT LOG
        // =====================================================

        auditLogService.log(
                "INSPECTION_UPDATED",
                "INSPECTION",
                inspectionId,
                "Inspection deleted from job card: "
                        + jobCardId,
                "inspectionCategory=" + category
                        + ", inspectionItem=" + item,
                "deleted=true"
        );
    }


    // =========================================================
    // GET INSPECTIONS BY JOB CARD
    // =========================================================

    @Transactional(readOnly = true)
    public List<InspectionResponse> getInspectionsByJobCard(
            Long jobCardId
    ) {

        /*
         * First verify that the Job Card exists.
         */

        if (!jobCardRepository.existsById(jobCardId)) {

            throw new RuntimeException(
                    "Job Card not found with id: " + jobCardId
            );
        }

        return inspectionRepository
                .findByJobCardId(jobCardId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }


    // =========================================================
    // GET INSPECTIONS BY JOB CARD + CATEGORY
    // =========================================================

    @Transactional(readOnly = true)
    public List<InspectionResponse> getInspectionsByJobCardAndCategory(
            Long jobCardId,
            String category
    ) {

        if (!jobCardRepository.existsById(jobCardId)) {

            throw new RuntimeException(
                    "Job Card not found with id: " + jobCardId
            );
        }

        return inspectionRepository
                .findByJobCardIdAndInspectionCategory(
                        jobCardId,
                        category
                )
                .stream()
                .map(this::mapToResponse)
                .toList();
    }


    // =========================================================
    // GET INSPECTIONS BY CONDITION
    // =========================================================

    @Transactional(readOnly = true)
    public List<InspectionResponse> getInspectionsByCondition(
            String condition
    ) {

        return inspectionRepository
                .findByConditionStatus(condition)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }


    // =========================================================
    // MAPPER
    // =========================================================

    private InspectionResponse mapToResponse(
            Inspection inspection
    ) {

        JobCard jobCard =
                inspection.getJobCard();

        return InspectionResponse.builder()
                .id(inspection.getId())

                .jobCardId(
                        jobCard.getId()
                )

                .jobCardNumber(
                        jobCard.getJobCardNumber()
                )

                .inspectionCategory(
                        inspection.getInspectionCategory()
                )

                .inspectionItem(
                        inspection.getInspectionItem()
                )

                .conditionStatus(
                        inspection.getConditionStatus()
                )

                .remarks(
                        inspection.getRemarks()
                )

                .createdAt(
                        inspection.getCreatedAt()
                )

                .updatedAt(
                        inspection.getUpdatedAt()
                )

                .build();
    }
}