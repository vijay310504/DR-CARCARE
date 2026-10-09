package com.drcarcare.service;

import com.drcarcare.dto.InventoryItemRequest;
import com.drcarcare.dto.InventoryItemResponse;
import com.drcarcare.dto.InventoryTransactionResponse;
import com.drcarcare.dto.JobCardPartRequest;
import com.drcarcare.dto.JobCardPartResponse;
import com.drcarcare.dto.StockAdjustmentRequest;
import com.drcarcare.entity.InventoryItem;
import com.drcarcare.entity.InventoryTransaction;
import com.drcarcare.entity.JobCard;
import com.drcarcare.entity.JobCardPart;
import com.drcarcare.repository.InventoryItemRepository;
import com.drcarcare.repository.InventoryTransactionRepository;
import com.drcarcare.repository.JobCardPartRepository;
import com.drcarcare.repository.JobCardRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class InventoryService {

    private final InventoryItemRepository inventoryItemRepository;
    private final InventoryTransactionRepository inventoryTransactionRepository;
    private final JobCardPartRepository jobCardPartRepository;
    private final JobCardRepository jobCardRepository;
    private final AuditLogService auditLogService;


    // ============================================================
    // CREATE INVENTORY ITEM
    // ============================================================

    @Transactional
    public InventoryItemResponse createItem(InventoryItemRequest request) {

        if (inventoryItemRepository.existsByPartCode(request.getPartCode())) {
            throw new RuntimeException(
                    "Part code already exists: " + request.getPartCode()
            );
        }

        validateStockRange(
                request.getMinimumStock(),
                request.getMaximumStock()
        );

        LocalDateTime now = LocalDateTime.now();

        InventoryItem item = InventoryItem.builder()
                .partCode(request.getPartCode())
                .partName(request.getPartName())
                .category(request.getCategory())
                .brand(request.getBrand())
                .unit(request.getUnit())
                .description(request.getDescription())
                .purchasePrice(defaultZero(request.getPurchasePrice()))
                .sellingPrice(defaultZero(request.getSellingPrice()))
                .currentStock(BigDecimal.ZERO)
                .minimumStock(defaultZero(request.getMinimumStock()))
                .maximumStock(request.getMaximumStock())
                .active(request.getActive() == null || request.getActive())
                .createdAt(now)
                .updatedAt(now)
                .build();

        InventoryItem savedItem =
                inventoryItemRepository.save(item);

        auditLogService.log(
                "INVENTORY_CREATED",
                "INVENTORY_ITEM",
                savedItem.getId(),
                "Inventory item created: " + savedItem.getPartName()
                        + " (" + savedItem.getPartCode() + ")",
                null,
                "Part Code: " + savedItem.getPartCode()
                        + ", Part Name: " + savedItem.getPartName()
                        + ", Opening Stock: " + savedItem.getCurrentStock()
        );

        return mapItem(savedItem);
    }


    // ============================================================
    // GET ALL INVENTORY ITEMS
    // ============================================================

    public List<InventoryItemResponse> getAllItems() {

        return inventoryItemRepository.findAll()
                .stream()
                .map(this::mapItem)
                .toList();
    }


    // ============================================================
    // GET INVENTORY ITEM BY ID
    // ============================================================

    public InventoryItemResponse getItem(Long id) {

        return mapItem(getItemEntity(id));
    }


    // ============================================================
    // GET ACTIVE ITEMS
    // ============================================================

    public List<InventoryItemResponse> getActiveItems() {

        return inventoryItemRepository.findByActive(true)
                .stream()
                .map(this::mapItem)
                .toList();
    }


    // ============================================================
    // GET LOW STOCK ITEMS
    // ============================================================

    public List<InventoryItemResponse> getLowStockItems() {

        return inventoryItemRepository.findLowStockItems()
                .stream()
                .map(this::mapItem)
                .toList();
    }


    // ============================================================
    // UPDATE INVENTORY ITEM
    // ============================================================

    @Transactional
    public InventoryItemResponse updateItem(
            Long id,
            InventoryItemRequest request
    ) {

        InventoryItem item = getItemEntity(id);

        String oldValues =
                "Part Code: " + item.getPartCode()
                        + ", Part Name: " + item.getPartName()
                        + ", Category: " + item.getCategory()
                        + ", Brand: " + item.getBrand()
                        + ", Purchase Price: " + item.getPurchasePrice()
                        + ", Selling Price: " + item.getSellingPrice()
                        + ", Minimum Stock: " + item.getMinimumStock()
                        + ", Maximum Stock: " + item.getMaximumStock()
                        + ", Active: " + item.getActive();

        if (!item.getPartCode().equals(request.getPartCode())
                && inventoryItemRepository.existsByPartCode(
                request.getPartCode()
        )) {

            throw new RuntimeException(
                    "Part code already exists: "
                            + request.getPartCode()
            );
        }

        validateStockRange(
                request.getMinimumStock(),
                request.getMaximumStock()
        );

        validateMaximumStockLimit(
                item.getCurrentStock(),
                request.getMaximumStock()
        );

        item.setPartCode(request.getPartCode());
        item.setPartName(request.getPartName());
        item.setCategory(request.getCategory());
        item.setBrand(request.getBrand());
        item.setUnit(request.getUnit());
        item.setDescription(request.getDescription());

        item.setPurchasePrice(
                defaultZero(request.getPurchasePrice())
        );

        item.setSellingPrice(
                defaultZero(request.getSellingPrice())
        );

        item.setMinimumStock(
                defaultZero(request.getMinimumStock())
        );

        item.setMaximumStock(
                request.getMaximumStock()
        );

        if (request.getActive() != null) {
            item.setActive(request.getActive());
        }

        item.setUpdatedAt(LocalDateTime.now());

        InventoryItem updatedItem =
                inventoryItemRepository.save(item);

        String newValues =
                "Part Code: " + updatedItem.getPartCode()
                        + ", Part Name: " + updatedItem.getPartName()
                        + ", Category: " + updatedItem.getCategory()
                        + ", Brand: " + updatedItem.getBrand()
                        + ", Purchase Price: " + updatedItem.getPurchasePrice()
                        + ", Selling Price: " + updatedItem.getSellingPrice()
                        + ", Minimum Stock: " + updatedItem.getMinimumStock()
                        + ", Maximum Stock: " + updatedItem.getMaximumStock()
                        + ", Active: " + updatedItem.getActive();

        auditLogService.log(
                "INVENTORY_UPDATED",
                "INVENTORY_ITEM",
                updatedItem.getId(),
                "Inventory item updated: " + updatedItem.getPartName(),
                oldValues,
                newValues
        );

        return mapItem(updatedItem);
    }


    // ============================================================
    // ADJUST STOCK
    // ============================================================

    @Transactional
    public InventoryTransactionResponse adjustStock(
            Long inventoryItemId,
            StockAdjustmentRequest request
    ) {

        InventoryItem item = inventoryItemRepository
                .findByIdForUpdate(inventoryItemId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Inventory item not found: "
                                        + inventoryItemId
                        )
                );

        if (!Boolean.TRUE.equals(item.getActive())) {
            throw new RuntimeException(
                    "Cannot adjust stock for inactive item: "
                            + item.getPartName()
            );
        }

        String type = request.getTransactionType()
                .trim()
                .toUpperCase();

        validateAdjustmentType(type);

        BigDecimal quantity = request.getQuantity();

        BigDecimal stockBefore =
                defaultZero(item.getCurrentStock());

        BigDecimal stockAfter;

        if (isStockIncrease(type)) {

            stockAfter =
                    stockBefore.add(quantity);

        } else {

            stockAfter =
                    stockBefore.subtract(quantity);

            if (stockAfter.compareTo(BigDecimal.ZERO) < 0) {
                throw new RuntimeException(
                        "Insufficient stock for: "
                                + item.getPartName()
                );
            }
        }

        validateMaximumStockLimit(
                stockAfter,
                item.getMaximumStock()
        );

        item.setCurrentStock(stockAfter);
        item.setUpdatedAt(LocalDateTime.now());

        inventoryItemRepository.save(item);

        InventoryTransaction transaction =
                createTransaction(
                        item,
                        type,
                        quantity,
                        stockBefore,
                        stockAfter,
                        null,
                        null,
                        request.getNotes()
                );

        InventoryTransaction savedTransaction =
                inventoryTransactionRepository.save(transaction);

        auditLogService.log(
                "INVENTORY_ADJUSTED",
                "INVENTORY_ITEM",
                item.getId(),
                "Inventory stock adjusted for: " + item.getPartName(),
                "Transaction Type: " + type
                        + ", Stock Before: " + stockBefore,
                "Transaction Type: " + type
                        + ", Quantity: " + quantity
                        + ", Stock After: " + stockAfter
        );

        return mapTransaction(savedTransaction);
    }


    // ============================================================
    // GET INVENTORY TRANSACTIONS
    // ============================================================

    public List<InventoryTransactionResponse> getTransactions(
            Long inventoryItemId
    ) {

        getItemEntity(inventoryItemId);

        return inventoryTransactionRepository
                .findByInventoryItemIdOrderByTransactionDateDesc(
                        inventoryItemId
                )
                .stream()
                .map(this::mapTransaction)
                .toList();
    }


    // ============================================================
    // ADD PART TO JOB CARD
    // ============================================================

    @Transactional
    public JobCardPartResponse addPartToJobCard(
            JobCardPartRequest request
    ) {

        JobCard jobCard =
                jobCardRepository.findById(
                                request.getJobCardId()
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Job card not found: "
                                                + request.getJobCardId()
                                )
                        );

        InventoryItem item =
                inventoryItemRepository
                        .findByIdForUpdate(
                                request.getInventoryItemId()
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Inventory item not found: "
                                                + request.getInventoryItemId()
                                )
                        );

        if (!Boolean.TRUE.equals(item.getActive())) {
            throw new RuntimeException(
                    "Cannot use inactive inventory item: "
                            + item.getPartName()
            );
        }

        BigDecimal quantity =
                request.getQuantity();

        BigDecimal stockBefore =
                defaultZero(item.getCurrentStock());

        if (stockBefore.compareTo(quantity) < 0) {

            throw new RuntimeException(
                    "Insufficient stock for: "
                            + item.getPartName()
            );
        }

        BigDecimal unitPrice =
                request.getUnitPrice() != null
                        ? request.getUnitPrice()
                        : item.getSellingPrice();

        unitPrice = defaultZero(unitPrice);

        BigDecimal totalAmount =
                quantity.multiply(unitPrice);

        BigDecimal stockAfter =
                stockBefore.subtract(quantity);

        item.setCurrentStock(stockAfter);
        item.setUpdatedAt(LocalDateTime.now());

        inventoryItemRepository.save(item);

        LocalDateTime now =
                LocalDateTime.now();

        JobCardPart jobCardPart =
                JobCardPart.builder()
                        .jobCard(jobCard)
                        .inventoryItem(item)
                        .quantity(quantity)
                        .unitPrice(unitPrice)
                        .totalAmount(totalAmount)
                        .status("USED")
                        .notes(request.getNotes())
                        .createdAt(now)
                        .updatedAt(now)
                        .build();

        JobCardPart savedPart =
                jobCardPartRepository.save(jobCardPart);

        InventoryTransaction transaction =
                createTransaction(
                        item,
                        "SERVICE_USAGE",
                        quantity,
                        stockBefore,
                        stockAfter,
                        "JOB_CARD",
                        jobCard.getId(),
                        "Part used for Job Card "
                                + jobCard.getJobCardNumber()
                );

        inventoryTransactionRepository.save(transaction);

        auditLogService.log(
                "PART_ADDED_TO_JOB_CARD",
                "JOB_CARD_PART",
                savedPart.getId(),
                "Part added to Job Card "
                        + jobCard.getJobCardNumber()
                        + ": " + item.getPartName(),
                "Stock Before: " + stockBefore,
                "Quantity Used: " + quantity
                        + ", Stock After: " + stockAfter
        );

        return mapJobCardPart(savedPart);
    }


    // ============================================================
    // GET PARTS BY JOB CARD
    // ============================================================

    public List<JobCardPartResponse> getPartsByJobCard(
            Long jobCardId
    ) {

        if (!jobCardRepository.existsById(jobCardId)) {

            throw new RuntimeException(
                    "Job card not found: "
                            + jobCardId
            );
        }

        return jobCardPartRepository
                .findByJobCardId(jobCardId)
                .stream()
                .map(this::mapJobCardPart)
                .toList();
    }


    // ============================================================
    // GET PART USAGE BY INVENTORY ITEM
    // ============================================================

    public List<JobCardPartResponse> getPartsByInventoryItem(
            Long inventoryItemId
    ) {

        getItemEntity(inventoryItemId);

        return jobCardPartRepository
                .findByInventoryItemId(
                        inventoryItemId
                )
                .stream()
                .map(this::mapJobCardPart)
                .toList();
    }


    // ============================================================
    // GET INVENTORY ENTITY
    // ============================================================

    private InventoryItem getItemEntity(Long id) {

        return inventoryItemRepository
                .findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Inventory item not found: "
                                        + id
                        )
                );
    }


    private BigDecimal defaultZero(
            BigDecimal value
    ) {

        return value == null
                ? BigDecimal.ZERO
                : value;
    }


    private void validateStockRange(
            BigDecimal minimumStock,
            BigDecimal maximumStock
    ) {

        if (maximumStock != null
                && minimumStock != null
                && maximumStock.compareTo(
                minimumStock
        ) < 0) {

            throw new RuntimeException(
                    "Maximum stock cannot be less than minimum stock"
            );
        }
    }


    private void validateMaximumStockLimit(
            BigDecimal stock,
            BigDecimal maximumStock
    ) {

        if (stock == null) {
            return;
        }

        if (maximumStock != null
                && stock.compareTo(
                maximumStock
        ) > 0) {

            throw new RuntimeException(
                    "Stock cannot exceed maximum stock"
            );
        }
    }


    private void validateAdjustmentType(
            String type
    ) {

        if (!type.equals("PURCHASE")
                && !type.equals("ADJUSTMENT_IN")
                && !type.equals("ADJUSTMENT_OUT")
                && !type.equals("RETURN")) {

            throw new RuntimeException(
                    "Invalid stock transaction type: "
                            + type
            );
        }
    }


    private boolean isStockIncrease(
            String type
    ) {

        return type.equals("PURCHASE")
                || type.equals("ADJUSTMENT_IN")
                || type.equals("RETURN");
    }


    private InventoryTransaction createTransaction(
            InventoryItem item,
            String type,
            BigDecimal quantity,
            BigDecimal stockBefore,
            BigDecimal stockAfter,
            String referenceType,
            Long referenceId,
            String notes
    ) {

        LocalDateTime now =
                LocalDateTime.now();

        return InventoryTransaction.builder()
                .inventoryItem(item)
                .transactionType(type)
                .quantity(quantity)
                .stockBefore(stockBefore)
                .stockAfter(stockAfter)
                .referenceType(referenceType)
                .referenceId(referenceId)
                .notes(notes)
                .transactionDate(now)
                .createdAt(now)
                .build();
    }


    private InventoryItemResponse mapItem(
            InventoryItem item
    ) {

        BigDecimal currentStock =
                defaultZero(item.getCurrentStock());

        BigDecimal minimumStock =
                defaultZero(item.getMinimumStock());

        BigDecimal purchasePrice =
                defaultZero(item.getPurchasePrice());

        BigDecimal sellingPrice =
                defaultZero(item.getSellingPrice());

        boolean lowStock =
                currentStock.compareTo(minimumStock) <= 0;

        return InventoryItemResponse.builder()
                .id(item.getId())
                .partCode(item.getPartCode())
                .partName(item.getPartName())
                .category(item.getCategory())
                .brand(item.getBrand())
                .unit(item.getUnit())
                .description(item.getDescription())
                .purchasePrice(purchasePrice)
                .sellingPrice(sellingPrice)
                .currentStock(currentStock)
                .minimumStock(minimumStock)
                .maximumStock(item.getMaximumStock())
                .active(item.getActive())
                .lowStock(lowStock)
                .createdAt(item.getCreatedAt())
                .updatedAt(item.getUpdatedAt())
                .build();
    }


    private InventoryTransactionResponse mapTransaction(
            InventoryTransaction transaction
    ) {

        InventoryItem item =
                transaction.getInventoryItem();

        return InventoryTransactionResponse.builder()
                .id(transaction.getId())
                .inventoryItemId(item.getId())
                .partCode(item.getPartCode())
                .partName(item.getPartName())
                .transactionType(
                        transaction.getTransactionType()
                )
                .quantity(transaction.getQuantity())
                .stockBefore(
                        transaction.getStockBefore()
                )
                .stockAfter(
                        transaction.getStockAfter()
                )
                .referenceType(
                        transaction.getReferenceType()
                )
                .referenceId(
                        transaction.getReferenceId()
                )
                .notes(transaction.getNotes())
                .transactionDate(
                        transaction.getTransactionDate()
                )
                .createdAt(
                        transaction.getCreatedAt()
                )
                .build();
    }


    private JobCardPartResponse mapJobCardPart(
            JobCardPart part
    ) {

        InventoryItem item =
                part.getInventoryItem();

        return JobCardPartResponse.builder()
                .id(part.getId())
                .jobCardId(
                        part.getJobCard().getId()
                )
                .jobCardNumber(
                        part.getJobCard().getJobCardNumber()
                )
                .inventoryItemId(
                        item.getId()
                )
                .partCode(
                        item.getPartCode()
                )
                .partName(
                        item.getPartName()
                )
                .quantity(
                        part.getQuantity()
                )
                .unitPrice(
                        part.getUnitPrice()
                )
                .totalAmount(
                        part.getTotalAmount()
                )
                .status(
                        part.getStatus()
                )
                .notes(
                        part.getNotes()
                )
                .createdAt(
                        part.getCreatedAt()
                )
                .updatedAt(
                        part.getUpdatedAt()
                )
                .build();
    }
}