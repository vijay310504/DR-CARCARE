package com.drcarcare.service;

import com.drcarcare.dto.JobCardServiceItemRequest;
import com.drcarcare.dto.JobCardServiceItemResponse;
import com.drcarcare.entity.JobCard;
import com.drcarcare.entity.JobCardServiceItem;
import com.drcarcare.entity.JobCardTechnician;
import com.drcarcare.entity.ServiceCatalogue;
import com.drcarcare.entity.Technician;
import com.drcarcare.repository.JobCardRepository;
import com.drcarcare.repository.JobCardServiceItemRepository;
import com.drcarcare.repository.JobCardTechnicianRepository;
import com.drcarcare.repository.ServiceCatalogueRepository;
import com.drcarcare.repository.TechnicianRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class JobCardServiceItemService {

    private static final String PENDING = "PENDING";
    private static final String IN_PROGRESS = "IN_PROGRESS";
    private static final String COMPLETED = "COMPLETED";
    private static final String CANCELLED = "CANCELLED";

    private final JobCardServiceItemRepository jobCardServiceItemRepository;
    private final JobCardRepository jobCardRepository;
    private final ServiceCatalogueRepository serviceCatalogueRepository;
    private final TechnicianRepository technicianRepository;
    private final JobCardTechnicianRepository jobCardTechnicianRepository;
    private final AuditLogService auditLogService;


    // =========================================================
    // CREATE SERVICE ITEM
    // =========================================================

    public JobCardServiceItemResponse createServiceItem(
            JobCardServiceItemRequest request
    ) {

        JobCard jobCard = jobCardRepository
                .findById(request.getJobCardId())
                .orElseThrow(() ->
                        new RuntimeException(
                                "Job card not found with id: "
                                        + request.getJobCardId()
                        )
                );

        ServiceCatalogue service = serviceCatalogueRepository
                .findById(request.getServiceId())
                .orElseThrow(() ->
                        new RuntimeException(
                                "Service not found with id: "
                                        + request.getServiceId()
                        )
                );

        if (!Boolean.TRUE.equals(service.getActive())) {
            throw new RuntimeException(
                    "Cannot add inactive service: "
                            + service.getServiceName()
            );
        }

        Technician technician = null;

        if (request.getTechnicianId() != null) {

            technician = validateAndGetTechnicianForJobCard(
                    request.getTechnicianId(),
                    request.getJobCardId()
            );
        }

        BigDecimal quantity = request.getQuantity();

        BigDecimal unitPrice =
                request.getUnitPrice() != null
                        ? request.getUnitPrice()
                        : service.getStandardPrice();

        BigDecimal discountAmount =
                request.getDiscountAmount() != null
                        ? request.getDiscountAmount()
                        : BigDecimal.ZERO;

        BigDecimal taxPercent =
                request.getTaxPercent() != null
                        ? request.getTaxPercent()
                        : BigDecimal.ZERO;

        BigDecimal subtotal =
                calculateSubtotal(
                        quantity,
                        unitPrice,
                        discountAmount
                );

        BigDecimal taxAmount =
                calculateTax(
                        subtotal,
                        taxPercent
                );

        BigDecimal totalAmount =
                subtotal.add(taxAmount)
                        .setScale(2, RoundingMode.HALF_UP);

        LocalDateTime now = LocalDateTime.now();

        JobCardServiceItem item =
                JobCardServiceItem.builder()
                        .jobCard(jobCard)
                        .service(service)
                        .technician(technician)
                        .description(request.getDescription())
                        .quantity(quantity)
                        .unitPrice(unitPrice)
                        .discountAmount(discountAmount)
                        .taxPercent(taxPercent)
                        .taxAmount(taxAmount)
                        .totalAmount(totalAmount)
                        .status(PENDING)
                        .notes(request.getNotes())
                        .createdAt(now)
                        .updatedAt(now)
                        .build();

        JobCardServiceItem saved =
                jobCardServiceItemRepository.save(item);

        auditLogService.log(
                "JOB_CARD_UPDATED",
                "JOB_CARD_SERVICE_ITEM",
                saved.getId(),
                "Service added to Job Card: "
                        + jobCard.getJobCardNumber()
                        + " - " + service.getServiceName(),
                null,
                "Service Item ID: " + saved.getId()
                        + ", Service: " + service.getServiceName()
                        + ", Quantity: " + quantity
                        + ", Total: " + totalAmount
        );

        return mapToResponse(saved);
    }


    // =========================================================
    // GET ALL
    // =========================================================

    @Transactional(readOnly = true)
    public List<JobCardServiceItemResponse> getAllServiceItems() {

        return jobCardServiceItemRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }


    // =========================================================
    // GET BY ID
    // =========================================================

    @Transactional(readOnly = true)
    public JobCardServiceItemResponse getServiceItemById(
            Long id
    ) {

        JobCardServiceItem item =
                jobCardServiceItemRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Job card service item not found "
                                                + "with id: " + id
                                )
                        );

        return mapToResponse(item);
    }


    // =========================================================
    // GET BY JOB CARD
    // =========================================================

    @Transactional(readOnly = true)
    public List<JobCardServiceItemResponse> getServiceItemsByJobCard(
            Long jobCardId
    ) {

        if (!jobCardRepository.existsById(jobCardId)) {
            throw new RuntimeException(
                    "Job card not found with id: " + jobCardId
            );
        }

        return jobCardServiceItemRepository
                .findByJobCardId(jobCardId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }


    // =========================================================
    // GET BY STATUS
    // =========================================================

    @Transactional(readOnly = true)
    public List<JobCardServiceItemResponse> getServiceItemsByStatus(
            String status
    ) {

        return jobCardServiceItemRepository
                .findByStatus(normalizeServiceStatus(status))
                .stream()
                .map(this::mapToResponse)
                .toList();
    }


    // =========================================================
    // UPDATE SERVICE ITEM
    // =========================================================

    public JobCardServiceItemResponse updateServiceItem(
            Long id,
            JobCardServiceItemRequest request
    ) {

        JobCardServiceItem item =
                jobCardServiceItemRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Job card service item not found "
                                                + "with id: " + id
                                )
                        );

        if (!item.getJobCard().getId()
                .equals(request.getJobCardId())) {

            throw new RuntimeException(
                    "Job card cannot be changed for an existing "
                            + "service item"
            );
        }

        String oldValues =
                "Service: " + item.getService().getServiceName()
                        + ", Technician: "
                        + (item.getTechnician() != null
                        ? item.getTechnician().getTechnicianCode()
                        : "None")
                        + ", Quantity: " + item.getQuantity()
                        + ", Unit Price: " + item.getUnitPrice()
                        + ", Total: " + item.getTotalAmount()
                        + ", Status: " + item.getStatus();

        ServiceCatalogue service =
                serviceCatalogueRepository
                        .findById(request.getServiceId())
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Service not found with id: "
                                                + request.getServiceId()
                                )
                        );

        if (!Boolean.TRUE.equals(service.getActive())) {
            throw new RuntimeException(
                    "Cannot use inactive service: "
                            + service.getServiceName()
            );
        }

        Technician technician = null;

        if (request.getTechnicianId() != null) {

            technician = validateAndGetTechnicianForJobCard(
                    request.getTechnicianId(),
                    request.getJobCardId()
            );
        }

        BigDecimal unitPrice =
                request.getUnitPrice() != null
                        ? request.getUnitPrice()
                        : service.getStandardPrice();

        BigDecimal discountAmount =
                request.getDiscountAmount() != null
                        ? request.getDiscountAmount()
                        : BigDecimal.ZERO;

        BigDecimal taxPercent =
                request.getTaxPercent() != null
                        ? request.getTaxPercent()
                        : BigDecimal.ZERO;

        BigDecimal subtotal =
                calculateSubtotal(
                        request.getQuantity(),
                        unitPrice,
                        discountAmount
                );

        BigDecimal taxAmount =
                calculateTax(
                        subtotal,
                        taxPercent
                );

        BigDecimal totalAmount =
                subtotal.add(taxAmount)
                        .setScale(2, RoundingMode.HALF_UP);

        item.setService(service);
        item.setTechnician(technician);
        item.setDescription(request.getDescription());
        item.setQuantity(request.getQuantity());
        item.setUnitPrice(unitPrice);
        item.setDiscountAmount(discountAmount);
        item.setTaxPercent(taxPercent);
        item.setTaxAmount(taxAmount);
        item.setTotalAmount(totalAmount);
        item.setNotes(request.getNotes());
        item.setUpdatedAt(LocalDateTime.now());

        JobCardServiceItem updated =
                jobCardServiceItemRepository.save(item);

        String newValues =
                "Service: " + updated.getService().getServiceName()
                        + ", Technician: "
                        + (updated.getTechnician() != null
                        ? updated.getTechnician().getTechnicianCode()
                        : "None")
                        + ", Quantity: " + updated.getQuantity()
                        + ", Unit Price: " + updated.getUnitPrice()
                        + ", Total: " + updated.getTotalAmount()
                        + ", Status: " + updated.getStatus();

        auditLogService.log(
                "JOB_CARD_UPDATED",
                "JOB_CARD_SERVICE_ITEM",
                updated.getId(),
                "Job Card service item updated: "
                        + updated.getJobCard().getJobCardNumber(),
                oldValues,
                newValues
        );

        return mapToResponse(updated);
    }


    // =========================================================
    // ASSIGN TECHNICIAN
    // =========================================================

    public JobCardServiceItemResponse assignTechnician(
            Long serviceItemId,
            Long technicianId
    ) {

        JobCardServiceItem item =
                jobCardServiceItemRepository
                        .findById(serviceItemId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Job card service item not found "
                                                + "with id: "
                                                + serviceItemId
                                )
                        );

        String oldTechnician =
                item.getTechnician() != null
                        ? item.getTechnician().getTechnicianCode()
                        : "None";

        Technician technician =
                validateAndGetTechnicianForJobCard(
                        technicianId,
                        item.getJobCard().getId()
                );

        item.setTechnician(technician);
        item.setUpdatedAt(LocalDateTime.now());

        JobCardServiceItem updated =
                jobCardServiceItemRepository.save(item);

        auditLogService.log(
                "JOB_CARD_UPDATED",
                "JOB_CARD_SERVICE_ITEM",
                updated.getId(),
                "Technician assigned to Job Card service item",
                "Technician: " + oldTechnician,
                "Technician: " + technician.getTechnicianCode()
        );

        return mapToResponse(updated);
    }


    // =========================================================
    // REMOVE TECHNICIAN
    // =========================================================

    public JobCardServiceItemResponse removeTechnician(
            Long serviceItemId
    ) {

        JobCardServiceItem item =
                jobCardServiceItemRepository
                        .findById(serviceItemId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Job card service item not found "
                                                + "with id: "
                                                + serviceItemId
                                )
                        );

        String oldTechnician =
                item.getTechnician() != null
                        ? item.getTechnician().getTechnicianCode()
                        : "None";

        item.setTechnician(null);
        item.setUpdatedAt(LocalDateTime.now());

        JobCardServiceItem updated =
                jobCardServiceItemRepository.save(item);

        auditLogService.log(
                "JOB_CARD_UPDATED",
                "JOB_CARD_SERVICE_ITEM",
                updated.getId(),
                "Technician removed from Job Card service item",
                "Technician: " + oldTechnician,
                "Technician: None"
        );

        return mapToResponse(updated);
    }


    // =========================================================
    // UPDATE SERVICE STATUS
    // =========================================================

    public JobCardServiceItemResponse updateStatus(
            Long id,
            String status
    ) {

        JobCardServiceItem item =
                jobCardServiceItemRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Job card service item not found "
                                                + "with id: " + id
                                )
                        );

        String oldStatus = item.getStatus();

        String normalizedStatus =
                normalizeServiceStatus(status);

        LocalDateTime now = LocalDateTime.now();

        switch (normalizedStatus) {

            case PENDING -> {
                item.setStatus(PENDING);
            }

            case IN_PROGRESS -> {

                if (item.getTechnician() == null) {
                    throw new RuntimeException(
                            "Cannot start service without "
                                    + "an assigned technician"
                    );
                }

                if (!"ACTIVE".equalsIgnoreCase(
                        item.getTechnician().getStatus()
                )) {
                    throw new RuntimeException(
                            "Assigned technician is inactive"
                    );
                }

                item.setStatus(IN_PROGRESS);

                if (item.getStartedAt() == null) {
                    item.setStartedAt(now);
                }
            }

            case COMPLETED -> {

                if (item.getTechnician() == null) {
                    throw new RuntimeException(
                            "Cannot complete service without "
                                    + "an assigned technician"
                    );
                }

                if (item.getStartedAt() == null) {
                    item.setStartedAt(now);
                }

                item.setStatus(COMPLETED);
                item.setCompletedAt(now);
            }

            case CANCELLED -> {

                item.setStatus(CANCELLED);
            }

            default -> throw new IllegalArgumentException(
                    "Invalid service status"
            );
        }

        item.setUpdatedAt(now);

        JobCardServiceItem updated =
                jobCardServiceItemRepository.save(item);

        auditLogService.log(
                "JOB_CARD_UPDATED",
                "JOB_CARD_SERVICE_ITEM",
                updated.getId(),
                "Job Card service item status changed",
                "Status: " + oldStatus,
                "Status: " + updated.getStatus()
        );

        return mapToResponse(updated);
    }


    // =========================================================
    // DELETE
    // =========================================================

    public void deleteServiceItem(Long id) {

        JobCardServiceItem item =
                jobCardServiceItemRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Job card service item not found "
                                                + "with id: " + id
                                )
                        );

        String oldValues =
                "Job Card: " + item.getJobCard().getJobCardNumber()
                        + ", Service: " + item.getService().getServiceName()
                        + ", Quantity: " + item.getQuantity()
                        + ", Total: " + item.getTotalAmount()
                        + ", Status: " + item.getStatus();

        auditLogService.log(
                "JOB_CARD_UPDATED",
                "JOB_CARD_SERVICE_ITEM",
                item.getId(),
                "Job Card service item deleted",
                oldValues,
                null
        );

        jobCardServiceItemRepository.delete(item);
    }


    // =========================================================
    // TECHNICIAN VALIDATION
    // =========================================================

    private Technician validateAndGetTechnicianForJobCard(
            Long technicianId,
            Long jobCardId
    ) {

        Technician technician =
                technicianRepository.findById(technicianId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Technician not found with id: "
                                                + technicianId
                                )
                        );

        if (!"ACTIVE".equalsIgnoreCase(
                technician.getStatus()
        )) {

            throw new RuntimeException(
                    "Cannot assign inactive technician: "
                            + technician.getTechnicianCode()
            );
        }

        List<JobCardTechnician> assignments =
                jobCardTechnicianRepository
                        .findByJobCardId(jobCardId);

        boolean assignedToJobCard =
                assignments.stream()
                        .anyMatch(assignment ->
                                assignment.getTechnician()
                                        .getId()
                                        .equals(technicianId)
                                        && !CANCELLED.equalsIgnoreCase(
                                        assignment.getStatus()
                                )
                        );

        if (!assignedToJobCard) {

            throw new RuntimeException(
                    "Technician "
                            + technician.getTechnicianCode()
                            + " is not assigned to Job Card ID "
                            + jobCardId
            );
        }

        return technician;
    }


    // =========================================================
    // CALCULATIONS
    // =========================================================

    private BigDecimal calculateSubtotal(
            BigDecimal quantity,
            BigDecimal unitPrice,
            BigDecimal discountAmount
    ) {

        BigDecimal subtotal =
                unitPrice
                        .multiply(quantity)
                        .subtract(discountAmount);

        if (subtotal.compareTo(BigDecimal.ZERO) < 0) {

            throw new RuntimeException(
                    "Discount cannot be greater than subtotal"
            );
        }

        return subtotal.setScale(
                2,
                RoundingMode.HALF_UP
        );
    }


    private BigDecimal calculateTax(
            BigDecimal subtotal,
            BigDecimal taxPercent
    ) {

        return subtotal
                .multiply(taxPercent)
                .divide(
                        BigDecimal.valueOf(100),
                        2,
                        RoundingMode.HALF_UP
                );
    }


    // =========================================================
    // MAPPER
    // =========================================================

    private JobCardServiceItemResponse mapToResponse(
            JobCardServiceItem item
    ) {

        Technician technician =
                item.getTechnician();

        return JobCardServiceItemResponse.builder()

                .id(item.getId())

                .jobCardId(
                        item.getJobCard().getId()
                )

                .jobCardNumber(
                        item.getJobCard().getJobCardNumber()
                )

                .serviceId(
                        item.getService().getId()
                )

                .serviceCode(
                        item.getService().getServiceCode()
                )

                .serviceName(
                        item.getService().getServiceName()
                )

                .technicianId(
                        technician != null
                                ? technician.getId()
                                : null
                )

                .technicianCode(
                        technician != null
                                ? technician.getTechnicianCode()
                                : null
                )

                .technicianName(
                        technician != null
                                ? technician.getName()
                                : null
                )

                .description(
                        item.getDescription()
                )

                .quantity(
                        item.getQuantity()
                )

                .unitPrice(
                        item.getUnitPrice()
                )

                .discountAmount(
                        item.getDiscountAmount()
                )

                .taxPercent(
                        item.getTaxPercent()
                )

                .taxAmount(
                        item.getTaxAmount()
                )

                .totalAmount(
                        item.getTotalAmount()
                )

                .status(
                        item.getStatus()
                )

                .startedAt(
                        item.getStartedAt()
                )

                .completedAt(
                        item.getCompletedAt()
                )

                .notes(
                        item.getNotes()
                )

                .createdAt(
                        item.getCreatedAt()
                )

                .updatedAt(
                        item.getUpdatedAt()
                )

                .build();
    }


    // =========================================================
    // STATUS VALIDATION
    // =========================================================

    private String normalizeServiceStatus(
            String status
    ) {

        if (status == null || status.isBlank()) {

            throw new IllegalArgumentException(
                    "Service status is required"
            );
        }

        String normalized =
                status.trim().toUpperCase();

        if (!normalized.equals(PENDING)
                && !normalized.equals(IN_PROGRESS)
                && !normalized.equals(COMPLETED)
                && !normalized.equals(CANCELLED)) {

            throw new IllegalArgumentException(
                    "Invalid service status: "
                            + status
                            + ". Allowed values: "
                            + "PENDING, IN_PROGRESS, "
                            + "COMPLETED, CANCELLED"
            );
        }

        return normalized;
    }
}