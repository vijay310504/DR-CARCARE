import { useEffect, useMemo, useState } from "react";
import {
    Banknote,
    CheckCircle2,
    CreditCard,
    Eye,
    Plus,
    Receipt,
    Search,
    Smartphone,
    X,
} from "lucide-react";

import paymentService from "../../services/paymentService";
import invoiceService from "../../services/invoiceService";
import "./Payments.css";


// =========================================================
// CONSTANTS
// =========================================================

const PAYMENT_METHODS = [
    {
        value: "CASH",
        label: "Cash",
        icon: Banknote,
    },
    {
        value: "UPI",
        label: "UPI",
        icon: Smartphone,
    },
    {
        value: "CARD",
        label: "Card",
        icon: CreditCard,
    },
    {
        value: "BANK_TRANSFER",
        label: "Bank Transfer",
        icon: Banknote,
    },
];


// =========================================================
// HELPERS
// =========================================================

const getToday = () => {
    const today = new Date();

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
};


const formatCurrency = (value) => {
    const amount = Number(value || 0);

    return `₹${amount.toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
};


const formatDate = (value) => {
    if (!value) {
        return "-";
    }

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


const getMethodIcon = (method) => {
    switch (method) {
        case "UPI":
            return Smartphone;

        case "CARD":
            return CreditCard;

        case "BANK_TRANSFER":
            return Banknote;

        case "CASH":
        default:
            return Banknote;
    }
};


const getMethodLabel = (method) => {
    switch (method) {
        case "BANK_TRANSFER":
            return "Bank Transfer";

        case "UPI":
            return "UPI";

        case "CARD":
            return "Card";

        case "CASH":
            return "Cash";

        default:
            return method || "-";
    }
};


const getInvoiceStatusLabel = (status) => {
    switch (status) {
        case "ISSUED":
            return "Issued";

        case "PARTIALLY_PAID":
            return "Partially Paid";

        case "PAID":
            return "Paid";

        case "DRAFT":
            return "Draft";

        case "CANCELLED":
            return "Cancelled";

        default:
            return status || "-";
    }
};


// =========================================================
// EMPTY FORM
// =========================================================

const getEmptyForm = () => ({
    invoiceId: "",
    amount: "",
    paymentMethod: "UPI",
    paymentDate: getToday(),
    referenceNumber: "",
    notes: "",
});


// =========================================================
// COMPONENT
// =========================================================

export default function Payments() {

    // =======================================================
    // STATE
    // =======================================================

    const [payments, setPayments] = useState([]);
    const [invoices, setInvoices] = useState([]);

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const [searchTerm, setSearchTerm] = useState("");
    const [methodFilter, setMethodFilter] = useState("ALL");

    const [showAddModal, setShowAddModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);

    const [selectedPayment, setSelectedPayment] = useState(null);

    const [form, setForm] = useState(getEmptyForm());


    // =======================================================
    // LOAD DATA
    // =======================================================

    const loadData = async () => {

        try {

            setLoading(true);
            setError("");

            const [
                paymentsData,
                invoicesData,
            ] = await Promise.all([
                paymentService.getAllPayments(),
                invoiceService.getAllInvoices(),
            ]);

            setPayments(
                Array.isArray(paymentsData)
                    ? paymentsData
                    : []
            );

            setInvoices(
                Array.isArray(invoicesData)
                    ? invoicesData
                    : []
            );

        } catch (err) {

            console.error(
                "Failed to load payment data:",
                err
            );

            setError(
                err.response?.data?.message ||
                err.response?.data?.error ||
                "Failed to load payment data."
            );

        } finally {

            setLoading(false);
        }
    };


    useEffect(() => {
        loadData();
    }, []);


    // =======================================================
    // AVAILABLE INVOICES
    // =======================================================

    const payableInvoices = useMemo(() => {

        return invoices.filter((invoice) => {

            const status =
                String(invoice.status || "")
                    .toUpperCase();

            const outstanding =
                Number(
                    invoice.outstandingAmount || 0
                );

            return (
                (
                    status === "ISSUED" ||
                    status === "PARTIALLY_PAID"
                ) &&
                outstanding > 0
            );
        });

    }, [invoices]);


    // =======================================================
    // SELECTED INVOICE
    // =======================================================

    const selectedInvoice = useMemo(() => {

        if (!form.invoiceId) {
            return null;
        }

        return invoices.find(
            (invoice) =>
                Number(invoice.id) ===
                Number(form.invoiceId)
        ) || null;

    }, [form.invoiceId, invoices]);


    // =======================================================
    // FILTER PAYMENTS
    // =======================================================

    const filteredPayments = useMemo(() => {

        const search =
            searchTerm
                .trim()
                .toLowerCase();

        return payments.filter((payment) => {

            const matchesSearch =
                !search ||
                String(
                    payment.paymentNumber || ""
                )
                    .toLowerCase()
                    .includes(search) ||

                String(
                    payment.invoiceNumber || ""
                )
                    .toLowerCase()
                    .includes(search) ||

                String(
                    payment.referenceNumber || ""
                )
                    .toLowerCase()
                    .includes(search) ||

                String(
                    payment.paymentMethod || ""
                )
                    .toLowerCase()
                    .includes(search);

            const matchesMethod =
                methodFilter === "ALL" ||
                payment.paymentMethod === methodFilter;

            return (
                matchesSearch &&
                matchesMethod
            );
        });

    }, [
        payments,
        searchTerm,
        methodFilter,
    ]);


    // =======================================================
    // STATISTICS
    // =======================================================

    const statistics = useMemo(() => {

        const totalAmount =
            payments.reduce(
                (sum, payment) =>
                    sum +
                    Number(payment.amount || 0),
                0
            );

        const cashAmount =
            payments
                .filter(
                    (payment) =>
                        payment.paymentMethod === "CASH"
                )
                .reduce(
                    (sum, payment) =>
                        sum +
                        Number(payment.amount || 0),
                    0
                );

        const upiAmount =
            payments
                .filter(
                    (payment) =>
                        payment.paymentMethod === "UPI"
                )
                .reduce(
                    (sum, payment) =>
                        sum +
                        Number(payment.amount || 0),
                    0
                );

        const cardAmount =
            payments
                .filter(
                    (payment) =>
                        payment.paymentMethod === "CARD"
                )
                .reduce(
                    (sum, payment) =>
                        sum +
                        Number(payment.amount || 0),
                    0
                );

        return {
            count: payments.length,
            totalAmount,
            cashAmount,
            upiAmount,
            cardAmount,
        };

    }, [payments]);


    // =======================================================
    // FORM CHANGE
    // =======================================================

    const handleFormChange = (event) => {

        const {
            name,
            value,
        } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));

        setError("");
    };


    // =======================================================
    // OPEN ADD PAYMENT
    // =======================================================

    const openAddPayment = () => {

        setForm(getEmptyForm());

        setError("");
        setSuccessMessage("");

        setShowAddModal(true);
    };


    // =======================================================
    // CLOSE ADD MODAL
    // =======================================================

    const closeAddModal = () => {

        if (submitting) {
            return;
        }

        setShowAddModal(false);
        setForm(getEmptyForm());
        setError("");
    };


    // =======================================================
    // OPEN VIEW
    // =======================================================

    const openViewPayment = async (payment) => {

        try {

            setError("");

            const paymentDetails =
                await paymentService.getPaymentById(
                    payment.id
                );

            setSelectedPayment(
                paymentDetails
            );

            setShowViewModal(true);

        } catch (err) {

            console.error(
                "Failed to load payment:",
                err
            );

            setSelectedPayment(payment);
            setShowViewModal(true);
        }
    };


    // =======================================================
    // CLOSE VIEW
    // =======================================================

    const closeViewModal = () => {

        setShowViewModal(false);
        setSelectedPayment(null);
    };


    // =======================================================
    // HANDLE INVOICE CHANGE
    // =======================================================

    const handleInvoiceChange = (event) => {

        const invoiceId =
            event.target.value;

        const invoice =
            invoices.find(
                (item) =>
                    Number(item.id) ===
                    Number(invoiceId)
            );

        setForm((previous) => ({
            ...previous,
            invoiceId,
            amount:
                invoice &&
                Number(invoice.outstandingAmount) > 0
                    ? Number(
                        invoice.outstandingAmount
                    ).toFixed(2)
                    : "",
        }));

        setError("");
    };


    // =======================================================
    // SUBMIT PAYMENT
    // =======================================================

    const handleSubmit = async (event) => {

        event.preventDefault();

        setError("");
        setSuccessMessage("");


        // ---------------------------------------------------
        // Invoice validation
        // ---------------------------------------------------

        if (!form.invoiceId) {

            setError(
                "Please select an invoice."
            );

            return;
        }


        const invoice =
            invoices.find(
                (item) =>
                    Number(item.id) ===
                    Number(form.invoiceId)
            );


        if (!invoice) {

            setError(
                "Selected invoice could not be found."
            );

            return;
        }


        // ---------------------------------------------------
        // Invoice status validation
        // ---------------------------------------------------

        const invoiceStatus =
            String(invoice.status || "")
                .toUpperCase();

        if (
            invoiceStatus !== "ISSUED" &&
            invoiceStatus !== "PARTIALLY_PAID"
        ) {

            setError(
                "Payment can only be recorded for an ISSUED or PARTIALLY_PAID invoice."
            );

            return;
        }


        // ---------------------------------------------------
        // Amount validation
        // ---------------------------------------------------

        const amount =
            Number(form.amount);

        const outstanding =
            Number(
                invoice.outstandingAmount || 0
            );

        if (
            !Number.isFinite(amount) ||
            amount <= 0
        ) {

            setError(
                "Payment amount must be greater than zero."
            );

            return;
        }


        if (amount > outstanding) {

            setError(
                `Payment cannot exceed the outstanding amount of ${formatCurrency(
                    outstanding
                )}.`
            );

            return;
        }


        // ---------------------------------------------------
        // Payment method validation
        // ---------------------------------------------------

        if (!form.paymentMethod) {

            setError(
                "Please select a payment method."
            );

            return;
        }


        try {

            setSubmitting(true);

            const savedPayment =
                await paymentService.createPayment(
                    Number(form.invoiceId),
                    {
                        amount,
                        paymentMethod:
                        form.paymentMethod,
                        paymentDate:
                            form.paymentDate ||
                            null,
                        referenceNumber:
                        form.referenceNumber,
                        notes:
                        form.notes,
                    }
                );


            // ------------------------------------------------
            // Refresh real backend data
            // ------------------------------------------------

            await loadData();


            setShowAddModal(false);
            setForm(getEmptyForm());


            setSuccessMessage(
                `Payment ${savedPayment?.paymentNumber || ""} recorded successfully.`
            );

        } catch (err) {

            console.error(
                "Failed to create payment:",
                err
            );

            setError(
                err.response?.data?.message ||
                err.response?.data?.error ||
                "Failed to record payment."
            );

        } finally {

            setSubmitting(false);
        }
    };


    // =======================================================
    // RENDER
    // =======================================================

    return (
        <div className="payments-page">

            {/* =================================================
                HEADER
            ================================================= */}

            <div className="payments-header">

                <div>

                    <div className="payments-breadcrumb">
                        Finance / Payments
                    </div>

                    <h1>
                        Payment Management
                    </h1>

                    <p>
                        Record and monitor customer payments
                        against issued invoices.
                    </p>

                </div>


                <button
                    type="button"
                    className="payments-primary-btn"
                    onClick={openAddPayment}
                    disabled={payableInvoices.length === 0}
                    title={
                        payableInvoices.length === 0
                            ? "No payable invoices available"
                            : "Record payment"
                    }
                >
                    <Plus size={18} />
                    Record Payment
                </button>

            </div>


            {/* =================================================
                SUCCESS MESSAGE
            ================================================= */}

            {successMessage && (

                <div className="payments-alert payments-alert-success">

                    <CheckCircle2 size={18} />

                    <span>
                        {successMessage}
                    </span>

                    <button
                        type="button"
                        onClick={() =>
                            setSuccessMessage("")
                        }
                    >
                        <X size={16} />
                    </button>

                </div>
            )}


            {/* =================================================
                ERROR MESSAGE
            ================================================= */}

            {error && !showAddModal && (

                <div className="payments-alert payments-alert-error">

                    <span>
                        {error}
                    </span>

                    <button
                        type="button"
                        onClick={() =>
                            setError("")
                        }
                    >
                        <X size={16} />
                    </button>

                </div>
            )}


            {/* =================================================
                STATISTICS
            ================================================= */}

            <div className="payments-stats">

                <div className="payment-stat">

                    <div className="payment-stat-icon blue">
                        <Receipt size={20} />
                    </div>

                    <div>
                        <span>
                            Total Payments
                        </span>

                        <strong>
                            {statistics.count}
                        </strong>
                    </div>

                </div>


                <div className="payment-stat">

                    <div className="payment-stat-icon green">
                        <Banknote size={20} />
                    </div>

                    <div>
                        <span>
                            Total Received
                        </span>

                        <strong>
                            {formatCurrency(
                                statistics.totalAmount
                            )}
                        </strong>
                    </div>

                </div>


                <div className="payment-stat">

                    <div className="payment-stat-icon orange">
                        <Smartphone size={20} />
                    </div>

                    <div>
                        <span>
                            UPI Received
                        </span>

                        <strong>
                            {formatCurrency(
                                statistics.upiAmount
                            )}
                        </strong>
                    </div>

                </div>


                <div className="payment-stat">

                    <div className="payment-stat-icon purple">
                        <CreditCard size={20} />
                    </div>

                    <div>
                        <span>
                            Card Received
                        </span>

                        <strong>
                            {formatCurrency(
                                statistics.cardAmount
                            )}
                        </strong>
                    </div>

                </div>

            </div>


            {/* =================================================
                PAYMENTS PANEL
            ================================================= */}

            <div className="payments-panel">

                <div className="payments-panel-header">

                    <div>

                        <h2>
                            Payment Transactions
                        </h2>

                        <span>
                            {filteredPayments.length} transaction
                            {filteredPayments.length !== 1
                                ? "s"
                                : ""}
                        </span>

                    </div>


                    <div className="payments-filters">

                        <div className="payments-search">

                            <Search size={17} />

                            <input
                                type="text"
                                placeholder="Search payment, invoice or reference..."
                                value={searchTerm}
                                onChange={(event) =>
                                    setSearchTerm(
                                        event.target.value
                                    )
                                }
                            />

                        </div>


                        <select
                            value={methodFilter}
                            onChange={(event) =>
                                setMethodFilter(
                                    event.target.value
                                )
                            }
                        >
                            <option value="ALL">
                                All Methods
                            </option>

                            <option value="CASH">
                                Cash
                            </option>

                            <option value="UPI">
                                UPI
                            </option>

                            <option value="CARD">
                                Card
                            </option>

                            <option value="BANK_TRANSFER">
                                Bank Transfer
                            </option>
                        </select>

                    </div>

                </div>


                {/* =================================================
                    TABLE
                ================================================= */}

                <div className="payments-table-wrap">

                    <table className="payments-table">

                        <thead>

                        <tr>

                            <th>
                                Receipt No.
                            </th>

                            <th>
                                Invoice
                            </th>

                            <th>
                                Date
                            </th>

                            <th>
                                Amount
                            </th>

                            <th>
                                Method
                            </th>

                            <th>
                                Reference
                            </th>

                            <th>
                                Status
                            </th>

                            <th>
                                Action
                            </th>

                        </tr>

                        </thead>


                        <tbody>

                        {loading ? (

                            <tr>

                                <td
                                    colSpan="8"
                                    className="payments-empty"
                                >
                                    Loading payments...
                                </td>

                            </tr>

                        ) : filteredPayments.length === 0 ? (

                            <tr>

                                <td
                                    colSpan="8"
                                    className="payments-empty"
                                >

                                    <Receipt size={32} />

                                    <strong>
                                        No payments found
                                    </strong>

                                    <span>
                                            Record a payment against
                                            an issued invoice to see
                                            it here.
                                        </span>

                                </td>

                            </tr>

                        ) : (

                            filteredPayments.map(
                                (payment) => {

                                    const MethodIcon =
                                        getMethodIcon(
                                            payment.paymentMethod
                                        );

                                    return (

                                        <tr
                                            key={
                                                payment.id
                                            }
                                        >

                                            <td>

                                                <strong>
                                                    {
                                                        payment.paymentNumber ||
                                                        "-"
                                                    }
                                                </strong>

                                            </td>


                                            <td>

                                                    <span>
                                                        {
                                                            payment.invoiceNumber ||
                                                            `Invoice #${payment.invoiceId}`
                                                        }
                                                    </span>

                                            </td>


                                            <td>
                                                {
                                                    formatDate(
                                                        payment.paymentDate
                                                    )
                                                }
                                            </td>


                                            <td>

                                                    <span className="payment-amount">
                                                        {formatCurrency(
                                                            payment.amount
                                                        )}
                                                    </span>

                                            </td>


                                            <td>

                                                    <span className="payment-method">

                                                        <MethodIcon
                                                            size={15}
                                                        />

                                                        {
                                                            getMethodLabel(
                                                                payment.paymentMethod
                                                            )
                                                        }

                                                    </span>

                                            </td>


                                            <td>

                                                {
                                                    payment.referenceNumber ||
                                                    "-"
                                                }

                                            </td>


                                            <td>

                                                    <span className="payment-success">

                                                        <CheckCircle2
                                                            size={15}
                                                        />

                                                        SUCCESS

                                                    </span>

                                            </td>


                                            <td>

                                                <div className="payments-actions">

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            openViewPayment(
                                                                payment
                                                            )
                                                        }
                                                        title="View payment"
                                                    >

                                                        <Eye
                                                            size={16}
                                                        />

                                                    </button>

                                                </div>

                                            </td>

                                        </tr>

                                    );
                                }
                            )

                        )}

                        </tbody>

                    </table>

                </div>

            </div>


            {/* =================================================
                ADD PAYMENT MODAL
            ================================================= */}

            {showAddModal && (

                <div className="payments-modal-overlay">

                    <div className="payments-modal">

                        <div className="payments-modal-header">

                            <div>

                                <h2>
                                    Record Payment
                                </h2>

                                <p>
                                    Record a customer payment
                                    against an issued invoice.
                                </p>

                            </div>

                            <button
                                type="button"
                                className="payments-close"
                                onClick={closeAddModal}
                                disabled={submitting}
                            >
                                <X size={20} />
                            </button>

                        </div>


                        <form
                            onSubmit={handleSubmit}
                        >

                            {/* ---------------------------------
                                ERROR
                            --------------------------------- */}

                            {error && (

                                <div className="payments-alert payments-alert-error">

                                    <span>
                                        {error}
                                    </span>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setError("")
                                        }
                                    >
                                        <X size={15} />
                                    </button>

                                </div>

                            )}


                            <div className="payments-form-grid">


                                {/* ---------------------------------
                                    INVOICE
                                --------------------------------- */}

                                <div className="payment-full">

                                    <label>
                                        Invoice
                                        <span>*</span>
                                    </label>

                                    <select
                                        name="invoiceId"
                                        value={
                                            form.invoiceId
                                        }
                                        onChange={
                                            handleInvoiceChange
                                        }
                                        required
                                    >

                                        <option value="">
                                            Select invoice
                                        </option>

                                        {payableInvoices.map(
                                            (invoice) => (

                                                <option
                                                    key={
                                                        invoice.id
                                                    }
                                                    value={
                                                        invoice.id
                                                    }
                                                >

                                                    {
                                                        invoice.invoiceNumber
                                                    }
                                                    {" — "}
                                                    {
                                                        formatCurrency(
                                                            invoice.outstandingAmount
                                                        )
                                                    }
                                                    {" outstanding"}

                                                </option>

                                            )
                                        )}

                                    </select>

                                    {payableInvoices.length === 0 && (

                                        <small>
                                            No issued or partially
                                            paid invoices with an
                                            outstanding balance are
                                            available.
                                        </small>

                                    )}

                                </div>


                                {/* ---------------------------------
                                    INVOICE SUMMARY
                                --------------------------------- */}

                                {selectedInvoice && (

                                    <div className="payment-full">

                                        <div className="payment-invoice-summary">

                                            <div>

                                                <span>
                                                    Invoice Total
                                                </span>

                                                <strong>
                                                    {formatCurrency(
                                                        selectedInvoice.totalAmount
                                                    )}
                                                </strong>

                                            </div>


                                            <div>

                                                <span>
                                                    Already Paid
                                                </span>

                                                <strong>
                                                    {formatCurrency(
                                                        selectedInvoice.paidAmount
                                                    )}
                                                </strong>

                                            </div>


                                            <div>

                                                <span>
                                                    Outstanding
                                                </span>

                                                <strong>
                                                    {formatCurrency(
                                                        selectedInvoice.outstandingAmount
                                                    )}
                                                </strong>

                                            </div>

                                        </div>

                                    </div>

                                )}


                                {/* ---------------------------------
                                    PAYMENT AMOUNT
                                --------------------------------- */}

                                <div>

                                    <label>
                                        Payment Amount
                                        <span>*</span>
                                    </label>

                                    <input
                                        type="number"
                                        name="amount"
                                        value={
                                            form.amount
                                        }
                                        onChange={
                                            handleFormChange
                                        }
                                        min="0.01"
                                        step="0.01"
                                        max={
                                            selectedInvoice
                                                ? selectedInvoice.outstandingAmount
                                                : undefined
                                        }
                                        placeholder="Enter amount"
                                        required
                                    />

                                    {selectedInvoice && (

                                        <small>
                                            Maximum:
                                            {" "}
                                            {formatCurrency(
                                                selectedInvoice.outstandingAmount
                                            )}
                                        </small>

                                    )}

                                </div>


                                {/* ---------------------------------
                                    PAYMENT METHOD
                                --------------------------------- */}

                                <div>

                                    <label>
                                        Payment Method
                                        <span>*</span>
                                    </label>

                                    <select
                                        name="paymentMethod"
                                        value={
                                            form.paymentMethod
                                        }
                                        onChange={
                                            handleFormChange
                                        }
                                        required
                                    >

                                        {PAYMENT_METHODS.map(
                                            (method) => (

                                                <option
                                                    key={
                                                        method.value
                                                    }
                                                    value={
                                                        method.value
                                                    }
                                                >
                                                    {
                                                        method.label
                                                    }
                                                </option>

                                            )
                                        )}

                                    </select>

                                </div>


                                {/* ---------------------------------
                                    DATE
                                --------------------------------- */}

                                <div>

                                    <label>
                                        Payment Date
                                        <span>*</span>
                                    </label>

                                    <input
                                        type="date"
                                        name="paymentDate"
                                        value={
                                            form.paymentDate
                                        }
                                        onChange={
                                            handleFormChange
                                        }
                                        required
                                    />

                                </div>


                                {/* ---------------------------------
                                    REFERENCE
                                --------------------------------- */}

                                <div>

                                    <label>
                                        Reference Number
                                    </label>

                                    <input
                                        type="text"
                                        name="referenceNumber"
                                        value={
                                            form.referenceNumber
                                        }
                                        onChange={
                                            handleFormChange
                                        }
                                        maxLength="100"
                                        placeholder="UPI / transaction reference"
                                    />

                                </div>


                                {/* ---------------------------------
                                    NOTES
                                --------------------------------- */}

                                <div className="payment-full">

                                    <label>
                                        Notes
                                    </label>

                                    <textarea
                                        name="notes"
                                        value={
                                            form.notes
                                        }
                                        onChange={
                                            handleFormChange
                                        }
                                        maxLength="1000"
                                        rows="3"
                                        placeholder="Optional payment notes..."
                                    />

                                </div>

                            </div>


                            {/* ---------------------------------
                                FOOTER
                            --------------------------------- */}

                            <div className="payments-modal-footer">

                                <button
                                    type="button"
                                    className="payments-secondary-btn"
                                    onClick={
                                        closeAddModal
                                    }
                                    disabled={
                                        submitting
                                    }
                                >
                                    Cancel
                                </button>


                                <button
                                    type="submit"
                                    className="payments-primary-btn"
                                    disabled={
                                        submitting ||
                                        !form.invoiceId ||
                                        !form.amount
                                    }
                                >

                                    {submitting
                                        ? "Recording..."
                                        : "Record Payment"
                                    }

                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}


            {/* =================================================
                VIEW PAYMENT MODAL
            ================================================= */}

            {showViewModal &&
                selectedPayment && (

                    <div className="payments-modal-overlay">

                        <div className="payments-modal">

                            <div className="payments-modal-header">

                                <div>

                                    <h2>
                                        Payment Details
                                    </h2>

                                    <p>
                                        {
                                            selectedPayment.paymentNumber ||
                                            "-"
                                        }
                                    </p>

                                </div>

                                <button
                                    type="button"
                                    className="payments-close"
                                    onClick={
                                        closeViewModal
                                    }
                                >
                                    <X size={20} />
                                </button>

                            </div>


                            <div className="payment-detail-top">

                                <div>

                                    <span>
                                        Payment Amount
                                    </span>

                                    <strong>
                                        {formatCurrency(
                                            selectedPayment.amount
                                        )}
                                    </strong>

                                </div>


                                <span className="payment-success">

                                    <CheckCircle2
                                        size={15}
                                    />

                                    SUCCESS

                                </span>

                            </div>


                            <div className="payment-detail-grid">

                                <div>

                                    <span>
                                        Payment Number
                                    </span>

                                    <strong>
                                        {
                                            selectedPayment.paymentNumber ||
                                            "-"
                                        }
                                    </strong>

                                </div>


                                <div>

                                    <span>
                                        Invoice
                                    </span>

                                    <strong>
                                        {
                                            selectedPayment.invoiceNumber ||
                                            `Invoice #${selectedPayment.invoiceId}`
                                        }
                                    </strong>

                                </div>


                                <div>

                                    <span>
                                        Payment Date
                                    </span>

                                    <strong>
                                        {formatDate(
                                            selectedPayment.paymentDate
                                        )}
                                    </strong>

                                </div>


                                <div>

                                    <span>
                                        Payment Method
                                    </span>

                                    <strong>
                                        {
                                            getMethodLabel(
                                                selectedPayment.paymentMethod
                                            )
                                        }
                                    </strong>

                                </div>


                                <div>

                                    <span>
                                        Reference Number
                                    </span>

                                    <strong>
                                        {
                                            selectedPayment.referenceNumber ||
                                            "-"
                                        }
                                    </strong>

                                </div>


                                <div>

                                    <span>
                                        Created At
                                    </span>

                                    <strong>
                                        {formatDate(
                                            selectedPayment.createdAt
                                        )}
                                    </strong>

                                </div>


                                <div className="payment-full">

                                    <span>
                                        Notes
                                    </span>

                                    <strong>
                                        {
                                            selectedPayment.notes ||
                                            "No notes"
                                        }
                                    </strong>

                                </div>

                            </div>


                            <div className="payments-modal-footer">

                                <button
                                    type="button"
                                    className="payments-secondary-btn"
                                    onClick={
                                        closeViewModal
                                    }
                                >
                                    Close
                                </button>

                            </div>

                        </div>

                    </div>

                )}

        </div>
    );
}