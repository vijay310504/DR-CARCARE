package com.drcarcare.service;

import com.drcarcare.dto.EstimateItemRequest;
import com.drcarcare.dto.EstimateItemResponse;
import com.drcarcare.dto.EstimateRequest;
import com.drcarcare.dto.EstimateResponse;
import com.drcarcare.entity.Estimate;
import com.drcarcare.entity.EstimateItem;
import com.drcarcare.entity.JobCard;
import com.drcarcare.repository.EstimateItemRepository;
import com.drcarcare.repository.EstimateRepository;
import com.drcarcare.repository.JobCardRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EstimateService {

    private final EstimateRepository estimateRepository;
    private final EstimateItemRepository estimateItemRepository;
    private final JobCardRepository jobCardRepository;
    private final AuditLogService auditLogService;


    // =========================================================
    // CREATE ESTIMATE
    // =========================================================

    @Transactional
    public EstimateResponse createEstimate(
            EstimateRequest request
    ) {

        JobCard jobCard =
                jobCardRepository.findById(
                        request.getJobCardId()
                ).orElseThrow(() ->
                        new RuntimeException(
                                "Job Card not found with id: "
                                        + request.getJobCardId()
                        )
                );

        LocalDate today = LocalDate.now();

        LocalDate estimateDate =
                request.getEstimateDate() != null
                        ? request.getEstimateDate()
                        : today;

        if (request.getValidUntil() != null
                && request.getValidUntil().isBefore(estimateDate)) {

            throw new RuntimeException(
                    "Valid until date cannot be before estimate date"
            );
        }

        LocalDateTime now = LocalDateTime.now();

        Estimate estimate =
                Estimate.builder()
                        .estimateNumber(generateEstimateNumber())
                        .jobCard(jobCard)
                        .estimateDate(estimateDate)
                        .validUntil(request.getValidUntil())
                        .status("DRAFT")
                        .subtotal(BigDecimal.ZERO)
                        .discountAmount(BigDecimal.ZERO)
                        .taxAmount(BigDecimal.ZERO)
                        .totalAmount(BigDecimal.ZERO)
                        .customerNotes(request.getCustomerNotes())
                        .internalNotes(request.getInternalNotes())
                        .createdAt(now)
                        .updatedAt(now)
                        .build();

        Estimate saved =
                estimateRepository.save(estimate);

        auditLogService.log(
                "ESTIMATE_CREATED",
                "ESTIMATE",
                saved.getId(),
                "Estimate created: "
                        + saved.getEstimateNumber(),
                null,
                "Estimate Number: " + saved.getEstimateNumber()
                        + ", Job Card: "
                        + jobCard.getJobCardNumber()
                        + ", Status: " + saved.getStatus()
        );

        return mapToResponse(saved);
    }
    @Transactional
    public EstimateResponse updateEstimate(
            Long id,
            EstimateRequest request
    ) {
        Estimate estimate = getEntityById(id);

        ensureStatus(estimate, "DRAFT");

        JobCard jobCard = jobCardRepository.findById(request.getJobCardId())
                .orElseThrow(() ->
                        new RuntimeException(
                                "Job Card not found with id: " + request.getJobCardId()
                        )
                );

        LocalDate estimateDate =
                request.getEstimateDate() != null
                        ? request.getEstimateDate()
                        : estimate.getEstimateDate();

        if (request.getValidUntil() != null
                && request.getValidUntil().isBefore(estimateDate)) {
            throw new RuntimeException(
                    "Valid until date cannot be before estimate date"
            );
        }

        String oldValues =
                "Job Card: " + estimate.getJobCard().getJobCardNumber()
                        + ", Estimate Date: " + estimate.getEstimateDate()
                        + ", Valid Until: " + estimate.getValidUntil()
                        + ", Customer Notes: " + estimate.getCustomerNotes()
                        + ", Internal Notes: " + estimate.getInternalNotes();

        estimate.setJobCard(jobCard);
        estimate.setEstimateDate(estimateDate);
        estimate.setValidUntil(request.getValidUntil());
        estimate.setCustomerNotes(request.getCustomerNotes());
        estimate.setInternalNotes(request.getInternalNotes());
        estimate.setUpdatedAt(LocalDateTime.now());

        Estimate updated = estimateRepository.save(estimate);

        auditLogService.log(
                "ESTIMATE_UPDATED",
                "ESTIMATE",
                updated.getId(),
                "Estimate updated: " + updated.getEstimateNumber(),
                oldValues,
                "Job Card: " + updated.getJobCard().getJobCardNumber()
                        + ", Estimate Date: " + updated.getEstimateDate()
                        + ", Valid Until: " + updated.getValidUntil()
        );

        return mapToResponse(updated);
    }


    // =========================================================
    // GET ALL
    // =========================================================

    @Transactional(readOnly = true)
    public List<EstimateResponse> getAllEstimates() {

        return estimateRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }


    // =========================================================
    // GET BY ID
    // =========================================================

    @Transactional(readOnly = true)
    public EstimateResponse getEstimateById(
            Long id
    ) {

        return mapToResponse(
                getEntityById(id)
        );
    }


    // =========================================================
    // GET BY NUMBER
    // =========================================================

    @Transactional(readOnly = true)
    public EstimateResponse getByEstimateNumber(
            String estimateNumber
    ) {

        Estimate estimate =
                estimateRepository
                        .findByEstimateNumber(estimateNumber)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Estimate not found with number: "
                                                + estimateNumber
                                )
                        );

        return mapToResponse(estimate);
    }


    // =========================================================
    // GET BY JOB CARD
    // =========================================================

    @Transactional(readOnly = true)
    public List<EstimateResponse> getByJobCard(
            Long jobCardId
    ) {

        if (!jobCardRepository.existsById(jobCardId)) {

            throw new RuntimeException(
                    "Job Card not found with id: "
                            + jobCardId
            );
        }

        return estimateRepository
                .findByJobCardId(jobCardId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }


    // =========================================================
    // GET BY STATUS
    // =========================================================

    @Transactional(readOnly = true)
    public List<EstimateResponse> getByStatus(
            String status
    ) {

        validateStatus(status);

        return estimateRepository
                .findByStatus(status.toUpperCase())
                .stream()
                .map(this::mapToResponse)
                .toList();
    }


    // =========================================================
    // ADD ITEM
    // =========================================================

    @Transactional
    public EstimateItemResponse addItem(
            EstimateItemRequest request
    ) {

        Estimate estimate =
                getEntityById(request.getEstimateId());

        ensureDraft(estimate);

        validateItemType(request.getItemType());

        BigDecimal quantity =
                request.getQuantity();

        BigDecimal unitPrice =
                request.getUnitPrice();

        BigDecimal discount =
                request.getDiscountAmount() != null
                        ? request.getDiscountAmount()
                        : BigDecimal.ZERO;

        BigDecimal taxPercent =
                request.getTaxPercent() != null
                        ? request.getTaxPercent()
                        : BigDecimal.ZERO;

        BigDecimal subtotal =
                unitPrice
                        .multiply(quantity)
                        .subtract(discount);

        if (subtotal.compareTo(BigDecimal.ZERO) < 0) {

            throw new RuntimeException(
                    "Discount cannot exceed item amount"
            );
        }

        BigDecimal taxAmount =
                subtotal
                        .multiply(taxPercent)
                        .divide(
                                BigDecimal.valueOf(100),
                                2,
                                RoundingMode.HALF_UP
                        );

        BigDecimal totalAmount =
                subtotal.add(taxAmount);

        LocalDateTime now =
                LocalDateTime.now();

        EstimateItem item =
                EstimateItem.builder()
                        .estimate(estimate)
                        .itemType(
                                request.getItemType()
                                        .toUpperCase()
                        )
                        .description(request.getDescription())
                        .quantity(quantity)
                        .unitPrice(unitPrice)
                        .discountAmount(discount)
                        .taxPercent(taxPercent)
                        .taxAmount(taxAmount)
                        .totalAmount(totalAmount)
                        .notes(request.getNotes())
                        .createdAt(now)
                        .updatedAt(now)
                        .build();

        EstimateItem savedItem =
                estimateItemRepository.save(item);

        recalculateEstimate(estimate);

        auditLogService.log(
                "ESTIMATE_UPDATED",
                "ESTIMATE",
                estimate.getId(),
                "Estimate item added to: "
                        + estimate.getEstimateNumber(),
                null,
                "Item ID: " + savedItem.getId()
                        + ", Type: " + savedItem.getItemType()
                        + ", Description: " + savedItem.getDescription()
                        + ", Total: " + savedItem.getTotalAmount()
        );

        return mapItemToResponse(savedItem);
    }


    // =========================================================
    // UPDATE ITEM
    // =========================================================

    @Transactional
    public EstimateItemResponse updateItem(
            Long estimateId,
            Long itemId,
            EstimateItemRequest request
    ) {

        Estimate estimate =
                getEntityById(estimateId);

        ensureDraft(estimate);

        EstimateItem item =
                estimateItemRepository.findById(itemId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Estimate item not found with id: "
                                                + itemId
                                )
                        );

        if (!item.getEstimate()
                .getId()
                .equals(estimateId)) {

            throw new RuntimeException(
                    "Estimate item does not belong to this estimate"
            );
        }

        String oldValues =
                "Type: " + item.getItemType()
                        + ", Description: " + item.getDescription()
                        + ", Quantity: " + item.getQuantity()
                        + ", Unit Price: " + item.getUnitPrice()
                        + ", Total: " + item.getTotalAmount();

        validateItemType(request.getItemType());

        BigDecimal quantity =
                request.getQuantity();

        BigDecimal unitPrice =
                request.getUnitPrice();

        BigDecimal discount =
                request.getDiscountAmount() != null
                        ? request.getDiscountAmount()
                        : BigDecimal.ZERO;

        BigDecimal taxPercent =
                request.getTaxPercent() != null
                        ? request.getTaxPercent()
                        : BigDecimal.ZERO;

        BigDecimal subtotal =
                unitPrice
                        .multiply(quantity)
                        .subtract(discount);

        if (subtotal.compareTo(BigDecimal.ZERO) < 0) {

            throw new RuntimeException(
                    "Discount cannot exceed item amount"
            );
        }

        BigDecimal taxAmount =
                subtotal
                        .multiply(taxPercent)
                        .divide(
                                BigDecimal.valueOf(100),
                                2,
                                RoundingMode.HALF_UP
                        );

        BigDecimal totalAmount =
                subtotal.add(taxAmount);

        item.setItemType(
                request.getItemType().toUpperCase()
        );

        item.setDescription(
                request.getDescription()
        );

        item.setQuantity(quantity);
        item.setUnitPrice(unitPrice);
        item.setDiscountAmount(discount);
        item.setTaxPercent(taxPercent);
        item.setTaxAmount(taxAmount);
        item.setTotalAmount(totalAmount);
        item.setNotes(request.getNotes());
        item.setUpdatedAt(LocalDateTime.now());

        EstimateItem savedItem =
                estimateItemRepository.save(item);

        recalculateEstimate(estimate);

        String newValues =
                "Type: " + savedItem.getItemType()
                        + ", Description: " + savedItem.getDescription()
                        + ", Quantity: " + savedItem.getQuantity()
                        + ", Unit Price: " + savedItem.getUnitPrice()
                        + ", Total: " + savedItem.getTotalAmount();

        auditLogService.log(
                "ESTIMATE_UPDATED",
                "ESTIMATE",
                estimate.getId(),
                "Estimate item updated: "
                        + estimate.getEstimateNumber(),
                oldValues,
                newValues
        );

        return mapItemToResponse(savedItem);
    }


    // =========================================================
    // DELETE ITEM
    // =========================================================

    @Transactional
    public void deleteItem(
            Long estimateId,
            Long itemId
    ) {

        Estimate estimate =
                getEntityById(estimateId);

        ensureDraft(estimate);

        EstimateItem item =
                estimateItemRepository.findById(itemId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Estimate item not found with id: "
                                                + itemId
                                )
                        );

        if (!item.getEstimate()
                .getId()
                .equals(estimateId)) {

            throw new RuntimeException(
                    "Estimate item does not belong to this estimate"
            );
        }

        String oldValues =
                "Item ID: " + item.getId()
                        + ", Type: " + item.getItemType()
                        + ", Description: " + item.getDescription()
                        + ", Total: " + item.getTotalAmount();

        estimateItemRepository.delete(item);

        recalculateEstimate(estimate);

        auditLogService.log(
                "ESTIMATE_UPDATED",
                "ESTIMATE",
                estimate.getId(),
                "Estimate item deleted: "
                        + estimate.getEstimateNumber(),
                oldValues,
                null
        );
    }


    // =========================================================
    // SUBMIT
    // =========================================================

    @Transactional
    public EstimateResponse submitEstimate(
            Long id
    ) {

        Estimate estimate =
                getEntityById(id);

        ensureStatus(
                estimate,
                "DRAFT"
        );

        List<EstimateItem> items =
                estimateItemRepository
                        .findByEstimateId(id);

        if (items.isEmpty()) {

            throw new RuntimeException(
                    "Cannot submit an estimate without items"
            );
        }

        String oldStatus = estimate.getStatus();

        recalculateEstimate(estimate);

        estimate.setStatus("PENDING_APPROVAL");
        estimate.setUpdatedAt(LocalDateTime.now());

        Estimate updated =
                estimateRepository.save(estimate);

        auditLogService.log(
                "ESTIMATE_UPDATED",
                "ESTIMATE",
                updated.getId(),
                "Estimate submitted for approval: "
                        + updated.getEstimateNumber(),
                "Status: " + oldStatus,
                "Status: " + updated.getStatus()
        );

        return mapToResponse(updated);
    }


    // =========================================================
    // APPROVE
    // =========================================================

    @Transactional
    public EstimateResponse approveEstimate(
            Long id
    ) {

        Estimate estimate =
                getEntityById(id);

        ensureStatus(
                estimate,
                "PENDING_APPROVAL"
        );

        LocalDateTime now =
                LocalDateTime.now();

        String oldStatus = estimate.getStatus();

        estimate.setStatus("APPROVED");
        estimate.setApprovedAt(now);
        estimate.setRejectedAt(null);
        estimate.setRejectionReason(null);
        estimate.setUpdatedAt(now);

        JobCard jobCard =
                estimate.getJobCard();

        if ("ESTIMATE".equals(jobCard.getStatus())
                || "WAITING_APPROVAL".equals(jobCard.getStatus())) {

            jobCard.setStatus("APPROVED");
            jobCard.setUpdatedAt(now);

            jobCardRepository.save(jobCard);
        }

        Estimate updated =
                estimateRepository.save(estimate);

        auditLogService.log(
                "ESTIMATE_APPROVED",
                "ESTIMATE",
                updated.getId(),
                "Estimate approved: "
                        + updated.getEstimateNumber(),
                "Status: " + oldStatus,
                "Status: " + updated.getStatus()
        );

        return mapToResponse(updated);
    }


    // =========================================================
    // REJECT
    // =========================================================

    @Transactional
    public EstimateResponse rejectEstimate(
            Long id,
            String rejectionReason
    ) {

        Estimate estimate =
                getEntityById(id);

        ensureStatus(
                estimate,
                "PENDING_APPROVAL"
        );

        if (rejectionReason == null
                || rejectionReason.trim().isEmpty()) {

            throw new RuntimeException(
                    "Rejection reason is required"
            );
        }

        LocalDateTime now =
                LocalDateTime.now();

        String oldStatus = estimate.getStatus();

        estimate.setStatus("REJECTED");
        estimate.setRejectionReason(
                rejectionReason.trim()
        );
        estimate.setRejectedAt(now);
        estimate.setApprovedAt(null);
        estimate.setUpdatedAt(now);

        JobCard jobCard =
                estimate.getJobCard();

        jobCard.setStatus("ESTIMATE");
        jobCard.setUpdatedAt(now);

        jobCardRepository.save(jobCard);

        Estimate updated =
                estimateRepository.save(estimate);

        auditLogService.log(
                "ESTIMATE_REJECTED",
                "ESTIMATE",
                updated.getId(),
                "Estimate rejected: "
                        + updated.getEstimateNumber(),
                "Status: " + oldStatus,
                "Status: " + updated.getStatus()
                        + ", Reason: "
                        + updated.getRejectionReason()
        );

        return mapToResponse(updated);
    }


    // =========================================================
    // DELETE ESTIMATE
    // =========================================================

    @Transactional
    public void deleteEstimate(
            Long id
    ) {

        Estimate estimate =
                getEntityById(id);

        ensureStatus(
                estimate,
                "DRAFT"
        );

        String oldValues =
                "Estimate Number: " + estimate.getEstimateNumber()
                        + ", Job Card: "
                        + estimate.getJobCard().getJobCardNumber()
                        + ", Status: " + estimate.getStatus()
                        + ", Total: " + estimate.getTotalAmount();

        List<EstimateItem> items =
                estimateItemRepository
                        .findByEstimateId(id);

        estimateItemRepository.deleteAll(items);

        auditLogService.log(
                "ESTIMATE_UPDATED",
                "ESTIMATE",
                estimate.getId(),
                "Estimate deleted: "
                        + estimate.getEstimateNumber(),
                oldValues,
                null
        );

        estimateRepository.delete(estimate);
    }


    // =========================================================
    // RECALCULATE ESTIMATE
    // =========================================================

    private void recalculateEstimate(
            Estimate estimate
    ) {

        List<EstimateItem> items =
                estimateItemRepository
                        .findByEstimateId(
                                estimate.getId()
                        );

        BigDecimal subtotal =
                BigDecimal.ZERO;

        BigDecimal discount =
                BigDecimal.ZERO;

        BigDecimal tax =
                BigDecimal.ZERO;

        BigDecimal total =
                BigDecimal.ZERO;

        for (EstimateItem item : items) {

            BigDecimal itemSubtotal =
                    item.getUnitPrice()
                            .multiply(item.getQuantity());

            subtotal =
                    subtotal.add(itemSubtotal);

            discount =
                    discount.add(
                            item.getDiscountAmount()
                    );

            tax =
                    tax.add(
                            item.getTaxAmount()
                    );

            total =
                    total.add(
                            item.getTotalAmount()
                    );
        }

        estimate.setSubtotal(
                subtotal.setScale(
                        2,
                        RoundingMode.HALF_UP
                )
        );

        estimate.setDiscountAmount(
                discount.setScale(
                        2,
                        RoundingMode.HALF_UP
                )
        );

        estimate.setTaxAmount(
                tax.setScale(
                        2,
                        RoundingMode.HALF_UP
                )
        );

        estimate.setTotalAmount(
                total.setScale(
                        2,
                        RoundingMode.HALF_UP
                )
        );

        estimate.setUpdatedAt(
                LocalDateTime.now()
        );

        estimateRepository.save(estimate);
    }


    // =========================================================
    // GENERATE ESTIMATE NUMBER
    // =========================================================

    private String generateEstimateNumber() {

        long nextNumber =
                estimateRepository.count() + 1;

        String estimateNumber;

        do {

            estimateNumber =
                    String.format(
                            "EST-%06d",
                            nextNumber
                    );

            nextNumber++;

        } while (
                estimateRepository
                        .existsByEstimateNumber(
                                estimateNumber
                        )
        );

        return estimateNumber;
    }


    // =========================================================
    // FIND ENTITY
    // =========================================================

    private Estimate getEntityById(
            Long id
    ) {

        return estimateRepository
                .findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Estimate not found with id: "
                                        + id
                        )
                );
    }


    // =========================================================
    // STATUS VALIDATION
    // =========================================================

    private void validateStatus(
            String status
    ) {

        if (status == null) {

            throw new RuntimeException(
                    "Estimate status is required"
            );
        }

        String normalized =
                status.toUpperCase();

        if (!normalized.equals("DRAFT")
                && !normalized.equals("PENDING_APPROVAL")
                && !normalized.equals("APPROVED")
                && !normalized.equals("REJECTED")
                && !normalized.equals("EXPIRED")) {

            throw new RuntimeException(
                    "Invalid estimate status: "
                            + status
            );
        }
    }


    private void ensureStatus(
            Estimate estimate,
            String expectedStatus
    ) {

        if (!expectedStatus.equals(
                estimate.getStatus()
        )) {

            throw new RuntimeException(
                    "Estimate must be in "
                            + expectedStatus
                            + " status"
            );
        }
    }


    private void ensureDraft(
            Estimate estimate
    ) {

        ensureStatus(
                estimate,
                "DRAFT"
        );
    }


    // =========================================================
    // ITEM TYPE VALIDATION
    // =========================================================

    private void validateItemType(
            String itemType
    ) {

        if (itemType == null) {

            throw new RuntimeException(
                    "Item type is required"
            );
        }

        String normalized =
                itemType.toUpperCase();

        if (!normalized.equals("SERVICE")
                && !normalized.equals("PART")
                && !normalized.equals("LABOUR")
                && !normalized.equals("OTHER")) {

            throw new RuntimeException(
                    "Invalid estimate item type: "
                            + itemType
            );
        }
    }


    // =========================================================
    // ESTIMATE MAPPER
    // =========================================================

    private EstimateResponse mapToResponse(
            Estimate estimate
    ) {

        JobCard jobCard =
                estimate.getJobCard();

        return EstimateResponse.builder()
                .id(estimate.getId())
                .estimateNumber(
                        estimate.getEstimateNumber()
                )
                .jobCardId(
                        jobCard.getId()
                )
                .jobCardNumber(
                        jobCard.getJobCardNumber()
                )
                .customerId(
                        jobCard.getCustomer().getId()
                )
                .customerName(
                        jobCard.getCustomer().getName()
                )
                .vehicleId(
                        jobCard.getVehicle().getId()
                )
                .vehicleNumber(
                        jobCard.getVehicle().getVehicleNumber()
                )
                .vehicleMake(
                        jobCard.getVehicle().getMake()
                )
                .vehicleModel(
                        jobCard.getVehicle().getModel()
                )
                .estimateDate(
                        estimate.getEstimateDate()
                )
                .validUntil(
                        estimate.getValidUntil()
                )
                .status(
                        estimate.getStatus()
                )
                .subtotal(
                        estimate.getSubtotal()
                )
                .discountAmount(
                        estimate.getDiscountAmount()
                )
                .taxAmount(
                        estimate.getTaxAmount()
                )
                .totalAmount(
                        estimate.getTotalAmount()
                )
                .customerNotes(
                        estimate.getCustomerNotes()
                )
                .internalNotes(
                        estimate.getInternalNotes()
                )
                .rejectionReason(
                        estimate.getRejectionReason()
                )
                .approvedAt(
                        estimate.getApprovedAt()
                )
                .rejectedAt(
                        estimate.getRejectedAt()
                )
                .createdAt(
                        estimate.getCreatedAt()
                )
                .updatedAt(
                        estimate.getUpdatedAt()
                )
                .items(
                        estimateItemRepository
                                .findByEstimateId(
                                        estimate.getId()
                                )
                                .stream()
                                .map(this::mapItemToResponse)
                                .toList()
                )
                .build();
    }


    // =========================================================
    // ITEM MAPPER
    // =========================================================

    private EstimateItemResponse mapItemToResponse(
            EstimateItem item
    ) {

        return EstimateItemResponse.builder()
                .id(item.getId())
                .estimateId(
                        item.getEstimate().getId()
                )
                .estimateNumber(
                        item.getEstimate()
                                .getEstimateNumber()
                )
                .itemType(
                        item.getItemType()
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
}