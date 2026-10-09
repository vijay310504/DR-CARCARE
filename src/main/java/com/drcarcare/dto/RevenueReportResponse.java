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
public class RevenueReportResponse {

    private String fromDate;
    private String toDate;

    private Summary summary;

    private List<DailyRevenue> dailyRevenue;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Summary {

        private BigDecimal totalRevenue;

        private Long invoiceCount;

        private BigDecimal averageInvoiceValue;

        private BigDecimal totalDiscount;

        private BigDecimal totalTax;

        private BigDecimal totalPaid;

        private BigDecimal totalOutstanding;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DailyRevenue {

        private String date;

        private Long invoiceCount;

        private BigDecimal revenue;
    }
}