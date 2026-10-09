import { useCallback, useEffect, useMemo, useState } from "react";

import {
    AlertTriangle,
    Bell,
    Calendar,
    Car,
    CheckCircle2,
    CircleCheck,
    CircleX,
    Clock3,
    Edit3,
    Eye,
    Filter,
    Plus,
    RefreshCw,
    Search,
    Trash2,
    User,
    X,
} from "lucide-react";

import reminderService from "../../services/reminderService";

import "./Reminders.css";


// =========================================================
// CONSTANTS
// =========================================================

const REMINDER_TYPES = {
    SERVICE: "Service",
    FOLLOW_UP: "Follow-up",
    PAYMENT: "Payment",
    ESTIMATE: "Estimate",
    DELIVERY: "Delivery",
    GENERAL: "General",
};

const emptyForm = {
    customerId: "",
    vehicleId: "",
    reminderType: "SERVICE",
    title: "",
    description: "",
    dueDate: "",
    status: "PENDING",
    priority: "MEDIUM",
    notes: "",
};


// =========================================================
// HELPERS
// =========================================================

function getTodayDate() {
    const date = new Date();

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}


function formatDate(date) {
    if (!date) {
        return "-";
    }

    const value = new Date(`${date}T00:00:00`);

    if (Number.isNaN(value.getTime())) {
        return date;
    }

    return value.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}


function getReminderNumber(id) {
    if (!id) {
        return "REM-NEW";
    }

    return `REM-${1000 + Number(id)}`;
}


function getTypeLabel(type) {
    return REMINDER_TYPES[type] || type || "-";
}


function getStatusLabel(status) {
    switch (status) {
        case "PENDING":
            return "Pending";

        case "COMPLETED":
            return "Completed";

        case "CANCELLED":
            return "Cancelled";

        default:
            return status || "-";
    }
}


function getPriorityLabel(priority) {
    switch (priority) {
        case "HIGH":
            return "High";

        case "MEDIUM":
            return "Medium";

        case "LOW":
            return "Low";

        default:
            return priority || "-";
    }
}


function getErrorMessage(error, fallback = "Something went wrong.") {
    return (
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        fallback
    );
}


function isDueToday(reminder) {
    return (
        reminder?.status === "PENDING" &&
        reminder?.dueDate === getTodayDate()
    );
}


