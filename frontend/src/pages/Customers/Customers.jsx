import { useEffect, useMemo, useState } from "react";
import {
    Car,
    Edit3,
    Eye,
    Mail,
    MoreVertical,
    Phone,
    Plus,
    Search,
    Trash2,
    UserPlus,
    Users,
    X,
} from "lucide-react";

import customerService from "../../services/customerService";

import "./Customers.css";

const emptyForm = {
    name: "",
    phone: "",
    email: "",
    city: "",
};

function Customers() {
    const [customers, setCustomers] = useState([]);

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [error, setError] = useState("");

    const [search, setSearch] = useState("");

    const [statusFilter, setStatusFilter] = useState("ALL");

    const [showForm, setShowForm] = useState(false);

    const [showDetails, setShowDetails] = useState(false);

    const [editingCustomer, setEditingCustomer] = useState(null);

    const [selectedCustomer, setSelectedCustomer] = useState(null);

    const [formData, setFormData] = useState(emptyForm);

    const [currentPage, setCurrentPage] = useState(1);

    const customersPerPage = 6;

    /*
     * ==========================================
     * LOAD CUSTOMERS
     * ==========================================
     */

    const loadCustomers = async () => {
        setLoading(true);
        setError("");

        try {
            const data = await customerService.getAllCustomers();

            setCustomers(
                Array.isArray(data)
                    ? data
                    : []
            );
        } catch (err) {
            console.error(
                "Failed to load customers:",
                err
            );

            setError(
                err.response?.data?.message ||
                err.response?.data?.error ||
                "Unable to load customers. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCustomers();
    }, []);

    /*
     * ==========================================
     * FILTER CUSTOMERS
     * ==========================================
     */

    const filteredCustomers = useMemo(() => {
        const keyword = search
            .trim()
            .toLowerCase();

        return customers.filter((customer) => {
            const name =
                customer.name?.toLowerCase() || "";

            const code =
                customer.customerCode?.toLowerCase() || "";

            const phone =
                customer.phone?.toLowerCase() || "";

            const email =
                customer.email?.toLowerCase() || "";

            const city =
                customer.city?.toLowerCase() || "";

            const matchesSearch =
                !keyword ||
                name.includes(keyword) ||
                code.includes(keyword) ||
                phone.includes(keyword) ||
                email.includes(keyword) ||
                city.includes(keyword);

            const matchesStatus =
                statusFilter === "ALL" ||
                (statusFilter === "ACTIVE" &&
                    customer.active) ||
                (statusFilter === "INACTIVE" &&
                    !customer.active);

            return (
                matchesSearch &&
                matchesStatus
            );
        });
    }, [
        customers,
        search,
        statusFilter,
    ]);

    /*
     * ==========================================
     * PAGINATION
     * ==========================================
     */

    const totalPages = Math.max(
        1,
        Math.ceil(
            filteredCustomers.length /
            customersPerPage
        )
    );

    const safePage = Math.min(
        currentPage,
        totalPages
    );

    const startIndex =
        (safePage - 1) *
        customersPerPage;

    const displayedCustomers =
        filteredCustomers.slice(
            startIndex,
            startIndex +
            customersPerPage
        );

    /*
     * ==========================================
     * SUMMARY
     * ==========================================
     */

    const totalCustomers =
        customers.length;

    const activeCustomers =
        customers.filter(
            (customer) =>
                customer.active
        ).length;

    /*
     * Vehicle count is currently not returned
     * by CustomerResponse.
     *
     * The real count will be connected when
     * Vehicle API integration is completed.
     */

    const totalVehicles = customers.reduce(
        (total, customer) =>
            total +
            Number(customer.vehicles || 0),
        0
    );

    /*
     * ==========================================
     * FORM
     * ==========================================
     */

    const openAddForm = () => {
        setEditingCustomer(null);

        setFormData({
            ...emptyForm,
        });

        setError("");

        setShowForm(true);
    };

    const openEditForm = (customer) => {
        setEditingCustomer(customer);

        setFormData({
            name: customer.name || "",
            phone: customer.phone || "",
            email: customer.email || "",
            city: customer.city || "",
        });

        setError("");

        setShowForm(true);
    };

    const closeForm = () => {
        if (submitting) {
            return;
        }

        setShowForm(false);

        setEditingCustomer(null);

        setFormData({
            ...emptyForm,
        });
    };

    const handleFormChange = (event) => {
        const {
            name,
            value,
        } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    /*
     * ==========================================
     * CREATE / UPDATE
     * ==========================================
     */

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (
            !formData.name.trim() ||
            !formData.phone.trim()
        ) {
            return;
        }

        setSubmitting(true);
        setError("");

        const customerData = {
            name: formData.name.trim(),
            phone: formData.phone.trim(),
            email:
                formData.email.trim() ||
                null,
            city:
                formData.city.trim() ||
                null,
        };

        try {
            if (editingCustomer) {
                await customerService.updateCustomer(
                    editingCustomer.id,
                    customerData
                );
            } else {
                await customerService.createCustomer(
                    customerData
                );

                setCurrentPage(1);
            }

            await loadCustomers();

            closeForm();
        } catch (err) {
            console.error(
                "Failed to save customer:",
                err
            );

            setError(
                err.response?.data?.message ||
                err.response?.data?.error ||
                "Unable to save customer. Please try again."
            );
        } finally {
            setSubmitting(false);
        }
    };

    /*
     * ==========================================
     * VIEW CUSTOMER
     * ==========================================
     */

    const openDetails = (customer) => {
        setSelectedCustomer(customer);

        setShowDetails(true);
    };

    const closeDetails = () => {
        setShowDetails(false);

        setSelectedCustomer(null);
    };

    /*
     * ==========================================
     * DEACTIVATE CUSTOMER
     * ==========================================
     */

    const deactivateCustomer = async (customer) => {
        const confirmed = window.confirm(
            `Deactivate customer "${customer.name}"?`
        );

        if (!confirmed) {
            return;
        }

        setError("");

        try {
            await customerService.deactivateCustomer(
                customer.id
            );

            await loadCustomers();

            if (
                selectedCustomer &&
                selectedCustomer.id === customer.id
            ) {
                setSelectedCustomer({
                    ...selectedCustomer,
                    active: false,
                });
            }
        } catch (err) {
            console.error(
                "Failed to deactivate customer:",
                err
            );

            setError(
                err.response?.data?.message ||
                err.response?.data?.error ||
                "Unable to deactivate customer."
            );
        }
    };

    /*
     * ==========================================
     * PAGE CHANGE
     * ==========================================
     */

    const changePage = (page) => {
        if (
            page < 1 ||
            page > totalPages
        ) {
            return;
        }

        setCurrentPage(page);
    };

    /*
     * ==========================================
     * ERROR DISMISS
     * ==========================================
     */

    const clearError = () => {
        setError("");
    };

    /*
     * ==========================================
     * RENDER
     * ==========================================
     */

    return (
        <main className="customers-page">

            {/* =====================================
                HEADER
            ===================================== */}

            <section className="customers-header">

                <div className="customers-header-content">

                    <div className="customers-title-icon">
                        <Users size={22} />
                    </div>

                    <div>

                        <span className="customers-eyebrow">
                            CUSTOMER MANAGEMENT
                        </span>

                        <h1>
                            Customers
                        </h1>

                        <p>
                            Manage customer information and vehicle ownership.
                        </p>

                    </div>

                </div>

                <button
                    type="button"
                    className="customers-primary-button"
                    onClick={openAddForm}
                >
                    <Plus size={17} />
                    Add Customer
                </button>

            </section>


            {/* =====================================
                ERROR MESSAGE
            ===================================== */}

            {error && (
                <div
                    style={{
                        marginBottom: "16px",
                        padding: "12px 14px",
                        borderRadius: "9px",
                        border: "1px solid rgba(220, 38, 38, 0.25)",
                        background: "rgba(220, 38, 38, 0.08)",
                        color: "var(--danger)",
                        fontSize: "11px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "12px",
                    }}
                >
                    <span>
                        {error}
                    </span>

                    <button
                        type="button"
                        onClick={clearError}
                        style={{
                            border: 0,
                            background: "transparent",
                            color: "inherit",
                            fontSize: "18px",
                            cursor: "pointer",
                        }}
                    >
                        ×
                    </button>
                </div>
            )}


            {/* =====================================
                SUMMARY
            ===================================== */}

            <section className="customer-summary">

                <div className="customer-summary-card">

                    <div className="customer-summary-icon">
                        <Users size={18} />
                    </div>

                    <div>

                        <span>
                            Total Customers
                        </span>

                        <strong>
                            {loading
                                ? "—"
                                : totalCustomers}
                        </strong>

                    </div>

                </div>


                <div className="customer-summary-card">

                    <div className="customer-summary-icon">
                        <UserPlus size={18} />
                    </div>

                    <div>

                        <span>
                            Active Customers
                        </span>

                        <strong>
                            {loading
                                ? "—"
                                : activeCustomers}
                        </strong>

                    </div>

                </div>


                <div className="customer-summary-card">

                    <div className="customer-summary-icon">
                        <Car size={18} />
                    </div>

                    <div>

                        <span>
                            Total Vehicles
                        </span>

                        <strong>
                            {loading
                                ? "—"
                                : totalVehicles}
                        </strong>

                    </div>

                </div>

            </section>


            {/* =====================================
                TABLE CARD
            ===================================== */}

            <section className="customers-table-card">

                {/* =================================
                    TOOLBAR
                ================================= */}

                <div className="customers-toolbar">

                    <div className="customer-search">

                        <Search size={17} />

                        <input
                            type="text"
                            placeholder="Search by name, code, phone or email..."
                            value={search}
                            onChange={(event) => {
                                setSearch(
                                    event.target.value
                                );

                                setCurrentPage(1);
                            }}
                        />

                        {search && (
                            <button
                                type="button"
                                className="search-clear"
                                onClick={() => {
                                    setSearch("");

                                    setCurrentPage(1);
                                }}
                            >
                                <X size={15} />
                            </button>
                        )}

                    </div>


                    <div className="customer-filters">

                        <select
                            value={statusFilter}
                            onChange={(event) => {
                                setStatusFilter(
                                    event.target.value
                                );

                                setCurrentPage(1);
                            }}
                        >
                            <option value="ALL">
                                All Customers
                            </option>

                            <option value="ACTIVE">
                                Active
                            </option>

                            <option value="INACTIVE">
                                Inactive
                            </option>

                        </select>

                    </div>

                </div>


                {/* =================================
                    TABLE
                ================================= */}

                <div className="customers-table-wrapper">

                    <table className="customers-table">

                        <thead>

                        <tr>

                            <th>
                                Customer
                            </th>

                            <th>
                                Contact
                            </th>

                            <th>
                                Location
                            </th>

                            <th>
                                Vehicles
                            </th>

                            <th>
                                Status
                            </th>

                            <th className="actions-column">
                                Actions
                            </th>

                        </tr>

                        </thead>


                        <tbody>

                        {loading ? (

                            <tr>

                                <td
                                    colSpan="6"
                                    className="customer-empty-cell"
                                >

                                    <strong>
                                        Loading customers...
                                    </strong>

                                    <span>
                                        Please wait while customer data is loaded.
                                    </span>

                                </td>

                            </tr>

                        ) : displayedCustomers.length > 0 ? (

                            displayedCustomers.map(
                                (customer) => (

                                    <tr
                                        key={customer.id}
                                    >

                                        {/* CUSTOMER */}

                                        <td>

                                            <div className="customer-name-cell">

                                                <div className="customer-avatar">

                                                    {(
                                                        customer.name ||
                                                        "?"
                                                    )
                                                        .charAt(0)
                                                        .toUpperCase()}

                                                </div>

                                                <div>

                                                    <strong>
                                                        {customer.name}
                                                    </strong>

                                                    <span>
                                                        {customer.customerCode ||
                                                            "—"}
                                                    </span>

                                                </div>

                                            </div>

                                        </td>


                                        {/* CONTACT */}

                                        <td>

                                            <div className="customer-contact-cell">

                                                <span>

                                                    <Phone size={13} />

                                                    {customer.phone ||
                                                        "No phone"}

                                                </span>

                                                <span>

                                                    <Mail size={13} />

                                                    {customer.email ||
                                                        "No email"}

                                                </span>

                                            </div>

                                        </td>


                                        {/* LOCATION */}

                                        <td>

                                            <span className="customer-city">

                                                {customer.city ||
                                                    "—"}

                                            </span>

                                        </td>


                                        {/* VEHICLES */}

                                        <td>

                                            <div className="vehicle-count">

                                                <Car size={15} />

                                                {customer.vehicles ||
                                                    0}

                                            </div>

                                        </td>


                                        {/* STATUS */}

                                        <td>

                                            <span
                                                className={`customer-status ${
                                                    customer.active
                                                        ? "active"
                                                        : "inactive"
                                                }`}
                                            >

                                                <span />

                                                {customer.active
                                                    ? "Active"
                                                    : "Inactive"}

                                            </span>

                                        </td>


                                        {/* ACTIONS */}

                                        <td>

                                            <div className="customer-actions">

                                                <button
                                                    type="button"
                                                    title="View customer"
                                                    onClick={() =>
                                                        openDetails(
                                                            customer
                                                        )
                                                    }
                                                >
                                                    <Eye size={16} />
                                                </button>


                                                <button
                                                    type="button"
                                                    title="Edit customer"
                                                    onClick={() =>
                                                        openEditForm(
                                                            customer
                                                        )
                                                    }
                                                >
                                                    <Edit3 size={16} />
                                                </button>


                                                {customer.active && (
                                                    <button
                                                        type="button"
                                                        title="Deactivate customer"
                                                        className="danger-action"
                                                        onClick={() =>
                                                            deactivateCustomer(
                                                                customer
                                                            )
                                                        }
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                )}


                                                <button
                                                    type="button"
                                                    title="More actions"
                                                >
                                                    <MoreVertical size={16} />
                                                </button>

                                            </div>

                                        </td>

                                    </tr>

                                )
                            )

                        ) : (

                            <tr>

                                <td
                                    colSpan="6"
                                    className="customer-empty-cell"
                                >

                                    <Users size={32} />

                                    <strong>
                                        No customers found
                                    </strong>

                                    <span>
                                        Try changing your search or filter.
                                    </span>

                                </td>

                            </tr>

                        )}

                        </tbody>

                    </table>

                </div>


                {/* =================================
                    PAGINATION
                ================================= */}

                <div className="customers-pagination">

                    <span>

                        Showing{" "}

                        {filteredCustomers.length === 0
                            ? 0
                            : startIndex + 1}

                        {" "}to{" "}

                        {Math.min(
                            startIndex +
                            customersPerPage,
                            filteredCustomers.length
                        )}

                        {" "}of{" "}

                        {filteredCustomers.length}

                        {" "}customers

                    </span>


                    <div className="pagination-buttons">

                        <button
                            type="button"
                            disabled={
                                safePage === 1
                            }
                            onClick={() =>
                                changePage(
                                    safePage - 1
                                )
                            }
                        >
                            Previous
                        </button>


                        {Array.from(
                            {
                                length: totalPages,
                            },
                            (_, index) =>
                                index + 1
                        ).map((page) => (

                            <button
                                type="button"
                                key={page}
                                className={
                                    page === safePage
                                        ? "current"
                                        : ""
                                }
                                onClick={() =>
                                    changePage(page)
                                }
                            >
                                {page}
                            </button>

                        ))}


                        <button
                            type="button"
                            disabled={
                                safePage === totalPages
                            }
                            onClick={() =>
                                changePage(
                                    safePage + 1
                                )
                            }
                        >
                            Next
                        </button>

                    </div>

                </div>

            </section>


            {/* =====================================
                ADD / EDIT MODAL
            ===================================== */}

            {showForm && (
                <div
                    className="customer-modal-overlay"
                    onMouseDown={(event) => {

                        if (
                            event.target ===
                            event.currentTarget
                        ) {
                            closeForm();
                        }

                    }}
                >

                    <div className="customer-modal">

                        <div className="customer-modal-header">

                            <div>

                                <span className="customers-eyebrow">
                                    CUSTOMER
                                </span>

                                <h2>
                                    {editingCustomer
                                        ? "Edit Customer"
                                        : "Add Customer"}
                                </h2>

                            </div>


                            <button
                                type="button"
                                onClick={closeForm}
                                className="modal-close-button"
                                disabled={submitting}
                            >
                                <X size={18} />
                            </button>

                        </div>


                        <form
                            onSubmit={handleSubmit}
                        >

                            <div className="customer-form-grid">

                                <div className="customer-form-field full">

                                    <label htmlFor="customer-name">
                                        Full Name *
                                    </label>

                                    <input
                                        id="customer-name"
                                        name="name"
                                        value={
                                            formData.name
                                        }
                                        onChange={
                                            handleFormChange
                                        }
                                        placeholder="Enter customer name"
                                        required
                                        disabled={submitting}
                                    />

                                </div>


                                <div className="customer-form-field">

                                    <label htmlFor="customer-phone">
                                        Phone *
                                    </label>

                                    <input
                                        id="customer-phone"
                                        name="phone"
                                        value={
                                            formData.phone
                                        }
                                        onChange={
                                            handleFormChange
                                        }
                                        placeholder="Enter phone number"
                                        required
                                        disabled={submitting}
                                    />

                                </div>


                                <div className="customer-form-field">

                                    <label htmlFor="customer-email">
                                        Email
                                    </label>

                                    <input
                                        id="customer-email"
                                        name="email"
                                        type="email"
                                        value={
                                            formData.email
                                        }
                                        onChange={
                                            handleFormChange
                                        }
                                        placeholder="Enter email"
                                        disabled={submitting}
                                    />

                                </div>


                                <div className="customer-form-field full">

                                    <label htmlFor="customer-city">
                                        City
                                    </label>

                                    <input
                                        id="customer-city"
                                        name="city"
                                        value={
                                            formData.city
                                        }
                                        onChange={
                                            handleFormChange
                                        }
                                        placeholder="Enter city"
                                        disabled={submitting}
                                    />

                                </div>

                            </div>


                            <div className="customer-modal-footer">

                                <button
                                    type="button"
                                    className="customer-secondary-button"
                                    onClick={closeForm}
                                    disabled={submitting}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="customers-primary-button"
                                    disabled={submitting}
                                >
                                    {submitting
                                        ? "Saving..."
                                        : editingCustomer
                                            ? "Save Changes"
                                            : "Create Customer"}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>
            )}


            {/* =====================================
                DETAILS MODAL
            ===================================== */}

            {showDetails &&
                selectedCustomer && (
                    <div
                        className="customer-modal-overlay"
                        onMouseDown={(event) => {

                            if (
                                event.target ===
                                event.currentTarget
                            ) {
                                closeDetails();
                            }

                        }}
                    >

                        <div className="customer-modal customer-details-modal">

                            <div className="customer-modal-header">

                                <div>

                                    <span className="customers-eyebrow">
                                        CUSTOMER PROFILE
                                    </span>

                                    <h2>
                                        {
                                            selectedCustomer.name
                                        }
                                    </h2>

                                </div>


                                <button
                                    type="button"
                                    onClick={
                                        closeDetails
                                    }
                                    className="modal-close-button"
                                >
                                    <X size={18} />
                                </button>

                            </div>


                            <div className="customer-profile">

                                <div className="customer-profile-avatar">

                                    {(
                                        selectedCustomer.name ||
                                        "?"
                                    )
                                        .charAt(0)
                                        .toUpperCase()}

                                </div>

                                <div>

                                    <strong>
                                        {
                                            selectedCustomer.name
                                        }
                                    </strong>

                                    <span>
                                        {
                                            selectedCustomer.customerCode ||
                                            "—"
                                        }
                                    </span>

                                </div>

                            </div>


                            <div className="customer-detail-grid">

                                <div>

                                    <span>
                                        Phone
                                    </span>

                                    <strong>
                                        {
                                            selectedCustomer.phone ||
                                            "—"
                                        }
                                    </strong>

                                </div>


                                <div>

                                    <span>
                                        Email
                                    </span>

                                    <strong>
                                        {
                                            selectedCustomer.email ||
                                            "—"
                                        }
                                    </strong>

                                </div>


                                <div>

                                    <span>
                                        City
                                    </span>

                                    <strong>
                                        {
                                            selectedCustomer.city ||
                                            "—"
                                        }
                                    </strong>

                                </div>


                                <div>

                                    <span>
                                        Vehicles
                                    </span>

                                    <strong>
                                        {
                                            selectedCustomer.vehicles ||
                                            0
                                        }
                                    </strong>

                                </div>


                                <div>

                                    <span>
                                        Status
                                    </span>

                                    <strong>
                                        {
                                            selectedCustomer.active
                                                ? "Active"
                                                : "Inactive"
                                        }
                                    </strong>

                                </div>

                            </div>


                            <div className="customer-modal-footer">

                                <button
                                    type="button"
                                    className="customer-secondary-button"
                                    onClick={
                                        closeDetails
                                    }
                                >
                                    Close
                                </button>

                                <button
                                    type="button"
                                    className="customers-primary-button"
                                    onClick={() => {

                                        closeDetails();

                                        openEditForm(
                                            selectedCustomer
                                        );

                                    }}
                                >
                                    <Edit3 size={15} />
                                    Edit Customer
                                </button>

                            </div>

                        </div>

                    </div>
                )}

        </main>
    );
}

export default Customers;