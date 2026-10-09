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
public class OutstandingReportResponse {

    private String reportDate;

    private Summary summary;

    private List<OutstandingInvoice> invoices;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Summary {

        private BigDecimal totalOutstanding;

        private Long invoiceCount;

        private BigDecimal totalInvoiced;

        private BigDecimal totalPaid;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OutstandingInvoice {

        private Long invoiceId;

        private String invoiceNumber;

        private Long jobCardId;

        private String invoiceDate;

        private BigDecimal totalAmount;

        private BigDecimal paidAmount;

        private BigDecimal outstandingAmount;

        private String status;
    }
}