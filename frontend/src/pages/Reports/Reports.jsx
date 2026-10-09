import { useEffect, useMemo, useState } from "react";
import {
    BarChart3,
    TrendingUp,
    TrendingDown,
    IndianRupee,
    Car,
    Wrench,
    Package,
    Download,
    FileText,
    CalendarDays,
    CreditCard,
    AlertCircle,
    RefreshCw,
    ShoppingCart,
    Receipt,
    X,
} from "lucide-react";

import reportService from "../../services/reportService";

import "./Reports.css";


// =========================================================
// HELPERS
// =========================================================

const formatCurrency = (value) => {
    const number = Number(value || 0);

    return `₹${number.toLocaleString("en-IN", {
        maximumFractionDigits: 2,
    })}`;
};

const formatNumber = (value) => {
    return Number(value || 0).toLocaleString("en-IN");
};

const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
};

const getDateRange = (period) => {
    const today = new Date();

    const to = new Date(today);

    let from;

    switch (period) {
        case "MONTH":
            from = new Date(
                today.getFullYear(),
                today.getMonth(),
                1
            );
            break;

        case "3MONTHS":
            from = new Date(
                today.getFullYear(),
                today.getMonth() - 2,
                1
            );
            break;

        case "6MONTHS":
            from = new Date(
                today.getFullYear(),
                today.getMonth() - 5,
                1
            );
            break;

        case "YEAR":
            from = new Date(
                today.getFullYear(),
                0,
                1
            );
            break;

        default:
            from = new Date(
                today.getFullYear(),
                today.getMonth() - 5,
                1
            );
    }

    return {
        from: formatDate(from),
        to: formatDate(to),
    };
};

const getErrorMessage = (error) => {
    return (
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Unable to load reports. Please try again."
    );
};

const getMonthLabel = (dateString) => {
    if (!dateString) {
        return "";
    }

    const date = new Date(`${dateString}T00:00:00`);

    return date.toLocaleDateString("en-IN", {
        month: "short",
    });
};

const getMonthKey = (dateString) => {
    if (!dateString) {
        return "";
    }

    return dateString.substring(0, 7);
};

const getMonthYearLabel = (dateString) => {
    if (!dateString) {
        return "";
    }

    const date = new Date(`${dateString}-01T00:00:00`);

    return date.toLocaleDateString("en-IN", {
        month: "short",
        year: "numeric",
    });
};


// =========================================================
// REPORT DEFINITIONS
// =========================================================

const reportCards = [
    {
        key: "revenue",
        title: "Revenue Report",
        description: "View invoice revenue, collections and outstanding amounts.",
        icon: IndianRupee,
    },
    {
        key: "payments",
        title: "Payment Report",
        description: "Analyze customer collections by payment method.",
        icon: CreditCard,
    },
    {
        key: "expenses",
        title: "Expense Report",
        description: "Review expenses, categories and daily spending.",
        icon: TrendingDown,
    },
    {
        key: "job-cards",
        title: "Job Card Report",
        description: "Analyze workshop jobs, statuses and completion.",
        icon: Wrench,
    },
    {
        key: "inventory",
        title: "Inventory Report",
        description: "Review stock levels, valuation and transactions.",
        icon: Package,
    },
    {
        key: "purchases",
        title: "Purchase Report",
        description: "Analyze vendor purchases, payments and outstanding.",
        icon: ShoppingCart,
    },
    {
        key: "outstanding",
        title: "Outstanding Report",
        description: "View customer invoices with pending balances.",
        icon: Receipt,
    },
    {
        key: "vehicles",
        title: "Vehicle Report",
        description: "View vehicle registration activity through the summary.",
        icon: Car,
    },
];


// =========================================================
// COMPONENT
// =========================================================

