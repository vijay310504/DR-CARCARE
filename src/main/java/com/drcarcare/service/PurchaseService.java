package com.drcarcare.service;

import com.drcarcare.repository.PurchaseOrderRepository;
import com.drcarcare.dto.*;
import com.drcarcare.entity.*;
import com.drcarcare.repository.*;
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
public class PurchaseService {

    private final PurchaseOrderRepository purchaseOrderRepository;
    private final PurchaseItemRepository purchaseItemRepository;
    private final VendorRepository vendorRepository;
    private final InventoryItemRepository inventoryItemRepository;
    private final InventoryTransactionRepository inventoryTransactionRepository;
    private final AuditLogService auditLogService;


    // =========================================================
    // CREATE PURCHASE ORDER
    // =========================================================

    @Transactional
    public PurchaseOrderResponse createPurchaseOrder(
            PurchaseOrderRequest request
    ) {

        Vendor vendor = vendorRepository.findById(
                request.getVendorId()
        ).orElseThrow(() ->
                new RuntimeException(
                        "Vendor not found with id: "
                                + request.getVendorId()
                )
        );

        if (!"ACTIVE".equals(vendor.getStatus())) {
            throw new RuntimeException(
                    "Cannot create purchase for inactive vendor"
            );
        }

        LocalDate purchaseDate =
                request.getPurchaseDate() != null
                        ? request.getPurchaseDate()
                        : LocalDate.now();

        LocalDateTime now = LocalDateTime.now();

        PurchaseOrder purchaseOrder =
                PurchaseOrder.builder()
                        .purchaseNumber(generatePurchaseNumber())
                        .vendor(vendor)
                        .purchaseDate(purchaseDate)
                        .expectedDate(request.getExpectedDate())
                        .status("DRAFT")
                        .subtotal(BigDecimal.ZERO)
                        .discountAmount(BigDecimal.ZERO)
                        .taxAmount(BigDecimal.ZERO)
                        .totalAmount(BigDecimal.ZERO)
                        .paidAmount(BigDecimal.ZERO)
                        .outstandingAmount(BigDecimal.ZERO)
                        .invoiceNumber(request.getInvoiceNumber())
                        .invoiceDate(request.getInvoiceDate())
                        .notes(request.getNotes())
                        .createdAt(now)
                        .updatedAt(now)
                        .build();

        purchaseOrder =
                purchaseOrderRepository.save(purchaseOrder);

        BigDecimal subtotal = BigDecimal.ZERO;
        BigDecimal discountTotal = BigDecimal.ZERO;
        BigDecimal taxTotal = BigDecimal.ZERO;
        BigDecimal total = BigDecimal.ZERO;

        for (PurchaseItemRequest itemRequest :
                request.getItems()) {

            InventoryItem inventoryItem =
                    inventoryItemRepository.findById(
                            itemRequest.getInventoryItemId()
                    ).orElseThrow(() ->
                            new RuntimeException(
                                    "Inventory item not found: "
                                            + itemRequest
                                            .getInventoryItemId()
                            )
                    );

            if (!Boolean.TRUE.equals(
                    inventoryItem.getActive()
            )) {
                throw new RuntimeException(
                        "Cannot purchase inactive inventory item: "
                                + inventoryItem.getPartName()
                );
            }

            BigDecimal quantity =
                    itemRequest.getQuantity();

            BigDecimal unitPrice =
                    itemRequest.getUnitPrice();

            BigDecimal discount =
                    defaultZero(
                            itemRequest.getDiscountAmount()
                    );

            BigDecimal taxPercent =
                    defaultZero(
                            itemRequest.getTaxPercent()
                    );

            BigDecimal gross =
                    unitPrice.multiply(quantity);

            BigDecimal itemSubtotal =
                    gross.subtract(discount);

            if (itemSubtotal.compareTo(BigDecimal.ZERO) < 0) {
                throw new RuntimeException(
                        "Discount cannot exceed item amount"
                );
            }

            BigDecimal taxAmount =
                    itemSubtotal
                            .multiply(taxPercent)
                            .divide(
                                    BigDecimal.valueOf(100),
                                    2,
                                    RoundingMode.HALF_UP
                            );

            BigDecimal itemTotal =
                    itemSubtotal.add(taxAmount);

            PurchaseItem purchaseItem =
                    PurchaseItem.builder()
                            .purchaseOrder(purchaseOrder)
                            .inventoryItem(inventoryItem)
                            .quantity(quantity)
                            .receivedQuantity(BigDecimal.ZERO)
                            .unitPrice(unitPrice)
                            .discountAmount(discount)
                            .taxPercent(taxPercent)
                            .taxAmount(taxAmount)
                            .totalAmount(itemTotal)
                            .createdAt(now)
                            .updatedAt(now)
                            .build();

            purchaseItemRepository.save(purchaseItem);

            subtotal = subtotal.add(gross);
            discountTotal = discountTotal.add(discount);
            taxTotal = taxTotal.add(taxAmount);
            total = total.add(itemTotal);
        }

        purchaseOrder.setSubtotal(subtotal);
        purchaseOrder.setDiscountAmount(discountTotal);
        purchaseOrder.setTaxAmount(taxTotal);
        purchaseOrder.setTotalAmount(total);
        purchaseOrder.setPaidAmount(BigDecimal.ZERO);
        purchaseOrder.setOutstandingAmount(total);
        purchaseOrder.setUpdatedAt(LocalDateTime.now());

        purchaseOrder =
                purchaseOrderRepository.save(purchaseOrder);

        auditLogService.log(
                "PURCHASE_CREATED",
                "PURCHASE_ORDER",
                purchaseOrder.getId(),
                "Purchase order created: "
                        + purchaseOrder.getPurchaseNumber(),
                null,
                "Vendor: " + vendor.getVendorName()
                        + ", Total: " + purchaseOrder.getTotalAmount()
                        + ", Status: DRAFT"
        );

        return mapToResponse(purchaseOrder);
    }


