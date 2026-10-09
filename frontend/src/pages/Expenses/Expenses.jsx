import { useEffect, useMemo, useState } from "react";
import {
    Search,
    Plus,
    Eye,
    Trash2,
    X,
    IndianRupee,
    Fuel,
    Wrench,
    Zap,
    Building2,
    MoreHorizontal,
    RefreshCw,
    CreditCard,
    Smartphone,
    Banknote,
    AlertCircle,
    CheckCircle2,
} from "lucide-react";

import expenseService from "../../services/expenseService";

import "./Expenses.css";

// =========================================================
// CONSTANTS
// =========================================================

const categories = [
    "Rent",
    "Electricity",
    "Fuel",
    "Tools",
    "Maintenance",
    "Salary",
    "Utilities",
    "Other",
];

const paymentMethods = [
    "CASH",
    "UPI",
    "CARD",
    "BANK_TRANSFER",
];

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

const getTodayDate = () => {
    const today = new Date();

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
};

const getErrorMessage = (error, fallbackMessage) => {
    return (
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        fallbackMessage
    );
};

// =========================================================
// COMPONENT
// =========================================================

function Expenses() {
    // -------------------------------------------------------
    // DATA STATE
    // -------------------------------------------------------

    const [expenses, setExpenses] = useState([]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // -------------------------------------------------------
    // FILTER STATE
    // -------------------------------------------------------

    const [search, setSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("ALL");

    // -------------------------------------------------------
    // MODAL STATE
    // -------------------------------------------------------

    const [showModal, setShowModal] = useState(false);
    const [selectedExpense, setSelectedExpense] = useState(null);

    // -------------------------------------------------------
    // ALERT STATE
    // -------------------------------------------------------

    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    // -------------------------------------------------------
    // FORM STATE
    // -------------------------------------------------------

    const [form, setForm] = useState({
        category: "Maintenance",
        description: "",
        amount: "",
        expenseDate: getTodayDate(),
        paymentMethod: "CASH",
        referenceNumber: "",
        notes: "",
    });

    // =========================================================
    // LOAD EXPENSES
    // =========================================================

    const loadExpenses = async () => {
        try {
            setLoading(true);
            setErrorMessage("");

            const data = await expenseService.getAllExpenses();

            setExpenses(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Failed to load expenses:", error);

            setErrorMessage(
                getErrorMessage(
                    error,
                    "Failed to load expenses. Please try again."
                )
            );
        } finally {
            setLoading(false);
        }
    };

    // =========================================================
    // INITIAL LOAD
    // =========================================================

    useEffect(() => {
        loadExpenses();
    }, []);

    // =========================================================
    // AUTO HIDE SUCCESS MESSAGE
    // =========================================================

    useEffect(() => {
        if (!successMessage) return;

        const timer = setTimeout(() => {
            setSuccessMessage("");
        }, 3500);

        return () => clearTimeout(timer);
    }, [successMessage]);

    // =========================================================
    // AUTO HIDE ERROR MESSAGE
    // =========================================================

    useEffect(() => {
        if (!errorMessage) return;

        const timer = setTimeout(() => {
            setErrorMessage("");
        }, 5000);

        return () => clearTimeout(timer);
    }, [errorMessage]);

    // =========================================================
    // FILTERED EXPENSES
    // =========================================================

    const filteredExpenses = useMemo(() => {
        const query = search.trim().toLowerCase();

        return expenses.filter((expense) => {
            const matchesSearch =
                !query ||
                String(expense.expenseNumber || "")
                    .toLowerCase()
                    .includes(query) ||
                String(expense.category || "")
                    .toLowerCase()
                    .includes(query) ||
                String(expense.description || "")
                    .toLowerCase()
                    .includes(query) ||
                String(expense.referenceNumber || "")
                    .toLowerCase()
                    .includes(query);

            const matchesCategory =
                categoryFilter === "ALL" ||
                String(expense.category || "").toUpperCase() ===
                categoryFilter.toUpperCase();

            return matchesSearch && matchesCategory;
        });
    }, [expenses, search, categoryFilter]);

    // =========================================================
    // SUMMARY CALCULATIONS
    // =========================================================

    const totalExpense = useMemo(() => {
        return expenses.reduce(
            (sum, expense) => sum + Number(expense.amount || 0),
            0
        );
    }, [expenses]);

    const fuelExpense = useMemo(() => {
        return expenses
            .filter(
                (expense) =>
                    String(expense.category || "").toUpperCase() === "FUEL"
            )
            .reduce(
                (sum, expense) => sum + Number(expense.amount || 0),
                0
            );
    }, [expenses]);

    const maintenanceExpense = useMemo(() => {
        return expenses
            .filter(
                (expense) =>
                    String(expense.category || "").toUpperCase() ===
                    "MAINTENANCE"
            )
            .reduce(
                (sum, expense) => sum + Number(expense.amount || 0),
                0
            );
    }, [expenses]);

    const rentExpense = useMemo(() => {
        return expenses
            .filter(
                (expense) =>
                    String(expense.category || "").toUpperCase() === "RENT"
            )
            .reduce(
                (sum, expense) => sum + Number(expense.amount || 0),
                0
            );
    }, [expenses]);

    // =========================================================
    // OPEN ADD MODAL
    // =========================================================

    const openAddModal = () => {
        setSelectedExpense(null);

        setForm({
            category: "Maintenance",
            description: "",
            amount: "",
            expenseDate: getTodayDate(),
            paymentMethod: "CASH",
            referenceNumber: "",
            notes: "",
        });

        setErrorMessage("");
        setShowModal(true);
    };

    // =========================================================
    // CLOSE ADD MODAL
    // =========================================================

    const closeAddModal = () => {
        if (saving) return;

        setShowModal(false);
        setErrorMessage("");
    };

    // =========================================================
    // FORM CHANGE
    // =========================================================

    const handleFormChange = (field, value) => {
        setForm((previous) => ({
            ...previous,
            [field]: value,
        }));
    };

    // =========================================================
    // SAVE EXPENSE
    // =========================================================

    const saveExpense = async (event) => {
        event.preventDefault();

        setErrorMessage("");
        setSuccessMessage("");

        // -----------------------------------------------
        // FRONTEND VALIDATION
        // -----------------------------------------------

        if (!form.category.trim()) {
            setErrorMessage("Please select an expense category.");
            return;
        }

        if (!form.description.trim()) {
            setErrorMessage("Expense description is required.");
            return;
        }

        if (!form.amount || Number(form.amount) <= 0) {
            setErrorMessage("Expense amount must be greater than zero.");
            return;
        }

        if (!form.expenseDate) {
            setErrorMessage("Expense date is required.");
            return;
        }

        if (!form.paymentMethod) {
            setErrorMessage("Payment method is required.");
            return;
        }

        try {
            setSaving(true);

            const createdExpense =
                await expenseService.createExpense(form);

            // Add newly created expense immediately.
            setExpenses((previous) => [
                createdExpense,
                ...previous,
            ]);

            setShowModal(false);

            setSuccessMessage(
                `${createdExpense.expenseNumber || "Expense"} created successfully.`
            );

            setForm({
                category: "Maintenance",
                description: "",
                amount: "",
                expenseDate: getTodayDate(),
                paymentMethod: "CASH",
                referenceNumber: "",
                notes: "",
            });
        } catch (error) {
            console.error("Failed to create expense:", error);

            setErrorMessage(
                getErrorMessage(
                    error,
                    "Failed to create expense. Please try again."
                )
            );
        } finally {
            setSaving(false);
        }
    };

    // =========================================================
    // VIEW EXPENSE
    // =========================================================

    const viewExpense = async (expense) => {
        try {
            setErrorMessage("");

            const data = await expenseService.getExpenseById(
                expense.id
            );

            setSelectedExpense(data);
        } catch (error) {
            console.error("Failed to load expense:", error);

            // Fallback to row data if detail request fails.
            setSelectedExpense(expense);

            setErrorMessage(
                getErrorMessage(
                    error,
                    "Failed to load expense details."
                )
            );
        }
    };

    // =========================================================
    // DELETE
    // =========================================================

    /*
     * IMPORTANT:
     *
     * The current backend ExpenseController does NOT expose
     * DELETE /api/expenses/{id}.
     *
     * Therefore delete is intentionally not connected here.
     * This prevents the frontend from calling a non-existent API.
     */

    // =========================================================
    // CATEGORY ICON
    // =========================================================

    const categoryIcon = (category) => {
        const normalizedCategory = String(
            category || ""
        ).toUpperCase();

        if (normalizedCategory === "FUEL") {
            return <Fuel size={16} />;
        }

        if (normalizedCategory === "TOOLS") {
            return <Wrench size={16} />;
        }

        if (normalizedCategory === "ELECTRICITY") {
            return <Zap size={16} />;
        }

        if (normalizedCategory === "RENT") {
            return <Building2 size={16} />;
        }

        return <MoreHorizontal size={16} />;
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

        return <IndianRupee size={14} />;
    };

    // =========================================================
    // RENDER
    // =========================================================

    return (
        <div className="expenses-page">
            {/* =================================================
                PAGE HEADER
            ================================================= */}

            <div className="page-header">
                <div>
                    <h1>Expenses</h1>
                    <p>
                        Track workshop expenses and operating costs.
                    </p>
                </div>

                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                    }}
                >
                    <button
                        className="secondary-btn"
                        type="button"
                        onClick={loadExpenses}
                        disabled={loading}
                    >
                        <RefreshCw
                            size={16}
                            className={loading ? "spin" : ""}
                        />
                        Refresh
                    </button>

                    <button
                        className="primary-btn"
                        type="button"
                        onClick={openAddModal}
                    >
                        <Plus size={18} />
                        Add Expense
                    </button>
                </div>
            </div>

            {/* =================================================
                SUCCESS MESSAGE
            ================================================= */}

            {successMessage && (
                <div className="expenses-alert expenses-alert-success">
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
                <div className="expenses-alert expenses-alert-error">
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
                SUMMARY CARDS
            ================================================= */}

            <div className="expense-summary">
                <div className="expense-summary-card">
                    <div className="expense-icon">
                        <IndianRupee size={21} />
                    </div>

                    <div>
                        <span>Total Expenses</span>
                        <strong>
                            {formatCurrency(totalExpense)}
                        </strong>
                    </div>
                </div>

                <div className="expense-summary-card">
                    <div className="expense-icon">
                        <Fuel size={21} />
                    </div>

                    <div>
                        <span>Fuel</span>
                        <strong>
                            {formatCurrency(fuelExpense)}
                        </strong>
                    </div>
                </div>

                <div className="expense-summary-card">
                    <div className="expense-icon">
                        <Wrench size={21} />
                    </div>

                    <div>
                        <span>Maintenance</span>
                        <strong>
                            {formatCurrency(maintenanceExpense)}
                        </strong>
                    </div>
                </div>

                <div className="expense-summary-card">
                    <div className="expense-icon">
                        <Building2 size={21} />
                    </div>

                    <div>
                        <span>Rent</span>
                        <strong>
                            {formatCurrency(rentExpense)}
                        </strong>
                    </div>
                </div>
            </div>

            {/* =================================================
                TABLE
            ================================================= */}

            <div className="table-card">
                <div className="table-toolbar">
                    <div className="search-box">
                        <Search size={18} />

                        <input
                            type="text"
                            placeholder="Search expenses..."
                            value={search}
                            onChange={(event) =>
                                setSearch(event.target.value)
                            }
                        />

                        {search && (
                            <button
                                type="button"
                                className="search-clear-btn"
                                onClick={() => setSearch("")}
                            >
                                <X size={15} />
                            </button>
                        )}
                    </div>

                    <select
                        value={categoryFilter}
                        onChange={(event) =>
                            setCategoryFilter(event.target.value)
                        }
                    >
                        <option value="ALL">
                            All Categories
                        </option>

                        {categories.map((category) => (
                            <option
                                key={category}
                                value={category}
                            >
                                {category}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="table-wrapper">
                    <table>
                        <thead>
                        <tr>
                            <th>Expense</th>
                            <th>Category</th>
                            <th>Description</th>
                            <th>Amount</th>
                            <th>Payment</th>
                            <th>Date</th>
                            <th>Reference</th>
                            <th>Action</th>
                        </tr>
                        </thead>

                        <tbody>
                        {loading ? (
                            <tr>
                                <td
                                    colSpan="8"
                                    className="table-loading"
                                >
                                    <RefreshCw
                                        size={18}
                                        className="spin"
                                    />
                                    Loading expenses...
                                </td>
                            </tr>
                        ) : filteredExpenses.length > 0 ? (
                            filteredExpenses.map(
                                (expense) => (
                                    <tr key={expense.id}>
                                        <td>
                                            <strong>
                                                {
                                                    expense.expenseNumber
                                                }
                                            </strong>
                                        </td>

                                        <td>
                                                <span className="category-badge">
                                                    {categoryIcon(
                                                        expense.category
                                                    )}

                                                    {
                                                        expense.category
                                                    }
                                                </span>
                                        </td>

                                        <td>
                                                <span className="description-cell">
                                                    {
                                                        expense.description
                                                    }
                                                </span>
                                        </td>

                                        <td>
                                            <strong>
                                                {formatCurrency(
                                                    expense.amount
                                                )}
                                            </strong>
                                        </td>

                                        <td>
                                                <span className="payment-badge">
                                                    {paymentIcon(
                                                        expense.paymentMethod
                                                    )}

                                                    {
                                                        expense.paymentMethod
                                                    }
                                                </span>
                                        </td>

                                        <td>
                                            {formatDate(
                                                expense.expenseDate
                                            )}
                                        </td>

                                        <td>
                                            {expense.referenceNumber ||
                                                "-"}
                                        </td>

                                        <td>
                                            <div className="action-group">
                                                <button
                                                    type="button"
                                                    className="icon-btn"
                                                    title="View Expense"
                                                    onClick={() =>
                                                        viewExpense(
                                                            expense
                                                        )
                                                    }
                                                >
                                                    <Eye
                                                        size={16}
                                                    />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            )
                        ) : (
                            <tr>
                                <td
                                    colSpan="8"
                                    className="empty-state"
                                >
                                    <div>
                                        <h3>
                                            No expenses found
                                        </h3>

                                        <p>
                                            {search ||
                                            categoryFilter !==
                                            "ALL"
                                                ? "Try changing your search or filter."
                                                : "Add your first workshop expense to get started."}
                                        </p>
                                    </div>
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* =================================================
                ADD EXPENSE MODAL
            ================================================= */}

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-box">
                        <div className="modal-header">
                            <div>
                                <h2>Add Expense</h2>
                                <p>
                                    Record a workshop expense.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={closeAddModal}
                                disabled={saving}
                            >
                                <X />
                            </button>
                        </div>

                        <form onSubmit={saveExpense}>
                            <div className="form-grid">
                                {/* CATEGORY */}

                                <div className="form-group">
                                    <label>
                                        Category
                                        <span className="required">
                                            *
                                        </span>
                                    </label>

                                    <select
                                        value={form.category}
                                        onChange={(event) =>
                                            handleFormChange(
                                                "category",
                                                event.target.value
                                            )
                                        }
                                        required
                                    >
                                        {categories.map(
                                            (category) => (
                                                <option
                                                    key={category}
                                                    value={category}
                                                >
                                                    {category}
                                                </option>
                                            )
                                        )}
                                    </select>
                                </div>

                                {/* AMOUNT */}

                                <div className="form-group">
                                    <label>
                                        Amount
                                        <span className="required">
                                            *
                                        </span>
                                    </label>

                                    <input
                                        type="number"
                                        required
                                        min="0.01"
                                        step="0.01"
                                        value={form.amount}
                                        onChange={(event) =>
                                            handleFormChange(
                                                "amount",
                                                event.target.value
                                            )
                                        }
                                        placeholder="Enter amount"
                                    />
                                </div>

                                {/* DESCRIPTION */}

                                <div className="form-group full">
                                    <label>
                                        Description
                                        <span className="required">
                                            *
                                        </span>
                                    </label>

                                    <input
                                        type="text"
                                        required
                                        maxLength="500"
                                        value={
                                            form.description
                                        }
                                        onChange={(event) =>
                                            handleFormChange(
                                                "description",
                                                event.target.value
                                            )
                                        }
                                        placeholder="Expense description"
                                    />
                                </div>

                                {/* DATE */}

                                <div className="form-group">
                                    <label>
                                        Expense Date
                                        <span className="required">
                                            *
                                        </span>
                                    </label>

                                    <input
                                        type="date"
                                        required
                                        value={
                                            form.expenseDate
                                        }
                                        onChange={(event) =>
                                            handleFormChange(
                                                "expenseDate",
                                                event.target.value
                                            )
                                        }
                                    />
                                </div>

                                {/* PAYMENT METHOD */}

                                <div className="form-group">
                                    <label>
                                        Payment Method
                                        <span className="required">
                                            *
                                        </span>
                                    </label>

                                    <select
                                        value={
                                            form.paymentMethod
                                        }
                                        onChange={(event) =>
                                            handleFormChange(
                                                "paymentMethod",
                                                event.target.value
                                            )
                                        }
                                        required
                                    >
                                        {paymentMethods.map(
                                            (method) => (
                                                <option
                                                    key={method}
                                                    value={method}
                                                >
                                                    {method}
                                                </option>
                                            )
                                        )}
                                    </select>
                                </div>

                                {/* REFERENCE */}

                                <div className="form-group">
                                    <label>
                                        Reference Number
                                    </label>

                                    <input
                                        type="text"
                                        maxLength="100"
                                        value={
                                            form.referenceNumber
                                        }
                                        onChange={(event) =>
                                            handleFormChange(
                                                "referenceNumber",
                                                event.target.value
                                            )
                                        }
                                        placeholder="Receipt / transaction number"
                                    />
                                </div>

                                {/* NOTES */}

                                <div className="form-group">
                                    <label>Notes</label>

                                    <input
                                        type="text"
                                        maxLength="1000"
                                        value={form.notes}
                                        onChange={(event) =>
                                            handleFormChange(
                                                "notes",
                                                event.target.value
                                            )
                                        }
                                        placeholder="Additional notes"
                                    />
                                </div>
                            </div>

                            {/* MODAL ACTIONS */}

                            <div className="modal-actions">
                                <button
                                    type="button"
                                    className="secondary-btn"
                                    onClick={closeAddModal}
                                    disabled={saving}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="primary-btn"
                                    disabled={saving}
                                >
                                    {saving ? (
                                        <>
                                            <RefreshCw
                                                size={16}
                                                className="spin"
                                            />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Plus size={17} />
                                            Save Expense
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* =================================================
                EXPENSE DETAILS MODAL
            ================================================= */}

            {selectedExpense && (
                <div className="modal-overlay">
                    <div className="modal-box small">
                        <div className="modal-header">
                            <div>
                                <h2>Expense Details</h2>

                                <p>
                                    {
                                        selectedExpense.expenseNumber
                                    }
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    setSelectedExpense(null)
                                }
                            >
                                <X />
                            </button>
                        </div>

                        <div className="detail-list">
                            <div>
                                <span>Expense Number</span>
                                <strong>
                                    {
                                        selectedExpense.expenseNumber
                                    }
                                </strong>
                            </div>

                            <div>
                                <span>Category</span>
                                <strong>
                                    {
                                        selectedExpense.category
                                    }
                                </strong>
                            </div>

                            <div>
                                <span>Description</span>
                                <strong>
                                    {
                                        selectedExpense.description
                                    }
                                </strong>
                            </div>

                            <div>
                                <span>Amount</span>
                                <strong>
                                    {formatCurrency(
                                        selectedExpense.amount
                                    )}
                                </strong>
                            </div>

                            <div>
                                <span>Expense Date</span>
                                <strong>
                                    {formatDate(
                                        selectedExpense.expenseDate
                                    )}
                                </strong>
                            </div>

                            <div>
                                <span>Payment Method</span>
                                <strong>
                                    {
                                        selectedExpense.paymentMethod
                                    }
                                </strong>
                            </div>

                            <div>
                                <span>Reference Number</span>
                                <strong>
                                    {
                                        selectedExpense.referenceNumber ||
                                        "-"
                                    }
                                </strong>
                            </div>

                            <div>
                                <span>Notes</span>
                                <strong>
                                    {
                                        selectedExpense.notes ||
                                        "-"
                                    }
                                </strong>
                            </div>

                            <div>
                                <span>Created At</span>
                                <strong>
                                    {selectedExpense.createdAt
                                        ? new Date(
                                            selectedExpense.createdAt
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

export default Expenses;