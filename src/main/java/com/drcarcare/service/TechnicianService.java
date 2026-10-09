package com.drcarcare.service;

import com.drcarcare.dto.TechnicianRequest;
import com.drcarcare.dto.TechnicianResponse;
import com.drcarcare.entity.Technician;
import com.drcarcare.repository.TechnicianRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class TechnicianService {

    private static final String ACTIVE = "ACTIVE";
    private static final String INACTIVE = "INACTIVE";

    private final TechnicianRepository technicianRepository;
    private final AuditLogService auditLogService;


    // =========================================================
    // CREATE
    // =========================================================

    public TechnicianResponse createTechnician(
            TechnicianRequest request
    ) {

        if (technicianRepository.existsByTechnicianCode(
                request.getTechnicianCode()
        )) {
            throw new RuntimeException(
                    "Technician code already exists: "
                            + request.getTechnicianCode()
            );
        }

        if (request.getEmail() != null
                && !request.getEmail().isBlank()
                && technicianRepository.existsByEmail(
                request.getEmail()
        )) {

            throw new RuntimeException(
                    "Technician email already exists: "
                            + request.getEmail()
            );
        }

        Technician technician = Technician.builder()
                .technicianCode(request.getTechnicianCode())
                .name(request.getName())
                .phone(request.getPhone())
                .email(request.getEmail())
                .specialization(request.getSpecialization())
                .experienceYears(request.getExperienceYears())
                .skillLevel(request.getSkillLevel())
                .status(
                        request.getStatus() == null
                                || request.getStatus().isBlank()
                                ? ACTIVE
                                : normalizeStatus(request.getStatus())
                )
                .joiningDate(
                        request.getJoiningDate() == null
                                ? LocalDate.now()
                                : request.getJoiningDate()
                )
                .address(request.getAddress())
                .notes(request.getNotes())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        Technician saved =
                technicianRepository.save(technician);

        auditLogService.log(
                "TECHNICIAN_CREATED",
                "TECHNICIAN",
                saved.getId(),
                "Technician created: " + saved.getName()
                        + " (" + saved.getTechnicianCode() + ")",
                null,
                "Technician ID: " + saved.getId()
                        + ", Code: " + saved.getTechnicianCode()
                        + ", Name: " + saved.getName()
                        + ", Status: " + saved.getStatus()
        );

        return mapToResponse(saved);
    }


    // =========================================================
    // GET ALL
    // =========================================================

    @Transactional(readOnly = true)
    public List<TechnicianResponse> getAllTechnicians() {

        return technicianRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }


    // =========================================================
    // GET BY ID
    // =========================================================

    @Transactional(readOnly = true)
    public TechnicianResponse getTechnicianById(
            Long id
    ) {

        Technician technician =
                technicianRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Technician not found with id: "
                                                + id
                                )
                        );

        return mapToResponse(technician);
    }


    // =========================================================
    // GET BY TECHNICIAN CODE
    // =========================================================

    @Transactional(readOnly = true)
    public TechnicianResponse getTechnicianByCode(
            String technicianCode
    ) {

        Technician technician =
                technicianRepository
                        .findByTechnicianCode(technicianCode)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Technician not found with code: "
                                                + technicianCode
                                )
                        );

        return mapToResponse(technician);
    }


    // =========================================================
    // GET BY STATUS
    // =========================================================

    @Transactional(readOnly = true)
    public List<TechnicianResponse> getTechniciansByStatus(
            String status
    ) {

        return technicianRepository
                .findByStatus(normalizeStatus(status))
                .stream()
                .map(this::mapToResponse)
                .toList();
    }


    // =========================================================
    // GET BY SPECIALIZATION
    // =========================================================

    @Transactional(readOnly = true)
    public List<TechnicianResponse> getTechniciansBySpecialization(
            String specialization
    ) {

        return technicianRepository
                .findBySpecializationIgnoreCase(specialization)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }


    // =========================================================
    // GET BY SKILL LEVEL
    // =========================================================

    @Transactional(readOnly = true)
    public List<TechnicianResponse> getTechniciansBySkillLevel(
            String skillLevel
    ) {

        return technicianRepository
                .findBySkillLevelIgnoreCase(skillLevel)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }


    // =========================================================
    // UPDATE
    // =========================================================

    public TechnicianResponse updateTechnician(
            Long id,
            TechnicianRequest request
    ) {

        Technician technician =
                technicianRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Technician not found with id: "
                                                + id
                                )
                        );

        String oldValues =
                "Code: " + technician.getTechnicianCode()
                        + ", Name: " + technician.getName()
                        + ", Phone: " + technician.getPhone()
                        + ", Email: " + technician.getEmail()
                        + ", Specialization: " + technician.getSpecialization()
                        + ", Experience: " + technician.getExperienceYears()
                        + ", Skill Level: " + technician.getSkillLevel()
                        + ", Status: " + technician.getStatus();

        // Prevent technician code from being duplicated
        if (!technician.getTechnicianCode()
                .equals(request.getTechnicianCode())
                && technicianRepository.existsByTechnicianCode(
                request.getTechnicianCode()
        )) {

            throw new RuntimeException(
                    "Technician code already exists: "
                            + request.getTechnicianCode()
            );
        }

        // Prevent duplicate email
        if (request.getEmail() != null
                && !request.getEmail().isBlank()
                && !request.getEmail().equalsIgnoreCase(
                technician.getEmail()
        )
                && technicianRepository.existsByEmail(
                request.getEmail()
        )) {

            throw new RuntimeException(
                    "Technician email already exists: "
                            + request.getEmail()
            );
        }

        technician.setTechnicianCode(
                request.getTechnicianCode()
        );

        technician.setName(
                request.getName()
        );

        technician.setPhone(
                request.getPhone()
        );

        technician.setEmail(
                request.getEmail()
        );

        technician.setSpecialization(
                request.getSpecialization()
        );

        technician.setExperienceYears(
                request.getExperienceYears()
        );

        technician.setSkillLevel(
                request.getSkillLevel()
        );

        if (request.getStatus() != null
                && !request.getStatus().isBlank()) {

            technician.setStatus(
                    normalizeStatus(request.getStatus())
            );
        }

        technician.setJoiningDate(
                request.getJoiningDate()
        );

        technician.setAddress(
                request.getAddress()
        );

        technician.setNotes(
                request.getNotes()
        );

        technician.setUpdatedAt(
                LocalDateTime.now()
        );

        Technician updated =
                technicianRepository.save(technician);

        String newValues =
                "Code: " + updated.getTechnicianCode()
                        + ", Name: " + updated.getName()
                        + ", Phone: " + updated.getPhone()
                        + ", Email: " + updated.getEmail()
                        + ", Specialization: " + updated.getSpecialization()
                        + ", Experience: " + updated.getExperienceYears()
                        + ", Skill Level: " + updated.getSkillLevel()
                        + ", Status: " + updated.getStatus();

        auditLogService.log(
                "TECHNICIAN_UPDATED",
                "TECHNICIAN",
                updated.getId(),
                "Technician updated: " + updated.getName()
                        + " (" + updated.getTechnicianCode() + ")",
                oldValues,
                newValues
        );

        return mapToResponse(updated);
    }


    // =========================================================
    // CHANGE STATUS
    // =========================================================

    public TechnicianResponse updateStatus(
            Long id,
            String status
    ) {

        Technician technician =
                technicianRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Technician not found with id: "
                                                + id
                                )
                        );

        String oldStatus = technician.getStatus();
        String newStatus = normalizeStatus(status);

        technician.setStatus(newStatus);

        technician.setUpdatedAt(
                LocalDateTime.now()
        );

        Technician updated =
                technicianRepository.save(technician);

        auditLogService.log(
                "TECHNICIAN_UPDATED",
                "TECHNICIAN",
                updated.getId(),
                "Technician status changed: "
                        + updated.getTechnicianCode(),
                "Status: " + oldStatus,
                "Status: " + newStatus
        );

        return mapToResponse(updated);
    }


    // =========================================================
    // ACTIVATE
    // =========================================================

    public TechnicianResponse activateTechnician(
            Long id
    ) {

        return updateStatus(id, ACTIVE);
    }


    // =========================================================
    // DEACTIVATE
    // =========================================================

    public TechnicianResponse deactivateTechnician(
            Long id
    ) {

        return updateStatus(id, INACTIVE);
    }


    // =========================================================
    // DELETE
    // =========================================================

    public void deleteTechnician(Long id) {

        Technician technician =
                technicianRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Technician not found with id: "
                                                + id
                                )
                        );

        String oldValues =
                "Code: " + technician.getTechnicianCode()
                        + ", Name: " + technician.getName()
                        + ", Status: " + technician.getStatus();

        auditLogService.log(
                "TECHNICIAN_UPDATED",
                "TECHNICIAN",
                technician.getId(),
                "Technician deleted: "
                        + technician.getName()
                        + " (" + technician.getTechnicianCode() + ")",
                oldValues,
                null
        );

        technicianRepository.delete(technician);
    }


    // =========================================================
    // MAPPER
    // =========================================================

    private TechnicianResponse mapToResponse(
            Technician technician
    ) {

        return TechnicianResponse.builder()
                .id(technician.getId())
                .technicianCode(
                        technician.getTechnicianCode()
                )
                .name(technician.getName())
                .phone(technician.getPhone())
                .email(technician.getEmail())
                .specialization(
                        technician.getSpecialization()
                )
                .experienceYears(
                        technician.getExperienceYears()
                )
                .skillLevel(
                        technician.getSkillLevel()
                )
                .status(
                        technician.getStatus()
                )
                .joiningDate(
                        technician.getJoiningDate()
                )
                .address(
                        technician.getAddress()
                )
                .notes(
                        technician.getNotes()
                )
                .createdAt(
                        technician.getCreatedAt()
                )
                .updatedAt(
                        technician.getUpdatedAt()
                )
                .build();
    }


    // =========================================================
    // STATUS NORMALIZATION
    // =========================================================

    private String normalizeStatus(String status) {

        if (status == null || status.isBlank()) {
            throw new IllegalArgumentException(
                    "Technician status is required"
            );
        }

        String normalized =
                status.trim().toUpperCase();

        if (!normalized.equals(ACTIVE)
                && !normalized.equals(INACTIVE)) {

            throw new IllegalArgumentException(
                    "Invalid technician status: "
                            + status
                            + ". Allowed values: ACTIVE, INACTIVE"
            );
        }

        return normalized;
    }
}