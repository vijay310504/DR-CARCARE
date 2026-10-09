import React, { useEffect, useMemo, useState } from "react";
import {
    FileText,
    Plus,
    Search,
    X,
    Eye,
    Send,
    Ban,
    RefreshCw,
    Receipt,
    IndianRupee,
    CreditCard,
    Clock,
    ShoppingCart,
    Download,
} from "lucide-react";

import invoiceService from "../../services/invoiceService";
import jobCardService from "../../services/jobCardService";
import purchaseService from "../../services/purchaseService";
import inventoryService from "../../services/inventoryService";
import downloadInvoicePdf from "../../services/invoicePdfService";

import "./Invoices.css";
import "./Invoices-pdf-additions.css";


// ============================================================
// HELPERS
// ============================================================

const toNumber = (value) => {
    const number = Number(value);
    return Number.isFinite(number) ? number : 0;
};

const formatCurrency = (value) => {
    return `₹${toNumber(value).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
};

const formatDate = (value) => {
    if (!value) return "-";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

const formatDateTime = (value) => {
    if (!value) return "-";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return date.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};

const normalizeList = (data) => {
    if (Array.isArray(data)) return data;

    if (Array.isArray(data?.content)) {
        return data.content;
    }

    if (Array.isArray(data?.data)) {
        return data.data;
    }

    return [];
};

const getInvoiceStatus = (invoice) => {
    return String(invoice?.status || "DRAFT").toUpperCase();
};

const getPaymentStatus = (invoice) => {
    if (
        invoice?.paymentStatus
    ) {
        return String(invoice.paymentStatus).toUpperCase();
    }

    const total = toNumber(invoice?.totalAmount);
    const paid = toNumber(invoice?.paidAmount);

    if (paid <= 0) return "UNPAID";
    if (paid >= total && total > 0) return "PAID";

    return "PARTIALLY_PAID";
};

const getPaymentLabel = (status) => {
    switch (status) {
        case "PAID":
            return "Paid";

        case "PARTIALLY_PAID":
            return "Partially Paid";

        case "UNPAID":
        default:
            return "Unpaid";
    }
};

const getStatusLabel = (status) => {
    switch (status) {
        case "DRAFT":
            return "Draft";

        case "ISSUED":
            return "Issued";

        case "PAID":
            return "Paid";

        case "CANCELLED":
            return "Cancelled";

        default:
            return status || "Unknown";
    }
};

const getItemTypeLabel = (type) => {
    switch (String(type || "").toUpperCase()) {
        case "PART":
            return "Part";

        case "SERVICE":
            return "Service";

        case "LABOUR":
            return "Labour";

        case "OTHER":
            return "Other";

        default:
            return type || "Item";
    }
};


// ============================================================
// COMPONENT
// ============================================================

const Invoices = () => {
    // ============================================================
    // DATA
    // ============================================================

    const [invoices, setInvoices] = useState([]);
    const [jobCards, setJobCards] = useState([]);
    const [purchases, setPurchases] = useState([]);
    const [inventoryItems, setInventoryItems] = useState([]);

    // ============================================================
    // UI STATE
    // ============================================================

    const [loading, setLoading] = useState(true);
    const [jobCardsLoading, setJobCardsLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [actionLoading, setActionLoading] = useState(null);
    const [pdfLoadingId, setPdfLoadingId] = useState(null);

    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [paymentFilter, setPaymentFilter] = useState("ALL");

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showDetails, setShowDetails] = useState(false);

    const [selectedInvoice, setSelectedInvoice] = useState(null);

    const [selectedJobCardId, setSelectedJobCardId] = useState("");
    const [discountAmount, setDiscountAmount] = useState("");
    const [notes, setNotes] = useState("");

    // invoice source
    const [invoiceSource, setInvoiceSource] = useState("JOB_CARD");

    // ============================================================
    // LOAD INVOICES
    // ============================================================

    const loadInvoices = async () => {
        try {
            setLoading(true);
            setErrorMessage("");

            const data = await invoiceService.getAllInvoices();

            setInvoices(normalizeList(data));
        } catch (error) {
            console.error("Failed to load invoices:", error);

            setErrorMessage(
                error?.response?.data?.message ||
                "Unable to load invoices."
            );
        } finally {
            setLoading(false);
        }
    };

    // ============================================================
    // LOAD JOB CARDS
    // ============================================================

    const loadJobCards = async () => {
        try {
            setJobCardsLoading(true);

            const data = await jobCardService.getAllJobCards();

            setJobCards(normalizeList(data));
        } catch (error) {
            console.error("Failed to load job cards:", error);

            setErrorMessage(
                error?.response?.data?.message ||
                "Unable to load job cards."
            );
        } finally {
            setJobCardsLoading(false);
        }
    };

    // ============================================================
    // LOAD PURCHASES
    // ============================================================

    const loadPurchases = async () => {
        try {
            const data = await purchaseService.getAllPurchases();

            setPurchases(normalizeList(data));
        } catch (error) {
            console.error("Failed to load purchases:", error);

            // Purchase data is supporting information.
            // Do not block the invoice page if unavailable.
            setPurchases([]);
        }
    };

    // ============================================================
    // LOAD INVENTORY
    // ============================================================

    const loadInventory = async () => {
        try {
            const data = await inventoryService.getAllItems();

            setInventoryItems(normalizeList(data));
        } catch (error) {
            console.error("Failed to load inventory:", error);

            setInventoryItems([]);
        }
    };

    // ============================================================
    // INITIAL LOAD
    // ============================================================

    useEffect(() => {
        loadInvoices();
        loadJobCards();
        loadPurchases();
        loadInventory();
    }, []);

    // ============================================================
    // CLEAR MESSAGES
    // ============================================================

    useEffect(() => {
        if (!successMessage && !errorMessage) {
            return undefined;
        }

        const timer = setTimeout(() => {
            setSuccessMessage("");
            setErrorMessage("");
        }, 4000);

        return () => clearTimeout(timer);
    }, [successMessage, errorMessage]);

    // ============================================================
    // STATISTICS
    // ============================================================

    const statistics = useMemo(() => {
        const totalInvoices = invoices.length;

        const issuedInvoices = invoices.filter(
            (invoice) =>
                getInvoiceStatus(invoice) === "ISSUED"
        ).length;

        const paidAmount = invoices.reduce(
            (sum, invoice) =>
                sum + toNumber(invoice?.paidAmount),
            0
        );

        const outstandingAmount = invoices.reduce(
            (sum, invoice) =>
                sum + toNumber(invoice?.outstandingAmount),
            0
        );

        const totalAmount = invoices.reduce(
            (sum, invoice) =>
                sum + toNumber(invoice?.totalAmount),
            0
        );

        return {
            totalInvoices,
            issuedInvoices,
            totalAmount,
            paidAmount,
            outstandingAmount,
        };
    }, [invoices]);

    // ============================================================
    // FILTERED INVOICES
    // ============================================================

    const filteredInvoices = useMemo(() => {
        const query = search.trim().toLowerCase();

        return invoices.filter((invoice) => {
            const invoiceNumber =
                String(invoice?.invoiceNumber || "").toLowerCase();

            const jobCardNumber =
                String(invoice?.jobCardNumber || "").toLowerCase();

            const customerName =
                String(invoice?.customerName || "").toLowerCase();

            const vehicleNumber =
                String(invoice?.vehicleNumber || "").toLowerCase();

            const matchesSearch =
                !query ||
                invoiceNumber.includes(query) ||
                jobCardNumber.includes(query) ||
                customerName.includes(query) ||
                vehicleNumber.includes(query);

            const status =
                getInvoiceStatus(invoice);

            const matchesStatus =
                statusFilter === "ALL" ||
                status === statusFilter;

            const paymentStatus =
                getPaymentStatus(invoice);

            const matchesPayment =
                paymentFilter === "ALL" ||
                paymentStatus === paymentFilter;

            return (
                matchesSearch &&
                matchesStatus &&
                matchesPayment
            );
        });
    }, [
        invoices,
        search,
        statusFilter,
        paymentFilter,
    ]);

    // ============================================================
    // JOB CARD WITHOUT INVOICE
    // ============================================================

    const availableJobCards = useMemo(() => {
        const invoiceJobCardIds = new Set(
            invoices
                .map((invoice) => invoice?.jobCardId)
                .filter(Boolean)
                .map(Number)
        );

        return jobCards.filter(
            (jobCard) =>
                jobCard?.id &&
                !invoiceJobCardIds.has(Number(jobCard.id))
        );
    }, [jobCards, invoices]);

    // ============================================================
    // RESET CREATE FORM
    // ============================================================

    const resetCreateForm = () => {
        setSelectedJobCardId("");
        setDiscountAmount("");
        setNotes("");
        setInvoiceSource("JOB_CARD");
    };

    // ============================================================
    // OPEN CREATE MODAL
    // ============================================================

    const openCreateModal = async () => {
        resetCreateForm();

        setShowCreateModal(true);

        if (jobCards.length === 0) {
            await loadJobCards();
        }
    };

    // ============================================================
    // CLOSE CREATE MODAL
    // ============================================================

    const closeCreateModal = () => {
        if (saving) return;

        setShowCreateModal(false);
        resetCreateForm();
    };

    // ============================================================
    // SELECTED JOB CARD
    // ============================================================

    const selectedJobCard = useMemo(() => {
        if (!selectedJobCardId) {
            return null;
        }

        return jobCards.find(
            (jobCard) =>
                Number(jobCard?.id) ===
                Number(selectedJobCardId)
        );
    }, [jobCards, selectedJobCardId]);

    // ============================================================
    // CREATE INVOICE
    // ============================================================

    const handleCreateInvoice = async (event) => {
        event.preventDefault();

        if (!selectedJobCardId) {
            setErrorMessage("Please select a job card.");
            return;
        }

        try {
            setSaving(true);
            setErrorMessage("");
            setSuccessMessage("");

            const discount =
                discountAmount === ""
                    ? 0
                    : toNumber(discountAmount);

            const payload = {
                jobCardId: Number(selectedJobCardId),
                discountAmount: discount,
                notes: notes.trim() || null,
            };

            const createdInvoice =
                await invoiceService.createInvoice(payload);

            setShowCreateModal(false);

            resetCreateForm();

            await loadInvoices();

            setSuccessMessage(
                `Invoice ${
                    createdInvoice?.invoiceNumber ||
                    ""
                } created successfully.`
            );
        } catch (error) {
            console.error(
                "Failed to create invoice:",
                error
            );

            setErrorMessage(
                error?.response?.data?.message ||
                "Unable to create invoice."
            );
        } finally {
            setSaving(false);
        }
    };

    // ============================================================
    // VIEW INVOICE
    // ============================================================

    const handleViewInvoice = async (invoice) => {
        try {
            setActionLoading(`view-${invoice.id}`);
            setErrorMessage("");

            const data =
                await invoiceService.getInvoiceById(
                    invoice.id
                );

            setSelectedInvoice(data);
            setShowDetails(true);
        } catch (error) {
            console.error(
                "Failed to load invoice:",
                error
            );

            setErrorMessage(
                error?.response?.data?.message ||
                "Unable to load invoice details."
            );
        } finally {
            setActionLoading(null);
        }
    };

    // ============================================================
    // DOWNLOAD INVOICE AS PDF
    // ============================================================

    const handleDownloadInvoicePdf = async (invoice) => {
        if (!invoice?.id) {
            setErrorMessage("Invoice information is missing. Unable to create PDF.");
            return;
        }

        try {
            setPdfLoadingId(invoice.id);
            setErrorMessage("");
            setSuccessMessage("");

            // Fetch the complete invoice so line items and totals are included.
            const response = await invoiceService.getInvoiceById(invoice.id);

            // Support services that return either the invoice directly or an
            // Axios/API wrapper such as { data: invoice } / { data: { data: invoice } }.
            const fullInvoice = response?.data?.data
                ? response.data.data
                : response?.data && (response.data.id || response.data.invoiceNumber || response.data.items)
                    ? response.data
                    : response;

            if (typeof downloadInvoicePdf !== "function") {
                throw new Error(
                    "Invoice PDF service is not loaded correctly. Check invoicePdfService.js default export."
                );
            }

            if (!fullInvoice || typeof fullInvoice !== "object") {
                throw new Error("The invoice details returned by the server are invalid.");
            }

            downloadInvoicePdf(fullInvoice);

            setSuccessMessage(
                `Invoice ${fullInvoice?.invoiceNumber || invoice.invoiceNumber || invoice.id} downloaded as PDF.`
            );
        } catch (error) {
            console.error("Failed to download invoice PDF:", error);
            setErrorMessage(
                error?.response?.data?.message ||
                error?.response?.data?.error ||
                error?.message ||
                "Unable to download invoice PDF."
            );
        } finally {
            setPdfLoadingId(null);
        }
    };

    // ============================================================
    // ISSUE INVOICE
    // ============================================================

    const handleIssueInvoice = async (invoice) => {
        const confirmed = window.confirm(
            `Issue invoice ${invoice.invoiceNumber}?`
        );

        if (!confirmed) return;

        try {
            setActionLoading(`issue-${invoice.id}`);
            setErrorMessage("");
            setSuccessMessage("");

            await invoiceService.issueInvoice(
                invoice.id
            );

            await loadInvoices();

            setSuccessMessage(
                `Invoice ${invoice.invoiceNumber} issued successfully.`
            );
        } catch (error) {
            console.error(
                "Failed to issue invoice:",
                error
            );

            setErrorMessage(
                error?.response?.data?.message ||
                "Unable to issue invoice."
            );
        } finally {
            setActionLoading(null);
        }
    };

    // ============================================================
    // CANCEL INVOICE
    // ============================================================

    const handleCancelInvoice = async (invoice) => {
        const confirmed = window.confirm(
            `Cancel invoice ${invoice.invoiceNumber}?`
        );

        if (!confirmed) return;

        try {
            setActionLoading(`cancel-${invoice.id}`);
            setErrorMessage("");
            setSuccessMessage("");

            await invoiceService.cancelInvoice(
                invoice.id
            );

            await loadInvoices();

            setSuccessMessage(
                `Invoice ${invoice.invoiceNumber} cancelled.`
            );
        } catch (error) {
            console.error(
                "Failed to cancel invoice:",
                error
            );

            setErrorMessage(
                error?.response?.data?.message ||
                "Unable to cancel invoice."
            );
        } finally {
            setActionLoading(null);
        }
    };

    // ============================================================
    // REFRESH
    // ============================================================

    const handleRefresh = async () => {
        await loadInvoices();
    };

    // ============================================================
    // RENDER
    // ============================================================

    return (
        <div className="invoices-page">

            {/* ==================================================
                HEADER
            ================================================== */}

            <div className="invoices-header">

                <div>
                    <div className="invoices-breadcrumb">
                        DR.CARCARE
                        <span>/</span>
                        Billing
                        <span>/</span>
                        Invoices
                    </div>

                    <h1>Invoices</h1>

                    <p>
                        Create and manage customer invoices
                        from job cards, estimates and actual
                        garage work.
                    </p>
                </div>

                <button
                    className="invoices-primary-btn"
                    onClick={openCreateModal}
                >
                    <Plus size={17} />
                    Create Invoice
                </button>

            </div>


            {/* ==================================================
                MESSAGES
            ================================================== */}

            {errorMessage && (
                <div
                    style={{
                        marginBottom: "15px",
                        padding: "12px 15px",
                        borderRadius: "9px",
                        background: "rgba(220,38,38,.08)",
                        color: "var(--danger)",
                        border: "1px solid rgba(220,38,38,.2)",
                        fontSize: "13px",
                    }}
                >
                    {errorMessage}
                </div>
            )}

            {successMessage && (
                <div
                    style={{
                        marginBottom: "15px",
                        padding: "12px 15px",
                        borderRadius: "9px",
                        background: "rgba(22,163,74,.08)",
                        color: "var(--success)",
                        border: "1px solid rgba(22,163,74,.2)",
                        fontSize: "13px",
                    }}
                >
                    {successMessage}
                </div>
            )}


            {/* ==================================================
                STATISTICS
            ================================================== */}

            <div className="invoices-stats">

                <div className="invoice-stat">
                    <div className="invoice-stat-icon blue">
                        <FileText size={19} />
                    </div>

                    <span>Total Invoices</span>

                    <strong>
                        {statistics.totalInvoices}
                    </strong>
                </div>


                <div className="invoice-stat">
                    <div className="invoice-stat-icon purple">
                        <Receipt size={19} />
                    </div>

                    <span>Issued Invoices</span>

                    <strong>
                        {statistics.issuedInvoices}
                    </strong>
                </div>


                <div className="invoice-stat">
                    <div className="invoice-stat-icon green">
                        <IndianRupee size={19} />
                    </div>

                    <span>Total Billed</span>

                    <strong>
                        {formatCurrency(
                            statistics.totalAmount
                        )}
                    </strong>
                </div>


                <div className="invoice-stat">
                    <div className="invoice-stat-icon green">
                        <CreditCard size={19} />
                    </div>

                    <span>Total Paid</span>

                    <strong>
                        {formatCurrency(
                            statistics.paidAmount
                        )}
                    </strong>
                </div>


                <div className="invoice-stat">
                    <div className="invoice-stat-icon orange">
                        <Clock size={19} />
                    </div>

                    <span>Outstanding</span>

                    <strong>
                        {formatCurrency(
                            statistics.outstandingAmount
                        )}
                    </strong>
                </div>

            </div>


            {/* ==================================================
                MAIN PANEL
            ================================================== */}

            <div className="invoices-panel">

                <div className="invoices-panel-header">
                    <h2>Customer Invoices</h2>

                    <p>
                        Track estimates, actual service charges,
                        parts and customer payments.
                    </p>
                </div>


                {/* ==================================================
                    FILTERS
                ================================================== */}

                <div className="invoices-filters">

                    <div className="invoices-search">
                        <Search size={16} />

                        <input
                            type="text"
                            placeholder="Search invoice, job card, customer or vehicle..."
                            value={search}
                            onChange={(event) =>
                                setSearch(
                                    event.target.value
                                )
                            }
                        />

                        {search && (
                            <button
                                type="button"
                                onClick={() =>
                                    setSearch("")
                                }
                            >
                                <X size={15} />
                            </button>
                        )}
                    </div>


                    <select
                        value={statusFilter}
                        onChange={(event) =>
                            setStatusFilter(
                                event.target.value
                            )
                        }
                    >
                        <option value="ALL">
                            All Invoice Status
                        </option>

                        <option value="DRAFT">
                            Draft
                        </option>

                        <option value="ISSUED">
                            Issued
                        </option>

                        <option value="PAID">
                            Paid
                        </option>

                        <option value="CANCELLED">
                            Cancelled
                        </option>
                    </select>


                    <select
                        value={paymentFilter}
                        onChange={(event) =>
                            setPaymentFilter(
                                event.target.value
                            )
                        }
                    >
                        <option value="ALL">
                            All Payment Status
                        </option>

                        <option value="PAID">
                            Paid
                        </option>

                        <option value="PARTIALLY_PAID">
                            Partially Paid
                        </option>

                        <option value="UNPAID">
                            Unpaid
                        </option>
                    </select>

                </div>


                {/* ==================================================
                    TABLE
                ================================================== */}

                <div className="invoices-table-wrap">

                    {loading ? (
                        <div className="invoices-empty">
                            <RefreshCw
                                size={30}
                                style={{
                                    animation:
                                        "spin 1s linear infinite",
                                }}
                            />

                            <h3>
                                Loading invoices...
                            </h3>

                            <p>
                                Please wait while invoice
                                records are loaded.
                            </p>
                        </div>
                    ) : filteredInvoices.length === 0 ? (
                        <div className="invoices-empty">

                            <FileText size={40} />

                            <h3>
                                No invoices found
                            </h3>

                            <p>
                                Create an invoice from a job
                                card to start billing.
                            </p>

                        </div>
                    ) : (
                        <table className="invoices-table">

                            <thead>
                            <tr>
                                <th>Invoice</th>
                                <th>Job Card</th>
                                <th>Customer / Vehicle</th>
                                <th>Date</th>
                                <th>Items</th>
                                <th>Total</th>
                                <th>Paid</th>
                                <th>Balance</th>
                                <th>Status</th>
                                <th>Payment</th>
                                <th>Actions</th>
                            </tr>
                            </thead>


                            <tbody>

                            {filteredInvoices.map(
                                (invoice) => {

                                    const invoiceStatus =
                                        getInvoiceStatus(
                                            invoice
                                        );

                                    const paymentStatus =
                                        getPaymentStatus(
                                            invoice
                                        );

                                    const itemCount =
                                        Array.isArray(
                                            invoice?.items
                                        )
                                            ? invoice.items.length
                                            : toNumber(
                                                invoice?.itemCount
                                            );

                                    return (
                                        <tr
                                            key={
                                                invoice.id
                                            }
                                        >

                                            {/* Invoice */}

                                            <td>
                                                <strong>
                                                    {
                                                        invoice.invoiceNumber ||
                                                        `INV-${invoice.id}`
                                                    }
                                                </strong>
                                            </td>


                                            {/* Job Card */}

                                            <td>
                                                <strong>
                                                    {
                                                        invoice.jobCardNumber ||
                                                        `JC-${invoice.jobCardId || "-"}`
                                                    }
                                                </strong>
                                            </td>


                                            {/* Customer / Vehicle */}

                                            <td>
                                                <div className="invoice-vehicle">

                                                    <strong>
                                                        {
                                                            invoice.customerName ||
                                                            "Customer"
                                                        }
                                                    </strong>

                                                    <span>
                                                            {
                                                                invoice.vehicleNumber ||
                                                                invoice.vehicleMake ||
                                                                "Vehicle"
                                                            }

                                                        {invoice.vehicleModel
                                                            ? ` • ${invoice.vehicleModel}`
                                                            : ""}
                                                        </span>

                                                </div>
                                            </td>


                                            {/* Date */}

                                            <td>
                                                {formatDate(
                                                    invoice.invoiceDate ||
                                                    invoice.createdAt
                                                )}
                                            </td>


                                            {/* Items */}

                                            <td>
                                                {itemCount}
                                            </td>


                                            {/* Total */}

                                            <td>
                                                <strong>
                                                    {formatCurrency(
                                                        invoice.totalAmount
                                                    )}
                                                </strong>
                                            </td>


                                            {/* Paid */}

                                            <td>
                                                    <span className="invoice-paid">
                                                        {formatCurrency(
                                                            invoice.paidAmount
                                                        )}
                                                    </span>
                                            </td>


                                            {/* Balance */}

                                            <td>
                                                    <span className="invoice-balance">
                                                        {formatCurrency(
                                                            invoice.outstandingAmount
                                                        )}
                                                    </span>
                                            </td>


                                            {/* Invoice Status */}

                                            <td>
                                                    <span
                                                        className={`invoice-status ${
                                                            invoiceStatus.toLowerCase()
                                                        }`}
                                                    >
                                                        {getStatusLabel(
                                                            invoiceStatus
                                                        )}
                                                    </span>
                                            </td>


                                            {/* Payment */}

                                            <td>
                                                    <span
                                                        className={`invoice-status ${
                                                            paymentStatus.toLowerCase()
                                                        }`}
                                                    >
                                                        {getPaymentLabel(
                                                            paymentStatus
                                                        )}
                                                    </span>
                                            </td>


                                            {/* Actions */}

                                            <td>

                                                <div className="invoice-actions">

                                                    {/* View */}

                                                    <button
                                                        type="button"
                                                        title="View Invoice"
                                                        onClick={() =>
                                                            handleViewInvoice(
                                                                invoice
                                                            )
                                                        }
                                                        disabled={
                                                            actionLoading ===
                                                            `view-${invoice.id}`
                                                        }
                                                    >
                                                        <Eye
                                                            size={15}
                                                        />
                                                    </button>


                                                    {/* Download PDF */}

                                                    <button
                                                        type="button"
                                                        title="Download Invoice PDF"
                                                        aria-label={`Download invoice ${invoice.invoiceNumber || invoice.id} as PDF`}
                                                        onClick={() => handleDownloadInvoicePdf(invoice)}
                                                        disabled={pdfLoadingId === invoice.id}
                                                    >
                                                        {pdfLoadingId === invoice.id ? (
                                                            <RefreshCw size={15} className="invoice-pdf-spinning" />
                                                        ) : (
                                                            <Download size={15} />
                                                        )}
                                                    </button>


                                                    {/* Issue */}

                                                    {invoiceStatus ===
                                                        "DRAFT" && (
                                                            <button
                                                                type="button"
                                                                title="Issue Invoice"
                                                                onClick={() =>
                                                                    handleIssueInvoice(
                                                                        invoice
                                                                    )
                                                                }
                                                                disabled={
                                                                    actionLoading ===
                                                                    `issue-${invoice.id}`
                                                                }
                                                            >
                                                                <Send
                                                                    size={
                                                                        15
                                                                    }
                                                                />
                                                            </button>
                                                        )}


                                                    {/* Cancel */}

                                                    {invoiceStatus !==
                                                        "CANCELLED" &&
                                                        invoiceStatus !==
                                                        "PAID" && (
                                                            <button
                                                                type="button"
                                                                title="Cancel Invoice"
                                                                onClick={() =>
                                                                    handleCancelInvoice(
                                                                        invoice
                                                                    )
                                                                }
                                                                disabled={
                                                                    actionLoading ===
                                                                    `cancel-${invoice.id}`
                                                                }
                                                            >
                                                                <Ban
                                                                    size={
                                                                        15
                                                                    }
                                                                />
                                                            </button>
                                                        )}

                                                </div>

                                            </td>

                                        </tr>
                                    );
                                }
                            )}

                            </tbody>

                        </table>
                    )}

                </div>

            </div>


            {/* ==================================================
                CREATE INVOICE MODAL
            ================================================== */}

            {showCreateModal && (
                <div
                    className="invoices-modal-overlay"
                    onMouseDown={(event) => {
                        if (
                            event.target ===
                            event.currentTarget
                        ) {
                            closeCreateModal();
                        }
                    }}
                >

                    <div className="invoices-modal">

                        <div className="invoices-modal-header">

                            <div>
                                <span>
                                    CUSTOMER BILLING
                                </span>

                                <h2>
                                    Create Invoice
                                </h2>
                            </div>

                            <button
                                type="button"
                                className="invoices-close"
                                onClick={
                                    closeCreateModal
                                }
                            >
                                <X size={17} />
                            </button>

                        </div>


                        <form
                            onSubmit={
                                handleCreateInvoice
                            }
                        >

                            {/* Invoice Source */}

                            <div
                                style={{
                                    marginBottom: "18px",
                                }}
                            >
                                <label
                                    style={{
                                        display: "flex",
                                        flexDirection:
                                            "column",
                                        gap: "7px",
                                        fontSize: "12px",
                                        fontWeight: 700,
                                    }}
                                >
                                    Invoice Source

                                    <div
                                        style={{
                                            display: "grid",
                                            gridTemplateColumns:
                                                "1fr 1fr",
                                            gap: "10px",
                                        }}
                                    >

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setInvoiceSource(
                                                    "JOB_CARD"
                                                )
                                            }
                                            style={{
                                                minHeight:
                                                    "55px",
                                                border:
                                                    invoiceSource ===
                                                    "JOB_CARD"
                                                        ? "2px solid var(--primary)"
                                                        : "1px solid var(--border)",
                                                borderRadius:
                                                    "9px",
                                                background:
                                                    "var(--background)",
                                                color:
                                                    "var(--text)",
                                                textAlign:
                                                    "left",
                                                padding:
                                                    "10px 12px",
                                                cursor:
                                                    "pointer",
                                            }}
                                        >
                                            <strong>
                                                <Receipt
                                                    size={
                                                        15
                                                    }
                                                    style={{
                                                        verticalAlign:
                                                            "middle",
                                                        marginRight:
                                                            "6px",
                                                    }}
                                                />
                                                Job Card / Estimate
                                            </strong>

                                            <div
                                                style={{
                                                    marginTop:
                                                        "4px",
                                                    fontSize:
                                                        "10px",
                                                    color:
                                                        "var(--text-secondary)",
                                                    fontWeight:
                                                        400,
                                                }}
                                            >
                                                Customer service
                                                invoice
                                            </div>
                                        </button>


                                        <button
                                            type="button"
                                            onClick={() =>
                                                setInvoiceSource(
                                                    "PURCHASE"
                                                )
                                            }
                                            style={{
                                                minHeight:
                                                    "55px",
                                                border:
                                                    invoiceSource ===
                                                    "PURCHASE"
                                                        ? "2px solid var(--primary)"
                                                        : "1px solid var(--border)",
                                                borderRadius:
                                                    "9px",
                                                background:
                                                    "var(--background)",
                                                color:
                                                    "var(--text)",
                                                textAlign:
                                                    "left",
                                                padding:
                                                    "10px 12px",
                                                cursor:
                                                    "pointer",
                                            }}
                                        >
                                            <strong>
                                                <ShoppingCart
                                                    size={
                                                        15
                                                    }
                                                    style={{
                                                        verticalAlign:
                                                            "middle",
                                                        marginRight:
                                                            "6px",
                                                    }}
                                                />
                                                Purchase
                                            </strong>

                                            <div
                                                style={{
                                                    marginTop:
                                                        "4px",
                                                    fontSize:
                                                        "10px",
                                                    color:
                                                        "var(--text-secondary)",
                                                    fontWeight:
                                                        400,
                                                }}
                                            >
                                                Garage purchase
                                                record
                                            </div>
                                        </button>

                                    </div>
                                </label>
                            </div>


                            {/* Job Card Source */}

                            {invoiceSource ===
                                "JOB_CARD" && (
                                    <>

                                        <div className="invoices-form-grid">

                                            <label>
                                                Job Card

                                                <select
                                                    value={
                                                        selectedJobCardId
                                                    }
                                                    onChange={(
                                                        event
                                                    ) =>
                                                        setSelectedJobCardId(
                                                            event
                                                                .target
                                                                .value
                                                        )
                                                    }
                                                    required
                                                    style={{
                                                        height:
                                                            "41px",
                                                        border:
                                                            "1px solid var(--border)",
                                                        borderRadius:
                                                            "8px",
                                                        background:
                                                            "var(--background)",
                                                        color:
                                                            "var(--text)",
                                                        padding:
                                                            "0 10px",
                                                    }}
                                                >

                                                    <option value="">
                                                        {jobCardsLoading
                                                            ? "Loading job cards..."
                                                            : "Select Job Card"}
                                                    </option>

                                                    {availableJobCards.map(
                                                        (
                                                            jobCard
                                                        ) => (
                                                            <option
                                                                key={
                                                                    jobCard.id
                                                                }
                                                                value={
                                                                    jobCard.id
                                                                }
                                                            >
                                                                {jobCard.jobCardNumber ||
                                                                    `JC-${jobCard.id}`}
                                                                {" — "}
                                                                {jobCard.customerName ||
                                                                    "Customer"}
                                                                {" — "}
                                                                {jobCard.vehicleNumber ||
                                                                    "Vehicle"}
                                                            </option>
                                                        )
                                                    )}

                                                </select>
                                            </label>


                                            <label>
                                                Discount

                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    value={
                                                        discountAmount
                                                    }
                                                    onChange={(
                                                        event
                                                    ) =>
                                                        setDiscountAmount(
                                                            event
                                                                .target
                                                                .value
                                                        )
                                                    }
                                                    placeholder="0.00"
                                                />
                                            </label>

                                        </div>


                                        {/* Selected Job Card */}

                                        {selectedJobCard && (
                                            <div className="invoice-total-preview">

                                                <div>
                                                <span>
                                                    Job Card
                                                </span>

                                                    <strong>
                                                        {
                                                            selectedJobCard.jobCardNumber ||
                                                            `JC-${selectedJobCard.id}`
                                                        }
                                                    </strong>
                                                </div>


                                                <div>
                                                <span>
                                                    Customer
                                                </span>

                                                    <strong>
                                                        {
                                                            selectedJobCard.customerName ||
                                                            "Customer"
                                                        }
                                                    </strong>
                                                </div>


                                                <div>
                                                <span>
                                                    Vehicle
                                                </span>

                                                    <strong>
                                                        {
                                                            selectedJobCard.vehicleNumber ||
                                                            "Vehicle"
                                                        }
                                                    </strong>
                                                </div>

                                            </div>
                                        )}

                                    </>
                                )}


                            {/* Purchase source */}

                            {invoiceSource ===
                                "PURCHASE" && (
                                    <div
                                        style={{
                                            padding:
                                                "15px",
                                            border:
                                                "1px solid var(--border)",
                                            borderRadius:
                                                "9px",
                                            background:
                                                "var(--background)",
                                            marginBottom:
                                                "18px",
                                        }}
                                    >
                                        <div
                                            style={{
                                                display:
                                                    "flex",
                                                alignItems:
                                                    "center",
                                                gap: "9px",
                                                marginBottom:
                                                    "8px",
                                            }}
                                        >
                                            <ShoppingCart
                                                size={17}
                                            />

                                            <strong>
                                                Purchase
                                                Information
                                            </strong>
                                        </div>

                                        <p
                                            style={{
                                                margin: 0,
                                                fontSize:
                                                    "12px",
                                                color:
                                                    "var(--text-secondary)",
                                            }}
                                        >
                                            Purchases are
                                            maintained through
                                            the Purchase and
                                            Inventory modules.
                                            Customer invoices
                                            should be created
                                            from a Job Card.
                                        </p>

                                        <div
                                            style={{
                                                marginTop:
                                                    "12px",
                                                fontSize:
                                                    "11px",
                                                color:
                                                    "var(--text-secondary)",
                                            }}
                                        >
                                            Recorded purchases:{" "}
                                            <strong>
                                                {
                                                    purchases.length
                                                }
                                            </strong>

                                            {" • "}

                                            Inventory items:{" "}
                                            <strong>
                                                {
                                                    inventoryItems.length
                                                }
                                            </strong>
                                        </div>
                                    </div>
                                )}


                            {/* Notes */}

                            <div
                                style={{
                                    marginTop: "15px",
                                }}
                            >
                                <label
                                    style={{
                                        display: "flex",
                                        flexDirection:
                                            "column",
                                        gap: "7px",
                                        fontSize: "12px",
                                        fontWeight: 700,
                                    }}
                                >
                                    Notes

                                    <textarea
                                        value={notes}
                                        onChange={(event) =>
                                            setNotes(
                                                event.target
                                                    .value
                                            )
                                        }
                                        maxLength={500}
                                        rows={4}
                                        placeholder="Optional invoice notes..."
                                        style={{
                                            border:
                                                "1px solid var(--border)",
                                            borderRadius:
                                                "8px",
                                            background:
                                                "var(--background)",
                                            color:
                                                "var(--text)",
                                            padding:
                                                "10px",
                                            resize:
                                                "vertical",
                                            outline: 0,
                                        }}
                                    />
                                </label>
                            </div>


                            {/* Preview */}

                            <div className="invoice-total-preview">

                                <div>
                                    <span>
                                        Billing Source
                                    </span>

                                    <strong>
                                        {invoiceSource ===
                                        "JOB_CARD"
                                            ? "Job Card / Estimate"
                                            : "Purchase Record"}
                                    </strong>
                                </div>

                                <div>
                                    <span>
                                        Discount
                                    </span>

                                    <strong>
                                        {formatCurrency(
                                            discountAmount
                                        )}
                                    </strong>
                                </div>

                            </div>


                            {/* Footer */}

                            <div className="invoices-modal-footer">

                                <button
                                    type="button"
                                    className="invoices-secondary-btn"
                                    onClick={
                                        closeCreateModal
                                    }
                                    disabled={saving}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="invoices-primary-btn"
                                    disabled={
                                        saving ||
                                        !selectedJobCardId ||
                                        invoiceSource !==
                                        "JOB_CARD"
                                    }
                                >
                                    {saving ? (
                                        <>
                                            <RefreshCw
                                                size={15}
                                            />
                                            Creating...
                                        </>
                                    ) : (
                                        <>
                                            <Plus
                                                size={15}
                                            />
                                            Create Invoice
                                        </>
                                    )}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>
            )}


            {/* ==================================================
                INVOICE DETAILS MODAL
            ================================================== */}

            {showDetails &&
                selectedInvoice && (
                    <div
                        className="invoices-modal-overlay"
                        onMouseDown={(event) => {
                            if (
                                event.target ===
                                event.currentTarget
                            ) {
                                setShowDetails(false);
                                setSelectedInvoice(null);
                            }
                        }}
                    >

                        <div className="invoices-modal large">

                            <div className="invoices-modal-header">

                                <div>
                                    <span>
                                        INVOICE DETAILS
                                    </span>

                                    <h2>
                                        {
                                            selectedInvoice.invoiceNumber ||
                                            `INV-${selectedInvoice.id}`
                                        }
                                    </h2>
                                </div>

                                <button
                                    type="button"
                                    className="invoices-close"
                                    onClick={() => {
                                        setShowDetails(
                                            false
                                        );
                                        setSelectedInvoice(
                                            null
                                        );
                                    }}
                                >
                                    <X size={17} />
                                </button>

                            </div>


                            {/* Invoice top */}

                            <div className="invoice-detail-top">

                                <Receipt size={22} />

                                <div>
                                    <strong>
                                        {
                                            selectedInvoice.customerName ||
                                            "Customer"
                                        }
                                    </strong>

                                    <span>
                                        {
                                            selectedInvoice.vehicleNumber ||
                                            "Vehicle"
                                        }

                                        {" • "}

                                        {
                                            selectedInvoice.jobCardNumber ||
                                            `JC-${selectedInvoice.jobCardId || "-"}`
                                        }
                                    </span>
                                </div>

                            </div>


                            {/* Details */}

                            <div className="invoice-detail-grid">

                                <div>
                                    <span>
                                        Invoice Date
                                    </span>

                                    <strong>
                                        {formatDate(
                                            selectedInvoice.invoiceDate ||
                                            selectedInvoice.createdAt
                                        )}
                                    </strong>
                                </div>


                                <div>
                                    <span>
                                        Status
                                    </span>

                                    <strong>
                                        {getStatusLabel(
                                            getInvoiceStatus(
                                                selectedInvoice
                                            )
                                        )}
                                    </strong>
                                </div>


                                <div>
                                    <span>
                                        Job Card
                                    </span>

                                    <strong>
                                        {
                                            selectedInvoice.jobCardNumber ||
                                            `JC-${selectedInvoice.jobCardId || "-"}`
                                        }
                                    </strong>
                                </div>


                                <div>
                                    <span>
                                        Created
                                    </span>

                                    <strong>
                                        {formatDateTime(
                                            selectedInvoice.createdAt
                                        )}
                                    </strong>
                                </div>

                            </div>


                            {/* Items */}

                            <div
                                style={{
                                    padding:
                                        "0 20px 20px",
                                }}
                            >

                                <h3
                                    style={{
                                        fontSize:
                                            "14px",
                                        margin:
                                            "0 0 10px",
                                    }}
                                >
                                    Invoice Items
                                </h3>


                                <div
                                    style={{
                                        overflowX:
                                            "auto",
                                        border:
                                            "1px solid var(--border)",
                                        borderRadius:
                                            "9px",
                                    }}
                                >

                                    <table
                                        className="invoices-table"
                                        style={{
                                            minWidth:
                                                "700px",
                                        }}
                                    >

                                        <thead>
                                        <tr>
                                            <th>
                                                Type
                                            </th>

                                            <th>
                                                Description
                                            </th>

                                            <th>
                                                Qty
                                            </th>

                                            <th>
                                                Unit Price
                                            </th>

                                            <th>
                                                Tax
                                            </th>

                                            <th>
                                                Total
                                            </th>
                                        </tr>
                                        </thead>


                                        <tbody>

                                        {Array.isArray(
                                            selectedInvoice.items
                                        ) &&
                                        selectedInvoice
                                            .items
                                            .length >
                                        0 ? (
                                            selectedInvoice.items.map(
                                                (
                                                    item
                                                ) => (
                                                    <tr
                                                        key={
                                                            item.id
                                                        }
                                                    >

                                                        <td>
                                                            {
                                                                getItemTypeLabel(
                                                                    item.itemType
                                                                )
                                                            }
                                                        </td>

                                                        <td>
                                                            <strong>
                                                                {
                                                                    item.description
                                                                }
                                                            </strong>
                                                        </td>

                                                        <td>
                                                            {
                                                                item.quantity
                                                            }
                                                        </td>

                                                        <td>
                                                            {formatCurrency(
                                                                item.unitPrice
                                                            )}
                                                        </td>

                                                        <td>
                                                            {formatCurrency(
                                                                item.taxAmount
                                                            )}
                                                        </td>

                                                        <td>
                                                            <strong>
                                                                {formatCurrency(
                                                                    item.totalAmount
                                                                )}
                                                            </strong>
                                                        </td>

                                                    </tr>
                                                )
                                            )
                                        ) : (
                                            <tr>
                                                <td
                                                    colSpan={
                                                        6
                                                    }
                                                    style={{
                                                        textAlign:
                                                            "center",
                                                    }}
                                                >
                                                    No invoice
                                                    items found.
                                                </td>
                                            </tr>
                                        )}

                                        </tbody>

                                    </table>

                                </div>

                            </div>


                            {/* Totals */}

                            <div
                                style={{
                                    padding:
                                        "0 20px 20px",
                                }}
                            >

                                <div
                                    style={{
                                        marginLeft:
                                            "auto",
                                        maxWidth:
                                            "340px",
                                        border:
                                            "1px solid var(--border)",
                                        borderRadius:
                                            "10px",
                                        padding:
                                            "15px",
                                        background:
                                            "var(--background)",
                                    }}
                                >

                                    <div
                                        style={{
                                            display:
                                                "flex",
                                            justifyContent:
                                                "space-between",
                                            marginBottom:
                                                "8px",
                                            fontSize:
                                                "12px",
                                        }}
                                    >
                                        <span>
                                            Subtotal
                                        </span>

                                        <strong>
                                            {formatCurrency(
                                                selectedInvoice.subtotal
                                            )}
                                        </strong>
                                    </div>


                                    <div
                                        style={{
                                            display:
                                                "flex",
                                            justifyContent:
                                                "space-between",
                                            marginBottom:
                                                "8px",
                                            fontSize:
                                                "12px",
                                        }}
                                    >
                                        <span>
                                            Discount
                                        </span>

                                        <strong>
                                            -{" "}
                                            {formatCurrency(
                                                selectedInvoice.discountAmount
                                            )}
                                        </strong>
                                    </div>


                                    <div
                                        style={{
                                            display:
                                                "flex",
                                            justifyContent:
                                                "space-between",
                                            marginBottom:
                                                "8px",
                                            fontSize:
                                                "12px",
                                        }}
                                    >
                                        <span>
                                            Tax
                                        </span>

                                        <strong>
                                            {formatCurrency(
                                                selectedInvoice.taxAmount
                                            )}
                                        </strong>
                                    </div>


                                    <div
                                        style={{
                                            display:
                                                "flex",
                                            justifyContent:
                                                "space-between",
                                            paddingTop:
                                                "10px",
                                            borderTop:
                                                "1px solid var(--border)",
                                            fontSize:
                                                "15px",
                                        }}
                                    >
                                        <strong>
                                            Total
                                        </strong>

                                        <strong>
                                            {formatCurrency(
                                                selectedInvoice.totalAmount
                                            )}
                                        </strong>
                                    </div>


                                    <div
                                        style={{
                                            display:
                                                "flex",
                                            justifyContent:
                                                "space-between",
                                            marginTop:
                                                "10px",
                                            fontSize:
                                                "12px",
                                        }}
                                    >
                                        <span>
                                            Paid
                                        </span>

                                        <strong className="invoice-paid">
                                            {formatCurrency(
                                                selectedInvoice.paidAmount
                                            )}
                                        </strong>
                                    </div>


                                    <div
                                        style={{
                                            display:
                                                "flex",
                                            justifyContent:
                                                "space-between",
                                            marginTop:
                                                "7px",
                                            fontSize:
                                                "12px",
                                        }}
                                    >
                                        <span>
                                            Outstanding
                                        </span>

                                        <strong className="invoice-balance">
                                            {formatCurrency(
                                                selectedInvoice.outstandingAmount
                                            )}
                                        </strong>
                                    </div>

                                </div>

                            </div>


                            {/* Notes */}

                            {selectedInvoice.notes && (
                                <div
                                    style={{
                                        margin:
                                            "0 20px 20px",
                                        padding:
                                            "12px",
                                        border:
                                            "1px solid var(--border)",
                                        borderRadius:
                                            "9px",
                                        background:
                                            "var(--background)",
                                    }}
                                >
                                    <span
                                        style={{
                                            display:
                                                "block",
                                            fontSize:
                                                "10px",
                                            color:
                                                "var(--text-secondary)",
                                            marginBottom:
                                                "5px",
                                        }}
                                    >
                                        NOTES
                                    </span>

                                    <div
                                        style={{
                                            fontSize:
                                                "12px",
                                        }}
                                    >
                                        {
                                            selectedInvoice.notes
                                        }
                                    </div>
                                </div>
                            )}


                            {/* Footer */}

                            <div className="invoices-modal-footer">

                                <button
                                    type="button"
                                    className="invoices-secondary-btn"
                                    onClick={() => {
                                        setShowDetails(
                                            false
                                        );
                                        setSelectedInvoice(
                                            null
                                        );
                                    }}
                                >
                                    Close
                                </button>

                                <button
                                    type="button"
                                    className="invoices-secondary-btn"
                                    onClick={() => handleDownloadInvoicePdf(selectedInvoice)}
                                    disabled={pdfLoadingId === selectedInvoice.id}
                                >
                                    {pdfLoadingId === selectedInvoice.id ? (
                                        <RefreshCw size={15} className="invoice-pdf-spinning" />
                                    ) : (
                                        <Download size={15} />
                                    )}
                                    Download PDF
                                </button>

                                {getInvoiceStatus(
                                    selectedInvoice
                                ) === "DRAFT" && (
                                    <button
                                        type="button"
                                        className="invoices-primary-btn"
                                        onClick={() =>
                                            handleIssueInvoice(
                                                selectedInvoice
                                            )
                                        }
                                    >
                                        <Send size={15} />
                                        Issue Invoice
                                    </button>
                                )}

                            </div>

                        </div>

                    </div>
                )}

        </div>
    );
};

export default Invoices;
