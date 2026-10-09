package com.drcarcare.service;

import com.drcarcare.dto.InvoiceItemResponse;
import com.drcarcare.dto.InvoiceRequest;
import com.drcarcare.dto.InvoiceResponse;
import com.drcarcare.entity.Estimate;
import com.drcarcare.entity.EstimateItem;
import com.drcarcare.entity.Invoice;
import com.drcarcare.entity.InvoiceItem;
import com.drcarcare.entity.JobCard;
import com.drcarcare.repository.EstimateItemRepository;
import com.drcarcare.repository.EstimateRepository;
import com.drcarcare.repository.InvoiceItemRepository;
import com.drcarcare.repository.InvoiceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final InvoiceItemRepository invoiceItemRepository;

    private final EstimateRepository estimateRepository;
    private final EstimateItemRepository estimateItemRepository;

    private final AuditLogService auditLogService;


    // =========================================================
    // CREATE INVOICE FROM APPROVED ESTIMATE
    // =========================================================

    @Transactional
    public InvoiceResponse createInvoiceFromEstimate(
            InvoiceRequest request
    ) {

        // -----------------------------------------------------
        // FIND ESTIMATE
        // -----------------------------------------------------

        Estimate estimate = estimateRepository
                .findById(request.getEstimateId())
                .orElseThrow(() ->
                        new RuntimeException(
                                "Estimate not found: "
                                        + request.getEstimateId()
                        )
                );


        // -----------------------------------------------------
        // ESTIMATE MUST BE APPROVED
        // -----------------------------------------------------

        if (!"APPROVED".equalsIgnoreCase(
                estimate.getStatus()
        )) {

            throw new RuntimeException(
                    "Invoice can only be created from an APPROVED estimate."
            );
        }


        // -----------------------------------------------------
        // GET JOB CARD
        // -----------------------------------------------------

        JobCard jobCard = estimate.getJobCard();

        if (jobCard == null) {

            throw new RuntimeException(
                    "Estimate is not linked to a Job Card."
            );
        }


        // -----------------------------------------------------
        // CHECK EXISTING INVOICE
        // -----------------------------------------------------

        if (invoiceRepository
                .findByJobCardId(jobCard.getId())
                .isPresent()) {

            throw new RuntimeException(
                    "Invoice already exists for Job Card: "
                            + jobCard.getJobCardNumber()
            );
        }


        // -----------------------------------------------------
        // GET ESTIMATE ITEMS
        // -----------------------------------------------------

        List<EstimateItem> estimateItems =
                estimateItemRepository
                        .findByEstimateId(
                                estimate.getId()
                        );

        if (estimateItems.isEmpty()) {

            throw new RuntimeException(
                    "Cannot create invoice. The approved estimate has no items."
            );
        }


        LocalDateTime now =
                LocalDateTime.now();


        // =====================================================
        // CREATE INVOICE HEADER
        // =====================================================

        Invoice invoice = Invoice.builder()
                .invoiceNumber(
                        generateInvoiceNumber()
                )
                .jobCardId(
                        jobCard.getId()
                )
                .invoiceDate(
                        LocalDate.now()
                )
                .status("DRAFT")

                /*
                 * IMPORTANT:
                 * Use the exact approved Estimate values.
                 */
                .subtotal(
                        defaultZero(
                                estimate.getSubtotal()
                        )
                )
                .discountAmount(
                        defaultZero(
                                estimate.getDiscountAmount()
                        )
                )
                .taxAmount(
                        defaultZero(
                                estimate.getTaxAmount()
                        )
                )
                .totalAmount(
                        defaultZero(
                                estimate.getTotalAmount()
                        )
                )
                .paidAmount(
                        BigDecimal.ZERO
                )
                .outstandingAmount(
                        defaultZero(
                                estimate.getTotalAmount()
                        )
                )
                .notes(
                        request.getNotes() != null
                                && !request.getNotes()
                                .trim()
                                .isEmpty()
                                ? request.getNotes().trim()
                                : estimate.getCustomerNotes()
                )
                .createdAt(now)
                .updatedAt(now)
                .build();


        Invoice savedInvoice =
                invoiceRepository.save(invoice);


        // =====================================================
        // COPY ESTIMATE ITEMS → INVOICE ITEMS
        // =====================================================

        for (EstimateItem estimateItem : estimateItems) {

            InvoiceItem invoiceItem =
                    InvoiceItem.builder()

                            .invoice(savedInvoice)

                            /*
                             * Keep the original estimate
                             * item type.
                             *
                             * Examples:
                             * SERVICE
                             * PART
                             * LABOUR
                             */
                            .itemType(
                                    estimateItem.getItemType()
                            )

                            /*
                             * Estimate Item ID is the
                             * source reference.
                             */
                            .sourceId(
                                    estimateItem.getId()
                            )

                            .description(
                                    estimateItem.getDescription()
                            )

                            .quantity(
                                    defaultZero(
                                            estimateItem.getQuantity()
                                    )
                            )

                            .unitPrice(
                                    defaultZero(
                                            estimateItem.getUnitPrice()
                                    )
                            )

                            .discountAmount(
                                    defaultZero(
                                            estimateItem
                                                    .getDiscountAmount()
                                    )
                            )

                            .taxPercent(
                                    defaultZero(
                                            estimateItem
                                                    .getTaxPercent()
                                    )
                            )

                            .taxAmount(
                                    defaultZero(
                                            estimateItem
                                                    .getTaxAmount()
                                    )
                            )

                            .totalAmount(
                                    defaultZero(
                                            estimateItem
                                                    .getTotalAmount()
                                    )
                            )

                            .createdAt(now)
                            .updatedAt(now)

                            .build();


            invoiceItemRepository.save(
                    invoiceItem
            );
        }


        // =====================================================
        // AUDIT LOG
        // =====================================================

        auditLogService.log(
                "INVOICE_CREATED",
                "INVOICE",
                savedInvoice.getId(),

                "Invoice created from approved Estimate "
                        + estimate.getEstimateNumber()
                        + " for Job Card "
                        + jobCard.getJobCardNumber(),

                null,

                "Invoice Number: "
                        + savedInvoice.getInvoiceNumber()
                        + ", Estimate: "
                        + estimate.getEstimateNumber()
                        + ", Total: "
                        + savedInvoice.getTotalAmount()
                        + ", Status: DRAFT"
        );


        return mapToResponse(
                savedInvoice
        );
    }


    // =========================================================
    // GET ALL
    // =========================================================

    @Transactional(readOnly = true)
    public List<InvoiceResponse> getAllInvoices() {

        return invoiceRepository
                .findAllByOrderByInvoiceDateDesc()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }


    // =========================================================
    // GET BY ID
    // =========================================================

    @Transactional(readOnly = true)
    public InvoiceResponse getInvoice(
            Long id
    ) {

        return mapToResponse(
                getInvoiceEntity(id)
        );
    }


    // =========================================================
    // GET BY JOB CARD
    // =========================================================

    @Transactional(readOnly = true)
    public InvoiceResponse getByJobCard(
            Long jobCardId
    ) {

        Invoice invoice =
                invoiceRepository
                        .findByJobCardId(jobCardId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Invoice not found for Job Card: "
                                                + jobCardId
                                )
                        );

        return mapToResponse(invoice);
    }


    // =========================================================
    // ISSUE INVOICE
    // =========================================================

    @Transactional
    public InvoiceResponse issueInvoice(
            Long id
    ) {

        Invoice invoice =
                getInvoiceEntity(id);

        if (!"DRAFT".equals(invoice.getStatus())) {

            throw new RuntimeException(
                    "Only DRAFT invoices can be issued"
            );
        }


        if (invoice.getTotalAmount()
                .compareTo(BigDecimal.ZERO) <= 0) {

            throw new RuntimeException(
                    "Invoice total must be greater than zero"
            );
        }


        String oldStatus =
                invoice.getStatus();


        invoice.setStatus("ISSUED");
        invoice.setUpdatedAt(
                LocalDateTime.now()
        );


        Invoice updatedInvoice =
                invoiceRepository.save(invoice);


        auditLogService.log(
                "INVOICE_UPDATED",
                "INVOICE",
                updatedInvoice.getId(),

                "Invoice issued: "
                        + updatedInvoice.getInvoiceNumber(),

                "Status: " + oldStatus,

                "Status: ISSUED"
        );


        return mapToResponse(
                updatedInvoice
        );
    }


    // =========================================================
    // CANCEL
    // =========================================================

    @Transactional
    public InvoiceResponse cancelInvoice(
            Long id
    ) {

        Invoice invoice =
                getInvoiceEntity(id);


        if ("PAID".equals(invoice.getStatus())) {

            throw new RuntimeException(
                    "Paid invoice cannot be cancelled"
            );
        }


        if (invoice.getPaidAmount()
                .compareTo(BigDecimal.ZERO) > 0) {

            throw new RuntimeException(
                    "Invoice with payment cannot be cancelled"
            );
        }


        String oldStatus =
                invoice.getStatus();


        invoice.setStatus("CANCELLED");
        invoice.setUpdatedAt(
                LocalDateTime.now()
        );


        Invoice updatedInvoice =
                invoiceRepository.save(invoice);


        auditLogService.log(
                "INVOICE_UPDATED",
                "INVOICE",
                updatedInvoice.getId(),

                "Invoice cancelled: "
                        + updatedInvoice.getInvoiceNumber(),

                "Status: " + oldStatus,

                "Status: CANCELLED"
        );


        return mapToResponse(
                updatedInvoice
        );
    }


    // =========================================================
    // GET INVOICE ENTITY
    // =========================================================

    private Invoice getInvoiceEntity(
            Long id
    ) {

        return invoiceRepository
                .findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Invoice not found: "
                                        + id
                        )
                );
    }


    // =========================================================
    // GENERATE INVOICE NUMBER
    // =========================================================

    private String generateInvoiceNumber() {

        long nextNumber =
                invoiceRepository.count() + 1;

        String invoiceNumber;

        do {

            invoiceNumber =
                    String.format(
                            "INV-%06d",
                            nextNumber
                    );

            nextNumber++;

        } while (
                invoiceRepository
                        .existsByInvoiceNumber(
                                invoiceNumber
                        )
        );

        return invoiceNumber;
    }


    // =========================================================
    // NULL → ZERO
    // =========================================================

    private BigDecimal defaultZero(
            BigDecimal value
    ) {

        return value == null
                ? BigDecimal.ZERO
                : value;
    }


    // =========================================================
    // MAP INVOICE → RESPONSE
    // =========================================================

    private InvoiceResponse mapToResponse(
            Invoice invoice
    ) {

        List<InvoiceItemResponse> items =
                invoiceItemRepository
                        .findByInvoiceId(
                                invoice.getId()
                        )
                        .stream()
                        .map(this::mapItem)
                        .toList();


        return InvoiceResponse.builder()

                .id(
                        invoice.getId()
                )

                .invoiceNumber(
                        invoice.getInvoiceNumber()
                )

                .jobCardId(
                        invoice.getJobCardId()
                )

                .invoiceDate(
                        invoice.getInvoiceDate()
                )

                .status(
                        invoice.getStatus()
                )

                .subtotal(
                        invoice.getSubtotal()
                )

                .discountAmount(
                        invoice.getDiscountAmount()
                )

                .taxAmount(
                        invoice.getTaxAmount()
                )

                .totalAmount(
                        invoice.getTotalAmount()
                )

                .paidAmount(
                        invoice.getPaidAmount()
                )

                .outstandingAmount(
                        invoice.getOutstandingAmount()
                )

                .notes(
                        invoice.getNotes()
                )

                .items(items)

                .createdAt(
                        invoice.getCreatedAt()
                )

                .updatedAt(
                        invoice.getUpdatedAt()
                )

                .build();
    }


    // =========================================================
    // MAP ITEM → RESPONSE
    // =========================================================

    private InvoiceItemResponse mapItem(
            InvoiceItem item
    ) {

        return InvoiceItemResponse.builder()

                .id(
                        item.getId()
                )

                .itemType(
                        item.getItemType()
                )

                .sourceId(
                        item.getSourceId()
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

                .build();
    }
}