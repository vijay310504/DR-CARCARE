package com.drcarcare.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InventoryReportResponse {

    private String reportDate;

    private Summary summary;

    private List<StockItem> stockItems;

    private List<TransactionSummary> transactions;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Summary {

        private Long totalItems;

        private Long activeItems;

        private Long lowStockItems;

        private Long outOfStockItems;

        private BigDecimal inventoryValue;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StockItem {

        private Long id;

        private String partCode;

        private String partName;

        private String category;

        private BigDecimal currentStock;

        private BigDecimal minimumStock;

        private BigDecimal purchasePrice;

        private BigDecimal sellingPrice;

        private BigDecimal stockValue;

        private Boolean active;

        private Boolean lowStock;

        private Boolean outOfStock;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TransactionSummary {

        private String transactionType;

        private Long transactionCount;

        private BigDecimal quantity;
    }
}