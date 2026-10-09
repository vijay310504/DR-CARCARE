import {
    Activity,
    ArrowUpRight,
    Bell,
    CalendarDays,
    CalendarPlus,
    Car,
    CheckCircle2,
    ClipboardList,
    CreditCard,
    DollarSign,
    FilePlus2,
    Gauge,
    Package,
    Plus,
    Receipt,
    RefreshCw,
    Settings2,
    ShoppingCart,
    TriangleAlert,
    Users,
    WalletCards,
    Wrench,
    XCircle,
} from "lucide-react";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import dashboardService from "../../services/dashboardService";
import "./Dashboard.css";


/* =========================================================
   HELPERS
========================================================= */

const numberValue = (value) => {
    const number = Number(value);
    return Number.isFinite(number) ? number : 0;
};


const formatNumber = (value) => {
    return new Intl.NumberFormat("en-IN").format(
        numberValue(value)
    );
};


const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(numberValue(value));
};


const formatDate = (value) => {
    if (!value) {
        return "Today";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return new Intl.DateTimeFormat("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
    }).format(date);
};


const formatActivityDate = (value) => {
    if (!value) {
        return "Recently";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return new Intl.DateTimeFormat("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    }).format(date);
};


/* =========================================================
   COMPONENT
========================================================= */

function Dashboard() {
    const navigate = useNavigate();

    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");

    /* =====================================================
       LOAD DASHBOARD
    ===================================================== */

    const loadDashboard = useCallback(async (showRefresh = false) => {
        try {
            if (showRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            setError("");

            const data = await dashboardService.getDashboard();

            setDashboard(data);
        } catch (err) {
            console.error("Dashboard loading failed:", err);

            setError(
                err?.response?.data?.message ||
                err?.message ||
                "Unable to load dashboard data."
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);


    useEffect(() => {
        loadDashboard();
    }, [loadDashboard]);


    /* =====================================================
       SAFE DATA
    ===================================================== */

    const overview = dashboard?.overview || {};

    const financial = dashboard?.financial || {};

    const workshop = dashboard?.workshop || {};

    const inventory = dashboard?.inventory || {};

    const customers = dashboard?.customers || {};

    const vehicles = dashboard?.vehicles || {};

    const bookings = dashboard?.bookings || {};

    const recentActivities =
        dashboard?.recentActivities || [];


    /* =====================================================
       JOB STATUS DATA
    ===================================================== */

    const jobStatuses = useMemo(() => {
        return [
            {
                name: "Under Service",
                count: numberValue(workshop.underService),
                color: "red",
                icon: Wrench,
            },
            {
                name: "Waiting Approval",
                count: numberValue(workshop.waitingApproval),
                color: "yellow",
                icon: ClipboardList,
            },
            {
                name: "Ready",
                count: numberValue(workshop.ready),
                color: "green",
                icon: CheckCircle2,
            },
            {
                name: "Inspection",
                count: numberValue(workshop.inspection),
                color: "blue",
                icon: Gauge,
            },
        ];
    }, [workshop]);


    const maximumJobCount = useMemo(() => {
        return Math.max(
            ...jobStatuses.map((item) => item.count),
            1
        );
    }, [jobStatuses]);


    /* =====================================================
       COLLECTION DATA
    ===================================================== */

    const collectionData = useMemo(() => {
        return [
            {
                label: "Cash",
                value: numberValue(financial.cashCollections),
                color: "var(--primary)",
            },
            {
                label: "Bank",
                value: numberValue(financial.bankCollections),
                color: "var(--info)",
            },
            {
                label: "UPI",
                value: numberValue(financial.upiCollections),
                color: "var(--success)",
            },
            {
                label: "Card",
                value: numberValue(financial.cardCollections),
                color: "var(--warning)",
            },
        ];
    }, [financial]);


    const collectionMaximum = useMemo(() => {
        return Math.max(
            ...collectionData.map((item) => item.value),
            1
        );
    }, [collectionData]);


    /* =====================================================
       QUICK ACTIONS
    ===================================================== */

    const quickActions = [
        {
            title: "New Customer",
            icon: Users,
            path: "/customers",
        },
        {
            title: "New Booking",
            icon: CalendarPlus,
            path: "/bookings",
        },
        {
            title: "Create Job Card",
            icon: ClipboardList,
            path: "/job-cards",
        },
        {
            title: "Add Vehicle",
            icon: Car,
            path: "/vehicles",
        },
        {
            title: "Create Estimate",
            icon: FilePlus2,
            path: "/estimates",
        },
        {
            title: "Record Payment",
            icon: CreditCard,
            path: "/payments",
        },
    ];


    /* =====================================================
       ACTIVITY ICON
    ===================================================== */

    const getActivityIcon = (type) => {
        switch (String(type || "").toUpperCase()) {
            case "PAYMENT":
                return CreditCard;

            case "INVOICE":
                return Receipt;

            case "EXPENSE":
                return ShoppingCart;

            default:
                return Activity;
        }
    };


    /* =====================================================
       ACTIVITY COLOR
    ===================================================== */

    const getActivityColor = (type) => {
        switch (String(type || "").toUpperCase()) {
            case "PAYMENT":
                return "var(--success)";

            case "INVOICE":
                return "var(--info)";

            case "EXPENSE":
                return "var(--warning)";

            default:
                return "var(--primary)";
        }
    };


    /* =====================================================
       LOADING
    ===================================================== */

    if (loading) {
        return (
            <main className="dashboard-page">
                <section
                    className="dashboard-card"
                    style={{
                        minHeight: "420px",
                        display: "grid",
                        placeItems: "center",
                        padding: "40px",
                    }}
                >
                    <div
                        style={{
                            textAlign: "center",
                            color: "var(--text-secondary)",
                        }}
                    >
                        <RefreshCw
                            size={34}
                            style={{
                                color: "var(--primary)",
                                animation: "dashboard-spin 1s linear infinite",
                                marginBottom: "14px",
                            }}
                        />

                        <div
                            style={{
                                color: "var(--text)",
                                fontSize: "15px",
                                fontWeight: 600,
                            }}
                        >
                            Loading DR. CAR CARE dashboard...
                        </div>

                        <div
                            style={{
                                marginTop: "5px",
                                fontSize: "12px",
                            }}
                        >
                            Fetching workshop information
                        </div>
                    </div>
                </section>

                <style>
                    {`
                        @keyframes dashboard-spin {
                            from { transform: rotate(0deg); }
                            to { transform: rotate(360deg); }
                        }
                    `}
                </style>
            </main>
        );
    }


    /* =====================================================
       ERROR
    ===================================================== */

    if (error && !dashboard) {
        return (
            <main className="dashboard-page">
                <section
                    className="dashboard-card"
                    style={{
                        padding: "50px 25px",
                        textAlign: "center",
                    }}
                >
                    <TriangleAlert
                        size={42}
                        style={{
                            color: "var(--primary)",
                            marginBottom: "14px",
                        }}
                    />

                    <h2
                        style={{
                            color: "var(--text)",
                            margin: "0 0 8px",
                        }}
                    >
                        Dashboard unavailable
                    </h2>

                    <p
                        style={{
                            color: "var(--text-secondary)",
                            margin: "0 0 20px",
                            fontSize: "13px",
                        }}
                    >
                        {error}
                    </p>

                    <button
                        type="button"
                        className="dashboard-card-action"
                        onClick={() => loadDashboard()}
                        style={{
                            border: "1px solid var(--border)",
                            color: "var(--text)",
                            background: "var(--surface-hover)",
                            padding: "10px 15px",
                            cursor: "pointer",
                        }}
                    >
                        <RefreshCw
                            size={14}
                            style={{ marginRight: "6px" }}
                        />

                        Try Again
                    </button>
                </section>
            </main>
        );
    }


    return (
        <main className="dashboard-page">

            {/* =================================================
                WELCOME HEADER
            ================================================= */}

            <section className="dashboard-welcome">
                <div>
                    <h1>
                        Good morning, Owner 👋
                    </h1>

                    <p>
                        Here's what's happening at DR. CAR CARE today.
                    </p>

                    {error && (
                        <div
                            style={{
                                marginTop: "8px",
                                color: "var(--warning)",
                                fontSize: "11px",
                            }}
                        >
                            Some dashboard information could not be refreshed.
                        </div>
                    )}
                </div>

                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                    }}
                >
                    <button
                        type="button"
                        className="dashboard-card-action"
                        onClick={() => loadDashboard(true)}
                        disabled={refreshing}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            border: "1px solid var(--border)",
                            cursor: refreshing
                                ? "wait"
                                : "pointer",
                        }}
                    >
                        <RefreshCw
                            size={13}
                            style={{
                                animation: refreshing
                                    ? "dashboard-spin 1s linear infinite"
                                    : "none",
                            }}
                        />

                        Refresh
                    </button>

                    <div className="dashboard-date">
                        <CalendarDays
                            size={14}
                            style={{
                                verticalAlign: "middle",
                                marginRight: "7px",
                                color: "var(--primary)",
                            }}
                        />

                        {formatDate(
                            dashboard?.dashboardDate
                        )}
                    </div>
                </div>
            </section>


            {/* =================================================
                STATISTICS
            ================================================= */}

            <section className="dashboard-stats">

                {/* CUSTOMERS */}

                <article className="stat-card">
                    <div className="stat-top">
                        <span className="stat-title">
                            Total Customers
                        </span>

                        <div className="stat-icon">
                            <Users size={18} />
                        </div>
                    </div>

                    <div className="stat-value">
                        {formatNumber(
                            overview.totalCustomers
                        )}
                    </div>

                    <div className="stat-footer">
                        <span className="stat-change">
                            +{formatNumber(
                            customers.newCustomersThisMonth
                        )}
                        </span>

                        new this month
                    </div>
                </article>


                {/* VEHICLES */}

                <article className="stat-card">
                    <div className="stat-top">
                        <span className="stat-title">
                            Total Vehicles
                        </span>

                        <div className="stat-icon">
                            <Car size={18} />
                        </div>
                    </div>

                    <div className="stat-value">
                        {formatNumber(
                            overview.totalVehicles
                        )}
                    </div>

                    <div className="stat-footer">
                        <span className="stat-change">
                            {formatNumber(
                                vehicles.vehiclesServicedToday
                            )}
                        </span>

                        serviced today
                    </div>
                </article>


                {/* ACTIVE JOBS */}

                <article className="stat-card">
                    <div className="stat-top">
                        <span className="stat-title">
                            Active Job Cards
                        </span>

                        <div className="stat-icon">
                            <Wrench size={18} />
                        </div>
                    </div>

                    <div className="stat-value">
                        {formatNumber(
                            workshop.activeJobs
                        )}
                    </div>

                    <div className="stat-footer">
                        <span className="stat-change warning">
                            {formatNumber(
                                workshop.waitingApproval
                            )}
                        </span>

                        waiting approval
                    </div>
                </article>


                {/* REVENUE */}

                <article className="stat-card">
                    <div className="stat-top">
                        <span className="stat-title">
                            Total Revenue
                        </span>

                        <div className="stat-icon">
                            <DollarSign size={18} />
                        </div>
                    </div>

                    <div className="stat-value">
                        {formatCurrency(
                            financial.totalRevenue
                        )}
                    </div>

                    <div className="stat-footer">
                        <span className="stat-change">
                            {formatCurrency(
                                financial.totalPayments
                            )}
                        </span>

                        collected
                    </div>
                </article>

            </section>


            {/* =================================================
                MAIN GRID
            ================================================= */}

            <section className="dashboard-main-grid">

                {/* =================================================
                    REVENUE / COLLECTIONS
                ================================================= */}

                <article className="dashboard-card">

                    <div className="dashboard-card-header">

                        <div className="dashboard-card-title">
                            <Activity size={17} />

                            <h2>
                                Revenue & Collections
                            </h2>
                        </div>

                        <button
                            className="dashboard-card-action"
                            type="button"
                            onClick={() =>
                                navigate("/reports")
                            }
                        >
                            View Reports
                            <ArrowUpRight
                                size={13}
                                style={{
                                    marginLeft: "4px",
                                }}
                            />
                        </button>

                    </div>


                    <div className="revenue-content">

                        <div className="revenue-summary">

                            <span className="revenue-total">
                                {formatCurrency(
                                    financial.totalRevenue
                                )}
                            </span>

                            <span className="revenue-period">
                                Net {formatCurrency(
                                financial.netProfit
                            )}
                            </span>

                        </div>


                        {/* PAYMENT CHANNEL VISUALIZATION */}

                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns:
                                    "repeat(4, minmax(0, 1fr))",
                                gap: "12px",
                                marginBottom: "18px",
                            }}
                        >
                            {collectionData.map((item) => {
                                const percentage =
                                    collectionMaximum > 0
                                        ? (item.value /
                                            collectionMaximum) *
                                        100
                                        : 0;

                                return (
                                    <div
                                        key={item.label}
                                        style={{
                                            minWidth: 0,
                                        }}
                                    >
                                        <div
                                            style={{
                                                display: "flex",
                                                justifyContent:
                                                    "space-between",
                                                gap: "5px",
                                                marginBottom:
                                                    "7px",
                                                fontSize:
                                                    "10px",
                                                color:
                                                    "var(--text-secondary)",
                                            }}
                                        >
                                            <span>
                                                {item.label}
                                            </span>

                                            <strong
                                                style={{
                                                    color:
                                                        "var(--text)",
                                                    fontSize:
                                                        "10px",
                                                }}
                                            >
                                                {formatCurrency(
                                                    item.value
                                                )}
                                            </strong>
                                        </div>

                                        <div
                                            style={{
                                                height: "7px",
                                                overflow:
                                                    "hidden",
                                                background:
                                                    "var(--surface-hover)",
                                                borderRadius:
                                                    "10px",
                                            }}
                                        >
                                            <div
                                                style={{
                                                    width: `${percentage}%`,
                                                    height: "100%",
                                                    minWidth:
                                                        item.value >
                                                        0
                                                            ? "5px"
                                                            : "0",
                                                    background:
                                                    item.color,
                                                    borderRadius:
                                                        "inherit",
                                                    transition:
                                                        "width 0.4s ease",
                                                }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>


                        {/* FINANCIAL VISUAL */}

                        <div className="chart">

                            <div className="chart-grid">
                                <div className="chart-line" />
                                <div className="chart-line" />
                                <div className="chart-line" />
                                <div className="chart-line" />
                                <div className="chart-line" />
                            </div>


                            <svg
                                className="chart-svg"
                                viewBox="0 0 700 210"
                                preserveAspectRatio="none"
                            >

                                <path
                                    className="chart-area"
                                    d="
                                        M0,180
                                        L175,125
                                        L350,150
                                        L525,85
                                        L700,45
                                        L700,210
                                        L0,210
                                        Z
                                    "
                                />

                                <path
                                    className="chart-path"
                                    d="
                                        M0,180
                                        L175,125
                                        L350,150
                                        L525,85
                                        L700,45
                                    "
                                />

                                {[
                                    [0, 180],
                                    [175, 125],
                                    [350, 150],
                                    [525, 85],
                                    [700, 45],
                                ].map(([cx, cy]) => (
                                    <circle
                                        key={`${cx}-${cy}`}
                                        className="chart-point"
                                        cx={cx}
                                        cy={cy}
                                        r="5"
                                    />
                                ))}

                            </svg>


                            <div className="chart-labels">
                                <span>
                                    Revenue
                                </span>

                                <span>
                                    Payments
                                </span>

                                <span>
                                    Expenses
                                </span>

                                <span>
                                    Net Result
                                </span>

                                <span>
                                    Outstanding
                                </span>
                            </div>

                        </div>


                        {/* FINANCIAL FOOTER */}

                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns:
                                    "repeat(3, 1fr)",
                                gap: "10px",
                                marginTop: "20px",
                            }}
                        >
                            <div
                                style={{
                                    padding: "11px",
                                    background:
                                        "var(--surface-hover)",
                                    borderRadius: "9px",
                                }}
                            >
                                <span
                                    style={{
                                        display: "block",
                                        color:
                                            "var(--text-secondary)",
                                        fontSize: "10px",
                                        marginBottom:
                                            "4px",
                                    }}
                                >
                                    Payments Collected
                                </span>

                                <strong
                                    style={{
                                        color:
                                            "var(--success)",
                                        fontSize: "14px",
                                    }}
                                >
                                    {formatCurrency(
                                        financial.totalPayments
                                    )}
                                </strong>
                            </div>


                            <div
                                style={{
                                    padding: "11px",
                                    background:
                                        "var(--surface-hover)",
                                    borderRadius: "9px",
                                }}
                            >
                                <span
                                    style={{
                                        display: "block",
                                        color:
                                            "var(--text-secondary)",
                                        fontSize: "10px",
                                        marginBottom:
                                            "4px",
                                    }}
                                >
                                    Expenses
                                </span>

                                <strong
                                    style={{
                                        color:
                                            "var(--warning)",
                                        fontSize: "14px",
                                    }}
                                >
                                    {formatCurrency(
                                        financial.totalExpenses
                                    )}
                                </strong>
                            </div>


                            <div
                                style={{
                                    padding: "11px",
                                    background:
                                        "var(--surface-hover)",
                                    borderRadius: "9px",
                                }}
                            >
                                <span
                                    style={{
                                        display: "block",
                                        color:
                                            "var(--text-secondary)",
                                        fontSize: "10px",
                                        marginBottom:
                                            "4px",
                                    }}
                                >
                                    Outstanding
                                </span>

                                <strong
                                    style={{
                                        color:
                                            "var(--primary)",
                                        fontSize: "14px",
                                    }}
                                >
                                    {formatCurrency(
                                        financial.outstandingCustomerPayments
                                    )}
                                </strong>
                            </div>
                        </div>

                    </div>

                </article>


                {/* =================================================
                    JOB STATUS
                ================================================= */}

                <article className="dashboard-card">

                    <div className="dashboard-card-header">

                        <div className="dashboard-card-title">
                            <ClipboardList size={17} />

                            <h2>
                                Job Card Status
                            </h2>
                        </div>

                        <button
                            className="dashboard-card-action"
                            type="button"
                            onClick={() =>
                                navigate("/job-cards")
                            }
                        >
                            View All
                        </button>

                    </div>


                    <div className="job-status-content">

                        <div
                            className="status-total"
                            style={{
                                display: "flex",
                                justifyContent:
                                    "space-between",
                                alignItems: "center",
                            }}
                        >
                            <div>
                                <strong>
                                    {formatNumber(
                                        workshop.activeJobs
                                    )}
                                </strong>

                                <span>
                                    Active job cards
                                </span>
                            </div>

                            <div
                                style={{
                                    width: "52px",
                                    height: "52px",
                                    display: "grid",
                                    placeItems: "center",
                                    borderRadius: "14px",
                                    background:
                                        "rgba(229, 57, 53, 0.1)",
                                    color:
                                        "var(--primary)",
                                }}
                            >
                                <Wrench size={25} />
                            </div>
                        </div>


                        <div className="status-list">

                            {jobStatuses.map((status) => {
                                const Icon = status.icon;

                                const percentage =
                                    workshop.activeJobs > 0
                                        ? Math.round(
                                            (status.count /
                                                workshop.activeJobs) *
                                            100
                                        )
                                        : 0;

                                const width =
                                    Math.min(
                                        100,
                                        (status.count /
                                            maximumJobCount) *
                                        100
                                    );

                                return (
                                    <div
                                        className="status-row"
                                        key={status.name}
                                    >
                                        <span
                                            className={`status-dot ${status.color}`}
                                        />

                                        <div className="status-info">

                                            <div className="status-name">
                                                <span
                                                    style={{
                                                        display:
                                                            "flex",
                                                        alignItems:
                                                            "center",
                                                        gap: "6px",
                                                    }}
                                                >
                                                    <Icon
                                                        size={12}
                                                    />

                                                    {status.name}
                                                </span>

                                                <span className="status-count">
                                                    {formatNumber(
                                                        status.count
                                                    )}

                                                    <small
                                                        style={{
                                                            color:
                                                                "var(--text-secondary)",
                                                            fontWeight:
                                                                400,
                                                            marginLeft:
                                                                "5px",
                                                        }}
                                                    >
                                                        {percentage}%
                                                    </small>
                                                </span>
                                            </div>

                                            <div className="status-bar">
                                                <div
                                                    className={`status-progress ${status.color}`}
                                                    style={{
                                                        width: `${width}%`,
                                                    }}
                                                />
                                            </div>

                                        </div>
                                    </div>
                                );
                            })}

                        </div>


                        {/* EXTRA JOB INFORMATION */}

                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns:
                                    "repeat(3, 1fr)",
                                gap: "8px",
                                marginTop: "20px",
                            }}
                        >
                            <div
                                style={{
                                    textAlign: "center",
                                    padding: "10px 5px",
                                    background:
                                        "var(--surface-hover)",
                                    borderRadius: "8px",
                                }}
                            >
                                <strong
                                    style={{
                                        display: "block",
                                        color:
                                            "var(--text)",
                                        fontSize: "16px",
                                    }}
                                >
                                    {formatNumber(
                                        workshop.received
                                    )}
                                </strong>

                                <span
                                    style={{
                                        color:
                                            "var(--text-secondary)",
                                        fontSize: "9px",
                                    }}
                                >
                                    Received
                                </span>
                            </div>


                            <div
                                style={{
                                    textAlign: "center",
                                    padding: "10px 5px",
                                    background:
                                        "var(--surface-hover)",
                                    borderRadius: "8px",
                                }}
                            >
                                <strong
                                    style={{
                                        display: "block",
                                        color:
                                            "var(--text)",
                                        fontSize: "16px",
                                    }}
                                >
                                    {formatNumber(
                                        workshop.qualityCheck
                                    )}
                                </strong>

                                <span
                                    style={{
                                        color:
                                            "var(--text-secondary)",
                                        fontSize: "9px",
                                    }}
                                >
                                    Quality Check
                                </span>
                            </div>


                            <div
                                style={{
                                    textAlign: "center",
                                    padding: "10px 5px",
                                    background:
                                        "var(--surface-hover)",
                                    borderRadius: "8px",
                                }}
                            >
                                <strong
                                    style={{
                                        display: "block",
                                        color:
                                            "var(--success)",
                                        fontSize: "16px",
                                    }}
                                >
                                    {formatNumber(
                                        workshop.delivered
                                    )}
                                </strong>

                                <span
                                    style={{
                                        color:
                                            "var(--text-secondary)",
                                        fontSize: "9px",
                                    }}
                                >
                                    Delivered
                                </span>
                            </div>
                        </div>

                    </div>

                </article>

            </section>


            {/* =================================================
                QUICK ACTIONS + ACTIVITY
            ================================================= */}

            <section className="dashboard-bottom-grid">

                {/* =================================================
                    QUICK ACTIONS
                ================================================= */}

                <article className="dashboard-card">

                    <div className="dashboard-card-header">

                        <div className="dashboard-card-title">
                            <Plus size={17} />

                            <h2>
                                Workshop Tools
                            </h2>
                        </div>

                        <button
                            className="dashboard-card-action"
                            type="button"
                            onClick={() =>
                                navigate("/job-cards")
                            }
                        >
                            Workshop
                        </button>

                    </div>


                    <div className="quick-actions">

                        {quickActions.map((action) => {
                            const Icon = action.icon;

                            return (
                                <button
                                    key={action.title}
                                    type="button"
                                    className="quick-action"
                                    onClick={() =>
                                        navigate(action.path)
                                    }
                                >
                                    <div className="quick-action-icon">
                                        <Icon size={17} />
                                    </div>

                                    <span>
                                        {action.title}
                                    </span>
                                </button>
                            );
                        })}

                    </div>


                    {/* AUTOMOTIVE TOOL STRIP */}

                    <div
                        style={{
                            margin:
                                "0 20px 20px",
                            padding: "15px",
                            display: "grid",
                            gridTemplateColumns:
                                "repeat(3, 1fr)",
                            gap: "10px",
                            borderRadius: "11px",
                            background:
                                "var(--surface-hover)",
                        }}
                    >

                        <button
                            type="button"
                            onClick={() =>
                                navigate("/inventory")
                            }
                            style={{
                                border: 0,
                                background:
                                    "transparent",
                                color:
                                    "var(--text)",
                                cursor: "pointer",
                                textAlign: "left",
                            }}
                        >
                            <Package
                                size={18}
                                style={{
                                    color:
                                        inventory.lowStockItems >
                                        0
                                            ? "var(--warning)"
                                            : "var(--success)",
                                    marginBottom: "6px",
                                }}
                            />

                            <strong
                                style={{
                                    display: "block",
                                    fontSize: "12px",
                                }}
                            >
                                {formatNumber(
                                    inventory.lowStockItems
                                )}
                            </strong>

                            <span
                                style={{
                                    color:
                                        "var(--text-secondary)",
                                    fontSize: "9px",
                                }}
                            >
                                Low Stock
                            </span>
                        </button>


                        <button
                            type="button"
                            onClick={() =>
                                navigate("/bookings")
                            }
                            style={{
                                border: 0,
                                background:
                                    "transparent",
                                color:
                                    "var(--text)",
                                cursor: "pointer",
                                textAlign: "left",
                            }}
                        >
                            <CalendarPlus
                                size={18}
                                style={{
                                    color:
                                        "var(--primary)",
                                    marginBottom: "6px",
                                }}
                            />

                            <strong
                                style={{
                                    display: "block",
                                    fontSize: "12px",
                                }}
                            >
                                {formatNumber(
                                    bookings.todayBookings
                                )}
                            </strong>

                            <span
                                style={{
                                    color:
                                        "var(--text-secondary)",
                                    fontSize: "9px",
                                }}
                            >
                                Today's Bookings
                            </span>
                        </button>


                        <button
                            type="button"
                            onClick={() =>
                                navigate("/payments")
                            }
                            style={{
                                border: 0,
                                background:
                                    "transparent",
                                color:
                                    "var(--text)",
                                cursor: "pointer",
                                textAlign: "left",
                            }}
                        >
                            <WalletCards
                                size={18}
                                style={{
                                    color:
                                        "var(--success)",
                                    marginBottom: "6px",
                                }}
                            />

                            <strong
                                style={{
                                    display: "block",
                                    fontSize: "12px",
                                }}
                            >
                                {formatCurrency(
                                    financial.totalPayments
                                )}
                            </strong>

                            <span
                                style={{
                                    color:
                                        "var(--text-secondary)",
                                    fontSize: "9px",
                                }}
                            >
                                Collected
                            </span>
                        </button>

                    </div>

                </article>


                {/* =================================================
                    RECENT ACTIVITY
                ================================================= */}

                <article className="dashboard-card">

                    <div className="dashboard-card-header">

                        <div className="dashboard-card-title">
                            <Bell size={17} />

                            <h2>
                                Recent Activity
                            </h2>
                        </div>

                        <button
                            className="dashboard-card-action"
                            type="button"
                            onClick={() =>
                                navigate("/reports")
                            }
                        >
                            View Reports
                        </button>

                    </div>


                    <div className="activity-list">

                        {recentActivities.length === 0 ? (
                            <div
                                style={{
                                    padding: "30px 10px",
                                    textAlign: "center",
                                    color:
                                        "var(--text-secondary)",
                                    fontSize: "12px",
                                }}
                            >
                                <Activity
                                    size={25}
                                    style={{
                                        color:
                                            "var(--primary)",
                                        marginBottom:
                                            "8px",
                                    }}
                                />

                                <div>
                                    No recent activity
                                </div>
                            </div>
                        ) : (
                            recentActivities
                                .slice(0, 6)
                                .map((activity, index) => {
                                    const Icon =
                                        getActivityIcon(
                                            activity.activityType
                                        );

                                    const color =
                                        getActivityColor(
                                            activity.activityType
                                        );

                                    return (
                                        <div
                                            className="activity-item"
                                            key={`${activity.activityType}-${activity.referenceId || index}`}
                                        >

                                            <div
                                                className="activity-icon"
                                                style={{
                                                    color,
                                                }}
                                            >
                                                <Icon
                                                    size={15}
                                                />
                                            </div>


                                            <div className="activity-details">

                                                <strong>
                                                    {activity.description ||
                                                        "Activity recorded"}
                                                </strong>

                                                <span>
                                                    {activity.referenceNumber
                                                        ? `${activity.referenceNumber} · `
                                                        : ""}

                                                    {activity.amount
                                                        ? formatCurrency(
                                                            activity.amount
                                                        )
                                                        : ""}

                                                    {activity.amount
                                                        ? " · "
                                                        : ""}

                                                    {formatActivityDate(
                                                        activity.activityDate
                                                    )}
                                                </span>

                                            </div>

                                        </div>
                                    );
                                })
                        )}

                    </div>

                </article>

            </section>


            {/* =================================================
                WORKSHOP SNAPSHOT
            ================================================= */}

            <section
                className="dashboard-card"
                style={{
                    marginTop: "20px",
                    overflow: "hidden",
                }}
            >

                <div className="dashboard-card-header">

                    <div className="dashboard-card-title">
                        <Settings2 size={17} />

                        <h2>
                            Workshop Snapshot
                        </h2>
                    </div>

                    <span
                        style={{
                            color:
                                "var(--text-secondary)",
                            fontSize: "10px",
                        }}
                    >
                        Live from workshop database
                    </span>

                </div>


                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns:
                            "repeat(6, 1fr)",
                        gap: "1px",
                        background:
                            "var(--border)",
                    }}
                >

                    <div
                        style={{
                            background:
                                "var(--surface)",
                            padding: "17px",
                        }}
                    >
                        <Car
                            size={18}
                            style={{
                                color:
                                    "var(--primary)",
                                marginBottom: "8px",
                            }}
                        />

                        <strong
                            style={{
                                display: "block",
                                color:
                                    "var(--text)",
                                fontSize: "17px",
                            }}
                        >
                            {formatNumber(
                                overview.totalVehicles
                            )}
                        </strong>

                        <span
                            style={{
                                color:
                                    "var(--text-secondary)",
                                fontSize: "10px",
                            }}
                        >
                            Vehicles
                        </span>
                    </div>


                    <div
                        style={{
                            background:
                                "var(--surface)",
                            padding: "17px",
                        }}
                    >
                        <ClipboardList
                            size={18}
                            style={{
                                color:
                                    "var(--primary)",
                                marginBottom: "8px",
                            }}
                        />

                        <strong
                            style={{
                                display: "block",
                                color:
                                    "var(--text)",
                                fontSize: "17px",
                            }}
                        >
                            {formatNumber(
                                overview.totalJobCards
                            )}
                        </strong>

                        <span
                            style={{
                                color:
                                    "var(--text-secondary)",
                                fontSize: "10px",
                            }}
                        >
                            Job Cards
                        </span>
                    </div>


                    <div
                        style={{
                            background:
                                "var(--surface)",
                            padding: "17px",
                        }}
                    >
                        <Receipt
                            size={18}
                            style={{
                                color:
                                    "var(--info)",
                                marginBottom: "8px",
                            }}
                        />

                        <strong
                            style={{
                                display: "block",
                                color:
                                    "var(--text)",
                                fontSize: "17px",
                            }}
                        >
                            {formatNumber(
                                overview.totalInvoices
                            )}
                        </strong>

                        <span
                            style={{
                                color:
                                    "var(--text-secondary)",
                                fontSize: "10px",
                            }}
                        >
                            Invoices
                        </span>
                    </div>


                    <div
                        style={{
                            background:
                                "var(--surface)",
                            padding: "17px",
                        }}
                    >
                        <CreditCard
                            size={18}
                            style={{
                                color:
                                    "var(--success)",
                                marginBottom: "8px",
                            }}
                        />

                        <strong
                            style={{
                                display: "block",
                                color:
                                    "var(--text)",
                                fontSize: "17px",
                            }}
                        >
                            {formatNumber(
                                overview.totalPayments
                            )}
                        </strong>

                        <span
                            style={{
                                color:
                                    "var(--text-secondary)",
                                fontSize: "10px",
                            }}
                        >
                            Payments
                        </span>
                    </div>


                    <div
                        style={{
                            background:
                                "var(--surface)",
                            padding: "17px",
                        }}
                    >
                        <Package
                            size={18}
                            style={{
                                color:
                                    inventory.lowStockItems >
                                    0
                                        ? "var(--warning)"
                                        : "var(--success)",
                                marginBottom: "8px",
                            }}
                        />

                        <strong
                            style={{
                                display: "block",
                                color:
                                    "var(--text)",
                                fontSize: "17px",
                            }}
                        >
                            {formatNumber(
                                inventory.lowStockItems
                            )}
                        </strong>

                        <span
                            style={{
                                color:
                                    "var(--text-secondary)",
                                fontSize: "10px",
                            }}
                        >
                            Low Stock
                        </span>
                    </div>


                    <div
                        style={{
                            background:
                                "var(--surface)",
                            padding: "17px",
                        }}
                    >
                        {inventory.outOfStockItems > 0 ? (
                            <XCircle
                                size={18}
                                style={{
                                    color:
                                        "var(--primary)",
                                    marginBottom: "8px",
                                }}
                            />
                        ) : (
                            <CheckCircle2
                                size={18}
                                style={{
                                    color:
                                        "var(--success)",
                                    marginBottom: "8px",
                                }}
                            />
                        )}

                        <strong
                            style={{
                                display: "block",
                                color:
                                    "var(--text)",
                                fontSize: "17px",
                            }}
                        >
                            {formatNumber(
                                inventory.outOfStockItems
                            )}
                        </strong>

                        <span
                            style={{
                                color:
                                    "var(--text-secondary)",
                                fontSize: "10px",
                            }}
                        >
                            Out of Stock
                        </span>
                    </div>

                </div>

            </section>


            {/* =================================================
                SMALL AUTOMOTIVE FOOTER
            ================================================= */}

            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    padding: "20px 0 5px",
                    color: "var(--text-secondary)",
                    fontSize: "10px",
                }}
            >
                <Car
                    size={14}
                    style={{
                        color: "var(--primary)",
                    }}
                />

                <span>
                    DR. CAR CARE · Workshop Management Dashboard
                </span>

                <span>•</span>

                <span>
                    {formatNumber(
                        overview.totalCustomers
                    )}{" "}
                    customers
                </span>
            </div>

        </main>
    );
}

export default Dashboard;