    // =========================================================
    // GET ALL
    // =========================================================

    public List<PurchaseOrderResponse> getAllPurchases() {

        return purchaseOrderRepository
                .findAllByOrderByPurchaseDateDesc()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }


    // =========================================================
    // GET BY ID
    // =========================================================

    public PurchaseOrderResponse getPurchase(
            Long id
    ) {

        return mapToResponse(
                getPurchaseEntity(id)
        );
    }


    // =========================================================
    // GET BY VENDOR
    // =========================================================

    public List<PurchaseOrderResponse> getPurchasesByVendor(
            Long vendorId
    ) {

        if (!vendorRepository.existsById(vendorId)) {
            throw new RuntimeException(
                    "Vendor not found with id: " + vendorId
            );
        }

        return purchaseOrderRepository
                .findByVendorIdOrderByPurchaseDateDesc(
                        vendorId
                )
                .stream()
                .map(this::mapToResponse)
                .toList();
    }


    // =========================================================
    // GET BY STATUS
    // =========================================================

    public List<PurchaseOrderResponse> getPurchasesByStatus(
            String status
    ) {

        validateStatus(status);

        return purchaseOrderRepository
                .findByStatusOrderByPurchaseDateDesc(
                        status.toUpperCase()
                )
                .stream()
                .map(this::mapToResponse)
                .toList();
    }


    // =========================================================
    // MARK ORDERED
    // =========================================================

    @Transactional
    public PurchaseOrderResponse markOrdered(
            Long id
    ) {

        PurchaseOrder purchaseOrder =
                getPurchaseEntity(id);

        if (!"DRAFT".equals(purchaseOrder.getStatus())) {
            throw new RuntimeException(
                    "Only DRAFT purchase orders can be marked ORDERED"
            );
        }

        String oldStatus = purchaseOrder.getStatus();

        purchaseOrder.setStatus("ORDERED");
        purchaseOrder.setUpdatedAt(LocalDateTime.now());

        PurchaseOrder updated =
                purchaseOrderRepository.save(purchaseOrder);

        auditLogService.log(
                "PURCHASE_UPDATED",
                "PURCHASE_ORDER",
                updated.getId(),
                "Purchase order marked as ORDERED: "
                        + updated.getPurchaseNumber(),
                "Status: " + oldStatus,
                "Status: ORDERED"
        );

        return mapToResponse(updated);
    }


    // =========================================================
    // RECEIVE PURCHASE
    // =========================================================

