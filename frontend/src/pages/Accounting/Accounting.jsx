import { useEffect, useMemo, useState } from "react";
import {
    Search,
    Eye,
    X,
    BookOpen,
    ArrowUpRight,
    ArrowDownRight,
    IndianRupee,
    RefreshCw,
    AlertCircle,
    CheckCircle2,
    CreditCard,
    Smartphone,
    Banknote,
    FileText,
} from "lucide-react";

import accountingService from "../../services/accountingService";

import "./Accounting.css";

// =========================================================
// HELPERS
// =========================================================

const formatCurrency = (value) =>
    `₹${Number(value || 0).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;

const formatDate = (date) => {
    if (!date) return "-";

    const parsedDate = new Date(`${date}T00:00:00`);

    if (Number.isNaN(parsedDate.getTime())) {
        return date;
    }

    return parsedDate.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

const getErrorMessage = (error, fallbackMessage) =>
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallbackMessage;

// =========================================================
// COMPONENT
// =========================================================

function Accounting() {
    // -------------------------------------------------------
    // DATA
    // -------------------------------------------------------

    const [entries, setEntries] = useState([]);
    const [journalEntries, setJournalEntries] = useState([]);

    // -------------------------------------------------------
    // UI STATE
    // -------------------------------------------------------

    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [typeFilter, setTypeFilter] = useState("ALL");

    const [selectedEntry, setSelectedEntry] = useState(null);

    // -------------------------------------------------------
    // ALERTS
    // -------------------------------------------------------

    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    // =========================================================
    // LOAD ACCOUNTING DATA
    // =========================================================

    const loadAccountingData = async () => {
        try {
            setLoading(true);
            setErrorMessage("");

            const [dayBookData, journalData] =
                await Promise.all([
                    accountingService.getDayBookEntries(),
                    accountingService.getJournalEntries(),
                ]);

            setEntries(
                Array.isArray(dayBookData)
                    ? dayBookData
                    : []
            );

            setJournalEntries(
                Array.isArray(journalData)
                    ? journalData
                    : []
            );

            setSuccessMessage("");
        } catch (error) {
            console.error(
                "Failed to load accounting data:",
                error
            );

            setErrorMessage(
                getErrorMessage(
                    error,
                    "Failed to load accounting data. Please try again."
                )
            );

            setEntries([]);
            setJournalEntries([]);
        } finally {
            setLoading(false);
        }
    };

    // =========================================================
    // INITIAL LOAD
    // =========================================================

    useEffect(() => {
        loadAccountingData();
    }, []);

    // =========================================================
    // FILTER ENTRIES
    // =========================================================

    const filteredEntries = useMemo(() => {
        const query = search.trim().toLowerCase();

        return entries.filter((entry) => {
            const matchesSearch =
                !query ||
                String(entry.entryNumber || "")
                    .toLowerCase()
                    .includes(query) ||
                String(entry.referenceType || "")
                    .toLowerCase()
                    .includes(query) ||
                String(entry.referenceId || "")
                    .toLowerCase()
                    .includes(query) ||
                String(entry.description || "")
                    .toLowerCase()
                    .includes(query) ||
                String(entry.paymentMethod || "")
                    .toLowerCase()
                    .includes(query) ||
                String(entry.entryType || "")
                    .toLowerCase()
                    .includes(query);

            const normalizedType =
                String(entry.entryType || "").toUpperCase();

            let matchesType = true;

            if (typeFilter === "INCOME") {
                matchesType =
                    normalizedType === "PAYMENT" ||
                    Number(entry.creditAmount || 0) > 0;
            }

            if (typeFilter === "EXPENSE") {
                matchesType =
                    normalizedType === "EXPENSE" ||
                    Number(entry.debitAmount || 0) > 0;
            }

            return matchesSearch && matchesType;
        });
    }, [entries, search, typeFilter]);

    // =========================================================
    // ACCOUNTING TOTALS
    // =========================================================

    const totalDebit = useMemo(() => {
        return entries.reduce(
            (sum, entry) =>
                sum + Number(entry.debitAmount || 0),
            0
        );
    }, [entries]);

    const totalCredit = useMemo(() => {
        return entries.reduce(
            (sum, entry) =>
                sum + Number(entry.creditAmount || 0),
            0
        );
    }, [entries]);

    const netBalance = totalCredit - totalDebit;

    const totalEntries = entries.length;

    // =========================================================
    // ENTRY TYPE
    // =========================================================

    const getEntryDisplayType = (entry) => {
        const type = String(
            entry.entryType || ""
        ).toUpperCase();

        if (type === "EXPENSE") {
            return "EXPENSE";
        }

        if (type === "PAYMENT") {
            return "INCOME";
        }

        if (Number(entry.creditAmount || 0) > 0) {
            return "INCOME";
        }

        if (Number(entry.debitAmount || 0) > 0) {
            return "EXPENSE";
        }

        return type || "ENTRY";
    };

    // =========================================================
    // PAYMENT ICON
    // =========================================================

    const paymentIcon = (method) => {
        const normalizedMethod = String(
            method || ""
        ).toUpperCase();

        if (normalizedMethod === "UPI") {
            return <Smartphone size={14} />;
        }

        if (normalizedMethod === "CARD") {
            return <CreditCard size={14} />;
        }

        if (normalizedMethod === "CASH") {
            return <Banknote size={14} />;
        }

        if (normalizedMethod === "BANK_TRANSFER") {
            return <IndianRupee size={14} />;
        }

        return null;
    };

    // =========================================================
    // VIEW ENTRY
    // =========================================================

    const viewEntry = (entry) => {
        setSelectedEntry(entry);
    };

    // =========================================================
    // CLEAR FILTERS
    // =========================================================

    const clearFilters = () => {
        setSearch("");
        setTypeFilter("ALL");
    };

    // =========================================================
    // RENDER
    // =========================================================

    return (
        <div className="accounting-page">
            {/* =================================================
                PAGE HEADER
            ================================================= */}

            <div className="page-header">
                <div>
                    <h1>Accounting</h1>
                    <p>
                        Monitor income, expenses and workshop
                        financial entries.
                    </p>
                </div>

                <button
                    type="button"
                    className="secondary-btn"
                    onClick={loadAccountingData}
                    disabled={loading}
                >
                    <RefreshCw
                        size={16}
                        className={loading ? "accounting-spin" : ""}
                    />

                    Refresh
                </button>
            </div>

            {/* =================================================
                SUCCESS MESSAGE
            ================================================= */}

            {successMessage && (
                <div className="accounting-alert accounting-alert-success">
                    <CheckCircle2 size={18} />

                    <span>{successMessage}</span>

                    <button
                        type="button"
                        onClick={() => setSuccessMessage("")}
                    >
                        <X size={17} />
                    </button>
                </div>
            )}

            {/* =================================================
                ERROR MESSAGE
            ================================================= */}

            {errorMessage && (
                <div className="accounting-alert accounting-alert-error">
                    <AlertCircle size={18} />

                    <span>{errorMessage}</span>

                    <button
                        type="button"
                        onClick={() => setErrorMessage("")}
                    >
                        <X size={17} />
                    </button>
                </div>
            )}

            {/* =================================================
                ACCOUNTING STATS
            ================================================= */}

            <div className="accounting-stats">
                {/* TOTAL CREDIT */}

                <div className="accounting-card">
                    <div className="accounting-icon green">
                        <ArrowUpRight />
                    </div>

                    <span>Total Credit</span>

                    <strong>
                        {formatCurrency(totalCredit)}
                    </strong>
                </div>

                {/* TOTAL DEBIT */}

                <div className="accounting-card">
                    <div className="accounting-icon red">
                        <ArrowDownRight />
                    </div>

                    <span>Total Debit</span>

                    <strong>
                        {formatCurrency(totalDebit)}
                    </strong>
                </div>

                {/* NET BALANCE */}

                <div className="accounting-card">
                    <div className="accounting-icon blue">
                        <IndianRupee />
                    </div>

                    <span>Net Balance</span>

                    <strong>
                        {formatCurrency(netBalance)}
                    </strong>
                </div>

                {/* TOTAL ENTRIES */}

                <div className="accounting-card">
                    <div className="accounting-icon orange">
                        <BookOpen />
                    </div>

                    <span>Total Entries</span>

                    <strong>{totalEntries}</strong>
                </div>
            </div>

            {/* =================================================
                LEDGER
            ================================================= */}

            <div className="ledger-card">
                <div className="ledger-header">
                    <div>
                        <h2>Day Book / Ledger</h2>

                        <p>
                            Financial transactions generated by
                            the workshop system.
                        </p>
                    </div>

                    <div className="ledger-filters">
                        {/* SEARCH */}

                        <div className="search-box">
                            <Search size={18} />

                            <input
                                type="text"
                                placeholder="Search entries..."
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
                                    className="accounting-search-clear"
                                    onClick={() =>
                                        setSearch("")
                                    }
                                >
                                    <X size={15} />
                                </button>
                            )}
                        </div>

                        {/* TYPE */}

                        <select
                            value={typeFilter}
                            onChange={(event) =>
                                setTypeFilter(
                                    event.target.value
                                )
                            }
                        >
                            <option value="ALL">
                                All
                            </option>

                            <option value="INCOME">
                                Income
                            </option>

                            <option value="EXPENSE">
                                Expense
                            </option>
                        </select>
                    </div>
                </div>

                {/* =================================================
                    TABLE
                ================================================= */}

                <div className="table-wrapper">
                    <table>
                        <thead>
                        <tr>
                            <th>Entry</th>
                            <th>Date</th>
                            <th>Reference</th>
                            <th>Description</th>
                            <th>Type</th>
                            <th>Debit</th>
                            <th>Credit</th>
                            <th>Payment</th>
                            <th>Action</th>
                        </tr>
                        </thead>

                        <tbody>
                        {loading ? (
                            <tr>
                                <td
                                    colSpan="9"
                                    className="accounting-loading"
                                >
                                    <RefreshCw
                                        size={18}
                                        className="accounting-spin"
                                    />

                                    Loading accounting
                                    entries...
                                </td>
                            </tr>
                        ) : filteredEntries.length > 0 ? (
                            filteredEntries.map(
                                (entry) => {
                                    const displayType =
                                        getEntryDisplayType(
                                            entry
                                        );

                                    return (
                                        <tr
                                            key={
                                                entry.id
                                            }
                                        >
                                            {/* ENTRY */}

                                            <td>
                                                <strong>
                                                    {
                                                        entry.entryNumber
                                                    }
                                                </strong>
                                            </td>

                                            {/* DATE */}

                                            <td>
                                                {formatDate(
                                                    entry.entryDate
                                                )}
                                            </td>

                                            {/* REFERENCE */}

                                            <td>
                                                <div className="reference-cell">
                                                    <strong>
                                                        {
                                                            entry.referenceType ||
                                                            "-"
                                                        }
                                                    </strong>

                                                    {entry.referenceId && (
                                                        <small>
                                                            #
                                                            {
                                                                entry.referenceId
                                                            }
                                                        </small>
                                                    )}
                                                </div>
                                            </td>

                                            {/* DESCRIPTION */}

                                            <td>
                                                    <span className="accounting-description">
                                                        {
                                                            entry.description
                                                        }
                                                    </span>
                                            </td>

                                            {/* TYPE */}

                                            <td>
                                                    <span
                                                        className={`entry-type ${displayType.toLowerCase()}`}
                                                    >
                                                        {
                                                            displayType
                                                        }
                                                    </span>
                                            </td>

                                            {/* DEBIT */}

                                            <td>
                                                {Number(
                                                    entry.debitAmount ||
                                                    0
                                                ) >
                                                0 ? (
                                                    <strong className="debit-amount">
                                                        {formatCurrency(
                                                            entry.debitAmount
                                                        )}
                                                    </strong>
                                                ) : (
                                                    "-"
                                                )}
                                            </td>

                                            {/* CREDIT */}

                                            <td>
                                                {Number(
                                                    entry.creditAmount ||
                                                    0
                                                ) >
                                                0 ? (
                                                    <strong className="credit-amount">
                                                        {formatCurrency(
                                                            entry.creditAmount
                                                        )}
                                                    </strong>
                                                ) : (
                                                    "-"
                                                )}
                                            </td>

                                            {/* PAYMENT */}

                                            <td>
                                                {entry.paymentMethod ? (
                                                    <span className="payment-method">
                                                            {paymentIcon(
                                                                entry.paymentMethod
                                                            )}

                                                        {
                                                            entry.paymentMethod
                                                        }
                                                        </span>
                                                ) : (
                                                    "-"
                                                )}
                                            </td>

                                            {/* ACTION */}

                                            <td>
                                                <button
                                                    type="button"
                                                    className="icon-btn"
                                                    title="View Entry"
                                                    onClick={() =>
                                                        viewEntry(
                                                            entry
                                                        )
                                                    }
                                                >
                                                    <Eye
                                                        size={
                                                            16
                                                        }
                                                    />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                }
                            )
                        ) : (
                            <tr>
                                <td
                                    colSpan="9"
                                    className="accounting-empty-state"
                                >
                                    <BookOpen
                                        size={38}
                                    />

                                    <h3>
                                        No accounting
                                        entries found
                                    </h3>

                                    <p>
                                        {search ||
                                        typeFilter !==
                                        "ALL"
                                            ? "Try changing your search or filter."
                                            : "Accounting entries will appear automatically when financial transactions are recorded."}
                                    </p>

                                    {(search ||
                                        typeFilter !==
                                        "ALL") && (
                                        <button
                                            type="button"
                                            className="secondary-btn"
                                            onClick={
                                                clearFilters
                                            }
                                        >
                                            Clear Filters
                                        </button>
                                    )}
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* =================================================
                JOURNAL ENTRY INFORMATION
            ================================================= */}

            <div className="journal-info">
                <FileText size={17} />

                <span>
                    {journalEntries.length} journal{" "}
                    {journalEntries.length === 1
                        ? "entry"
                        : "entries"}{" "}
                    recorded in the accounting system.
                </span>
            </div>

            {/* =================================================
                ENTRY DETAILS MODAL
            ================================================= */}

            {selectedEntry && (
                <div className="modal-overlay">
                    <div className="modal-box small">
                        <div className="modal-header">
                            <div>
                                <h2>Accounting Entry</h2>

                                <p>
                                    {
                                        selectedEntry.entryNumber
                                    }
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    setSelectedEntry(
                                        null
                                    )
                                }
                            >
                                <X />
                            </button>
                        </div>

                        <div className="entry-details">
                            <div>
                                <span>Entry Number</span>

                                <strong>
                                    {
                                        selectedEntry.entryNumber
                                    }
                                </strong>
                            </div>

                            <div>
                                <span>Entry Date</span>

                                <strong>
                                    {formatDate(
                                        selectedEntry.entryDate
                                    )}
                                </strong>
                            </div>

                            <div>
                                <span>Entry Type</span>

                                <strong>
                                    {
                                        selectedEntry.entryType
                                    }
                                </strong>
                            </div>

                            <div>
                                <span>Reference Type</span>

                                <strong>
                                    {
                                        selectedEntry.referenceType ||
                                        "-"
                                    }
                                </strong>
                            </div>

                            <div>
                                <span>Reference ID</span>

                                <strong>
                                    {
                                        selectedEntry.referenceId ||
                                        "-"
                                    }
                                </strong>
                            </div>

                            <div>
                                <span>Description</span>

                                <strong>
                                    {
                                        selectedEntry.description
                                    }
                                </strong>
                            </div>

                            <div>
                                <span>Debit Amount</span>

                                <strong>
                                    {formatCurrency(
                                        selectedEntry.debitAmount
                                    )}
                                </strong>
                            </div>

                            <div>
                                <span>Credit Amount</span>

                                <strong>
                                    {formatCurrency(
                                        selectedEntry.creditAmount
                                    )}
                                </strong>
                            </div>

                            <div>
                                <span>Payment Method</span>

                                <strong>
                                    {
                                        selectedEntry.paymentMethod ||
                                        "-"
                                    }
                                </strong>
                            </div>

                            <div>
                                <span>Created At</span>

                                <strong>
                                    {selectedEntry.createdAt
                                        ? new Date(
                                            selectedEntry.createdAt
                                        ).toLocaleString(
                                            "en-IN"
                                        )
                                        : "-"}
                                </strong>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Accounting;