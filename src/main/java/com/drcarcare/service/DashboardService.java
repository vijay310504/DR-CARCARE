package com.drcarcare.service;

import com.drcarcare.dto.DashboardResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final JdbcTemplate jdbcTemplate;


    // =========================================================
    // MAIN DASHBOARD
    // =========================================================

    @Transactional(readOnly = true)
    public DashboardResponse getDashboard() {

        return DashboardResponse.builder()
                .dashboardDate(
                        java.time.LocalDate.now().toString()
                )
                .overview(buildOverview())
                .financial(buildFinancialSummary())
                .workshop(buildWorkshopSummary())
                .inventory(buildInventorySummary())
                .customers(buildCustomerSummary())
                .vehicles(buildVehicleSummary())
                .bookings(buildBookingSummary())
                .recentActivities(buildRecentActivities())
                .build();
    }


    // =========================================================
    // OVERVIEW
    // =========================================================

    private DashboardResponse.Overview buildOverview() {

        return DashboardResponse.Overview.builder()

                .totalCustomers(
                        count("customers")
                )

                .totalVehicles(
                        count("vehicles")
                )

                .totalBookings(
                        count("bookings")
                )

                .totalJobCards(
                        count("job_cards")
                )

                .totalInvoices(
                        count("invoices")
                )

                .totalPayments(
                        count("payments")
                )

                .totalExpenses(
                        count("expenses")
                )

                .build();
    }


    // =========================================================
    // FINANCIAL SUMMARY
    // =========================================================

    private DashboardResponse.FinancialSummary buildFinancialSummary() {

        /*
         * Revenue
         *
         * Uses invoice total_amount.
         * Draft invoices are excluded.
         */

        BigDecimal totalRevenue = queryDecimal(
                """
                SELECT COALESCE(SUM(total_amount), 0)
                FROM invoices
                WHERE UPPER(status) <> 'DRAFT'
                """
        );


        /*
         * Total money actually received from customers.
         */

        BigDecimal totalPayments = queryDecimal(
                """
                SELECT COALESCE(SUM(amount), 0)
                FROM payments
                """
        );


        /*
         * Total business expenses.
         */

        BigDecimal totalExpenses = queryDecimal(
                """
                SELECT COALESCE(SUM(amount), 0)
                FROM expenses
                """
        );


        /*
         * Customer outstanding amount.
         */

        BigDecimal outstandingCustomerPayments = queryDecimal(
                """
                SELECT COALESCE(SUM(outstanding_amount), 0)
                FROM invoices
                WHERE outstanding_amount > 0
                """
        );


        /*
         * Payment method breakdown.
         */

        BigDecimal cashCollections = queryDecimal(
                """
                SELECT COALESCE(SUM(amount), 0)
                FROM payments
                WHERE UPPER(payment_method) = 'CASH'
                """
        );


        BigDecimal bankCollections = queryDecimal(
                """
                SELECT COALESCE(SUM(amount), 0)
                FROM payments
                WHERE UPPER(payment_method) = 'BANK_TRANSFER'
                """
        );


        BigDecimal upiCollections = queryDecimal(
                """
                SELECT COALESCE(SUM(amount), 0)
                FROM payments
                WHERE UPPER(payment_method) = 'UPI'
                """
        );


        BigDecimal cardCollections = queryDecimal(
                """
                SELECT COALESCE(SUM(amount), 0)
                FROM payments
                WHERE UPPER(payment_method) = 'CARD'
                """
        );


        /*
         * Dashboard-level net profit.
         *
         * Revenue - Expenses
         */

        BigDecimal netProfit =
                totalRevenue.subtract(totalExpenses);


        return DashboardResponse.FinancialSummary.builder()

                .totalRevenue(totalRevenue)

                .totalPayments(totalPayments)

                .totalExpenses(totalExpenses)

                .netProfit(netProfit)

                .outstandingCustomerPayments(
                        outstandingCustomerPayments
                )

                .cashCollections(cashCollections)

                .bankCollections(bankCollections)

                .upiCollections(upiCollections)

                .cardCollections(cardCollections)

                .build();
    }


    // =========================================================
    // WORKSHOP SUMMARY
    // =========================================================

    private DashboardResponse.WorkshopSummary buildWorkshopSummary() {

        return DashboardResponse.WorkshopSummary.builder()

                .received(
                        countJobCardsByStatus("RECEIVED")
                )

                .inspection(
                        countJobCardsByStatus("INSPECTION")
                )

                .estimate(
                        countJobCardsByStatus("ESTIMATE")
                )

                .waitingApproval(
                        countJobCardsByStatus("WAITING_APPROVAL")
                )

                .approved(
                        countJobCardsByStatus("APPROVED")
                )

                .underService(
                        countJobCardsByStatus("UNDER_SERVICE")
                )

                .qualityCheck(
                        countJobCardsByStatus("QUALITY_CHECK")
                )

                .ready(
                        countJobCardsByStatus("READY")
                )

                .delivered(
                        countJobCardsByStatus("DELIVERED")
                )

                .activeJobs(
                        queryLong(
                                """
                                SELECT COUNT(*)
                                FROM job_cards
                                WHERE UPPER(status) IN (
                                    'RECEIVED',
                                    'INSPECTION',
                                    'ESTIMATE',
                                    'WAITING_APPROVAL',
                                    'APPROVED',
                                    'UNDER_SERVICE',
                                    'QUALITY_CHECK',
                                    'READY'
                                )
                                """
                        )
                )

                .build();
    }


    // =========================================================
    // INVENTORY SUMMARY
    // =========================================================

    private DashboardResponse.InventorySummary buildInventorySummary() {

        Long totalItems = count("inventory_items");


        Long activeItems = queryLong(
                """
                SELECT COUNT(*)
                FROM inventory_items
                WHERE active = TRUE
                """
        );


        Long lowStockItems = queryLong(
                """
                SELECT COUNT(*)
                FROM inventory_items
                WHERE active = TRUE
                AND current_stock <= minimum_stock
                """
        );


        Long outOfStockItems = queryLong(
                """
                SELECT COUNT(*)
                FROM inventory_items
                WHERE active = TRUE
                AND current_stock <= 0
                """
        );


        BigDecimal inventoryValue = queryDecimal(
                """
                SELECT COALESCE(
                    SUM(current_stock * purchase_price),
                    0
                )
                FROM inventory_items
                WHERE active = TRUE
                """
        );


        return DashboardResponse.InventorySummary.builder()

                .totalItems(totalItems)

                .activeItems(activeItems)

                .lowStockItems(lowStockItems)

                .outOfStockItems(outOfStockItems)

                .inventoryValue(inventoryValue)

                .build();
    }


    // =========================================================
    // CUSTOMER SUMMARY
    // =========================================================

    private DashboardResponse.CustomerSummary buildCustomerSummary() {

        Long totalCustomers =
                count("customers");


        Long newCustomersToday = queryLong(
                """
                SELECT COUNT(*)
                FROM customers
                WHERE DATE(created_at) = CURRENT_DATE
                """
        );


        Long newCustomersThisMonth = queryLong(
                """
                SELECT COUNT(*)
                FROM customers
                WHERE YEAR(created_at) = YEAR(CURRENT_DATE)
                AND MONTH(created_at) = MONTH(CURRENT_DATE)
                """
        );


        return DashboardResponse.CustomerSummary.builder()

                .totalCustomers(totalCustomers)

                .newCustomersToday(newCustomersToday)

                .newCustomersThisMonth(
                        newCustomersThisMonth
                )

                .build();
    }


    // =========================================================
    // VEHICLE SUMMARY
    // =========================================================

    private DashboardResponse.VehicleSummary buildVehicleSummary() {
        Long totalVehicles = count("vehicles");

        Long vehiclesServicedToday = queryLong("""
            SELECT COUNT(DISTINCT vehicle_id)
            FROM job_cards
            WHERE DATE(opened_at) = CURRENT_DATE
            """);

        return DashboardResponse.VehicleSummary.builder()
                .totalVehicles(totalVehicles)
                .vehiclesServicedToday(vehiclesServicedToday)
                .build();
    }


    // =========================================================
    // BOOKING SUMMARY
    // =========================================================

    private DashboardResponse.BookingSummary buildBookingSummary() {

        Long totalBookings =
                count("bookings");


        Long todayBookings = queryLong(
                """
                SELECT COUNT(*)
                FROM bookings
                WHERE booking_date = CURRENT_DATE
                """
        );


        Long booked =
                countBookingsByStatus("BOOKED");


        Long confirmed =
                countBookingsByStatus("CONFIRMED");


        Long arrived =
                countBookingsByStatus("ARRIVED");


        Long cancelled =
                countBookingsByStatus("CANCELLED");


        return DashboardResponse.BookingSummary.builder()

                .totalBookings(totalBookings)

                .todayBookings(todayBookings)

                .booked(booked)

                .confirmed(confirmed)

                .arrived(arrived)

                .cancelled(cancelled)

                .build();
    }


    // =========================================================
    // RECENT ACTIVITIES
    // =========================================================

    private List<DashboardResponse.RecentActivity>
    buildRecentActivities() {

        List<DashboardResponse.RecentActivity> activities =
                new ArrayList<>();


        // =====================================================
        // PAYMENTS
        // =====================================================

        List<Map<String, Object>> payments =
                jdbcTemplate.queryForList(
                        """
                        SELECT
                            id,
                            payment_number,
                            amount,
                            payment_date
                        FROM payments
                        ORDER BY payment_date DESC, id DESC
                        LIMIT 5
                        """
                );


        for (Map<String, Object> row : payments) {

            activities.add(
                    DashboardResponse.RecentActivity.builder()

                            .activityType("PAYMENT")

                            .referenceId(
                                    toLong(row.get("id"))
                            )

                            .referenceNumber(
                                    toStringValue(
                                            row.get("payment_number")
                                    )
                            )

                            .description(
                                    "Customer payment received"
                            )

                            .amount(
                                    toBigDecimal(
                                            row.get("amount")
                                    )
                            )

                            .activityDate(
                                    toStringValue(
                                            row.get("payment_date")
                                    )
                            )

                            .build()
            );
        }


        // =====================================================
        // EXPENSES
        // =====================================================

        List<Map<String, Object>> expenses =
                jdbcTemplate.queryForList(
                        """
                        SELECT
                            id,
                            expense_number,
                            description,
                            amount,
                            expense_date
                        FROM expenses
                        ORDER BY expense_date DESC, id DESC
                        LIMIT 5
                        """
                );


        for (Map<String, Object> row : expenses) {

            activities.add(
                    DashboardResponse.RecentActivity.builder()

                            .activityType("EXPENSE")

                            .referenceId(
                                    toLong(row.get("id"))
                            )

                            .referenceNumber(
                                    toStringValue(
                                            row.get("expense_number")
                                    )
                            )

                            .description(
                                    toStringValue(
                                            row.get("description")
                                    )
                            )

                            .amount(
                                    toBigDecimal(
                                            row.get("amount")
                                    )
                            )

                            .activityDate(
                                    toStringValue(
                                            row.get("expense_date")
                                    )
                            )

                            .build()
            );
        }


        // =====================================================
        // INVOICES
        // =====================================================

        List<Map<String, Object>> invoices =
                jdbcTemplate.queryForList(
                        """
                        SELECT
                            id,
                            invoice_number,
                            total_amount,
                            invoice_date
                        FROM invoices
                        WHERE UPPER(status) <> 'DRAFT'
                        ORDER BY invoice_date DESC, id DESC
                        LIMIT 5
                        """
                );


        for (Map<String, Object> row : invoices) {

            activities.add(
                    DashboardResponse.RecentActivity.builder()

                            .activityType("INVOICE")

                            .referenceId(
                                    toLong(row.get("id"))
                            )

                            .referenceNumber(
                                    toStringValue(
                                            row.get("invoice_number")
                                    )
                            )

                            .description(
                                    "Invoice generated"
                            )

                            .amount(
                                    toBigDecimal(
                                            row.get("total_amount")
                                    )
                            )

                            .activityDate(
                                    toStringValue(
                                            row.get("invoice_date")
                                    )
                            )

                            .build()
            );
        }


        // =====================================================
        // SORT AND LIMIT
        // =====================================================

        activities.sort(
                (a, b) -> {

                    String dateA =
                            a.getActivityDate();

                    String dateB =
                            b.getActivityDate();

                    if (dateA == null && dateB == null) {
                        return 0;
                    }

                    if (dateA == null) {
                        return 1;
                    }

                    if (dateB == null) {
                        return -1;
                    }

                    return dateB.compareTo(dateA);
                }
        );


        return activities.stream()
                .limit(15)
                .toList();
    }


    // =========================================================
    // GENERIC COUNT
    // =========================================================

    private Long count(String tableName) {

        return jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM " + tableName,
                Long.class
        );
    }


    // =========================================================
    // JOB CARD STATUS
    // =========================================================

    private Long countJobCardsByStatus(
            String status
    ) {

        return jdbcTemplate.queryForObject(
                """
                SELECT COUNT(*)
                FROM job_cards
                WHERE UPPER(status) = ?
                """,
                Long.class,
                status
        );
    }


    // =========================================================
    // BOOKING STATUS
    // =========================================================

    private Long countBookingsByStatus(
            String status
    ) {

        return jdbcTemplate.queryForObject(
                """
                SELECT COUNT(*)
                FROM bookings
                WHERE UPPER(status) = ?
                """,
                Long.class,
                status
        );
    }


    // =========================================================
    // DECIMAL
    // =========================================================

    private BigDecimal queryDecimal(
            String sql
    ) {

        BigDecimal result =
                jdbcTemplate.queryForObject(
                        sql,
                        BigDecimal.class
                );

        return result != null
                ? result
                : BigDecimal.ZERO;
    }


    // =========================================================
    // LONG
    // =========================================================

    private Long queryLong(
            String sql
    ) {

        Long result =
                jdbcTemplate.queryForObject(
                        sql,
                        Long.class
                );

        return result != null
                ? result
                : 0L;
    }


    // =========================================================
    // CONVERSION HELPERS
    // =========================================================

    private BigDecimal toBigDecimal(
            Object value
    ) {

        if (value == null) {
            return BigDecimal.ZERO;
        }

        if (value instanceof BigDecimal) {
            return (BigDecimal) value;
        }

        if (value instanceof Number) {
            return BigDecimal.valueOf(
                    ((Number) value).doubleValue()
            );
        }

        return new BigDecimal(
                value.toString()
        );
    }


    private Long toLong(
            Object value
    ) {

        if (value == null) {
            return null;
        }

        if (value instanceof Number) {
            return ((Number) value).longValue();
        }

        return Long.parseLong(
                value.toString()
        );
    }


    private String toStringValue(
            Object value
    ) {

        if (value == null) {
            return null;
        }

        return value.toString();
    }
}