    @Transactional
    public PurchaseOrderResponse receivePurchase(
            Long id
    ) {

        PurchaseOrder purchaseOrder =
                getPurchaseEntity(id);

        if ("CANCELLED".equals(
                purchaseOrder.getStatus()
        )) {
            throw new RuntimeException(
                    "Cancelled purchase cannot be received"
            );
        }

        if ("RECEIVED".equals(
                purchaseOrder.getStatus()
        )) {
            throw new RuntimeException(
                    "Purchase is already fully received"
            );
        }

        List<PurchaseItem> items =
                purchaseItemRepository
                        .findByPurchaseOrderId(id);

        if (items.isEmpty()) {
            throw new RuntimeException(
                    "Purchase contains no items"
            );
        }

        LocalDateTime now = LocalDateTime.now();

        boolean allReceived = true;

        for (PurchaseItem purchaseItem : items) {

            BigDecimal pending =
                    purchaseItem.getQuantity()
                            .subtract(
                                    purchaseItem
                                            .getReceivedQuantity()
                            );

            if (pending.compareTo(BigDecimal.ZERO) <= 0) {
                continue;
            }

            InventoryItem inventoryItem =
                    inventoryItemRepository
                            .findByIdForUpdate(
                                    purchaseItem
                                            .getInventoryItem()
                                            .getId()
                            )
                            .orElseThrow(() ->
                                    new RuntimeException(
                                            "Inventory item not found: "
                                                    + purchaseItem
                                                    .getInventoryItem()
                                                    .getId()
                                    )
                            );

            BigDecimal stockBefore =
                    inventoryItem.getCurrentStock();

            BigDecimal stockAfter =
                    stockBefore.add(pending);

            if (inventoryItem.getMaximumStock() != null
                    && stockAfter.compareTo(
                    inventoryItem.getMaximumStock()
            ) > 0) {

                throw new RuntimeException(
                        "Receiving purchase exceeds maximum stock for: "
                                + inventoryItem.getPartName()
                                + ". Current stock: "
                                + stockBefore
                                + ", pending quantity: "
                                + pending
                                + ", maximum stock: "
                                + inventoryItem
                                .getMaximumStock()
                );
            }

            inventoryItem.setCurrentStock(stockAfter);
            inventoryItem.setPurchasePrice(
                    purchaseItem.getUnitPrice()
            );
            inventoryItem.setUpdatedAt(now);

            inventoryItemRepository.save(inventoryItem);

            InventoryTransaction transaction =
                    InventoryTransaction.builder()
                            .inventoryItem(inventoryItem)
                            .transactionType("PURCHASE")
                            .quantity(pending)
                            .stockBefore(stockBefore)
                            .stockAfter(stockAfter)
                            .referenceType("PURCHASE")
                            .referenceId(purchaseOrder.getId())
                            .notes(
                                    "Purchase received: "
                                            + purchaseOrder
                                            .getPurchaseNumber()
                            )
                            .transactionDate(now)
                            .build();

            inventoryTransactionRepository.save(
                    transaction
            );

            purchaseItem.setReceivedQuantity(
                    purchaseItem
                            .getReceivedQuantity()
                            .add(pending)
            );

            purchaseItem.setUpdatedAt(now);

            purchaseItemRepository.save(
                    purchaseItem
            );
        }

        for (PurchaseItem purchaseItem : items) {

            if (purchaseItem.getReceivedQuantity()
                    .compareTo(
                            purchaseItem.getQuantity()
                    ) < 0) {

                allReceived = false;
                break;
            }
        }

        String oldStatus = purchaseOrder.getStatus();

        purchaseOrder.setStatus(
                allReceived
                        ? "RECEIVED"
                        : "PARTIALLY_RECEIVED"
        );

        purchaseOrder.setUpdatedAt(now);

        purchaseOrder =
                purchaseOrderRepository.save(
                        purchaseOrder
                );

        auditLogService.log(
                "PURCHASE_RECEIVED",
                "PURCHASE_ORDER",
                purchaseOrder.getId(),
                "Purchase received: "
                        + purchaseOrder.getPurchaseNumber(),
                "Status: " + oldStatus,
                "Status: " + purchaseOrder.getStatus()
                        + ", Inventory updated for received items"
        );

        return mapToResponse(purchaseOrder);
    }


    // =========================================================
    // CANCEL
    // =========================================================

    @Transactional
    public PurchaseOrderResponse cancelPurchase(
            Long id
    ) {

        PurchaseOrder purchaseOrder =
                getPurchaseEntity(id);

        if ("RECEIVED".equals(
                purchaseOrder.getStatus()
        )) {
            throw new RuntimeException(
                    "Fully received purchase cannot be cancelled"
            );
        }

        if ("PARTIALLY_RECEIVED".equals(
                purchaseOrder.getStatus()
        )) {
            throw new RuntimeException(
                    "Partially received purchase cannot be cancelled"
            );
        }

        String oldStatus = purchaseOrder.getStatus();

        purchaseOrder.setStatus("CANCELLED");
        purchaseOrder.setUpdatedAt(LocalDateTime.now());

        PurchaseOrder updated =
                purchaseOrderRepository.save(
                        purchaseOrder
                );

        auditLogService.log(
                "PURCHASE_UPDATED",
                "PURCHASE_ORDER",
                updated.getId(),
                "Purchase order cancelled: "
                        + updated.getPurchaseNumber(),
                "Status: " + oldStatus,
                "Status: CANCELLED"
        );

        return mapToResponse(updated);
    }