function Reports() {
    const [period, setPeriod] = useState("6MONTHS");

    const [summary, setSummary] = useState(null);
    const [revenueReport, setRevenueReport] = useState(null);
    const [paymentReport, setPaymentReport] = useState(null);
    const [expenseReport, setExpenseReport] = useState(null);
    const [jobCardReport, setJobCardReport] = useState(null);
    const [inventoryReport, setInventoryReport] = useState(null);
    const [purchaseReport, setPurchaseReport] = useState(null);
    const [outstandingReport, setOutstandingReport] = useState(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [selectedReport, setSelectedReport] = useState(null);
    const [reportModalOpen, setReportModalOpen] = useState(false);

    const dateRange = useMemo(
        () => getDateRange(period),
        [period]
    );


    // =========================================================
    // LOAD REPORTS
    // =========================================================

    const loadReports = async () => {
        setLoading(true);
        setError("");

        try {
            const [
                summaryData,
                revenueData,
                paymentData,
                expenseData,
                jobCardData,
                inventoryData,
                purchaseData,
                outstandingData,
            ] = await Promise.all([
                reportService.getSummary(
                    dateRange.from,
                    dateRange.to
                ),

                reportService.getRevenueReport(
                    dateRange.from,
                    dateRange.to
                ),

                reportService.getPaymentReport(
                    dateRange.from,
                    dateRange.to
                ),

                reportService.getExpenseReport(
                    dateRange.from,
                    dateRange.to
                ),

                reportService.getJobCardReport(
                    dateRange.from,
                    dateRange.to
                ),

                reportService.getInventoryReport(),

                reportService.getPurchaseReport(
                    dateRange.from,
                    dateRange.to
                ),

                reportService.getOutstandingReport(),
            ]);

            setSummary(summaryData);
            setRevenueReport(revenueData);
            setPaymentReport(paymentData);
            setExpenseReport(expenseData);
            setJobCardReport(jobCardData);
            setInventoryReport(inventoryData);
            setPurchaseReport(purchaseData);
            setOutstandingReport(outstandingData);
        } catch (err) {
            console.error("Reports loading error:", err);

            setError(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        loadReports();
    }, [dateRange.from, dateRange.to]);


    // =========================================================
    // SUMMARY VALUES
    // =========================================================

    const financial = summary?.financial || {};

    const workshop = summary?.workshop || {};

    const customers = summary?.customers || {};

    const vehicles = summary?.vehicles || {};

    const inventorySummary =
        inventoryReport?.summary || {};

    const purchaseSummary =
        purchaseReport?.summary || {};

    const outstandingSummary =
        outstandingReport?.summary || {};


    // =========================================================
    // CHART DATA
    // =========================================================

    const chartData = useMemo(() => {
        const revenueDaily =
            revenueReport?.dailyRevenue || [];

        const expenseDaily =
            expenseReport?.dailyExpenses || [];

        const grouped = {};

        revenueDaily.forEach((item) => {
            const key = getMonthKey(item.date);

            if (!grouped[key]) {
                grouped[key] = {
                    month: key,
                    revenue: 0,
                    expenses: 0,
                };
            }

            grouped[key].revenue += Number(
                item.revenue || 0
            );
        });

        expenseDaily.forEach((item) => {
            const key = getMonthKey(item.date);

            if (!grouped[key]) {
                grouped[key] = {
                    month: key,
                    revenue: 0,
                    expenses: 0,
                };
            }

            grouped[key].expenses += Number(
                item.amount || 0
            );
        });

        return Object.values(grouped)
            .sort((a, b) =>
                a.month.localeCompare(b.month)
            )
            .slice(-12);
    }, [revenueReport, expenseReport]);


    const maxChartValue = useMemo(() => {
        if (!chartData.length) {
            return 1;
        }

        return Math.max(
            ...chartData.flatMap((item) => [
                item.revenue,
                item.expenses,
            ]),
            1
        );
    }, [chartData]);


    // =========================================================
    // BUSINESS ANALYSIS
    // =========================================================

    const averageMonthlyRevenue =
        chartData.length > 0
            ? chartData.reduce(
            (sum, item) => sum + item.revenue,
            0
        ) / chartData.length
            : 0;

    const averageMonthlyExpenses =
        chartData.length > 0
            ? chartData.reduce(
            (sum, item) => sum + item.expenses,
            0
        ) / chartData.length
            : 0;

    const totalRevenue =
        Number(financial.revenue || 0);

    const totalExpenses =
        Number(financial.expenses || 0);

    const netResult =
        Number(financial.netResult || 0);

    const profitMargin =
        totalRevenue > 0
            ? (netResult / totalRevenue) * 100
            : 0;


    // =========================================================
    // CSV EXPORT
    // =========================================================

    const downloadCsv = (filename, rows) => {
        if (!rows.length) {
            return;
        }

        const headers = Object.keys(rows[0]);

        const csvRows = [
            headers.join(","),
            ...rows.map((row) =>
                headers
                    .map((header) => {
                        const value =
                            row[header] ?? "";

                        const stringValue =
                            String(value)
                                .replace(/"/g, '""');

                        return `"${stringValue}"`;
                    })
                    .join(",")
            ),
        ];

        const blob = new Blob(
            [csvRows.join("\n")],
            {
                type: "text/csv;charset=utf-8;",
            }
        );

        const url =
            URL.createObjectURL(blob);

        const link =
            document.createElement("a");

        link.href = url;
        link.download = filename;

        document.body.appendChild(link);

        link.click();

        document.body.removeChild(link);

        URL.revokeObjectURL(url);
    };


    const exportReport = () => {
        const rows = [
            {
                From: dateRange.from,
                To: dateRange.to,
                Revenue: totalRevenue,
                PaymentsCollected:
                    financial.paymentsCollected || 0,
                Expenses: totalExpenses,
                NetResult: netResult,
                Outstanding:
                    financial.outstandingCustomerAmount || 0,
                Invoices:
                    financial.invoiceCount || 0,
                Payments:
                    financial.paymentCount || 0,
                ExpensesCount:
                    financial.expenseCount || 0,
                JobsOpened:
                    workshop.jobCardsOpened || 0,
                JobsActive:
                    workshop.activeJobCards || 0,
                JobsDelivered:
                    workshop.deliveredJobCards || 0,
                NewCustomers:
                    customers.newCustomers || 0,
                NewVehicles:
                    vehicles.newVehicles || 0,
            },
        ];

        downloadCsv(
            `drcarcare-report-${dateRange.from}-to-${dateRange.to}.csv`,
            rows
        );
    };


    // =========================================================
    // REPORT GENERATION
    // =========================================================

    const generateReport = (reportKey) => {
        setSelectedReport(reportKey);
        setReportModalOpen(true);
    };


    const closeReportModal = () => {
        setReportModalOpen(false);
        setSelectedReport(null);
    };


    // =========================================================
    // SELECTED REPORT CONTENT
    // =========================================================

    const selectedReportData = useMemo(() => {
        switch (selectedReport) {
            case "revenue":
                return revenueReport;

            case "payments":
                return paymentReport;

            case "expenses":
                return expenseReport;

            case "job-cards":
                return jobCardReport;

            case "inventory":
                return inventoryReport;

            case "purchases":
                return purchaseReport;

            case "outstanding":
                return outstandingReport;

            case "vehicles":
                return summary?.vehicles;

            default:
                return null;
        }
    }, [
        selectedReport,
        revenueReport,
        paymentReport,
        expenseReport,
        jobCardReport,
        inventoryReport,
        purchaseReport,
        outstandingReport,
        summary,
    ]);


    const selectedReportTitle =
        reportCards.find(
            (report) =>
                report.key === selectedReport
        )?.title || "Report";


    // =========================================================
    // LOADING
    // =========================================================

    if (loading && !summary) {
        return (
            <div className="reports-page">
                <div className="page-header">
                    <div>
                        <h1>Reports & Analytics</h1>
                        <p>
                            Loading garage performance and
                            business analytics...
                        </p>
                    </div>
                </div>

                <div className="report-section">
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            padding: "30px",
                            justifyContent: "center",
                        }}
                    >
                        <RefreshCw
                            size={20}
                            className="spin"
                        />
                        Loading reports...
                    </div>
                </div>
            </div>
        );
    }


    // =========================================================
    // RENDER
    // =========================================================

    return (
        <div className="reports-page">

            {/* =================================================
                HEADER
            ================================================= */}

            <div className="page-header">
                <div>
                    <h1>Reports & Analytics</h1>

                    <p>
                        Understand garage performance,
                        revenue and operations.
                    </p>

                    <small
                        style={{
                            color: "var(--text-secondary)",
                        }}
                    >
                        {dateRange.from} → {dateRange.to}
                    </small>
                </div>

                <div className="report-actions">

                    <select
                        value={period}
                        onChange={(e) =>
                            setPeriod(e.target.value)
                        }
                    >
                        <option value="MONTH">
                            This Month
                        </option>

                        <option value="3MONTHS">
                            Last 3 Months
                        </option>

                        <option value="6MONTHS">
                            Last 6 Months
                        </option>

                        <option value="YEAR">
                            This Year
                        </option>
                    </select>

                    <button
                        className="primary-btn"
                        onClick={exportReport}
                        disabled={loading}
                    >
                        <Download size={18} />

                        Export CSV
                    </button>

                </div>
            </div>


            {/* =================================================
                ERROR
            ================================================= */}

            {error && (
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: "14px 16px",
                        marginBottom: "20px",
                        borderRadius: "10px",
                        background: "#fee2e2",
                        color: "#b91c1c",
                        border: "1px solid #fecaca",
                    }}
                >
                    <AlertCircle size={20} />

                    <span style={{ flex: 1 }}>
                        {error}
                    </span>

                    <button
                        onClick={loadReports}
                        style={{
                            border: "none",
                            background: "transparent",
                            cursor: "pointer",
                            color: "inherit",
                            display: "flex",
                        }}
                    >
                        <RefreshCw size={18} />
                    </button>
                </div>
            )}


            {/* =================================================
                STAT CARDS
            ================================================= */}

            <div className="report-stat-grid">

                <div className="report-stat-card">
                    <div className="report-stat-icon green">
                        <TrendingUp />
                    </div>

                    <span>Total Revenue</span>

                    <strong>
                        {formatCurrency(totalRevenue)}
                    </strong>

                    <small>
                        Invoice revenue
                    </small>
                </div>


                <div className="report-stat-card">
                    <div className="report-stat-icon red">
                        <TrendingDown />
                    </div>

                    <span>Total Expenses</span>

                    <strong>
                        {formatCurrency(totalExpenses)}
                    </strong>

                    <small>
                        Recorded expenses
                    </small>
                </div>


                <div className="report-stat-card">
                    <div className="report-stat-icon blue">
                        <IndianRupee />
                    </div>

                    <span>Net Result</span>

                    <strong>
                        {formatCurrency(netResult)}
                    </strong>

                    <small>
                        Revenue minus expenses
                    </small>
                </div>


                <div className="report-stat-card">
                    <div className="report-stat-icon orange">
                        <Wrench />
                    </div>

                    <span>Jobs Delivered</span>

                    <strong>
                        {formatNumber(
                            workshop.deliveredJobCards
                        )}
                    </strong>

                    <small>
                        Completed service jobs
                    </small>
                </div>

            </div>


            {/* =================================================
                FINANCIAL CHART + BUSINESS SUMMARY
            ================================================= */}

            <div className="report-grid">

                {/* CHART */}

                <div className="chart-card">

                    <div className="card-header">

                        <div>
                            <h2>
                                Revenue vs Expenses
                            </h2>

                            <p>
                                Monthly financial performance
                            </p>
                        </div>

                        <BarChart3 />

                    </div>


                    {chartData.length === 0 ? (
                        <div
                            style={{
                                height: "240px",
                                display: "grid",
                                placeItems: "center",
                                color:
                                    "var(--text-secondary)",
                            }}
                        >
                            No financial data available
                            for this period.
                        </div>
                    ) : (
                        <>
                            <div className="bar-chart">

                                {chartData.map(
                                    (item) => (
                                        <div
                                            className="bar-column"
                                            key={item.month}
                                        >

                                            <div className="bars">

                                                <div
                                                    className="bar revenue"
                                                    style={{
                                                        height: `${Math.max(
                                                            5,
                                                            (item.revenue /
                                                                maxChartValue) *
                                                            180
                                                        )}px`,
                                                    }}
                                                    title={`Revenue: ${formatCurrency(
                                                        item.revenue
                                                    )}`}
                                                />

                                                <div
                                                    className="bar expenses"
                                                    style={{
                                                        height: `${Math.max(
                                                            5,
                                                            (item.expenses /
                                                                maxChartValue) *
                                                            180
                                                        )}px`,
                                                    }}
                                                    title={`Expenses: ${formatCurrency(
                                                        item.expenses
                                                    )}`}
                                                />

                                            </div>

                                            <span>
                                                {getMonthYearLabel(
                                                    item.month
                                                )}
                                            </span>

                                        </div>
                                    )
                                )}

                            </div>

                            <div className="chart-legend">

                                <span>
                                    <i className="legend revenue" />
                                    Revenue
                                </span>

                                <span>
                                    <i className="legend expenses" />
                                    Expenses
                                </span>

                            </div>
                        </>
                    )}

                </div>


                {/* BUSINESS SUMMARY */}

                <div className="performance-card">

                    <div className="card-header">

                        <div>
                            <h2>
                                Business Summary
                            </h2>

                            <p>
                                Key performance indicators
                            </p>
                        </div>

                        <TrendingUp />

                    </div>


                    <div className="performance-list">

                        <div>
                            <span>
                                Average Monthly Revenue
                            </span>

                            <strong>
                                {formatCurrency(
                                    averageMonthlyRevenue
                                )}
                            </strong>
                        </div>


                        <div>
                            <span>
                                Average Monthly Expenses
                            </span>

                            <strong>
                                {formatCurrency(
                                    averageMonthlyExpenses
                                )}
                            </strong>
                        </div>


                        <div>
                            <span>
                                Payments Collected
                            </span>

                            <strong>
                                {formatCurrency(
                                    financial.paymentsCollected
                                )}
                            </strong>
                        </div>


                        <div>
                            <span>
                                Profit Margin
                            </span>

                            <strong>
                                {profitMargin.toFixed(1)}%
                            </strong>
                        </div>

                    </div>

                </div>

            </div>


            {/* =================================================
                OPERATIONS SUMMARY
            ================================================= */}

            <div className="report-section">

                <div className="section-heading">

                    <div>
                        <h2>
                            Operations Overview
                        </h2>

                        <p>
                            Workshop and customer activity
                            for the selected period.
                        </p>
                    </div>

                    <Wrench size={22} />

                </div>


                <div className="report-card-grid">

                    <div className="available-report">

                        <div className="available-report-icon">
                            <Wrench />
                        </div>

                        <div>
                            <h3>
                                Job Cards Opened
                            </h3>

                            <p>
                                Workshop jobs created
                            </p>
                        </div>

                        <strong>
                            {formatNumber(
                                workshop.jobCardsOpened
                            )}
                        </strong>

                    </div>


                    <div className="available-report">

                        <div className="available-report-icon">
                            <Wrench />
                        </div>

                        <div>
                            <h3>
                                Active Job Cards
                            </h3>

                            <p>
                                Jobs currently in progress
                            </p>
                        </div>

                        <strong>
                            {formatNumber(
                                workshop.activeJobCards
                            )}
                        </strong>

                    </div>


                    <div className="available-report">

                        <div className="available-report-icon">
                            <Car />
                        </div>

                        <div>
                            <h3>
                                New Vehicles
                            </h3>

                            <p>
                                Vehicles registered
                            </p>
                        </div>

                        <strong>
                            {formatNumber(
                                vehicles.newVehicles
                            )}
                        </strong>

                    </div>


                    <div className="available-report">

                        <div className="available-report-icon">
                            <Package />
                        </div>

                        <div>
                            <h3>
                                Inventory Value
                            </h3>

                            <p>
                                Current stock valuation
                            </p>
                        </div>

                        <strong>
                            {formatCurrency(
                                inventorySummary.inventoryValue
                            )}
                        </strong>

                    </div>

                </div>

            </div>


            {/* =================================================
                FINANCIAL OVERVIEW
            ================================================= */}

            <div className="report-section">

                <div className="section-heading">

                    <div>
                        <h2>
                            Financial Overview
                        </h2>

                        <p>
                            Current financial position
                            from the reporting APIs.
                        </p>
                    </div>

                    <IndianRupee size={22} />

                </div>


                <div className="report-card-grid">

                    <div className="available-report">

                        <div className="available-report-icon">
                            <Receipt />
                        </div>

                        <div>
                            <h3>
                                Invoices
                            </h3>

                            <p>
                                Non-draft invoices
                            </p>
                        </div>

                        <strong>
                            {formatNumber(
                                financial.invoiceCount
                            )}
                        </strong>

                    </div>


                    <div className="available-report">

                        <div className="available-report-icon">
                            <CreditCard />
                        </div>

                        <div>
                            <h3>
                                Payments
                            </h3>

                            <p>
                                Customer payments recorded
                            </p>
                        </div>

                        <strong>
                            {formatNumber(
                                financial.paymentCount
                            )}
                        </strong>

                    </div>


                    <div className="available-report">

                        <div className="available-report-icon">
                            <TrendingDown />
                        </div>

                        <div>
                            <h3>
                                Expense Entries
                            </h3>

                            <p>
                                Recorded business expenses
                            </p>
                        </div>

                        <strong>
                            {formatNumber(
                                financial.expenseCount
                            )}
                        </strong>

                    </div>


                    <div className="available-report">

                        <div className="available-report-icon">
                            <AlertCircle />
                        </div>

                        <div>
                            <h3>
                                Customer Outstanding
                            </h3>

                            <p>
                                Amount pending collection
                            </p>
                        </div>

                        <strong>
                            {formatCurrency(
                                financial.outstandingCustomerAmount
                            )}
                        </strong>

                    </div>

                </div>

            </div>


            {/* =================================================
                PURCHASE / INVENTORY
            ================================================= */}

            <div className="report-section">

                <div className="section-heading">

                    <div>
                        <h2>
                            Inventory & Purchases
                        </h2>

                        <p>
                            Stock position and vendor
                            purchase activity.
                        </p>
                    </div>

                    <ShoppingCart size={22} />

                </div>


                <div className="report-card-grid">

                    <div className="available-report">

                        <div className="available-report-icon">
                            <Package />
                        </div>

                        <div>
                            <h3>
                                Active Inventory Items
                            </h3>

                            <p>
                                Currently active stock items
                            </p>
                        </div>

                        <strong>
                            {formatNumber(
                                inventorySummary.activeItems
                            )}
                        </strong>

                    </div>


                    <div className="available-report">

                        <div className="available-report-icon">
                            <AlertCircle />
                        </div>

                        <div>
                            <h3>
                                Low Stock Items
                            </h3>

                            <p>
                                Items at or below minimum stock
                            </p>
                        </div>

                        <strong>
                            {formatNumber(
                                inventorySummary.lowStockItems
                            )}
                        </strong>

                    </div>


                    <div className="available-report">

                        <div className="available-report-icon">
                            <ShoppingCart />
                        </div>

                        <div>
                            <h3>
                                Purchase Orders
                            </h3>

                            <p>
                                Purchase orders in period
                            </p>
                        </div>

                        <strong>
                            {formatNumber(
                                purchaseSummary.purchaseOrderCount
                            )}
                        </strong>

                    </div>


                    <div className="available-report">

                        <div className="available-report-icon">
                            <IndianRupee />
                        </div>

                        <div>
                            <h3>
                                Total Purchases
                            </h3>

                            <p>
                                Vendor purchase value
                            </p>
                        </div>

                        <strong>
                            {formatCurrency(
                                purchaseSummary.totalPurchases
                            )}
                        </strong>

                    </div>

                </div>

            </div>


            {/* =================================================
                AVAILABLE REPORTS
            ================================================= */}

            <div className="report-section">

                <div className="section-heading">

                    <div>
                        <h2>
                            Available Reports
                        </h2>

                        <p>
                            Generate detailed reports
                            from live garage data.
                        </p>
                    </div>

                    <CalendarDays size={22} />

                </div>


                <div className="report-card-grid">

                    {reportCards.map((report) => {

                        const Icon = report.icon;

                        return (
                            <div
                                className="available-report"
                                key={report.key}
                            >

                                <div className="available-report-icon">
                                    <Icon />
                                </div>


                                <div>
                                    <h3>
                                        {report.title}
                                    </h3>

                                    <p>
                                        {report.description}
                                    </p>
                                </div>


                                <button
                                    onClick={() =>
                                        generateReport(
                                            report.key
                                        )
                                    }
                                >
                                    <FileText size={16} />

                                    Generate
                                </button>

                            </div>
                        );
                    })}

                </div>

            </div>


            {/* =================================================
                REPORT MODAL
            ================================================= */}

            {reportModalOpen && (
                <div
                    style={{
                        position: "fixed",
                        inset: 0,
                        background:
                            "rgba(0,0,0,0.55)",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        padding: "20px",
                        zIndex: 1000,
                    }}
                    onClick={closeReportModal}
                >

                    <div
                        style={{
                            width: "min(900px, 100%)",
                            maxHeight: "90vh",
                            overflowY: "auto",
                            background:
                                "var(--surface)",
                            color: "var(--text)",
                            borderRadius: "14px",
                            border:
                                "1px solid var(--border)",
                            boxShadow:
                                "var(--shadow)",
                            padding: "22px",
                        }}
                        onClick={(event) =>
                            event.stopPropagation()
                        }
                    >

                        <div
                            style={{
                                display: "flex",
                                alignItems: "flex-start",
                                justifyContent:
                                    "space-between",
                                gap: "20px",
                                marginBottom: "20px",
                            }}
                        >

                            <div>
                                <h2
                                    style={{
                                        margin: 0,
                                    }}
                                >
                                    {selectedReportTitle}
                                </h2>

                                <p
                                    style={{
                                        margin:
                                            "6px 0 0",
                                        color:
                                            "var(--text-secondary)",
                                        fontSize: "13px",
                                    }}
                                >
                                    {dateRange.from} →{" "}
                                    {dateRange.to}
                                </p>
                            </div>


                            <button
                                onClick={closeReportModal}
                                style={{
                                    border: "none",
                                    background:
                                        "transparent",
                                    color:
                                        "var(--text)",
                                    cursor:
                                        "pointer",
                                    display: "flex",
                                }}
                            >
                                <X size={20} />
                            </button>

                        </div>


                        {/* REVENUE */}

                        {selectedReport ===
                            "revenue" &&
                            selectedReportData && (
                                <div>
                                    <div className="report-card-grid">

                                        <div className="available-report">
                                            <div className="available-report-icon">
                                                <IndianRupee />
                                            </div>

                                            <div>
                                                <h3>
                                                    Total Revenue
                                                </h3>
                                            </div>

                                            <strong>
                                                {formatCurrency(
                                                    selectedReportData
                                                        .summary
                                                        ?.totalRevenue
                                                )}
                                            </strong>
                                        </div>


                                        <div className="available-report">
                                            <div className="available-report-icon">
                                                <Receipt />
                                            </div>

                                            <div>
                                                <h3>
                                                    Invoice Count
                                                </h3>
                                            </div>

                                            <strong>
                                                {formatNumber(
                                                    selectedReportData
                                                        .summary
                                                        ?.invoiceCount
                                                )}
                                            </strong>
                                        </div>


                                        <div className="available-report">
                                            <div className="available-report-icon">
                                                <IndianRupee />
                                            </div>

                                            <div>
                                                <h3>
                                                    Total Paid
                                                </h3>
                                            </div>

                                            <strong>
                                                {formatCurrency(
                                                    selectedReportData
                                                        .summary
                                                        ?.totalPaid
                                                )}
                                            </strong>
                                        </div>


                                        <div className="available-report">
                                            <div className="available-report-icon">
                                                <AlertCircle />
                                            </div>

                                            <div>
                                                <h3>
                                                    Outstanding
                                                </h3>
                                            </div>

                                            <strong>
                                                {formatCurrency(
                                                    selectedReportData
                                                        .summary
                                                        ?.totalOutstanding
                                                )}
                                            </strong>
                                        </div>

                                    </div>
                                </div>
                            )}


                        {/* PAYMENTS */}

                        {selectedReport ===
                            "payments" &&
                            selectedReportData && (
                                <div>
                                    <div className="report-card-grid">

                                        <div className="available-report">
                                            <div className="available-report-icon">
                                                <CreditCard />
                                            </div>

                                            <div>
                                                <h3>
                                                    Total Collected
                                                </h3>
                                            </div>

                                            <strong>
                                                {formatCurrency(
                                                    selectedReportData
                                                        .summary
                                                        ?.totalCollected
                                                )}
                                            </strong>
                                        </div>


                                        <div className="available-report">
                                            <div className="available-report-icon">
                                                <IndianRupee />
                                            </div>

                                            <div>
                                                <h3>
                                                    Cash
                                                </h3>
                                            </div>

                                            <strong>
                                                {formatCurrency(
                                                    selectedReportData
                                                        .summary
                                                        ?.cashCollected
                                                )}
                                            </strong>
                                        </div>


                                        <div className="available-report">
                                            <div className="available-report-icon">
                                                <CreditCard />
                                            </div>

                                            <div>
                                                <h3>
                                                    Card
                                                </h3>
                                            </div>

                                            <strong>
                                                {formatCurrency(
                                                    selectedReportData
                                                        .summary
                                                        ?.cardCollected
                                                )}
                                            </strong>
                                        </div>


                                        <div className="available-report">
                                            <div className="available-report-icon">
                                                <IndianRupee />
                                            </div>

                                            <div>
                                                <h3>
                                                    UPI
                                                </h3>
                                            </div>

                                            <strong>
                                                {formatCurrency(
                                                    selectedReportData
                                                        .summary
                                                        ?.upiCollected
                                                )}
                                            </strong>
                                        </div>

                                    </div>
                                </div>
                            )}


                        {/* EXPENSES */}

                        {selectedReport ===
                            "expenses" &&
                            selectedReportData && (
                                <div>
                                    <div className="report-card-grid">

                                        <div className="available-report">
                                            <div className="available-report-icon">
                                                <TrendingDown />
                                            </div>

                                            <div>
                                                <h3>
                                                    Total Expenses
                                                </h3>
                                            </div>

                                            <strong>
                                                {formatCurrency(
                                                    selectedReportData
                                                        .summary
                                                        ?.totalExpenses
                                                )}
                                            </strong>
                                        </div>


                                        <div className="available-report">
                                            <div className="available-report-icon">
                                                <Receipt />
                                            </div>

                                            <div>
                                                <h3>
                                                    Expense Count
                                                </h3>
                                            </div>

                                            <strong>
                                                {formatNumber(
                                                    selectedReportData
                                                        .summary
                                                        ?.expenseCount
                                                )}
                                            </strong>
                                        </div>


                                        <div className="available-report">
                                            <div className="available-report-icon">
                                                <IndianRupee />
                                            </div>

                                            <div>
                                                <h3>
                                                    Average Expense
                                                </h3>
                                            </div>

                                            <strong>
                                                {formatCurrency(
                                                    selectedReportData
                                                        .summary
                                                        ?.averageExpense
                                                )}
                                            </strong>
                                        </div>

                                    </div>
                                </div>
                            )}


                        {/* JOB CARDS */}

                        {selectedReport ===
                            "job-cards" &&
                            selectedReportData && (
                                <div>
                                    <div className="report-card-grid">

                                        <div className="available-report">
                                            <div className="available-report-icon">
                                                <Wrench />
                                            </div>

                                            <div>
                                                <h3>
                                                    Opened
                                                </h3>
                                            </div>

                                            <strong>
                                                {formatNumber(
                                                    selectedReportData
                                                        .summary
                                                        ?.totalOpened
                                                )}
                                            </strong>
                                        </div>


                                        <div className="available-report">
                                            <div className="available-report-icon">
                                                <Wrench />
                                            </div>

                                            <div>
                                                <h3>
                                                    Active
                                                </h3>
                                            </div>

                                            <strong>
                                                {formatNumber(
                                                    selectedReportData
                                                        .summary
                                                        ?.active
                                                )}
                                            </strong>
                                        </div>


                                        <div className="available-report">
                                            <div className="available-report-icon">
                                                <Car />
                                            </div>

                                            <div>
                                                <h3>
                                                    Delivered
                                                </h3>
                                            </div>

                                            <strong>
                                                {formatNumber(
                                                    selectedReportData
                                                        .summary
                                                        ?.delivered
                                                )}
                                            </strong>
                                        </div>


                                        <div className="available-report">
                                            <div className="available-report-icon">
                                                <AlertCircle />
                                            </div>

                                            <div>
                                                <h3>
                                                    Cancelled
                                                </h3>
                                            </div>

                                            <strong>
                                                {formatNumber(
                                                    selectedReportData
                                                        .summary
                                                        ?.cancelled
                                                )}
                                            </strong>
                                        </div>

                                    </div>
                                </div>
                            )}


                        {/* INVENTORY */}

                        {selectedReport ===
                            "inventory" &&
                            selectedReportData && (
                                <div>
                                    <div className="report-card-grid">

                                        <div className="available-report">
                                            <div className="available-report-icon">
                                                <Package />
                                            </div>

                                            <div>
                                                <h3>
                                                    Total Items
                                                </h3>
                                            </div>

                                            <strong>
                                                {formatNumber(
                                                    selectedReportData
                                                        .summary
                                                        ?.totalItems
                                                )}
                                            </strong>
                                        </div>


                                        <div className="available-report">
                                            <div className="available-report-icon">
                                                <Package />
                                            </div>

                                            <div>
                                                <h3>
                                                    Active Items
                                                </h3>
                                            </div>

                                            <strong>
                                                {formatNumber(
                                                    selectedReportData
                                                        .summary
                                                        ?.activeItems
                                                )}
                                            </strong>
                                        </div>


                                        <div className="available-report">
                                            <div className="available-report-icon">
                                                <AlertCircle />
                                            </div>

                                            <div>
                                                <h3>
                                                    Low Stock
                                                </h3>
                                            </div>

                                            <strong>
                                                {formatNumber(
                                                    selectedReportData
                                                        .summary
                                                        ?.lowStockItems
                                                )}
                                            </strong>
                                        </div>


                                        <div className="available-report">
                                            <div className="available-report-icon">
                                                <IndianRupee />
                                            </div>

                                            <div>
                                                <h3>
                                                    Inventory Value
                                                </h3>
                                            </div>

                                            <strong>
                                                {formatCurrency(
                                                    selectedReportData
                                                        .summary
                                                        ?.inventoryValue
                                                )}
                                            </strong>
                                        </div>

                                    </div>
                                </div>
                            )}


                        {/* PURCHASES */}

                        {selectedReport ===
                            "purchases" &&
                            selectedReportData && (
                                <div>
                                    <div className="report-card-grid">

                                        <div className="available-report">
                                            <div className="available-report-icon">
                                                <ShoppingCart />
                                            </div>

                                            <div>
                                                <h3>
                                                    Total Purchases
                                                </h3>
                                            </div>

                                            <strong>
                                                {formatCurrency(
                                                    selectedReportData
                                                        .summary
                                                        ?.totalPurchases
                                                )}
                                            </strong>
                                        </div>


                                        <div className="available-report">
                                            <div className="available-report-icon">
                                                <Receipt />
                                            </div>

                                            <div>
                                                <h3>
                                                    Purchase Orders
                                                </h3>
                                            </div>

                                            <strong>
                                                {formatNumber(
                                                    selectedReportData
                                                        .summary
                                                        ?.purchaseOrderCount
                                                )}
                                            </strong>
                                        </div>


                                        <div className="available-report">
                                            <div className="available-report-icon">
                                                <IndianRupee />
                                            </div>

                                            <div>
                                                <h3>
                                                    Total Paid
                                                </h3>
                                            </div>

                                            <strong>
                                                {formatCurrency(
                                                    selectedReportData
                                                        .summary
                                                        ?.totalPaid
                                                )}
                                            </strong>
                                        </div>


                                        <div className="available-report">
                                            <div className="available-report-icon">
                                                <AlertCircle />
                                            </div>

                                            <div>
                                                <h3>
                                                    Outstanding
                                                </h3>
                                            </div>

                                            <strong>
                                                {formatCurrency(
                                                    selectedReportData
                                                        .summary
                                                        ?.totalOutstanding
                                                )}
                                            </strong>
                                        </div>

                                    </div>
                                </div>
                            )}


                        {/* OUTSTANDING */}

                        {selectedReport ===
                            "outstanding" &&
                            selectedReportData && (
                                <div>
                                    <div className="report-card-grid">

                                        <div className="available-report">
                                            <div className="available-report-icon">
                                                <AlertCircle />
                                            </div>

                                            <div>
                                                <h3>
                                                    Total Outstanding
                                                </h3>
                                            </div>

                                            <strong>
                                                {formatCurrency(
                                                    selectedReportData
                                                        .summary
                                                        ?.totalOutstanding
                                                )}
                                            </strong>
                                        </div>


                                        <div className="available-report">
                                            <div className="available-report-icon">
                                                <Receipt />
                                            </div>

                                            <div>
                                                <h3>
                                                    Pending Invoices
                                                </h3>
                                            </div>

                                            <strong>
                                                {formatNumber(
                                                    selectedReportData
                                                        .summary
                                                        ?.invoiceCount
                                                )}
                                            </strong>
                                        </div>


                                        <div className="available-report">
                                            <div className="available-report-icon">
                                                <IndianRupee />
                                            </div>

                                            <div>
                                                <h3>
                                                    Total Invoiced
                                                </h3>
                                            </div>

                                            <strong>
                                                {formatCurrency(
                                                    selectedReportData
                                                        .summary
                                                        ?.totalInvoiced
                                                )}
                                            </strong>
                                        </div>


                                        <div className="available-report">
                                            <div className="available-report-icon">
                                                <CreditCard />
                                            </div>

                                            <div>
                                                <h3>
                                                    Total Paid
                                                </h3>
                                            </div>

                                            <strong>
                                                {formatCurrency(
                                                    selectedReportData
                                                        .summary
                                                        ?.totalPaid
                                                )}
                                            </strong>
                                        </div>

                                    </div>
                                </div>
                            )}


                        {/* VEHICLES */}

                        {selectedReport ===
                            "vehicles" &&
                            selectedReportData && (
                                <div>
                                    <div className="available-report">

                                        <div className="available-report-icon">
                                            <Car />
                                        </div>

                                        <div>
                                            <h3>
                                                New Vehicles
                                            </h3>

                                            <p>
                                                Vehicles registered
                                                during the selected
                                                period.
                                            </p>
                                        </div>

                                        <strong>
                                            {formatNumber(
                                                selectedReportData
                                                    .newVehicles
                                            )}
                                        </strong>

                                    </div>
                                </div>
                            )}


                        {/* EXPORT CURRENT REPORT */}

                        <div
                            style={{
                                display: "flex",
                                justifyContent:
                                    "flex-end",
                                marginTop: "22px",
                            }}
                        >

                            <button
                                className="primary-btn"
                                onClick={() =>
                                    exportReport()
                                }
                            >
                                <Download size={17} />

                                Export Summary CSV
                            </button>

                        </div>

                    </div>

                </div>
            )}

        </div>
    );
}

export default Reports;