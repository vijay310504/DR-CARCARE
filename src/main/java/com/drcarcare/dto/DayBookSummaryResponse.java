package com.drcarcare.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DayBookSummaryResponse {

    private LocalDate fromDate;

    private LocalDate toDate;

    private BigDecimal totalDebit;

    private BigDecimal totalCredit;

    private BigDecimal netAmount;

    private long transactionCount;
}