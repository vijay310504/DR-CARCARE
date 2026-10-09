package com.drcarcare.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardResponse {

    private String dashboardDate;

    private Overview overview;

    private FinancialSummary financial;

    private WorkshopSummary workshop;

    private InventorySummary inventory;

    private CustomerSummary customers;

    private VehicleSummary vehicles;

    private BookingSummary bookings;

    private List<RecentActivity> recentActivities;


    // =========================================================
    // OVERVIEW
    // =========================================================

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Overview {

        private Long totalCustomers;

        private Long totalVehicles;

        private Long totalBookings;

        private Long totalJobCards;

        private Long totalInvoices;

        private Long totalPayments;

        private Long totalExpenses;
    }


    // =========================================================
    // FINANCIAL SUMMARY
    // =========================================================

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FinancialSummary {

        private BigDecimal totalRevenue;

        private BigDecimal totalPayments;

        private BigDecimal totalExpenses;

        private BigDecimal netProfit;

        private BigDecimal outstandingCustomerPayments;

        private BigDecimal cashCollections;

        private BigDecimal bankCollections;

        private BigDecimal upiCollections;

        private BigDecimal cardCollections;
    }


    // =========================================================
    // WORKSHOP SUMMARY
    // =========================================================

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class WorkshopSummary {

        private Long received;

        private Long inspection;

        private Long estimate;

        private Long waitingApproval;

        private Long approved;

        private Long underService;

        private Long qualityCheck;

        private Long ready;

        private Long delivered;

        private Long activeJobs;
    }


    // =========================================================
    // INVENTORY SUMMARY
    // =========================================================

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class InventorySummary {

        private Long totalItems;

        private Long activeItems;

        private Long lowStockItems;

        private Long outOfStockItems;

        private BigDecimal inventoryValue;
    }


    // =========================================================
    // CUSTOMER SUMMARY
    // =========================================================

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CustomerSummary {

        private Long totalCustomers;

        private Long newCustomersToday;

        private Long newCustomersThisMonth;
    }


    // =========================================================
    // VEHICLE SUMMARY
    // =========================================================

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class VehicleSummary {

        private Long totalVehicles;

        private Long vehiclesServicedToday;
    }


    // =========================================================
    // BOOKING SUMMARY
    // =========================================================

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BookingSummary {

        private Long totalBookings;

        private Long todayBookings;

        private Long booked;

        private Long confirmed;

        private Long arrived;

        private Long cancelled;
    }


    // =========================================================
    // RECENT ACTIVITY
    // =========================================================

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RecentActivity {

        private String activityType;

        private Long referenceId;

        private String referenceNumber;

        private String description;

        private BigDecimal amount;

        private String activityDate;
    }
}