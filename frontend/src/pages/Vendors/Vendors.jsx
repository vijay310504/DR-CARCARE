import { useEffect, useMemo, useState } from "react";
import {
    Building2,
    CheckCircle2,
    Edit3,
    Eye,
    Mail,
    Phone,
    Plus,
    Search,
    X,
    XCircle,
} from "lucide-react";

import vendorService from "../../services/vendorService";
import purchaseService from "../../services/purchaseService";

import "./Vendors.css";

const getEmptyForm = () => ({
    vendorCode: "",
    vendorName: "",
    contactPerson: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    gstin: "",
    category: "Spare Parts",
    paymentTerms: "",
    status: "ACTIVE",
    notes: "",
});

const categories = [
    "Spare Parts",
    "Battery",
    "Tyres",
    "AC & Cooling",
    "Fluids",
    "Electrical",
    "General",
];

const formatCurrency = (value) =>
    `₹${Number(value || 0).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;

const normalizeList = (data) => {
    if (Array.isArray(data)) {
        return data;
    }

    if (Array.isArray(data?.content)) {
        return data.content;
    }

    if (Array.isArray(data?.data)) {
        return data.data;
    }

    return [];
};

const getErrorMessage = (error, fallback) => {
    const status = error?.response?.status;
    const data = error?.response?.data;

    if (typeof data === "string" && data.trim()) {
        return status
            ? `${data} (${status})`
            : data;
    }

    if (data?.message) {
        return status
            ? `${data.message} (${status})`
            : data.message;
    }

    if (data?.error) {
        return status
            ? `${data.error} (${status})`
            : data.error;
    }

    if (error?.message) {
        return error.message;
    }

    return fallback;
};

const generateVendorCode = (vendors) => {
    let highestNumber = 0;

    vendors.forEach((vendor) => {
        const code = String(
            vendor.vendorCode || ""
        ).toUpperCase();

        const match = code.match(/^VEN-(\d+)$/);

        if (match) {
            highestNumber = Math.max(
                highestNumber,
                Number(match[1])
            );
        }
    });

    return `VEN-${String(
        highestNumber + 1
    ).padStart(3, "0")}`;
};

function Vendors() {
    const [vendors, setVendors] = useState([]);
    const [purchases, setPurchases] = useState([]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [actionLoading, setActionLoading] = useState(null);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");

    const [showForm, setShowForm] = useState(false);
    const [showView, setShowView] = useState(false);

    const [editingVendor, setEditingVendor] = useState(null);
    const [selectedVendor, setSelectedVendor] = useState(null);

    const [form, setForm] = useState(getEmptyForm());

    // =========================================================
    // LOAD VENDORS + PURCHASES
    // =========================================================

    const loadVendors = async () => {
        setLoading(true);
        setError("");

        try {
            const [
                vendorResponse,
                purchaseResponse,
            ] = await Promise.all([
                vendorService.getAllVendors(),
                purchaseService.getAllPurchases(),
            ]);

            setVendors(
                normalizeList(vendorResponse)
            );

            setPurchases(
                normalizeList(purchaseResponse)
            );
        } catch (err) {
            console.error(
                "Vendor loading error:",
                err
            );

            setError(
                getErrorMessage(
                    err,
                    "Unable to load vendors."
                )
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadVendors();
    }, []);

    // =========================================================
    // PURCHASE TOTALS BY VENDOR
    // =========================================================

    const vendorPurchaseTotals = useMemo(() => {
        const totals = {};

        purchases.forEach((purchase) => {
            const status = String(
                purchase.status || ""
            ).toUpperCase();

            // Cancelled purchases should not affect
            // vendor purchase totals.
            if (status === "CANCELLED") {
                return;
            }

            const vendorId = Number(
                purchase.vendorId
            );

            if (!vendorId) {
                return;
            }

            if (!totals[vendorId]) {
                totals[vendorId] = {
                    totalPurchases: 0,
                    outstanding: 0,
                };
            }

            totals[vendorId].totalPurchases +=
                Number(
                    purchase.totalAmount || 0
                );

            totals[vendorId].outstanding +=
                Number(
                    purchase.outstandingAmount || 0
                );
        });

        return totals;
    }, [purchases]);

    // =========================================================
    // ENRICH VENDORS WITH PURCHASE DATA
    // =========================================================

    const enrichedVendors = useMemo(() => {
        return vendors.map((vendor) => {
            const totals =
                vendorPurchaseTotals[
                    Number(vendor.id)
                    ] || {
                    totalPurchases: 0,
                    outstanding: 0,
                };

            return {
                ...vendor,
                totalPurchases:
                totals.totalPurchases,
                outstanding:
                totals.outstanding,
            };
        });
    }, [
        vendors,
        vendorPurchaseTotals,
    ]);

    // =========================================================
    // STATS
    // =========================================================

    const stats = useMemo(() => {
        return {
            total: vendors.length,

            active: vendors.filter(
                (vendor) =>
                    vendor.status === "ACTIVE"
            ).length,

            outstanding:
                enrichedVendors.reduce(
                    (sum, vendor) =>
                        sum +
                        Number(
                            vendor.outstanding || 0
                        ),
                    0
                ),

            purchases:
                enrichedVendors.reduce(
                    (sum, vendor) =>
                        sum +
                        Number(
                            vendor.totalPurchases ||
                            0
                        ),
                    0
                ),
        };
    }, [vendors, enrichedVendors]);

    // =========================================================
    // FILTER
    // =========================================================

    const filteredVendors = useMemo(() => {
        const term =
            search.trim().toLowerCase();

        return enrichedVendors.filter(
            (vendor) => {
                const matchesSearch =
                    !term ||
                    String(
                        vendor.vendorCode || ""
                    )
                        .toLowerCase()
                        .includes(term) ||
                    String(
                        vendor.vendorName || ""
                    )
                        .toLowerCase()
                        .includes(term) ||
                    String(
                        vendor.contactPerson || ""
                    )
                        .toLowerCase()
                        .includes(term) ||
                    String(
                        vendor.phone || ""
                    )
                        .toLowerCase()
                        .includes(term) ||
                    String(
                        vendor.category || ""
                    )
                        .toLowerCase()
                        .includes(term);

                const matchesStatus =
                    statusFilter === "ALL" ||
                    vendor.status ===
                    statusFilter;

                return (
                    matchesSearch &&
                    matchesStatus
                );
            }
        );
    }, [
        enrichedVendors,
        search,
        statusFilter,
    ]);

    // =========================================================
    // FORM
    // =========================================================

    const openAdd = () => {
        setEditingVendor(null);

        setForm({
            ...getEmptyForm(),
            vendorCode:
                generateVendorCode(vendors),
        });

        setError("");
        setSuccess("");
        setShowForm(true);
    };

    const openEdit = (vendor) => {
        setEditingVendor(vendor);

        setForm({
            vendorCode:
                vendor.vendorCode || "",

            vendorName:
                vendor.vendorName || "",

            contactPerson:
                vendor.contactPerson || "",

            phone:
                vendor.phone || "",

            email:
                vendor.email || "",

            address:
                vendor.address || "",

            city:
                vendor.city || "",

            state:
                vendor.state || "",

            pincode:
                vendor.pincode || "",

            gstin:
                vendor.gstin || "",

            category:
                vendor.category ||
                "General",

            paymentTerms:
                vendor.paymentTerms || "",

            status:
                vendor.status || "ACTIVE",

            notes:
                vendor.notes || "",
        });

        setError("");
        setSuccess("");
        setShowForm(true);
    };

    const openView = (vendor) => {
        setSelectedVendor(vendor);
        setShowView(true);
    };

    const handleChange = (event) => {
        const {
            name,
            value,
        } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    // =========================================================
    // VALIDATION
    // =========================================================

    const validateForm = () => {
        if (!form.vendorCode.trim()) {
            return "Vendor code is required.";
        }

        if (!form.vendorName.trim()) {
            return "Vendor name is required.";
        }

        if (
            form.email.trim() &&
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
                form.email.trim()
            )
        ) {
            return "Please enter a valid email address.";
        }

        return "";
    };

    // =========================================================
    // CREATE / UPDATE
    // =========================================================

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");
        setSuccess("");

        const validationError =
            validateForm();

        if (validationError) {
            setError(validationError);
            return;
        }

        const payload = {
            vendorCode:
                form.vendorCode.trim(),

            vendorName:
                form.vendorName.trim(),

            contactPerson:
                form.contactPerson.trim() ||
                null,

            phone:
                form.phone.trim() ||
                null,

            email:
                form.email.trim() ||
                null,

            address:
                form.address.trim() ||
                null,

            city:
                form.city.trim() ||
                null,

            state:
                form.state.trim() ||
                null,

            pincode:
                form.pincode.trim() ||
                null,

            gstin:
                form.gstin.trim() ||
                null,

            category:
                form.category || null,

            paymentTerms:
                form.paymentTerms.trim() ||
                null,

            status:
                form.status || "ACTIVE",

            notes:
                form.notes.trim() ||
                null,
        };

        setSaving(true);

        try {
            let savedVendor;

            if (editingVendor) {
                savedVendor =
                    await vendorService.updateVendor(
                        editingVendor.id,
                        payload
                    );

                setSuccess(
                    `Vendor "${savedVendor.vendorName}" updated successfully.`
                );
            } else {
                savedVendor =
                    await vendorService.createVendor(
                        payload
                    );

                setSuccess(
                    `Vendor "${savedVendor.vendorName}" created successfully.`
                );
            }

            setShowForm(false);
            setEditingVendor(null);
            setForm(getEmptyForm());

            await loadVendors();
        } catch (err) {
            console.error(
                "Vendor save error:",
                err
            );

            setError(
                getErrorMessage(
                    err,
                    editingVendor
                        ? "Unable to update vendor."
                        : "Unable to create vendor."
                )
            );
        } finally {
            setSaving(false);
        }
    };

    // =========================================================
    // DEACTIVATE
    // =========================================================

    const deactivateVendor = async (
        vendor
    ) => {
        if (
            vendor.status ===
            "INACTIVE"
        ) {
            return;
        }

        const confirmed =
            window.confirm(
                `Deactivate vendor "${vendor.vendorName}"?`
            );

        if (!confirmed) {
            return;
        }

        setError("");
        setSuccess("");
        setActionLoading(vendor.id);

        try {
            await vendorService.deactivateVendor(
                vendor.id
            );

            setSuccess(
                `Vendor "${vendor.vendorName}" deactivated successfully.`
            );

            await loadVendors();

            // Refresh selected vendor if
            // the view modal is open.
            if (
                selectedVendor?.id ===
                vendor.id
            ) {
                setSelectedVendor(
                    (current) =>
                        current
                            ? {
                                ...current,
                                status: "INACTIVE",
                            }
                            : current
                );
            }
        } catch (err) {
            console.error(
                "Vendor deactivate error:",
                err
            );

            setError(
                getErrorMessage(
                    err,
                    "Unable to deactivate vendor."
                )
            );
        } finally {
            setActionLoading(null);
        }
    };

    // =========================================================
    // RENDER
    // =========================================================

    return (
        <div className="vendors-page">
            {/* HEADER */}

            <div className="vendors-header">
                <div>
                    <div className="vendors-breadcrumb">
                        Workshop{" "}
                        <span>/</span>{" "}
                        Vendors
                    </div>

                    <h1>
                        Vendor Management
                    </h1>

                    <p>
                        Manage suppliers,
                        contacts, purchases
                        and vendor records.
                    </p>
                </div>

                <button
                    className="vendors-primary-btn"
                    onClick={openAdd}
                    disabled={loading}
                >
                    <Plus size={18} />
                    Add Vendor
                </button>
            </div>

            {/* ALERTS */}

            {error && (
                <div
                    className="vendor-alert vendor-alert-error"
                    style={{
                        marginBottom: "16px",
                        padding: "12px 15px",
                        borderRadius: "9px",
                        border: "1px solid var(--danger)",
                        color: "var(--danger)",
                        display: "flex",
                        alignItems: "center",
                        gap: "9px",
                    }}
                >
                    <XCircle size={18} />

                    <span
                        style={{
                            flex: 1,
                        }}
                    >
                        {error}
                    </span>

                    <button
                        onClick={() =>
                            setError("")
                        }
                        style={{
                            border: 0,
                            background:
                                "transparent",
                            color: "inherit",
                        }}
                    >
                        <X size={16} />
                    </button>
                </div>
            )}

            {success && (
                <div
                    className="vendor-alert vendor-alert-success"
                    style={{
                        marginBottom: "16px",
                        padding: "12px 15px",
                        borderRadius: "9px",
                        border: "1px solid var(--success)",
                        color: "var(--success)",
                        display: "flex",
                        alignItems: "center",
                        gap: "9px",
                    }}
                >
                    <CheckCircle2 size={18} />

                    <span
                        style={{
                            flex: 1,
                        }}
                    >
                        {success}
                    </span>

                    <button
                        onClick={() =>
                            setSuccess("")
                        }
                        style={{
                            border: 0,
                            background:
                                "transparent",
                            color: "inherit",
                        }}
                    >
                        <X size={16} />
                    </button>
                </div>
            )}

            {/* STATS */}

            <div className="vendors-stats">
                <div className="vendors-stat">
                    <div className="vendors-stat-icon blue">
                        <Building2
                            size={20}
                        />
                    </div>

                    <div>
                        <span>
                            Total Vendors
                        </span>

                        <strong>
                            {stats.total}
                        </strong>
                    </div>
                </div>

                <div className="vendors-stat">
                    <div className="vendors-stat-icon green">
                        <CheckCircle2
                            size={20}
                        />
                    </div>

                    <div>
                        <span>
                            Active Vendors
                        </span>

                        <strong>
                            {stats.active}
                        </strong>
                    </div>
                </div>

                <div className="vendors-stat">
                    <div className="vendors-stat-icon orange">
                        <Building2
                            size={20}
                        />
                    </div>

                    <div>
                        <span>
                            Outstanding
                        </span>

                        <strong>
                            {formatCurrency(
                                stats.outstanding
                            )}
                        </strong>
                    </div>
                </div>

                <div className="vendors-stat">
                    <div className="vendors-stat-icon red">
                        <Building2
                            size={20}
                        />
                    </div>

                    <div>
                        <span>
                            Total Purchases
                        </span>

                        <strong>
                            {formatCurrency(
                                stats.purchases
                            )}
                        </strong>
                    </div>
                </div>
            </div>

            {/* PANEL */}

            <div className="vendors-panel">
                <div className="vendors-panel-header">
                    <div>
                        <h2>
                            Suppliers
                        </h2>

                        <p>
                            {
                                filteredVendors.length
                            }{" "}
                            vendors displayed
                        </p>
                    </div>
                </div>

                {/* FILTERS */}

                <div className="vendors-filters">
                    <div className="vendors-search">
                        <Search size={18} />

                        <input
                            value={search}
                            onChange={(
                                event
                            ) =>
                                setSearch(
                                    event.target
                                        .value
                                )
                            }
                            placeholder="Search vendor, contact, phone..."
                        />

                        {search && (
                            <button
                                onClick={() =>
                                    setSearch(
                                        ""
                                    )
                                }
                            >
                                <X
                                    size={15}
                                />
                            </button>
                        )}
                    </div>

                    <select
                        value={
                            statusFilter
                        }
                        onChange={(
                            event
                        ) =>
                            setStatusFilter(
                                event.target
                                    .value
                            )
                        }
                    >
                        <option value="ALL">
                            All Status
                        </option>

                        <option value="ACTIVE">
                            Active
                        </option>

                        <option value="INACTIVE">
                            Inactive
                        </option>
                    </select>
                </div>

                {/* TABLE */}

                <div className="vendors-table-wrap">
                    <table className="vendors-table">
                        <thead>
                        <tr>
                            <th>
                                Vendor
                            </th>

                            <th>
                                Contact
                            </th>

                            <th>
                                Category
                            </th>

                            <th>
                                GST
                            </th>

                            <th>
                                Purchases
                            </th>

                            <th>
                                Outstanding
                            </th>

                            <th>
                                Status
                            </th>

                            <th>
                                Actions
                            </th>
                        </tr>
                        </thead>

                        <tbody>
                        {loading ? (
                            <tr>
                                <td
                                    colSpan="8"
                                >
                                    <div className="vendors-empty">
                                        <Building2
                                            size={
                                                40
                                            }
                                        />

                                        <h3>
                                            Loading
                                            vendors...
                                        </h3>

                                        <p>
                                            Please
                                            wait.
                                        </p>
                                    </div>
                                </td>
                            </tr>
                        ) : filteredVendors.length ===
                        0 ? (
                            <tr>
                                <td
                                    colSpan="8"
                                >
                                    <div className="vendors-empty">
                                        <Building2
                                            size={
                                                40
                                            }
                                        />

                                        <h3>
                                            No vendors
                                            found
                                        </h3>

                                        <p>
                                            Try changing
                                            your search
                                            or filter.
                                        </p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            filteredVendors.map(
                                (
                                    vendor
                                ) => (
                                    <tr
                                        key={
                                            vendor.id
                                        }
                                    >
                                        <td>
                                            <div className="vendor-cell">
                                                <div className="vendor-icon">
                                                    <Building2
                                                        size={
                                                            17
                                                        }
                                                    />
                                                </div>

                                                <div>
                                                    <strong>
                                                        {
                                                            vendor.vendorName
                                                        }
                                                    </strong>

                                                    <span>
                                                            {
                                                                vendor.vendorCode
                                                            }
                                                        </span>
                                                </div>
                                            </div>
                                        </td>

                                        <td>
                                            <div className="contact-cell">
                                                <strong>
                                                    {
                                                        vendor.contactPerson ||
                                                        "-"
                                                    }
                                                </strong>

                                                {vendor.phone && (
                                                    <span>
                                                            <Phone
                                                                size={
                                                                    12
                                                                }
                                                            />

                                                        {
                                                            vendor.phone
                                                        }
                                                        </span>
                                                )}

                                                {vendor.email && (
                                                    <span>
                                                            <Mail
                                                                size={
                                                                    12
                                                                }
                                                            />

                                                        {
                                                            vendor.email
                                                        }
                                                        </span>
                                                )}
                                            </div>
                                        </td>

                                        <td>
                                                <span className="vendor-category">
                                                    {
                                                        vendor.category ||
                                                        "-"
                                                    }
                                                </span>
                                        </td>

                                        <td>
                                            {vendor.gstin ||
                                                "—"}
                                        </td>

                                        <td>
                                            <strong>
                                                {formatCurrency(
                                                    vendor.totalPurchases
                                                )}
                                            </strong>
                                        </td>

                                        <td>
                                            <strong className="vendor-paid">
                                                {formatCurrency(
                                                    vendor.outstanding
                                                )}
                                            </strong>
                                        </td>

                                        <td>
                                                <span
                                                    className={`vendor-status ${String(
                                                        vendor.status ||
                                                        ""
                                                    ).toLowerCase()}`}
                                                >
                                                    {vendor.status ===
                                                    "ACTIVE" ? (
                                                        <CheckCircle2
                                                            size={
                                                                13
                                                            }
                                                        />
                                                    ) : (
                                                        <X
                                                            size={
                                                                13
                                                            }
                                                        />
                                                    )}

                                                    {
                                                        vendor.status
                                                    }
                                                </span>
                                        </td>

                                        <td>
                                            <div className="vendor-actions">
                                                <button
                                                    className="vendor-icon-btn"
                                                    onClick={() =>
                                                        openView(
                                                            vendor
                                                        )
                                                    }
                                                    title="View Vendor"
                                                >
                                                    <Eye
                                                        size={
                                                            16
                                                        }
                                                    />
                                                </button>

                                                <button
                                                    className="vendor-icon-btn"
                                                    onClick={() =>
                                                        openEdit(
                                                            vendor
                                                        )
                                                    }
                                                    title="Edit Vendor"
                                                >
                                                    <Edit3
                                                        size={
                                                            16
                                                        }
                                                    />
                                                </button>

                                                {vendor.status ===
                                                    "ACTIVE" && (
                                                        <button
                                                            className="vendor-icon-btn danger"
                                                            disabled={
                                                                actionLoading ===
                                                                vendor.id
                                                            }
                                                            onClick={() =>
                                                                deactivateVendor(
                                                                    vendor
                                                                )
                                                            }
                                                            title="Deactivate Vendor"
                                                        >
                                                            <XCircle
                                                                size={
                                                                    16
                                                                }
                                                            />
                                                        </button>
                                                    )}
                                            </div>
                                        </td>
                                    </tr>
                                )
                            )
                        )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* =================================================
                ADD / EDIT MODAL
            ================================================= */}

            {showForm && (
                <div
                    className="vendors-modal-overlay"
                    onMouseDown={() => {
                        if (!saving) {
                            setShowForm(
                                false
                            );
                        }
                    }}
                >
                    <div
                        className="vendors-modal large"
                        onMouseDown={(
                            event
                        ) =>
                            event.stopPropagation()
                        }
                    >
                        <div className="vendors-modal-header">
                            <div>
                                <span>
                                    VENDOR MANAGEMENT
                                </span>

                                <h2>
                                    {editingVendor
                                        ? "Edit Vendor"
                                        : "Add Vendor"}
                                </h2>
                            </div>

                            <button
                                className="vendors-close"
                                onClick={() =>
                                    !saving &&
                                    setShowForm(
                                        false
                                    )
                                }
                                disabled={
                                    saving
                                }
                            >
                                <X
                                    size={20}
                                />
                            </button>
                        </div>

                        <form
                            onSubmit={
                                handleSubmit
                            }
                        >
                            <div className="vendors-form-grid">
                                <label>
                                    Vendor Code *
                                    <input
                                        name="vendorCode"
                                        value={
                                            form.vendorCode
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        required
                                        maxLength={
                                            30
                                        }
                                    />
                                </label>

                                <label>
                                    Vendor Name *
                                    <input
                                        name="vendorName"
                                        value={
                                            form.vendorName
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        required
                                        maxLength={
                                            150
                                        }
                                        placeholder="ABC Auto Parts"
                                    />
                                </label>

                                <label>
                                    Contact Person
                                    <input
                                        name="contactPerson"
                                        value={
                                            form.contactPerson
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        maxLength={
                                            100
                                        }
                                        placeholder="Contact name"
                                    />
                                </label>

                                <label>
                                    Phone
                                    <input
                                        name="phone"
                                        value={
                                            form.phone
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        maxLength={
                                            20
                                        }
                                        placeholder="9876543210"
                                    />
                                </label>

                                <label>
                                    Email
                                    <input
                                        type="email"
                                        name="email"
                                        value={
                                            form.email
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        maxLength={
                                            150
                                        }
                                        placeholder="vendor@email.com"
                                    />
                                </label>

                                <label>
                                    Category
                                    <select
                                        name="category"
                                        value={
                                            form.category
                                        }
                                        onChange={
                                            handleChange
                                        }
                                    >
                                        {categories.map(
                                            (
                                                category
                                            ) => (
                                                <option
                                                    key={
                                                        category
                                                    }
                                                    value={
                                                        category
                                                    }
                                                >
                                                    {
                                                        category
                                                    }
                                                </option>
                                            )
                                        )}
                                    </select>
                                </label>

                                <label>
                                    GSTIN
                                    <input
                                        name="gstin"
                                        value={
                                            form.gstin
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        maxLength={
                                            30
                                        }
                                        placeholder="33ABCDE1234F1Z5"
                                    />
                                </label>

                                <label>
                                    Payment Terms
                                    <input
                                        name="paymentTerms"
                                        value={
                                            form.paymentTerms
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        maxLength={
                                            100
                                        }
                                        placeholder="30 Days"
                                    />
                                </label>

                                <label>
                                    City
                                    <input
                                        name="city"
                                        value={
                                            form.city
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        maxLength={
                                            100
                                        }
                                    />
                                </label>

                                <label>
                                    State
                                    <input
                                        name="state"
                                        value={
                                            form.state
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        maxLength={
                                            100
                                        }
                                    />
                                </label>

                                <label>
                                    Pincode
                                    <input
                                        name="pincode"
                                        value={
                                            form.pincode
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        maxLength={
                                            10
                                        }
                                    />
                                </label>

                                <label>
                                    Status
                                    <select
                                        name="status"
                                        value={
                                            form.status
                                        }
                                        onChange={
                                            handleChange
                                        }
                                    >
                                        <option value="ACTIVE">
                                            Active
                                        </option>

                                        <option value="INACTIVE">
                                            Inactive
                                        </option>
                                    </select>
                                </label>

                                <label className="full">
                                    Address
                                    <textarea
                                        name="address"
                                        value={
                                            form.address
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        rows="3"
                                        maxLength={
                                            500
                                        }
                                        placeholder="Vendor address"
                                    />
                                </label>

                                <label className="full">
                                    Notes
                                    <textarea
                                        name="notes"
                                        value={
                                            form.notes
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        rows="3"
                                        maxLength={
                                            1000
                                        }
                                        placeholder="Additional vendor notes"
                                    />
                                </label>
                            </div>

                            <div className="vendors-modal-footer">
                                <button
                                    type="button"
                                    className="vendors-secondary-btn"
                                    onClick={() =>
                                        setShowForm(
                                            false
                                        )
                                    }
                                    disabled={
                                        saving
                                    }
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="vendors-primary-btn"
                                    disabled={
                                        saving
                                    }
                                >
                                    <CheckCircle2
                                        size={17}
                                    />

                                    {saving
                                        ? "Saving..."
                                        : editingVendor
                                            ? "Save Changes"
                                            : "Add Vendor"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* =================================================
                VIEW MODAL
            ================================================= */}

            {showView &&
                selectedVendor && (
                    <div
                        className="vendors-modal-overlay"
                        onMouseDown={() =>
                            setShowView(
                                false
                            )
                        }
                    >
                        <div
                            className="vendors-modal"
                            onMouseDown={(
                                event
                            ) =>
                                event.stopPropagation()
                            }
                        >
                            <div className="vendors-modal-header">
                                <div>
                                    <span>
                                        {
                                            selectedVendor.vendorCode
                                        }
                                    </span>

                                    <h2>
                                        {
                                            selectedVendor.vendorName
                                        }
                                    </h2>
                                </div>

                                <button
                                    className="vendors-close"
                                    onClick={() =>
                                        setShowView(
                                            false
                                        )
                                    }
                                >
                                    <X
                                        size={20}
                                    />
                                </button>
                            </div>

                            <div className="vendor-detail">
                                <div className="vendor-detail-icon">
                                    <Building2
                                        size={26}
                                    />
                                </div>

                                <div>
                                    <strong>
                                        {
                                            selectedVendor.vendorName
                                        }
                                    </strong>

                                    <span>
                                        {
                                            selectedVendor.contactPerson ||
                                            "No contact person"
                                        }
                                    </span>
                                </div>
                            </div>

                            <div className="vendor-detail-grid">
                                <div>
                                    <span>
                                        Phone
                                    </span>

                                    <strong>
                                        {
                                            selectedVendor.phone ||
                                            "-"
                                        }
                                    </strong>
                                </div>

                                <div>
                                    <span>
                                        Email
                                    </span>

                                    <strong>
                                        {
                                            selectedVendor.email ||
                                            "-"
                                        }
                                    </strong>
                                </div>

                                <div>
                                    <span>
                                        Category
                                    </span>

                                    <strong>
                                        {
                                            selectedVendor.category ||
                                            "-"
                                        }
                                    </strong>
                                </div>

                                <div>
                                    <span>
                                        GSTIN
                                    </span>

                                    <strong>
                                        {
                                            selectedVendor.gstin ||
                                            "-"
                                        }
                                    </strong>
                                </div>

                                <div>
                                    <span>
                                        Payment Terms
                                    </span>

                                    <strong>
                                        {
                                            selectedVendor.paymentTerms ||
                                            "-"
                                        }
                                    </strong>
                                </div>

                                <div>
                                    <span>
                                        Status
                                    </span>

                                    <strong>
                                        {
                                            selectedVendor.status ||
                                            "-"
                                        }
                                    </strong>
                                </div>

                                <div>
                                    <span>
                                        City
                                    </span>

                                    <strong>
                                        {
                                            selectedVendor.city ||
                                            "-"
                                        }
                                    </strong>
                                </div>

                                <div>
                                    <span>
                                        State
                                    </span>

                                    <strong>
                                        {
                                            selectedVendor.state ||
                                            "-"
                                        }
                                    </strong>
                                </div>

                                <div>
                                    <span>
                                        Pincode
                                    </span>

                                    <strong>
                                        {
                                            selectedVendor.pincode ||
                                            "-"
                                        }
                                    </strong>
                                </div>

                                <div className="full">
                                    <span>
                                        Address
                                    </span>

                                    <strong>
                                        {
                                            selectedVendor.address ||
                                            "-"
                                        }
                                    </strong>
                                </div>

                                <div className="full">
                                    <span>
                                        Notes
                                    </span>

                                    <strong>
                                        {
                                            selectedVendor.notes ||
                                            "-"
                                        }
                                    </strong>
                                </div>

                                <div>
                                    <span>
                                        Total Purchases
                                    </span>

                                    <strong>
                                        {formatCurrency(
                                            selectedVendor.totalPurchases
                                        )}
                                    </strong>
                                </div>

                                <div>
                                    <span>
                                        Outstanding
                                    </span>

                                    <strong>
                                        {formatCurrency(
                                            selectedVendor.outstanding
                                        )}
                                    </strong>
                                </div>
                            </div>

                            <div className="vendors-modal-footer">
                                {selectedVendor.status ===
                                    "ACTIVE" && (
                                        <button
                                            className="vendors-secondary-btn"
                                            disabled={
                                                actionLoading ===
                                                selectedVendor.id
                                            }
                                            onClick={() =>
                                                deactivateVendor(
                                                    selectedVendor
                                                )
                                            }
                                        >
                                            <XCircle
                                                size={16}
                                            />

                                            Deactivate
                                        </button>
                                    )}

                                <button
                                    className="vendors-secondary-btn"
                                    onClick={() =>
                                        setShowView(
                                            false
                                        )
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

export default Vendors;