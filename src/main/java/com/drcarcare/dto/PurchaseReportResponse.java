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
public class PurchaseReportResponse {

    private String fromDate;
    private String toDate;

    private Summary summary;

    private List<StatusSummary> statuses;

    private List<DailyPurchase> dailyPurchases;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Summary {

        private BigDecimal totalPurchases;

        private Long purchaseOrderCount;

        private BigDecimal averagePurchase;

        private BigDecimal totalPaid;

        private BigDecimal totalOutstanding;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StatusSummary {

        private String status;

        private Long purchaseOrderCount;

        private BigDecimal amount;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DailyPurchase {

        private String date;

        private Long purchaseOrderCount;

        private BigDecimal amount;
    }
}