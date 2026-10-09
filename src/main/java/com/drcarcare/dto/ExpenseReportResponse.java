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
public class ExpenseReportResponse {

    private String fromDate;
    private String toDate;

    private Summary summary;

    private List<CategorySummary> categories;

    private List<DailyExpense> dailyExpenses;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Summary {

        private BigDecimal totalExpenses;

        private Long expenseCount;

        private BigDecimal averageExpense;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CategorySummary {

        private String category;

        private Long expenseCount;

        private BigDecimal amount;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DailyExpense {

        private String date;

        private Long expenseCount;

        private BigDecimal amount;
    }
}