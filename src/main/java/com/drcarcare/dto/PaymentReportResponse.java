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
public class PaymentReportResponse {

    private String fromDate;
    private String toDate;

    private Summary summary;

    private List<MethodSummary> paymentMethods;

    private List<DailyPayment> dailyPayments;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Summary {

        private BigDecimal totalCollected;

        private Long paymentCount;

        private BigDecimal averagePayment;

        private BigDecimal cashCollected;

        private BigDecimal bankCollected;

        private BigDecimal upiCollected;

        private BigDecimal cardCollected;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MethodSummary {

        private String paymentMethod;

        private Long paymentCount;

        private BigDecimal amount;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DailyPayment {

        private String date;

        private Long paymentCount;

        private BigDecimal amount;
    }
}