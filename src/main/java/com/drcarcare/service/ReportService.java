package com.drcarcare.service;

import com.drcarcare.dto.ExpenseReportResponse;
import com.drcarcare.dto.InventoryReportResponse;
import com.drcarcare.dto.JobCardReportResponse;
import com.drcarcare.dto.OutstandingReportResponse;
import com.drcarcare.dto.PaymentReportResponse;
import com.drcarcare.dto.PurchaseReportResponse;
import com.drcarcare.dto.ReportSummaryResponse;
import com.drcarcare.dto.RevenueReportResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final JdbcTemplate jdbcTemplate;

    // =========================================================
    // V18.1 - SUMMARY
    // =========================================================

    @Transactional(readOnly = true)
    public ReportSummaryResponse getSummary(
            LocalDate from,
            LocalDate to
    ) {

        validateDateRange(from, to);

        return ReportSummaryResponse.builder()
                .fromDate(from.toString())
                .toDate(to.toString())
                .financial(buildFinancialSummary(from, to))
                .workshop(buildWorkshopSummary(from, to))
                .customers(buildCustomerSummary(from, to))
                .vehicles(buildVehicleSummary(from, to))
                .build();
    }

    private ReportSummaryResponse.FinancialSummary buildFinancialSummary(
            LocalDate from,
            LocalDate to
    ) {

        BigDecimal revenue = queryDecimal(
                """
                SELECT COALESCE(SUM(total_amount), 0)
                FROM invoices
                WHERE invoice_date BETWEEN ? AND ?
                AND UPPER(status) <> 'DRAFT'
                """,
                from,
                to
        );

        BigDecimal paymentsCollected = queryDecimal(
                """
                SELECT COALESCE(SUM(amount), 0)
                FROM payments
                WHERE payment_date BETWEEN ? AND ?
                """,
                from,
                to
        );

        BigDecimal expenses = queryDecimal(
                """
                SELECT COALESCE(SUM(amount), 0)
                FROM expenses
                WHERE expense_date BETWEEN ? AND ?
                """,
                from,
                to
        );

        BigDecimal netResult = revenue.subtract(expenses);

        BigDecimal outstandingCustomerAmount = queryDecimal(
                """
                SELECT COALESCE(SUM(outstanding_amount), 0)
                FROM invoices
                WHERE outstanding_amount > 0
                AND UPPER(status) <> 'DRAFT'
                """
        );

        Long invoiceCount = queryLong(
                """
                SELECT COUNT(*)
                FROM invoices
                WHERE invoice_date BETWEEN ? AND ?
                AND UPPER(status) <> 'DRAFT'
                """,
                from,
                to
        );

        Long paymentCount = queryLong(
                """
                SELECT COUNT(*)
                FROM payments
                WHERE payment_date BETWEEN ? AND ?
                """,
                from,
                to
        );

        Long expenseCount = queryLong(
                """
                SELECT COUNT(*)
                FROM expenses
                WHERE expense_date BETWEEN ? AND ?
                """,
                from,
                to
        );

        return ReportSummaryResponse.FinancialSummary.builder()
                .revenue(revenue)
                .paymentsCollected(paymentsCollected)
                .expenses(expenses)
                .netResult(netResult)
                .outstandingCustomerAmount(outstandingCustomerAmount)
                .invoiceCount(invoiceCount)
                .paymentCount(paymentCount)
                .expenseCount(expenseCount)
                .build();
    }

    private ReportSummaryResponse.WorkshopSummary buildWorkshopSummary(
            LocalDate from,
            LocalDate to
    ) {

        Long jobCardsOpened = queryLong(
                """
                SELECT COUNT(*)
                FROM job_cards
                WHERE DATE(opened_at) BETWEEN ? AND ?
                """,
                from,
                to
        );

        Long activeJobCards = queryLong(
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
                """);

        Long deliveredJobCards = queryLong(
                """
                SELECT COUNT(*)
                FROM job_cards
                WHERE UPPER(status) = 'DELIVERED'
                AND closed_at IS NOT NULL
                AND DATE(closed_at) BETWEEN ? AND ?
                """,
                from,
                to
        );

        return ReportSummaryResponse.WorkshopSummary.builder()
                .jobCardsOpened(jobCardsOpened)
                .activeJobCards(activeJobCards)
                .deliveredJobCards(deliveredJobCards)
                .build();
    }

    private ReportSummaryResponse.CustomerSummary buildCustomerSummary(
            LocalDate from,
            LocalDate to
    ) {

        Long newCustomers = queryLong(
                """
                SELECT COUNT(*)
                FROM customers
                WHERE DATE(created_at) BETWEEN ? AND ?
                """,
                from,
                to
        );

        return ReportSummaryResponse.CustomerSummary.builder()
                .newCustomers(newCustomers)
                .build();
    }

    private ReportSummaryResponse.VehicleSummary buildVehicleSummary(
            LocalDate from,
            LocalDate to
    ) {

        Long newVehicles = queryLong(
                """
                SELECT COUNT(*)
                FROM vehicles
                WHERE DATE(created_at) BETWEEN ? AND ?
                """,
                from,
                to
        );

        return ReportSummaryResponse.VehicleSummary.builder()
                .newVehicles(newVehicles)
                .build();
    }

    // =========================================================
    // V18.2 - REVENUE REPORT
    // =========================================================

    @Transactional(readOnly = true)
    public RevenueReportResponse getRevenueReport(
            LocalDate from,
            LocalDate to
    ) {

        validateDateRange(from, to);

        BigDecimal totalRevenue = queryDecimal(
                """
                SELECT COALESCE(SUM(total_amount), 0)
                FROM invoices
                WHERE invoice_date BETWEEN ? AND ?
                AND UPPER(status) <> 'DRAFT'
                """,
                from,
                to
        );

        Long invoiceCount = queryLong(
                """
                SELECT COUNT(*)
                FROM invoices
                WHERE invoice_date BETWEEN ? AND ?
                AND UPPER(status) <> 'DRAFT'
                """,
                from,
                to
        );

        BigDecimal totalDiscount = queryDecimal(
                """
                SELECT COALESCE(SUM(discount_amount), 0)
                FROM invoices
                WHERE invoice_date BETWEEN ? AND ?
                AND UPPER(status) <> 'DRAFT'
                """,
                from,
                to
        );

        BigDecimal totalTax = queryDecimal(
                """
                SELECT COALESCE(SUM(tax_amount), 0)
                FROM invoices
                WHERE invoice_date BETWEEN ? AND ?
                AND UPPER(status) <> 'DRAFT'
                """,
                from,
                to
        );

        BigDecimal totalPaid = queryDecimal(
                """
                SELECT COALESCE(SUM(paid_amount), 0)
                FROM invoices
                WHERE invoice_date BETWEEN ? AND ?
                AND UPPER(status) <> 'DRAFT'
                """,
                from,
                to
        );

        BigDecimal totalOutstanding = queryDecimal(
                """
                SELECT COALESCE(SUM(outstanding_amount), 0)
                FROM invoices
                WHERE invoice_date BETWEEN ? AND ?
                AND UPPER(status) <> 'DRAFT'
                """,
                from,
                to
        );

        BigDecimal averageInvoiceValue = invoiceCount > 0
                ? totalRevenue.divide(
                BigDecimal.valueOf(invoiceCount),
                2,
                RoundingMode.HALF_UP
        )
                : BigDecimal.ZERO;

        List<RevenueReportResponse.DailyRevenue> dailyRevenue =
                jdbcTemplate.query(
                        """
                        SELECT
                            invoice_date AS report_date,
                            COUNT(*) AS invoice_count,
                            COALESCE(SUM(total_amount), 0) AS revenue
                        FROM invoices
                        WHERE invoice_date BETWEEN ? AND ?
                        AND UPPER(status) <> 'DRAFT'
                        GROUP BY invoice_date
                        ORDER BY invoice_date
                        """,
                        (rs, rowNum) ->
                                RevenueReportResponse.DailyRevenue.builder()
                                        .date(
                                                rs.getDate("report_date")
                                                        .toLocalDate()
                                                        .toString()
                                        )
                                        .invoiceCount(
                                                rs.getLong("invoice_count")
                                        )
                                        .revenue(
                                                rs.getBigDecimal("revenue")
                                        )
                                        .build(),
                        from,
                        to
                );

        return RevenueReportResponse.builder()
                .fromDate(from.toString())
                .toDate(to.toString())
                .summary(
                        RevenueReportResponse.Summary.builder()
                                .totalRevenue(totalRevenue)
                                .invoiceCount(invoiceCount)
                                .averageInvoiceValue(
                                        averageInvoiceValue
                                )
                                .totalDiscount(totalDiscount)
                                .totalTax(totalTax)
                                .totalPaid(totalPaid)
                                .totalOutstanding(totalOutstanding)
                                .build()
                )
                .dailyRevenue(dailyRevenue)
                .build();
    }

    // =========================================================
    // V18.3 - PAYMENT REPORT
    // =========================================================

    @Transactional(readOnly = true)
    public PaymentReportResponse getPaymentReport(
            LocalDate from,
            LocalDate to
    ) {

        validateDateRange(from, to);

        BigDecimal totalCollected = queryDecimal(
                """
                SELECT COALESCE(SUM(amount), 0)
                FROM payments
                WHERE payment_date BETWEEN ? AND ?
                """,
                from,
                to
        );

        Long paymentCount = queryLong(
                """
                SELECT COUNT(*)
                FROM payments
                WHERE payment_date BETWEEN ? AND ?
                """,
                from,
                to
        );

        BigDecimal averagePayment = paymentCount > 0
                ? totalCollected.divide(
                BigDecimal.valueOf(paymentCount),
                2,
                RoundingMode.HALF_UP
        )
                : BigDecimal.ZERO;

        BigDecimal cash = getPaymentMethodAmount(
                "CASH",
                from,
                to
        );

        BigDecimal bank = getPaymentMethodAmount(
                "BANK_TRANSFER",
                from,
                to
        );

        BigDecimal upi = getPaymentMethodAmount(
                "UPI",
                from,
                to
        );

        BigDecimal card = getPaymentMethodAmount(
                "CARD",
                from,
                to
        );

        List<PaymentReportResponse.MethodSummary> methods =
                jdbcTemplate.query(
                        """
                        SELECT
                            UPPER(payment_method) AS payment_method,
                            COUNT(*) AS payment_count,
                            COALESCE(SUM(amount), 0) AS amount
                        FROM payments
                        WHERE payment_date BETWEEN ? AND ?
                        GROUP BY UPPER(payment_method)
                        ORDER BY amount DESC
                        """,
                        (rs, rowNum) ->
                                PaymentReportResponse.MethodSummary.builder()
                                        .paymentMethod(
                                                rs.getString(
                                                        "payment_method"
                                                )
                                        )
                                        .paymentCount(
                                                rs.getLong("payment_count")
                                        )
                                        .amount(
                                                rs.getBigDecimal("amount")
                                        )
                                        .build(),
                        from,
                        to
                );

        List<PaymentReportResponse.DailyPayment> dailyPayments =
                jdbcTemplate.query(
                        """
                        SELECT
                            payment_date AS report_date,
                            COUNT(*) AS payment_count,
                            COALESCE(SUM(amount), 0) AS amount
                        FROM payments
                        WHERE payment_date BETWEEN ? AND ?
                        GROUP BY payment_date
                        ORDER BY payment_date
                        """,
                        (rs, rowNum) ->
                                PaymentReportResponse.DailyPayment.builder()
                                        .date(
                                                rs.getDate("report_date")
                                                        .toLocalDate()
                                                        .toString()
                                        )
                                        .paymentCount(
                                                rs.getLong("payment_count")
                                        )
                                        .amount(
                                                rs.getBigDecimal("amount")
                                        )
                                        .build(),
                        from,
                        to
                );

        return PaymentReportResponse.builder()
                .fromDate(from.toString())
                .toDate(to.toString())
                .summary(
                        PaymentReportResponse.Summary.builder()
                                .totalCollected(totalCollected)
                                .paymentCount(paymentCount)
                                .averagePayment(averagePayment)
                                .cashCollected(cash)
                                .bankCollected(bank)
                                .upiCollected(upi)
                                .cardCollected(card)
                                .build()
                )
                .paymentMethods(methods)
                .dailyPayments(dailyPayments)
                .build();
    }

    private BigDecimal getPaymentMethodAmount(
            String method,
            LocalDate from,
            LocalDate to
    ) {

        return queryDecimal(
                """
                SELECT COALESCE(SUM(amount), 0)
                FROM payments
                WHERE payment_date BETWEEN ? AND ?
                AND UPPER(payment_method) = ?
                """,
                from,
                to,
                method
        );
    }

    // =========================================================
    // V18.4 - EXPENSE REPORT
    // =========================================================

    @Transactional(readOnly = true)
    public ExpenseReportResponse getExpenseReport(
            LocalDate from,
            LocalDate to
    ) {

        validateDateRange(from, to);

        BigDecimal totalExpenses = queryDecimal(
                """
                SELECT COALESCE(SUM(amount), 0)
                FROM expenses
                WHERE expense_date BETWEEN ? AND ?
                """,
                from,
                to
        );

        Long expenseCount = queryLong(
                """
                SELECT COUNT(*)
                FROM expenses
                WHERE expense_date BETWEEN ? AND ?
                """,
                from,
                to
        );

        BigDecimal averageExpense = expenseCount > 0
                ? totalExpenses.divide(
                BigDecimal.valueOf(expenseCount),
                2,
                RoundingMode.HALF_UP
        )
                : BigDecimal.ZERO;

        List<ExpenseReportResponse.CategorySummary> categories =
                jdbcTemplate.query(
                        """
                        SELECT
                            category,
                            COUNT(*) AS expense_count,
                            COALESCE(SUM(amount), 0) AS amount
                        FROM expenses
                        WHERE expense_date BETWEEN ? AND ?
                        GROUP BY category
                        ORDER BY amount DESC
                        """,
                        (rs, rowNum) ->
                                ExpenseReportResponse.CategorySummary.builder()
                                        .category(
                                                rs.getString("category")
                                        )
                                        .expenseCount(
                                                rs.getLong("expense_count")
                                        )
                                        .amount(
                                                rs.getBigDecimal("amount")
                                        )
                                        .build(),
                        from,
                        to
                );

        List<ExpenseReportResponse.DailyExpense> dailyExpenses =
                jdbcTemplate.query(
                        """
                        SELECT
                            expense_date AS report_date,
                            COUNT(*) AS expense_count,
                            COALESCE(SUM(amount), 0) AS amount
                        FROM expenses
                        WHERE expense_date BETWEEN ? AND ?
                        GROUP BY expense_date
                        ORDER BY expense_date
                        """,
                        (rs, rowNum) ->
                                ExpenseReportResponse.DailyExpense.builder()
                                        .date(
                                                rs.getDate("report_date")
                                                        .toLocalDate()
                                                        .toString()
                                        )
                                        .expenseCount(
                                                rs.getLong("expense_count")
                                        )
                                        .amount(
                                                rs.getBigDecimal("amount")
                                        )
                                        .build(),
                        from,
                        to
                );

        return ExpenseReportResponse.builder()
                .fromDate(from.toString())
                .toDate(to.toString())
                .summary(
                        ExpenseReportResponse.Summary.builder()
                                .totalExpenses(totalExpenses)
                                .expenseCount(expenseCount)
                                .averageExpense(averageExpense)
                                .build()
                )
                .categories(categories)
                .dailyExpenses(dailyExpenses)
                .build();
    }

    // =========================================================
    // V18.5 - OUTSTANDING REPORT
    // =========================================================

    @Transactional(readOnly = true)
    public OutstandingReportResponse getOutstandingReport() {

        BigDecimal totalOutstanding = queryDecimal(
                """
                SELECT COALESCE(SUM(outstanding_amount), 0)
                FROM invoices
                WHERE outstanding_amount > 0
                AND UPPER(status) <> 'DRAFT'
                """
        );

        Long invoiceCount = queryLong(
                """
                SELECT COUNT(*)
                FROM invoices
                WHERE outstanding_amount > 0
                AND UPPER(status) <> 'DRAFT'
                """
        );

        BigDecimal totalInvoiced = queryDecimal(
                """
                SELECT COALESCE(SUM(total_amount), 0)
                FROM invoices
                WHERE outstanding_amount > 0
                AND UPPER(status) <> 'DRAFT'
                """
        );

        BigDecimal totalPaid = queryDecimal(
                """
                SELECT COALESCE(SUM(paid_amount), 0)
                FROM invoices
                WHERE outstanding_amount > 0
                AND UPPER(status) <> 'DRAFT'
                """
        );

        List<OutstandingReportResponse.OutstandingInvoice> invoices =
                jdbcTemplate.query(
                        """
                        SELECT
                            id,
                            invoice_number,
                            job_card_id,
                            invoice_date,
                            total_amount,
                            paid_amount,
                            outstanding_amount,
                            status
                        FROM invoices
                        WHERE outstanding_amount > 0
                        AND UPPER(status) <> 'DRAFT'
                        ORDER BY invoice_date ASC, id ASC
                        """,
                        (rs, rowNum) ->
                                OutstandingReportResponse
                                        .OutstandingInvoice.builder()
                                        .invoiceId(
                                                rs.getLong("id")
                                        )
                                        .invoiceNumber(
                                                rs.getString(
                                                        "invoice_number"
                                                )
                                        )
                                        .jobCardId(
                                                rs.getLong("job_card_id")
                                        )
                                        .invoiceDate(
                                                rs.getDate("invoice_date")
                                                        .toLocalDate()
                                                        .toString()
                                        )
                                        .totalAmount(
                                                rs.getBigDecimal(
                                                        "total_amount"
                                                )
                                        )
                                        .paidAmount(
                                                rs.getBigDecimal(
                                                        "paid_amount"
                                                )
                                        )
                                        .outstandingAmount(
                                                rs.getBigDecimal(
                                                        "outstanding_amount"
                                                )
                                        )
                                        .status(
                                                rs.getString("status")
                                        )
                                        .build()
                );

        return OutstandingReportResponse.builder()
                .reportDate(LocalDate.now().toString())
                .summary(
                        OutstandingReportResponse.Summary.builder()
                                .totalOutstanding(totalOutstanding)
                                .invoiceCount(invoiceCount)
                                .totalInvoiced(totalInvoiced)
                                .totalPaid(totalPaid)
                                .build()
                )
                .invoices(invoices)
                .build();
    }

    // =========================================================
    // V18.6 - JOB CARD REPORT
    // =========================================================

    @Transactional(readOnly = true)
    public JobCardReportResponse getJobCardReport(
            LocalDate from,
            LocalDate to
    ) {

        validateDateRange(from, to);

        Long totalOpened = queryLong(
                """
                SELECT COUNT(*)
                FROM job_cards
                WHERE DATE(opened_at) BETWEEN ? AND ?
                """,
                from,
                to
        );

        Long active = queryLong(
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
        );

        Long delivered = queryLong(
                """
                SELECT COUNT(*)
                FROM job_cards
                WHERE UPPER(status) = 'DELIVERED'
                AND closed_at IS NOT NULL
                AND DATE(closed_at) BETWEEN ? AND ?
                """,
                from,
                to
        );

        Long cancelled = queryLong(
                """
                SELECT COUNT(*)
                FROM job_cards
                WHERE UPPER(status) = 'CANCELLED'
                AND DATE(opened_at) BETWEEN ? AND ?
                """,
                from,
                to
        );

        List<JobCardReportResponse.StatusSummary> statuses =
                jdbcTemplate.query(
                        """
                        SELECT
                            UPPER(status) AS status,
                            COUNT(*) AS status_count
                        FROM job_cards
                        WHERE DATE(opened_at) BETWEEN ? AND ?
                        GROUP BY UPPER(status)
                        ORDER BY status_count DESC
                        """,
                        (rs, rowNum) ->
                                JobCardReportResponse.StatusSummary.builder()
                                        .status(
                                                rs.getString("status")
                                        )
                                        .count(
                                                rs.getLong("status_count")
                                        )
                                        .build(),
                        from,
                        to
                );

        List<JobCardReportResponse.DailyJobCard> dailyJobCards =
                jdbcTemplate.query(
                        """
                        SELECT
                            DATE(opened_at) AS report_date,
                            COUNT(*) AS opened,
                            SUM(
                                CASE
                                    WHEN UPPER(status) = 'DELIVERED'
                                    AND closed_at IS NOT NULL
                                    AND DATE(closed_at) = DATE(opened_at)
                                    THEN 1
                                    ELSE 0
                                END
                            ) AS delivered
                        FROM job_cards
                        WHERE DATE(opened_at) BETWEEN ? AND ?
                        GROUP BY DATE(opened_at)
                        ORDER BY DATE(opened_at)
                        """,
                        (rs, rowNum) ->
                                JobCardReportResponse.DailyJobCard.builder()
                                        .date(
                                                rs.getDate("report_date")
                                                        .toLocalDate()
                                                        .toString()
                                        )
                                        .opened(
                                                rs.getLong("opened")
                                        )
                                        .delivered(
                                                rs.getLong("delivered")
                                        )
                                        .build(),
                        from,
                        to
                );

        return JobCardReportResponse.builder()
                .fromDate(from.toString())
                .toDate(to.toString())
                .summary(
                        JobCardReportResponse.Summary.builder()
                                .totalOpened(totalOpened)
                                .active(active)
                                .delivered(delivered)
                                .cancelled(cancelled)
                                .build()
                )
                .statuses(statuses)
                .dailyJobCards(dailyJobCards)
                .build();
    }

    // =========================================================
    // V18.7 - INVENTORY REPORT
    // =========================================================

    @Transactional(readOnly = true)
    public InventoryReportResponse getInventoryReport() {

        Long totalItems = queryLong(
                """
                SELECT COUNT(*)
                FROM inventory_items
                """
        );

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

        List<InventoryReportResponse.StockItem> stockItems =
                jdbcTemplate.query(
                        """
                        SELECT
                            id,
                            part_code,
                            part_name,
                            category,
                            current_stock,
                            minimum_stock,
                            purchase_price,
                            selling_price,
                            active
                        FROM inventory_items
                        ORDER BY part_name ASC
                        """,
                        (rs, rowNum) -> {

                            BigDecimal currentStock =
                                    rs.getBigDecimal("current_stock");

                            BigDecimal minimumStock =
                                    rs.getBigDecimal("minimum_stock");

                            boolean outOfStock =
                                    currentStock.compareTo(
                                            BigDecimal.ZERO
                                    ) <= 0;

                            boolean lowStock =
                                    currentStock.compareTo(
                                            minimumStock
                                    ) <= 0;

                            BigDecimal stockValue =
                                    currentStock.multiply(
                                            rs.getBigDecimal(
                                                    "purchase_price"
                                            )
                                    );

                            return InventoryReportResponse.StockItem
                                    .builder()
                                    .id(rs.getLong("id"))
                                    .partCode(
                                            rs.getString("part_code")
                                    )
                                    .partName(
                                            rs.getString("part_name")
                                    )
                                    .category(
                                            rs.getString("category")
                                    )
                                    .currentStock(currentStock)
                                    .minimumStock(minimumStock)
                                    .purchasePrice(
                                            rs.getBigDecimal(
                                                    "purchase_price"
                                            )
                                    )
                                    .sellingPrice(
                                            rs.getBigDecimal(
                                                    "selling_price"
                                            )
                                    )
                                    .stockValue(stockValue)
                                    .active(
                                            rs.getBoolean("active")
                                    )
                                    .lowStock(lowStock)
                                    .outOfStock(outOfStock)
                                    .build();
                        }
                );

        List<InventoryReportResponse.TransactionSummary> transactions =
                jdbcTemplate.query(
                        """
                        SELECT
                            UPPER(transaction_type) AS transaction_type,
                            COUNT(*) AS transaction_count,
                            COALESCE(SUM(quantity), 0) AS quantity
                        FROM inventory_transactions
                        GROUP BY UPPER(transaction_type)
                        ORDER BY transaction_count DESC
                        """,
                        (rs, rowNum) ->
                                InventoryReportResponse
                                        .TransactionSummary.builder()
                                        .transactionType(
                                                rs.getString(
                                                        "transaction_type"
                                                )
                                        )
                                        .transactionCount(
                                                rs.getLong(
                                                        "transaction_count"
                                                )
                                        )
                                        .quantity(
                                                rs.getBigDecimal(
                                                        "quantity"
                                                )
                                        )
                                        .build()
                );

        return InventoryReportResponse.builder()
                .reportDate(LocalDate.now().toString())
                .summary(
                        InventoryReportResponse.Summary.builder()
                                .totalItems(totalItems)
                                .activeItems(activeItems)
                                .lowStockItems(lowStockItems)
                                .outOfStockItems(outOfStockItems)
                                .inventoryValue(inventoryValue)
                                .build()
                )
                .stockItems(stockItems)
                .transactions(transactions)
                .build();
    }

    // =========================================================
    // V18.8 - PURCHASE REPORT
    // =========================================================
// =========================================================
// V18.8 - PURCHASE REPORT
// =========================================================

    @Transactional(readOnly = true)
    public PurchaseReportResponse getPurchaseReport(
            LocalDate from,
            LocalDate to
    ) {

        validateDateRange(from, to);

        // ---------------------------------------------------------
        // TOTAL PURCHASES
        // ---------------------------------------------------------

        BigDecimal totalPurchases = queryDecimal(
                """
                SELECT COALESCE(SUM(total_amount), 0)
                FROM purchase_orders
                WHERE purchase_date BETWEEN ? AND ?
                AND UPPER(status) <> 'CANCELLED'
                """,
                from,
                to
        );

        // ---------------------------------------------------------
        // PURCHASE ORDER COUNT
        // ---------------------------------------------------------

        Long purchaseOrderCount = queryLong(
                """
                SELECT COUNT(*)
                FROM purchase_orders
                WHERE purchase_date BETWEEN ? AND ?
                AND UPPER(status) <> 'CANCELLED'
                """,
                from,
                to
        );

        // ---------------------------------------------------------
        // TOTAL PAID
        // ---------------------------------------------------------

        BigDecimal totalPaid = queryDecimal(
                """
                SELECT COALESCE(SUM(paid_amount), 0)
                FROM purchase_orders
                WHERE purchase_date BETWEEN ? AND ?
                AND UPPER(status) <> 'CANCELLED'
                """,
                from,
                to
        );

        // ---------------------------------------------------------
        // TOTAL OUTSTANDING
        // ---------------------------------------------------------

        BigDecimal totalOutstanding = queryDecimal(
                """
                SELECT COALESCE(SUM(outstanding_amount), 0)
                FROM purchase_orders
                WHERE purchase_date BETWEEN ? AND ?
                AND UPPER(status) <> 'CANCELLED'
                """,
                from,
                to
        );

        // ---------------------------------------------------------
        // AVERAGE PURCHASE
        // ---------------------------------------------------------

        BigDecimal averagePurchase = purchaseOrderCount > 0
                ? totalPurchases.divide(
                BigDecimal.valueOf(purchaseOrderCount),
                2,
                RoundingMode.HALF_UP
        )
                : BigDecimal.ZERO;

        // ---------------------------------------------------------
        // PURCHASE STATUS BREAKDOWN
        // ---------------------------------------------------------

        List<PurchaseReportResponse.StatusSummary> statuses =
                jdbcTemplate.query(
                        """
                        SELECT
                            UPPER(status) AS status,
                            COUNT(*) AS purchase_order_count,
                            COALESCE(SUM(total_amount), 0) AS amount
                        FROM purchase_orders
                        WHERE purchase_date BETWEEN ? AND ?
                        GROUP BY UPPER(status)
                        ORDER BY amount DESC
                        """,
                        (rs, rowNum) ->
                                PurchaseReportResponse.StatusSummary
                                        .builder()
                                        .status(
                                                rs.getString("status")
                                        )
                                        .purchaseOrderCount(
                                                rs.getLong(
                                                        "purchase_order_count"
                                                )
                                        )
                                        .amount(
                                                rs.getBigDecimal("amount")
                                        )
                                        .build(),
                        from,
                        to
                );

        // ---------------------------------------------------------
        // DAILY PURCHASES
        // ---------------------------------------------------------

        List<PurchaseReportResponse.DailyPurchase> dailyPurchases =
                jdbcTemplate.query(
                        """
                        SELECT
                            purchase_date AS report_date,
                            COUNT(*) AS purchase_order_count,
                            COALESCE(SUM(total_amount), 0) AS amount
                        FROM purchase_orders
                        WHERE purchase_date BETWEEN ? AND ?
                        AND UPPER(status) <> 'CANCELLED'
                        GROUP BY purchase_date
                        ORDER BY purchase_date
                        """,
                        (rs, rowNum) ->
                                PurchaseReportResponse.DailyPurchase
                                        .builder()
                                        .date(
                                                rs.getDate("report_date")
                                                        .toLocalDate()
                                                        .toString()
                                        )
                                        .purchaseOrderCount(
                                                rs.getLong(
                                                        "purchase_order_count"
                                                )
                                        )
                                        .amount(
                                                rs.getBigDecimal("amount")
                                        )
                                        .build(),
                        from,
                        to
                );

        // ---------------------------------------------------------
        // FINAL RESPONSE
        // ---------------------------------------------------------

        return PurchaseReportResponse.builder()
                .fromDate(from.toString())
                .toDate(to.toString())
                .summary(
                        PurchaseReportResponse.Summary.builder()
                                .totalPurchases(totalPurchases)
                                .purchaseOrderCount(
                                        purchaseOrderCount
                                )
                                .averagePurchase(
                                        averagePurchase
                                )
                                .totalPaid(totalPaid)
                                .totalOutstanding(
                                        totalOutstanding
                                )
                                .build()
                )
                .statuses(statuses)
                .dailyPurchases(dailyPurchases)
                .build();
    }
    // =========================================================
    // VALIDATION
    // =========================================================

    private void validateDateRange(
            LocalDate from,
            LocalDate to
    ) {

        if (from == null) {
            throw new IllegalArgumentException(
                    "From date is required"
            );
        }

        if (to == null) {
            throw new IllegalArgumentException(
                    "To date is required"
            );
        }

        if (from.isAfter(to)) {
            throw new IllegalArgumentException(
                    "From date cannot be after To date"
            );
        }
    }

    // =========================================================
    // JDBC HELPERS
    // =========================================================

    private BigDecimal queryDecimal(
            String sql,
            Object... params
    ) {

        BigDecimal result = jdbcTemplate.queryForObject(
                sql,
                BigDecimal.class,
                params
        );

        return result != null
                ? result
                : BigDecimal.ZERO;
    }

    private Long queryLong(
            String sql,
            Object... params
    ) {

        Long result = jdbcTemplate.queryForObject(
                sql,
                Long.class,
                params
        );

        return result != null
                ? result
                : 0L;
    }
}