function isOverdue(reminder) {
    if (typeof reminder?.overdue === "boolean") {
        return reminder.overdue;
    }

    if (
        reminder?.status !== "PENDING" ||
        !reminder?.dueDate
    ) {
        return false;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dueDate = new Date(
        `${reminder.dueDate}T00:00:00`
    );

    return dueDate < today;
}


// =========================================================
// COMPONENT
// =========================================================

export default function Reminders() {
    const [reminders, setReminders] = useState([]);

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const [searchTerm, setSearchTerm] = useState("");

    const [statusFilter, setStatusFilter] = useState("ALL");
    const [priorityFilter, setPriorityFilter] = useState("ALL");
    const [typeFilter, setTypeFilter] = useState("ALL");

    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState("add");

    const [selectedReminder, setSelectedReminder] =
        useState(null);

    const [formData, setFormData] =
        useState(emptyForm);


    // =========================================================
    // LOAD REMINDERS
    // =========================================================

    const loadReminders = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const data =
                await reminderService.getAllReminders();

            setReminders(
                Array.isArray(data)
                    ? data
                    : []
            );
        } catch (err) {
            setError(
                getErrorMessage(
                    err,
                    "Unable to load reminders."
                )
            );
        } finally {
            setLoading(false);
        }
    }, []);


    useEffect(() => {
        loadReminders();
    }, [loadReminders]);


    // =========================================================
    // SUCCESS MESSAGE
    // =========================================================

    const showSuccess = (message) => {
        setSuccessMessage(message);

        window.setTimeout(() => {
            setSuccessMessage("");
        }, 3000);
    };


    // =========================================================
    // STATISTICS
    // =========================================================

    const stats = useMemo(() => {
        const total = reminders.length;

        const pending = reminders.filter(
            (item) => item.status === "PENDING"
        ).length;

        const completed = reminders.filter(
            (item) => item.status === "COMPLETED"
        ).length;

        const cancelled = reminders.filter(
            (item) => item.status === "CANCELLED"
        ).length;

        const dueToday = reminders.filter(
            (item) => isDueToday(item)
        ).length;

        const overdue = reminders.filter(
            (item) => isOverdue(item)
        ).length;

        return {
            total,
            pending,
            completed,
            cancelled,
            dueToday,
            overdue,
        };
    }, [reminders]);


    // =========================================================
    // FILTERED REMINDERS
    // =========================================================

    const filteredReminders = useMemo(() => {
        const search =
            searchTerm
                .toLowerCase()
                .trim();

        return reminders.filter((reminder) => {
            const reminderNumber =
                getReminderNumber(reminder.id)
                    .toLowerCase();

            const customer =
                reminder.customerName
                    ?.toLowerCase() || "";

            const title =
                reminder.title
                    ?.toLowerCase() || "";

            const description =
                reminder.description
                    ?.toLowerCase() || "";

            const matchesSearch =
                !search ||
                reminderNumber.includes(search) ||
                customer.includes(search) ||
                title.includes(search) ||
                description.includes(search);

            const matchesStatus =
                statusFilter === "ALL" ||
                reminder.status === statusFilter;

            const matchesPriority =
                priorityFilter === "ALL" ||
                reminder.priority === priorityFilter;

            const matchesType =
                typeFilter === "ALL" ||
                reminder.reminderType === typeFilter;

            return (
                matchesSearch &&
                matchesStatus &&
                matchesPriority &&
                matchesType
            );
        });
    }, [
        reminders,
        searchTerm,
        statusFilter,
        priorityFilter,
        typeFilter,
    ]);


    // =========================================================
    // ADD MODAL
    // =========================================================

    const openAddModal = () => {
        setModalMode("add");
        setSelectedReminder(null);

        setFormData({
            ...emptyForm,
            dueDate: getTodayDate(),
        });

        setError("");
        setShowModal(true);
    };


    // =========================================================
    // EDIT MODAL
    // =========================================================

    const openEditModal = (reminder) => {
        setModalMode("edit");
        setSelectedReminder(reminder);

        setFormData({
            customerId:
                reminder.customerId
                    ? String(reminder.customerId)
                    : "",

            vehicleId:
                reminder.vehicleId
                    ? String(reminder.vehicleId)
                    : "",

            reminderType:
                reminder.reminderType || "SERVICE",

            title:
                reminder.title || "",

            description:
                reminder.description || "",

            dueDate:
                reminder.dueDate || "",

            status:
                reminder.status || "PENDING",

            priority:
                reminder.priority || "MEDIUM",

            notes:
                reminder.notes || "",
        });

        setError("");
        setShowModal(true);
    };


    // =========================================================
    // VIEW MODAL
    // =========================================================

    const openViewModal = (reminder) => {
        setModalMode("view");
        setSelectedReminder(reminder);
        setError("");
        setShowModal(true);
    };


    // =========================================================
    // CLOSE MODAL
    // =========================================================

    const closeModal = () => {
        if (submitting) {
            return;
        }

        setShowModal(false);
        setSelectedReminder(null);
        setFormData(emptyForm);
        setError("");
    };


    // =========================================================
    // INPUT CHANGE
    // =========================================================

    const handleInputChange = (event) => {
        const {
            name,
            value,
        } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };


    // =========================================================
    // CREATE / UPDATE
    // =========================================================

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");

        if (!formData.customerId) {
            setError(
                "Customer ID is required."
            );

            return;
        }

        if (!formData.title.trim()) {
            setError(
                "Reminder title is required."
            );

            return;
        }

        if (!formData.dueDate) {
            setError(
                "Due date is required."
            );

            return;
        }

        try {
            setSubmitting(true);

            if (
                modalMode === "edit" &&
                selectedReminder
            ) {
                const updated =
                    await reminderService.updateReminder(
                        selectedReminder.id,
                        formData
                    );

                setReminders((previous) =>
                    previous.map((item) =>
                        item.id === updated.id
                            ? updated
                            : item
                    )
                );

                showSuccess(
                    "Reminder updated successfully."
                );
            } else {
                const created =
                    await reminderService.createReminder(
                        formData
                    );

                setReminders((previous) => [
                    created,
                    ...previous,
                ]);

                showSuccess(
                    "Reminder created successfully."
                );
            }

            setShowModal(false);
            setSelectedReminder(null);
            setFormData(emptyForm);
        } catch (err) {
            setError(
                getErrorMessage(
                    err,
                    "Unable to save reminder."
                )
            );
        } finally {
            setSubmitting(false);
        }
    };


    // =========================================================
    // COMPLETE
    // =========================================================

    const completeReminder = async (id) => {
        try {
            setError("");

            const updated =
                await reminderService.completeReminder(
                    id
                );

            setReminders((previous) =>
                previous.map((item) =>
                    item.id === updated.id
                        ? updated
                        : item
                )
            );

            if (
                selectedReminder?.id === id
            ) {
                setSelectedReminder(updated);
            }

            showSuccess(
                "Reminder marked as completed."
            );
        } catch (err) {
            setError(
                getErrorMessage(
                    err,
                    "Unable to complete reminder."
                )
            );
        }
    };


    // =========================================================
    // CANCEL
    // =========================================================

    const cancelReminder = async (id) => {
        const confirmed =
            window.confirm(
                "Are you sure you want to cancel this reminder?"
            );

        if (!confirmed) {
            return;
        }

        try {
            setError("");

            const updated =
                await reminderService.cancelReminder(
                    id
                );

            setReminders((previous) =>
                previous.map((item) =>
                    item.id === updated.id
                        ? updated
                        : item
                )
            );

            if (
                selectedReminder?.id === id
            ) {
                setSelectedReminder(updated);
            }

            showSuccess(
                "Reminder cancelled successfully."
            );
        } catch (err) {
            setError(
                getErrorMessage(
                    err,
                    "Unable to cancel reminder."
                )
            );
        }
    };


    // =========================================================
    // DELETE
    // =========================================================

    const deleteReminder = async (id) => {
        const confirmed =
            window.confirm(
                "Are you sure you want to permanently delete this reminder?"
            );

        if (!confirmed) {
            return;
        }

        try {
            setError("");

            await reminderService.deleteReminder(
                id
            );

            setReminders((previous) =>
                previous.filter(
                    (item) => item.id !== id
                )
            );

            if (
                selectedReminder?.id === id
            ) {
                closeModal();
            }

            showSuccess(
                "Reminder deleted successfully."
            );
        } catch (err) {
            setError(
                getErrorMessage(
                    err,
                    "Unable to delete reminder."
                )
            );
        }
    };


    // =========================================================
    // CLEAR FILTERS
    // =========================================================

    const clearFilters = () => {
        setSearchTerm("");
        setStatusFilter("ALL");
        setPriorityFilter("ALL");
        setTypeFilter("ALL");
    };


    // =========================================================
    // RENDER
    // =========================================================

    return (
        <div className="reminders-page">

            {/* =================================================
                HEADER
            ================================================= */}

            <div className="reminders-header">
                <div className="page-title-row">

                    <div className="page-icon">
                        <Bell size={22} />
                    </div>

                    <div>
                        <h1>Reminders</h1>

                        <p>
                            Manage customer follow-ups,
                            service reminders and pending actions.
                        </p>
                    </div>

                </div>

                <div
                    style={{
                        display: "flex",
                        gap: "10px",
                    }}
                >
                    <button
                        type="button"
                        className="secondary-button"
                        onClick={loadReminders}
                        disabled={loading}
                    >
                        <RefreshCw
                            size={17}
                            className={
                                loading
                                    ? "reminder-spin"
                                    : ""
                            }
                        />

                        Refresh
                    </button>

                    <button
                        type="button"
                        className="primary-button"
                        onClick={openAddModal}
                    >
                        <Plus size={18} />

                        Add Reminder
                    </button>
                </div>
            </div>


            {/* =================================================
                SUCCESS MESSAGE
            ================================================= */}

            {successMessage && (
                <div
                    style={{
                        marginBottom: "16px",
                        padding: "12px 14px",
                        borderRadius: "9px",
                        border:
                            "1px solid rgba(22, 163, 74, 0.25)",
                        background:
                            "rgba(22, 163, 74, 0.08)",
                        color: "var(--success)",
                        fontSize: "13px",
                        fontWeight: 600,
                    }}
                >
                    <CheckCircle2
                        size={16}
                        style={{
                            verticalAlign: "middle",
                            marginRight: "7px",
                        }}
                    />

                    {successMessage}
                </div>
            )}


            {/* =================================================
                ERROR MESSAGE
            ================================================= */}

            {error && (
                <div
                    style={{
                        marginBottom: "16px",
                        padding: "12px 14px",
                        borderRadius: "9px",
                        border:
                            "1px solid rgba(220, 38, 38, 0.25)",
                        background:
                            "rgba(220, 38, 38, 0.08)",
                        color: "var(--danger)",
                        fontSize: "13px",
                        fontWeight: 600,
                    }}
                >
                    <AlertTriangle
                        size={16}
                        style={{
                            verticalAlign: "middle",
                            marginRight: "7px",
                        }}
                    />

                    {error}
                </div>
            )}


            {/* =================================================
                STATISTICS
            ================================================= */}

            <div className="reminder-stats">

                <div className="reminder-stat-card">
                    <div className="stat-icon blue">
                        <Bell size={20} />
                    </div>

                    <div>
                        <span>Total Reminders</span>
                        <strong>
                            {stats.total}
                        </strong>
                    </div>
                </div>


                <div className="reminder-stat-card">
                    <div className="stat-icon orange">
                        <Clock3 size={20} />
                    </div>

                    <div>
                        <span>Due Today</span>

                        <strong>
                            {stats.dueToday}
                        </strong>
                    </div>
                </div>


                <div className="reminder-stat-card">
                    <div className="stat-icon red">
                        <AlertTriangle size={20} />
                    </div>

                    <div>
                        <span>Overdue</span>

                        <strong>
                            {stats.overdue}
                        </strong>
                    </div>
                </div>


                <div className="reminder-stat-card">
                    <div className="stat-icon green">
                        <CheckCircle2 size={20} />
                    </div>

                    <div>
                        <span>Completed</span>

                        <strong>
                            {stats.completed}
                        </strong>
                    </div>
                </div>


                <div className="reminder-stat-card">
                    <div className="stat-icon purple">
                        <Clock3 size={20} />
                    </div>

                    <div>
                        <span>Pending</span>

                        <strong>
                            {stats.pending}
                        </strong>
                    </div>
                </div>

            </div>


            {/* =================================================
                TOOLBAR
            ================================================= */}

            <div className="reminders-toolbar">

                <div className="search-box">
                    <Search size={18} />

                    <input
                        type="text"
                        placeholder="Search reminder, customer..."
                        value={searchTerm}
                        onChange={(event) =>
                            setSearchTerm(
                                event.target.value
                            )
                        }
                    />
                </div>


                <div className="filter-item">
                    <Filter size={17} />

                    <select
                        value={statusFilter}
                        onChange={(event) =>
                            setStatusFilter(
                                event.target.value
                            )
                        }
                    >
                        <option value="ALL">
                            All Status
                        </option>

                        <option value="PENDING">
                            Pending
                        </option>

                        <option value="COMPLETED">
                            Completed
                        </option>

                        <option value="CANCELLED">
                            Cancelled
                        </option>
                    </select>
                </div>


                <div className="filter-item">

                    <select
                        value={priorityFilter}
                        onChange={(event) =>
                            setPriorityFilter(
                                event.target.value
                            )
                        }
                    >
                        <option value="ALL">
                            All Priority
                        </option>

                        <option value="HIGH">
                            High
                        </option>

                        <option value="MEDIUM">
                            Medium
                        </option>

                        <option value="LOW">
                            Low
                        </option>
                    </select>

                </div>


                <div className="filter-item">

                    <select
                        value={typeFilter}
                        onChange={(event) =>
                            setTypeFilter(
                                event.target.value
                            )
                        }
                    >
                        <option value="ALL">
                            All Types
                        </option>

                        {Object.entries(
                            REMINDER_TYPES
                        ).map(
                            ([value, label]) => (
                                <option
                                    key={value}
                                    value={value}
                                >
                                    {label}
                                </option>
                            )
                        )}
                    </select>

                </div>


                <button
                    type="button"
                    className="clear-filter-button"
                    onClick={clearFilters}
                >
                    Clear
                </button>

            </div>


            {/* =================================================
                TABLE
            ================================================= */}

            <div className="reminders-table-card">

                <div className="table-header">
                    <h2>Reminder List</h2>

                    <span>
                        Showing{" "}
                        {filteredReminders.length}{" "}
                        of{" "}
                        {reminders.length} reminders
                    </span>
                </div>


                <div className="table-wrapper">

                    <table className="reminders-table">

                        <thead>
                        <tr>
                            <th>Reminder</th>
                            <th>Customer</th>
                            <th>Vehicle</th>
                            <th>Reminder Type</th>
                            <th>Due Date</th>
                            <th>Priority</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                        </thead>


                        <tbody>

                        {loading ? (
                            <tr>
                                <td
                                    colSpan="8"
                                    className="empty-state"
                                >
                                    <RefreshCw
                                        size={30}
                                        className="reminder-spin"
                                    />

                                    <strong>
                                        Loading reminders...
                                    </strong>

                                    <span>
                                        Fetching reminders
                                        from the server.
                                    </span>
                                </td>
                            </tr>
                        ) : filteredReminders.length === 0 ? (
                            <tr>
                                <td
                                    colSpan="8"
                                    className="empty-state"
                                >
                                    <Bell size={30} />

                                    <strong>
                                        No reminders found
                                    </strong>

                                    <span>
                                        Try changing your
                                        filters or add a
                                        new reminder.
                                    </span>
                                </td>
                            </tr>
                        ) : (
                            filteredReminders.map(
                                (reminder) => {
                                    const overdue =
                                        isOverdue(
                                            reminder
                                        );

                                    return (
                                        <tr
                                            key={
                                                reminder.id
                                            }
                                            className={
                                                overdue
                                                    ? "overdue-row"
                                                    : ""
                                            }
                                        >

                                            {/* REMINDER */}

                                            <td>
                                                <div className="reminder-number">

                                                    <strong>
                                                        {getReminderNumber(
                                                            reminder.id
                                                        )}
                                                    </strong>

                                                    <span>
                                                        {
                                                            reminder.title
                                                        }
                                                    </span>

                                                </div>
                                            </td>


                                            {/* CUSTOMER */}

                                            <td>
                                                <div className="customer-cell">

                                                    <div className="mini-icon">
                                                        <User
                                                            size={
                                                                14
                                                            }
                                                        />
                                                    </div>

                                                    <span>
                                                        {
                                                            reminder.customerName ||
                                                            `Customer #${reminder.customerId}`
                                                        }
                                                    </span>

                                                </div>
                                            </td>


                                            {/* VEHICLE */}

                                            <td>
                                                <div className="vehicle-cell">

                                                    <Car size={15} />

                                                    {reminder.vehicleId
                                                        ? `Vehicle #${reminder.vehicleId}`
                                                        : "-"}

                                                </div>
                                            </td>


                                            {/* TYPE */}

                                            <td>
                                                <span className="type-badge">
                                                    {getTypeLabel(
                                                        reminder.reminderType
                                                    )}
                                                </span>
                                            </td>


                                            {/* DATE */}

                                            <td>

                                                <div className="date-cell">

                                                    <Calendar
                                                        size={15}
                                                    />

                                                    <div>

                                                        <strong>
                                                            {formatDate(
                                                                reminder.dueDate
                                                            )}
                                                        </strong>

                                                    </div>

                                                </div>

                                                {overdue && (
                                                    <span className="overdue-label">
                                                        Overdue
                                                    </span>
                                                )}

                                            </td>


                                            {/* PRIORITY */}

                                            <td>

                                                <span
                                                    className={`priority-badge ${
                                                        reminder.priority?.toLowerCase() ||
                                                        "medium"
                                                    }`}
                                                >
                                                    {getPriorityLabel(
                                                        reminder.priority
                                                    )}
                                                </span>

                                            </td>


                                            {/* STATUS */}

                                            <td>

                                                <span
                                                    className={`status-badge ${
                                                        reminder.status?.toLowerCase() ||
                                                        "pending"
                                                    }`}
                                                >

                                                    {reminder.status ===
                                                        "COMPLETED" && (
                                                            <CheckCircle2
                                                                size={
                                                                    14
                                                                }
                                                            />
                                                        )}

                                                    {reminder.status ===
                                                        "CANCELLED" && (
                                                            <CircleX
                                                                size={
                                                                    14
                                                                }
                                                            />
                                                        )}

                                                    {reminder.status ===
                                                        "PENDING" && (
                                                            <Clock3
                                                                size={
                                                                    14
                                                                }
                                                            />
                                                        )}

                                                    {getStatusLabel(
                                                        reminder.status
                                                    )}

                                                </span>

                                            </td>


                                            {/* ACTIONS */}

                                            <td>

                                                <div className="action-buttons">

                                                    {/* VIEW */}

                                                    <button
                                                        type="button"
                                                        className="icon-button"
                                                        title="View"
                                                        onClick={() =>
                                                            openViewModal(
                                                                reminder
                                                            )
                                                        }
                                                    >
                                                        <Eye
                                                            size={
                                                                17
                                                            }
                                                        />
                                                    </button>


                                                    {/* EDIT */}

                                                    <button
                                                        type="button"
                                                        className="icon-button"
                                                        title="Edit"
                                                        onClick={() =>
                                                            openEditModal(
                                                                reminder
                                                            )
                                                        }
                                                    >
                                                        <Edit3
                                                            size={
                                                                17
                                                            }
                                                        />
                                                    </button>


                                                    {/* COMPLETE */}

                                                    {reminder.status ===
                                                        "PENDING" && (
                                                            <button
                                                                type="button"
                                                                className="icon-button success"
                                                                title="Complete"
                                                                onClick={() =>
                                                                    completeReminder(
                                                                        reminder.id
                                                                    )
                                                                }
                                                            >
                                                                <CheckCircle2
                                                                    size={
                                                                        17
                                                                    }
                                                                />
                                                            </button>
                                                        )}


                                                    {/* CANCEL */}

                                                    {reminder.status ===
                                                        "PENDING" && (
                                                            <button
                                                                type="button"
                                                                className="icon-button danger"
                                                                title="Cancel"
                                                                onClick={() =>
                                                                    cancelReminder(
                                                                        reminder.id
                                                                    )
                                                                }
                                                            >
                                                                <CircleX
                                                                    size={
                                                                        17
                                                                    }
                                                                />
                                                            </button>
                                                        )}


                                                    {/* DELETE */}

                                                    <button
                                                        type="button"
                                                        className="icon-button danger"
                                                        title="Delete"
                                                        onClick={() =>
                                                            deleteReminder(
                                                                reminder.id
                                                            )
                                                        }
                                                    >
                                                        <Trash2
                                                            size={
                                                                17
                                                            }
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
                MODAL
            ================================================= */}

            {showModal && (
                <div
                    className="modal-overlay"
                    onClick={closeModal}
                >

                    <div
                        className="reminder-modal"
                        onClick={(event) =>
                            event.stopPropagation()
                        }
                    >

                        {/* MODAL HEADER */}

                        <div className="modal-header">

                            <div>

                                <h2>
                                    {modalMode === "add"
                                        ? "Add Reminder"
                                        : modalMode === "edit"
                                            ? "Edit Reminder"
                                            : "Reminder Details"}
                                </h2>

                                {selectedReminder && (
                                    <span>
                                        {getReminderNumber(
                                            selectedReminder.id
                                        )}
                                    </span>
                                )}

                            </div>

                            <button
                                type="button"
                                className="close-button"
                                onClick={closeModal}
                                disabled={submitting}
                            >
                                <X size={20} />
                            </button>

                        </div>


                        {/* =================================================
                            VIEW
                        ================================================= */}

                        {modalMode === "view" &&
                        selectedReminder ? (
                            <div className="view-content">

                                <div className="view-title">

                                    <div className="large-reminder-icon">
                                        <Bell size={24} />
                                    </div>

                                    <div>

                                        <h3>
                                            {
                                                selectedReminder.title
                                            }
                                        </h3>

                                        <span>
                                            {getTypeLabel(
                                                selectedReminder.reminderType
                                            )}
                                        </span>

                                    </div>

                                </div>


                                <div className="detail-grid">

                                    <div className="detail-item">
                                        <span>
                                            Customer
                                        </span>

                                        <strong>
                                            {selectedReminder.customerName ||
                                                `Customer #${selectedReminder.customerId}`}
                                        </strong>
                                    </div>


                                    <div className="detail-item">
                                        <span>
                                            Customer ID
                                        </span>

                                        <strong>
                                            {
                                                selectedReminder.customerId
                                            }
                                        </strong>
                                    </div>


                                    <div className="detail-item">
                                        <span>
                                            Vehicle ID
                                        </span>

                                        <strong>
                                            {selectedReminder.vehicleId ||
                                                "-"}
                                        </strong>
                                    </div>


                                    <div className="detail-item">
                                        <span>
                                            Reminder Type
                                        </span>

                                        <strong>
                                            {getTypeLabel(
                                                selectedReminder.reminderType
                                            )}
                                        </strong>
                                    </div>


                                    <div className="detail-item">
                                        <span>
                                            Due Date
                                        </span>

                                        <strong>
                                            {formatDate(
                                                selectedReminder.dueDate
                                            )}
                                        </strong>
                                    </div>


                                    <div className="detail-item">
                                        <span>
                                            Priority
                                        </span>

                                        <strong>
                                            {getPriorityLabel(
                                                selectedReminder.priority
                                            )}
                                        </strong>
                                    </div>


                                    <div className="detail-item">
                                        <span>
                                            Status
                                        </span>

                                        <strong>
                                            {getStatusLabel(
                                                selectedReminder.status
                                            )}
                                        </strong>
                                    </div>


                                    <div className="detail-item">
                                        <span>
                                            Created
                                        </span>

                                        <strong>
                                            {selectedReminder.createdAt
                                                ? new Date(
                                                    selectedReminder.createdAt
                                                ).toLocaleString(
                                                    "en-IN"
                                                )
                                                : "-"}
                                        </strong>
                                    </div>

                                </div>


                                <div className="notes-box">

                                    <span>
                                        Description
                                    </span>

                                    <p>
                                        {selectedReminder.description ||
                                            "No description available."}
                                    </p>

                                </div>


                                <div className="notes-box">

                                    <span>
                                        Notes
                                    </span>

                                    <p>
                                        {selectedReminder.notes ||
                                            "No notes available."}
                                    </p>

                                </div>


                                <div className="modal-footer">

                                    <button
                                        type="button"
                                        className="secondary-button"
                                        onClick={closeModal}
                                    >
                                        Close
                                    </button>


                                    {selectedReminder.status ===
                                        "PENDING" && (
                                            <>
                                                <button
                                                    type="button"
                                                    className="secondary-button"
                                                    onClick={() =>
                                                        cancelReminder(
                                                            selectedReminder.id
                                                        )
                                                    }
                                                >
                                                    <CircleX
                                                        size={17}
                                                    />

                                                    Cancel Reminder
                                                </button>

                                                <button
                                                    type="button"
                                                    className="primary-button"
                                                    onClick={async () => {
                                                        await completeReminder(
                                                            selectedReminder.id
                                                        );

                                                        setShowModal(
                                                            false
                                                        );
                                                    }}
                                                >
                                                    <CircleCheck
                                                        size={17}
                                                    />

                                                    Mark Completed
                                                </button>
                                            </>
                                        )}

                                </div>

                            </div>
                        ) : (

                            /* =================================================
                               ADD / EDIT FORM
                            ================================================= */

                            <form
                                onSubmit={
                                    handleSubmit
                                }
                            >

                                <div className="form-grid">

                                    {/* CUSTOMER ID */}

                                    <div className="form-group">

                                        <label>
                                            Customer ID *
                                        </label>

                                        <input
                                            type="number"
                                            name="customerId"
                                            value={
                                                formData.customerId
                                            }
                                            onChange={
                                                handleInputChange
                                            }
                                            placeholder="Enter customer ID"
                                            min="1"
                                            required
                                        />

                                    </div>


                                    {/* VEHICLE ID */}

                                    <div className="form-group">

                                        <label>
                                            Vehicle ID
                                        </label>

                                        <input
                                            type="number"
                                            name="vehicleId"
                                            value={
                                                formData.vehicleId
                                            }
                                            onChange={
                                                handleInputChange
                                            }
                                            placeholder="Enter vehicle ID"
                                            min="1"
                                        />

                                    </div>


                                    {/* TITLE */}

                                    <div className="form-group full-width">

                                        <label>
                                            Reminder Title *
                                        </label>

                                        <input
                                            type="text"
                                            name="title"
                                            value={
                                                formData.title
                                            }
                                            onChange={
                                                handleInputChange
                                            }
                                            placeholder="Enter reminder title"
                                            maxLength="200"
                                            required
                                        />

                                    </div>


                                    {/* TYPE */}

                                    <div className="form-group">

                                        <label>
                                            Reminder Type
                                        </label>

                                        <select
                                            name="reminderType"
                                            value={
                                                formData.reminderType
                                            }
                                            onChange={
                                                handleInputChange
                                            }
                                        >
                                            {Object.entries(
                                                REMINDER_TYPES
                                            ).map(
                                                ([value, label]) => (
                                                    <option
                                                        key={
                                                            value
                                                        }
                                                        value={
                                                            value
                                                        }
                                                    >
                                                        {label}
                                                    </option>
                                                )
                                            )}
                                        </select>

                                    </div>


                                    {/* PRIORITY */}

                                    <div className="form-group">

                                        <label>
                                            Priority
                                        </label>

                                        <select
                                            name="priority"
                                            value={
                                                formData.priority
                                            }
                                            onChange={
                                                handleInputChange
                                            }
                                        >
                                            <option value="LOW">
                                                Low
                                            </option>

                                            <option value="MEDIUM">
                                                Medium
                                            </option>

                                            <option value="HIGH">
                                                High
                                            </option>
                                        </select>

                                    </div>


                                    {/* DUE DATE */}

                                    <div className="form-group">

                                        <label>
                                            Due Date *
                                        </label>

                                        <input
                                            type="date"
                                            name="dueDate"
                                            value={
                                                formData.dueDate
                                            }
                                            onChange={
                                                handleInputChange
                                            }
                                            required
                                        />

                                    </div>


                                    {/* STATUS */}

                                    <div className="form-group">

                                        <label>
                                            Status
                                        </label>

                                        <select
                                            name="status"
                                            value={
                                                formData.status
                                            }
                                            onChange={
                                                handleInputChange
                                            }
                                        >
                                            <option value="PENDING">
                                                Pending
                                            </option>

                                            <option value="COMPLETED">
                                                Completed
                                            </option>

                                            <option value="CANCELLED">
                                                Cancelled
                                            </option>
                                        </select>

                                    </div>


                                    {/* DESCRIPTION */}

                                    <div className="form-group full-width">

                                        <label>
                                            Description
                                        </label>

                                        <textarea
                                            name="description"
                                            value={
                                                formData.description
                                            }
                                            onChange={
                                                handleInputChange
                                            }
                                            placeholder="Enter reminder description..."
                                            rows="3"
                                            maxLength="500"
                                        />

                                    </div>


                                    {/* NOTES */}

                                    <div className="form-group full-width">

                                        <label>
                                            Notes
                                        </label>

                                        <textarea
                                            name="notes"
                                            value={
                                                formData.notes
                                            }
                                            onChange={
                                                handleInputChange
                                            }
                                            placeholder="Enter reminder notes..."
                                            rows="4"
                                            maxLength="1000"
                                        />

                                    </div>

                                </div>


                                {/* FORM FOOTER */}

                                <div className="modal-footer">

                                    <button
                                        type="button"
                                        className="secondary-button"
                                        onClick={
                                            closeModal
                                        }
                                        disabled={
                                            submitting
                                        }
                                    >
                                        Cancel
                                    </button>


                                    <button
                                        type="submit"
                                        className="primary-button"
                                        disabled={
                                            submitting
                                        }
                                    >

                                        {submitting ? (
                                            <>
                                                <RefreshCw
                                                    size={17}
                                                    className="reminder-spin"
                                                />

                                                Saving...
                                            </>
                                        ) : modalMode ===
                                        "edit" ? (
                                            <>
                                                <Edit3
                                                    size={17}
                                                />

                                                Update Reminder
                                            </>
                                        ) : (
                                            <>
                                                <Plus
                                                    size={17}
                                                />

                                                Create Reminder
                                            </>
                                        )}

                                    </button>

                                </div>

                            </form>
                        )}

                    </div>

                </div>
            )}

        </div>
    );
}