    // =========================================================
    // ENTITY
    // =========================================================

    public PurchaseOrder getPurchaseEntity(
            Long id
    ) {

        return purchaseOrderRepository
                .findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Purchase order not found with id: "
                                        + id
                        )
                );
    }


    // =========================================================
    // NUMBER GENERATOR
    // =========================================================

    private String generatePurchaseNumber() {

        long nextNumber =
                purchaseOrderRepository.count() + 1;

        String purchaseNumber;

        do {

            purchaseNumber =
                    String.format(
                            "PO-%06d",
                            nextNumber
                    );

            nextNumber++;

        } while (
                purchaseOrderRepository
                        .existsByPurchaseNumber(
                                purchaseNumber
                        )
        );

        return purchaseNumber;
    }


    // =========================================================
    // STATUS VALIDATION
    // =========================================================

    private void validateStatus(
            String status
    ) {

        if (status == null) {
            throw new RuntimeException(
                    "Purchase status is required"
            );
        }

        String normalized =
                status.toUpperCase();

        if (!normalized.equals("DRAFT")
                && !normalized.equals("ORDERED")
                && !normalized.equals("PARTIALLY_RECEIVED")
                && !normalized.equals("RECEIVED")
                && !normalized.equals("CANCELLED")) {

            throw new RuntimeException(
                    "Invalid purchase status: "
                            + status
            );
        }
    }


    // =========================================================
    // MAPPER
    // =========================================================

    private PurchaseOrderResponse mapToResponse(
            PurchaseOrder purchaseOrder
    ) {

        List<PurchaseItemResponse> items =
                purchaseItemRepository
                        .findByPurchaseOrderId(
                                purchaseOrder.getId()
                        )
                        .stream()
                        .map(this::mapItem)
                        .toList();

        return PurchaseOrderResponse.builder()
                .id(purchaseOrder.getId())
                .purchaseNumber(
                        purchaseOrder.getPurchaseNumber()
                )
                .vendorId(
                        purchaseOrder.getVendor().getId()
                )
                .vendorCode(
                        purchaseOrder.getVendor()
                                .getVendorCode()
                )
                .vendorName(
                        purchaseOrder.getVendor()
                                .getVendorName()
                )
                .purchaseDate(
                        purchaseOrder.getPurchaseDate()
                )
                .expectedDate(
                        purchaseOrder.getExpectedDate()
                )
                .status(
                        purchaseOrder.getStatus()
                )
                .subtotal(
                        purchaseOrder.getSubtotal()
                )
                .discountAmount(
                        purchaseOrder.getDiscountAmount()
                )
                .taxAmount(
                        purchaseOrder.getTaxAmount()
                )
                .totalAmount(
                        purchaseOrder.getTotalAmount()
                )
                .paidAmount(
                        purchaseOrder.getPaidAmount()
                )
                .outstandingAmount(
                        purchaseOrder.getOutstandingAmount()
                )
                .invoiceNumber(
                        purchaseOrder.getInvoiceNumber()
                )
                .invoiceDate(
                        purchaseOrder.getInvoiceDate()
                )
                .notes(
                        purchaseOrder.getNotes()
                )
                .items(items)
                .createdAt(
                        purchaseOrder.getCreatedAt()
                )
                .updatedAt(
                        purchaseOrder.getUpdatedAt()
                )
                .build();
    }


    private PurchaseItemResponse mapItem(
            PurchaseItem item
    ) {

        BigDecimal pending =
                item.getQuantity()
                        .subtract(
                                item.getReceivedQuantity()
                        );

        return PurchaseItemResponse.builder()
                .id(item.getId())
                .inventoryItemId(
                        item.getInventoryItem().getId()
                )
                .partCode(
                        item.getInventoryItem()
                                .getPartCode()
                )
                .partName(
                        item.getInventoryItem()
                                .getPartName()
                )
                .quantity(
                        item.getQuantity()
                )
                .receivedQuantity(
                        item.getReceivedQuantity()
                )
                .pendingQuantity(pending)
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
                .createdAt(
                        item.getCreatedAt()
                )
                .updatedAt(
                        item.getUpdatedAt()
                )
                .build();
    }


    private BigDecimal defaultZero(
            BigDecimal value
    ) {

        return value != null
                ? value
                : BigDecimal.ZERO;
    }
}