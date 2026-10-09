package com.drcarcare.service;

import com.drcarcare.dto.JobCardTechnicianRequest;
import com.drcarcare.dto.JobCardTechnicianResponse;
import com.drcarcare.entity.JobCard;
import com.drcarcare.entity.JobCardTechnician;
import com.drcarcare.entity.Technician;
import com.drcarcare.repository.JobCardRepository;
import com.drcarcare.repository.JobCardTechnicianRepository;
import com.drcarcare.repository.TechnicianRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class JobCardTechnicianService {

    private static final String ASSIGNED = "ASSIGNED";
    private static final String IN_PROGRESS = "IN_PROGRESS";
    private static final String PAUSED = "PAUSED";
    private static final String COMPLETED = "COMPLETED";
    private static final String CANCELLED = "CANCELLED";

    private final JobCardTechnicianRepository jobCardTechnicianRepository;
    private final JobCardRepository jobCardRepository;
    private final TechnicianRepository technicianRepository;
    private final AuditLogService auditLogService;


    // =========================================================
    // CREATE ASSIGNMENT
    // =========================================================

    public JobCardTechnicianResponse assignTechnician(
            JobCardTechnicianRequest request
    ) {

        JobCard jobCard = jobCardRepository.findById(request.getJobCardId())
                .orElseThrow(() ->
                        new RuntimeException(
                                "Job card not found with id: "
                                        + request.getJobCardId()
                        )
                );

        Technician technician = technicianRepository
                .findById(request.getTechnicianId())
                .orElseThrow(() ->
                        new RuntimeException(
                                "Technician not found with id: "
                                        + request.getTechnicianId()
                        )
                );

        if (!"ACTIVE".equalsIgnoreCase(technician.getStatus())) {
            throw new RuntimeException(
                    "Cannot assign inactive technician: "
                            + technician.getTechnicianCode()
            );
        }

        boolean alreadyAssigned =
                jobCardTechnicianRepository
                        .existsByJobCardIdAndTechnicianIdAndStatusNot(
                                request.getJobCardId(),
                                request.getTechnicianId(),
                                CANCELLED
                        );

        if (alreadyAssigned) {
            throw new RuntimeException(
                    "Technician is already assigned to this job card"
            );
        }

        LocalDateTime now = LocalDateTime.now();

        JobCardTechnician assignment = JobCardTechnician.builder()
                .jobCard(jobCard)
                .technician(technician)
                .assignedAt(now)
                .status(ASSIGNED)
                .estimatedHours(request.getEstimatedHours())
                .actualHours(request.getActualHours())
                .notes(request.getNotes())
                .createdAt(now)
                .updatedAt(now)
                .build();

        JobCardTechnician saved =
                jobCardTechnicianRepository.save(assignment);

        auditLogService.log(
                "JOB_CARD_UPDATED",
                "JOB_CARD_TECHNICIAN",
                saved.getId(),
                "Technician "
                        + technician.getTechnicianCode()
                        + " assigned to Job Card "
                        + jobCard.getJobCardNumber(),
                null,
                "Technician ID: " + technician.getId()
                        + ", Technician Code: "
                        + technician.getTechnicianCode()
                        + ", Job Card ID: "
                        + jobCard.getId()
        );

        return mapToResponse(saved);
    }


    // =========================================================
    // GET ALL
    // =========================================================

    @Transactional(readOnly = true)
    public List<JobCardTechnicianResponse> getAllAssignments() {

        return jobCardTechnicianRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }


    // =========================================================
    // GET BY ID
    // =========================================================

    @Transactional(readOnly = true)
    public JobCardTechnicianResponse getAssignmentById(Long id) {

        JobCardTechnician assignment =
                jobCardTechnicianRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Job card technician assignment "
                                                + "not found with id: "
                                                + id
                                )
                        );

        return mapToResponse(assignment);
    }


    // =========================================================
    // GET BY JOB CARD
    // =========================================================

    @Transactional(readOnly = true)
    public List<JobCardTechnicianResponse> getAssignmentsByJobCard(
            Long jobCardId
    ) {

        if (!jobCardRepository.existsById(jobCardId)) {
            throw new RuntimeException(
                    "Job card not found with id: " + jobCardId
            );
        }

        return jobCardTechnicianRepository
                .findByJobCardId(jobCardId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }


    // =========================================================
    // GET BY TECHNICIAN
    // =========================================================

    @Transactional(readOnly = true)
    public List<JobCardTechnicianResponse> getAssignmentsByTechnician(
            Long technicianId
    ) {

        if (!technicianRepository.existsById(technicianId)) {
            throw new RuntimeException(
                    "Technician not found with id: " + technicianId
            );
        }

        return jobCardTechnicianRepository
                .findByTechnicianId(technicianId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }


    // =========================================================
    // GET BY STATUS
    // =========================================================

    @Transactional(readOnly = true)
    public List<JobCardTechnicianResponse> getAssignmentsByStatus(
            String status
    ) {

        return jobCardTechnicianRepository
                .findByStatus(normalizeStatus(status))
                .stream()
                .map(this::mapToResponse)
                .toList();
    }


    // =========================================================
    // UPDATE ASSIGNMENT
    // =========================================================

    public JobCardTechnicianResponse updateAssignment(
            Long id,
            JobCardTechnicianRequest request
    ) {

        JobCardTechnician assignment =
                jobCardTechnicianRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Assignment not found with id: "
                                                + id
                                )
                        );

        if (!assignment.getJobCard().getId()
                .equals(request.getJobCardId())) {

            throw new RuntimeException(
                    "Job card cannot be changed for an existing assignment"
            );
        }

        String oldTechnician =
                assignment.getTechnician().getTechnicianCode();

        String oldEstimatedHours =
                String.valueOf(assignment.getEstimatedHours());

        String oldActualHours =
                String.valueOf(assignment.getActualHours());

        String oldNotes =
                assignment.getNotes();

        if (!assignment.getTechnician().getId()
                .equals(request.getTechnicianId())) {

            Technician newTechnician =
                    technicianRepository
                            .findById(request.getTechnicianId())
                            .orElseThrow(() ->
                                    new RuntimeException(
                                            "Technician not found with id: "
                                                    + request.getTechnicianId()
                                    )
                            );

            if (!"ACTIVE".equalsIgnoreCase(newTechnician.getStatus())) {
                throw new RuntimeException(
                        "Cannot assign inactive technician"
                );
            }

            boolean alreadyAssigned =
                    jobCardTechnicianRepository
                            .existsByJobCardIdAndTechnicianIdAndStatusNot(
                                    request.getJobCardId(),
                                    request.getTechnicianId(),
                                    CANCELLED
                            );

            if (alreadyAssigned) {
                throw new RuntimeException(
                        "Technician is already assigned to this job card"
                );
            }

            assignment.setTechnician(newTechnician);
        }

        assignment.setEstimatedHours(request.getEstimatedHours());
        assignment.setActualHours(request.getActualHours());
        assignment.setNotes(request.getNotes());
        assignment.setUpdatedAt(LocalDateTime.now());

        JobCardTechnician updated =
                jobCardTechnicianRepository.save(assignment);

        auditLogService.log(
                "JOB_CARD_UPDATED",
                "JOB_CARD_TECHNICIAN",
                updated.getId(),
                "Job Card technician assignment updated for Job Card "
                        + updated.getJobCard().getJobCardNumber(),
                "Technician: " + oldTechnician
                        + ", Estimated Hours: " + oldEstimatedHours
                        + ", Actual Hours: " + oldActualHours
                        + ", Notes: " + oldNotes,
                "Technician: "
                        + updated.getTechnician().getTechnicianCode()
                        + ", Estimated Hours: "
                        + updated.getEstimatedHours()
                        + ", Actual Hours: "
                        + updated.getActualHours()
                        + ", Notes: "
                        + updated.getNotes()
        );

        return mapToResponse(updated);
    }


    // =========================================================
    // UPDATE STATUS
    // =========================================================

    public JobCardTechnicianResponse updateStatus(
            Long id,
            String status
    ) {

        JobCardTechnician assignment =
                jobCardTechnicianRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Assignment not found with id: "
                                                + id
                                )
                        );

        String oldStatus = assignment.getStatus();

        String normalizedStatus = normalizeStatus(status);

        LocalDateTime now = LocalDateTime.now();

        switch (normalizedStatus) {

            case ASSIGNED -> {
                assignment.setStatus(ASSIGNED);
            }

            case IN_PROGRESS -> {

                assignment.setStatus(IN_PROGRESS);

                if (assignment.getStartedAt() == null) {
                    assignment.setStartedAt(now);
                }
            }

            case PAUSED -> {

                assignment.setStatus(PAUSED);
            }

            case COMPLETED -> {

                assignment.setStatus(COMPLETED);

                if (assignment.getStartedAt() == null) {
                    assignment.setStartedAt(now);
                }

                if (assignment.getCompletedAt() == null) {
                    assignment.setCompletedAt(now);
                }
            }

            case CANCELLED -> {

                assignment.setStatus(CANCELLED);

                if (assignment.getCompletedAt() != null) {
                    assignment.setCompletedAt(null);
                }
            }

            default -> throw new IllegalArgumentException(
                    "Invalid assignment status"
            );
        }

        assignment.setUpdatedAt(now);

        JobCardTechnician updated =
                jobCardTechnicianRepository.save(assignment);

        auditLogService.log(
                "JOB_CARD_UPDATED",
                "JOB_CARD_TECHNICIAN",
                updated.getId(),
                "Job Card technician assignment status changed for Job Card "
                        + updated.getJobCard().getJobCardNumber(),
                "Status: " + oldStatus,
                "Status: " + updated.getStatus()
        );

        return mapToResponse(updated);
    }


    // =========================================================
    // DELETE
    // =========================================================

    public void deleteAssignment(Long id) {

        JobCardTechnician assignment =
                jobCardTechnicianRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Assignment not found with id: "
                                                + id
                                )
                        );

        String jobCardNumber =
                assignment.getJobCard().getJobCardNumber();

        String technicianCode =
                assignment.getTechnician().getTechnicianCode();

        auditLogService.log(
                "JOB_CARD_UPDATED",
                "JOB_CARD_TECHNICIAN",
                assignment.getId(),
                "Technician assignment removed from Job Card "
                        + jobCardNumber,
                "Technician: " + technicianCode
                        + ", Status: " + assignment.getStatus(),
                null
        );

        jobCardTechnicianRepository.delete(assignment);
    }


    // =========================================================
    // MAPPER
    // =========================================================

    private JobCardTechnicianResponse mapToResponse(
            JobCardTechnician assignment
    ) {

        return JobCardTechnicianResponse.builder()

                .id(assignment.getId())

                .jobCardId(
                        assignment.getJobCard().getId()
                )

                .jobCardNumber(
                        assignment.getJobCard().getJobCardNumber()
                )

                .technicianId(
                        assignment.getTechnician().getId()
                )

                .technicianCode(
                        assignment.getTechnician().getTechnicianCode()
                )

                .technicianName(
                        assignment.getTechnician().getName()
                )

                .assignedAt(
                        assignment.getAssignedAt()
                )

                .startedAt(
                        assignment.getStartedAt()
                )

                .completedAt(
                        assignment.getCompletedAt()
                )

                .status(
                        assignment.getStatus()
                )

                .estimatedHours(
                        assignment.getEstimatedHours()
                )

                .actualHours(
                        assignment.getActualHours()
                )

                .notes(
                        assignment.getNotes()
                )

                .createdAt(
                        assignment.getCreatedAt()
                )

                .updatedAt(
                        assignment.getUpdatedAt()
                )

                .build();
    }


    // =========================================================
    // STATUS VALIDATION
    // =========================================================

    private String normalizeStatus(String status) {

        if (status == null || status.isBlank()) {

            throw new IllegalArgumentException(
                    "Assignment status is required"
            );
        }

        String normalized =
                status.trim().toUpperCase();

        if (!normalized.equals(ASSIGNED)
                && !normalized.equals(IN_PROGRESS)
                && !normalized.equals(PAUSED)
                && !normalized.equals(COMPLETED)
                && !normalized.equals(CANCELLED)) {

            throw new IllegalArgumentException(
                    "Invalid assignment status: "
                            + status
                            + ". Allowed values: "
                            + "ASSIGNED, IN_PROGRESS, PAUSED, "
                            + "COMPLETED, CANCELLED"
            );
        }

        return normalized;
    }
}