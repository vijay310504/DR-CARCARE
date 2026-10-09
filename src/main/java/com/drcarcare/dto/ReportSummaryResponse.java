package com.drcarcare.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReportSummaryResponse {

    private String fromDate;
    private String toDate;

    private FinancialSummary financial;

    private WorkshopSummary workshop;

    private CustomerSummary customers;

    private VehicleSummary vehicles;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FinancialSummary {

        private BigDecimal revenue;

        private BigDecimal paymentsCollected;

        private BigDecimal expenses;

        private BigDecimal netResult;

        private BigDecimal outstandingCustomerAmount;

        private Long invoiceCount;

        private Long paymentCount;

        private Long expenseCount;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class WorkshopSummary {

        private Long jobCardsOpened;

        private Long activeJobCards;

        private Long deliveredJobCards;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CustomerSummary {

        private Long newCustomers;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class VehicleSummary {

        private Long newVehicles;
    }
}