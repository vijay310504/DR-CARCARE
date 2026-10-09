import { useEffect, useMemo, useState } from "react";
import {
    CheckCircle2,
    ChevronDown,
    Eye,
    PackagePlus,
    Plus,
    Search,
    Truck,
    X,
    XCircle,
} from "lucide-react";

import api from "../../services/api";
import purchaseService from "../../services/purchaseService";
import "./Purchases.css";

const emptyItem = () => ({
    inventoryItemId: "",
    quantity: "1",
    unitPrice: "",
    discountAmount: "0",
    taxPercent: "0",
});

const getToday = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
};

const emptyForm = () => ({
    vendorId: "",
    purchaseDate: getToday(),
    expectedDate: "",
    invoiceNumber: "",
    invoiceDate: "",
    notes: "",
    items: [emptyItem()],
});

const money = (value) =>
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
        return data;
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

const getStatusLabel = (status) => {
    switch (status) {
        case "DRAFT":
            return "Draft";
        case "ORDERED":
            return "Ordered";
        case "PARTIALLY_RECEIVED":
            return "Partially Received";
        case "RECEIVED":
            return "Received";
        case "CANCELLED":
            return "Cancelled";
        default:
            return status || "Unknown";
    }
};

const getPaymentStatus = (purchase) => {
    const paid = Number(purchase?.paidAmount || 0);
    const outstanding = Number(
        purchase?.outstandingAmount || 0
    );

    if (outstanding <= 0 && paid > 0) {
        return "PAID";
    }

    if (paid > 0 && outstanding > 0) {
        return "PARTIAL";
    }

    return "PENDING";
};

const formatDate = (date) => {
    if (!date) {
        return "-";
    }

    const parsed = new Date(`${date}T00:00:00`);

    if (Number.isNaN(parsed.getTime())) {
        return date;
    }

    return parsed.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

function Purchases() {
    const [purchases, setPurchases] = useState([]);
    const [vendors, setVendors] = useState([]);
    const [inventoryItems, setInventoryItems] = useState([]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [actionLoading, setActionLoading] = useState(null);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");

    const [showForm, setShowForm] = useState(false);
    const [showDetails, setShowDetails] = useState(false);

    const [selectedPurchase, setSelectedPurchase] =
        useState(null);

    const [form, setForm] = useState(emptyForm());

    // =========================================================
    // LOAD DATA
    // =========================================================

    const loadPurchases = async () => {
        const response =
            await purchaseService.getAllPurchases();

        setPurchases(normalizeList(response));
    };

    const loadVendors = async () => {
        const response = await api.get("/api/vendors");

        const data = normalizeList(response.data);

        setVendors(data);
    };

    const loadInventoryItems = async () => {
        const response = await api.get(
            "/api/inventory/items/active"
        );

        const data = normalizeList(response.data);

        setInventoryItems(data);
    };

    const loadAllData = async () => {
        setLoading(true);
        setError("");

        try {
            await Promise.all([
                loadPurchases(),
                loadVendors(),
                loadInventoryItems(),
            ]);
        } catch (err) {
            console.error(
                "Purchases module loading error:",
                err
            );

            setError(
                getErrorMessage(
                    err,
                    "Unable to load Purchases data."
                )
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAllData();
    }, []);

    // =========================================================
    // STATS
    // =========================================================

    const stats = useMemo(() => {
        const total = purchases.length;

        const ordered = purchases.filter(
            (purchase) =>
                purchase.status === "ORDERED"
        ).length;

        const received = purchases.filter(
            (purchase) =>
                purchase.status === "RECEIVED"
        ).length;

        const totalValue = purchases.reduce(
            (sum, purchase) =>
                sum +
                Number(purchase.totalAmount || 0),
            0
        );

        const outstanding = purchases.reduce(
            (sum, purchase) =>
                sum +
                Number(
                    purchase.outstandingAmount || 0
                ),
            0
        );

        return {
            total,
            ordered,
            received,
            totalValue,
            outstanding,
        };
    }, [purchases]);

    // =========================================================
    // FILTER
    // =========================================================

    const filteredPurchases = useMemo(() => {
        const search = searchTerm
            .trim()
            .toLowerCase();

        return purchases.filter((purchase) => {
            const matchesSearch =
                !search ||
                String(
                    purchase.purchaseNumber || ""
                )
                    .toLowerCase()
                    .includes(search) ||
                String(
                    purchase.vendorName || ""
                )
                    .toLowerCase()
                    .includes(search) ||
                String(
                    purchase.vendorCode || ""
                )
                    .toLowerCase()
                    .includes(search) ||
                String(
                    purchase.invoiceNumber || ""
                )
                    .toLowerCase()
                    .includes(search);

            const matchesStatus =
                statusFilter === "ALL" ||
                purchase.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [
        purchases,
        searchTerm,
        statusFilter,
    ]);

    // =========================================================
    // FORM
    // =========================================================

    const selectedVendor = useMemo(() => {
        return vendors.find(
            (vendor) =>
                String(vendor.id) ===
                String(form.vendorId)
        );
    }, [vendors, form.vendorId]);

    const calculateItem = (item) => {
        const quantity = Number(
            item.quantity || 0
        );

        const unitPrice = Number(
            item.unitPrice || 0
        );

        const discount = Number(
            item.discountAmount || 0
        );

        const taxPercent = Number(
            item.taxPercent || 0
        );

        const gross =
            quantity * unitPrice;

        const taxable =
            Math.max(
                gross - discount,
                0
            );

        const tax =
            taxable *
            (taxPercent / 100);

        const total =
            taxable + tax;

        return {
            gross,
            discount,
            taxable,
            tax,
            total,
        };
    };

    const formTotals = useMemo(() => {
        let subtotal = 0;
        let discountAmount = 0;
        let taxAmount = 0;

        form.items.forEach((item) => {
            const calculated =
                calculateItem(item);

            subtotal +=
                calculated.gross;

            discountAmount +=
                calculated.discount;

            taxAmount +=
                calculated.tax;
        });

        return {
            subtotal,
            discountAmount,
            taxAmount,
            totalAmount:
                subtotal -
                discountAmount +
                taxAmount,
        };
    }, [form.items]);

    const updateFormField = (
        field,
        value
    ) => {
        setForm((current) => ({
            ...current,
            [field]: value,
        }));
    };

    const updateItem = (
        index,
        field,
        value
    ) => {
        setForm((current) => ({
            ...current,
            items: current.items.map(
                (item, itemIndex) =>
                    itemIndex === index
                        ? {
                            ...item,
                            [field]:
                            value,
                        }
                        : item
            ),
        }));
    };

    const handleInventoryChange = (
        index,
        inventoryItemId
    ) => {
        const selected =
            inventoryItems.find(
                (item) =>
                    String(item.id) ===
                    String(inventoryItemId)
            );

        setForm((current) => ({
            ...current,
            items: current.items.map(
                (item, itemIndex) =>
                    itemIndex === index
                        ? {
                            ...item,
                            inventoryItemId,
                            unitPrice:
                                selected
                                    ?.purchasePrice ??
                                "",
                        }
                        : item
            ),
        }));
    };

    const addItem = () => {
        setForm((current) => ({
            ...current,
            items: [
                ...current.items,
                emptyItem(),
            ],
        }));
    };

    const removeItem = (index) => {
        if (form.items.length === 1) {
            return;
        }

        setForm((current) => ({
            ...current,
            items: current.items.filter(
                (_, itemIndex) =>
                    itemIndex !== index
            ),
        }));
    };

    const resetForm = () => {
        setForm(emptyForm());
        setSelectedPurchase(null);
        setShowForm(false);
    };

    // =========================================================
    // CREATE PURCHASE
    // =========================================================

    const validateForm = () => {
        if (!form.vendorId) {
            return "Please select a vendor.";
        }

        if (!form.items.length) {
            return "Add at least one purchase item.";
        }

        for (
            let index = 0;
            index < form.items.length;
            index++
        ) {
            const item = form.items[index];

            if (!item.inventoryItemId) {
                return `Please select an inventory item for row ${
                    index + 1
                }.`;
            }

            if (
                Number(item.quantity) <=
                0
            ) {
                return `Quantity must be greater than zero for row ${
                    index + 1
                }.`;
            }

            if (
                Number(item.unitPrice) <
                0
            ) {
                return `Unit price cannot be negative for row ${
                    index + 1
                }.`;
            }

            if (
                Number(
                    item.discountAmount || 0
                ) < 0
            ) {
                return `Discount cannot be negative for row ${
                    index + 1
                }.`;
            }

            if (
                Number(
                    item.taxPercent || 0
                ) < 0
            ) {
                return `Tax percentage cannot be negative for row ${
                    index + 1
                }.`;
            }
        }

        return "";
    };

    const handleCreatePurchase = async (
        event
    ) => {
        event.preventDefault();

        setError("");
        setSuccess("");

        const validationError =
            validateForm();

        if (validationError) {
            setError(
                validationError
            );
            return;
        }

        const payload = {
            vendorId: Number(
                form.vendorId
            ),

            purchaseDate:
                form.purchaseDate ||
                null,

            expectedDate:
                form.expectedDate ||
                null,

            invoiceNumber:
                form.invoiceNumber
                    .trim() || null,

            invoiceDate:
                form.invoiceDate ||
                null,

            notes:
                form.notes.trim() ||
                null,

            items: form.items.map(
                (item) => ({
                    inventoryItemId:
                        Number(
                            item.inventoryItemId
                        ),

                    quantity:
                        Number(
                            item.quantity
                        ),

                    unitPrice:
                        Number(
                            item.unitPrice
                        ),

                    discountAmount:
                        Number(
                            item.discountAmount ||
                            0
                        ),

                    taxPercent:
                        Number(
                            item.taxPercent ||
                            0
                        ),
                })
            ),
        };

        setSaving(true);

        try {
            const created =
                await purchaseService.createPurchase(
                    payload
                );

            setPurchases(
                (current) => [
                    created,
                    ...current,
                ]
            );

            setSuccess(
                `Purchase ${
                    created.purchaseNumber ||
                    ""
                } created successfully.`
            );

            resetForm();

            await loadPurchases();
        } catch (err) {
            console.error(
                "Create purchase error:",
                err
            );

            setError(
                getErrorMessage(
                    err,
                    "Unable to create purchase."
                )
            );
        } finally {
            setSaving(false);
        }
    };

    // =========================================================
    // PURCHASE ACTIONS
    // =========================================================

    const runPurchaseAction = async (
        id,
        action,
        successMessage
    ) => {
        setError("");
        setSuccess("");
        setActionLoading(id);

        try {
            let updated;

            if (action === "ORDER") {
                updated =
                    await purchaseService.markOrdered(
                        id
                    );
            } else if (
                action === "RECEIVE"
            ) {
                updated =
                    await purchaseService.receivePurchase(
                        id
                    );
            } else if (
                action === "CANCEL"
            ) {
                updated =
                    await purchaseService.cancelPurchase(
                        id
                    );
            } else {
                throw new Error(
                    "Unsupported purchase action."
                );
            }

            setPurchases(
                (current) =>
                    current.map(
                        (purchase) =>
                            purchase.id === id
                                ? updated
                                : purchase
                    )
            );

            if (
                selectedPurchase?.id ===
                id
            ) {
                setSelectedPurchase(
                    updated
                );
            }

            setSuccess(
                successMessage
            );

            // Receiving changes inventory,
            // therefore refresh active inventory.
            if (
                action === "RECEIVE"
            ) {
                await loadInventoryItems();
            }

            await loadPurchases();
        } catch (err) {
            console.error(
                `Purchase ${action} error:`,
                err
            );

            setError(
                getErrorMessage(
                    err,
                    `Unable to ${action.toLowerCase()} purchase.`
                )
            );
        } finally {
            setActionLoading(null);
        }
    };

    const handleOrder = (purchase) => {
        runPurchaseAction(
            purchase.id,
            "ORDER",
            `${purchase.purchaseNumber} marked as ordered.`
        );
    };

    const handleReceive = (purchase) => {
        const confirmed =
            window.confirm(
                `Receive purchase ${purchase.purchaseNumber}? This will increase inventory stock.`
            );

        if (!confirmed) {
            return;
        }

        runPurchaseAction(
            purchase.id,
            "RECEIVE",
            `${purchase.purchaseNumber} received successfully.`
        );
    };

    const handleCancel = (purchase) => {
        const confirmed =
            window.confirm(
                `Cancel purchase ${purchase.purchaseNumber}?`
            );

        if (!confirmed) {
            return;
        }

        runPurchaseAction(
            purchase.id,
            "CANCEL",
            `${purchase.purchaseNumber} cancelled successfully.`
        );
    };

    // =========================================================
    // DETAILS
    // =========================================================

    const openDetails = async (
        purchase
    ) => {
        setError("");

        try {
            const details =
                await purchaseService.getPurchaseById(
                    purchase.id
                );

            setSelectedPurchase(
                details
            );

            setShowDetails(true);
        } catch (err) {
            console.error(
                "Purchase details error:",
                err
            );

            setError(
                getErrorMessage(
                    err,
                    "Unable to load purchase details."
                )
            );
        }
    };

    // =========================================================
    // RENDER
    // =========================================================

    return (
        <div className="purchases-page">
            {/* =================================================
                HEADER
            ================================================== */}

            <div className="page-header">
                <div>
                    <h1>Purchases</h1>

                    <p>
                        Manage vendor purchases,
                        stock receiving and
                        purchase records.
                    </p>
                </div>

                <button
                    className="primary-btn"
                    onClick={() => {
                        setError("");
                        setSuccess("");
                        setForm(emptyForm());
                        setShowForm(true);
                    }}
                    disabled={
                        loading ||
                        vendors.length === 0 ||
                        inventoryItems.length === 0
                    }
                >
                    <Plus size={18} />
                    New Purchase
                </button>
            </div>

            {/* =================================================
                ALERTS
            ================================================== */}

            {error && (
                <div className="alert error-alert">
                    <XCircle size={18} />

                    <span>
                        {error}
                    </span>

                    <button
                        onClick={() =>
                            setError("")
                        }
                    >
                        <X size={16} />
                    </button>
                </div>
            )}

            {success && (
                <div className="alert success-alert">
                    <CheckCircle2
                        size={18}
                    />

                    <span>
                        {success}
                    </span>

                    <button
                        onClick={() =>
                            setSuccess("")
                        }
                    >
                        <X size={16} />
                    </button>
                </div>
            )}

            {/* =================================================
                STATS
            ================================================== */}

            <div className="stats-grid">
                <div className="stat-card">
                    <span>
                        Total Purchases
                    </span>

                    <strong>
                        {stats.total}
                    </strong>
                </div>

                <div className="stat-card">
                    <span>
                        Ordered
                    </span>

                    <strong>
                        {stats.ordered}
                    </strong>
                </div>

                <div className="stat-card">
                    <span>
                        Received
                    </span>

                    <strong>
                        {stats.received}
                    </strong>
                </div>

                <div className="stat-card">
                    <span>
                        Total Value
                    </span>

                    <strong>
                        {money(
                            stats.totalValue
                        )}
                    </strong>
                </div>

                <div className="stat-card">
                    <span>
                        Outstanding
                    </span>

                    <strong>
                        {money(
                            stats.outstanding
                        )}
                    </strong>
                </div>
            </div>

            {/* =================================================
                FILTERS
            ================================================== */}

            <div className="filters-bar">
                <div className="search-box">
                    <Search size={18} />

                    <input
                        type="text"
                        placeholder="Search purchase, vendor or invoice..."
                        value={searchTerm}
                        onChange={(event) =>
                            setSearchTerm(
                                event.target.value
                            )
                        }
                    />
                </div>

                <div className="filter-select">
                    <ChevronDown
                        size={16}
                    />

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

                        <option value="DRAFT">
                            Draft
                        </option>

                        <option value="ORDERED">
                            Ordered
                        </option>

                        <option value="PARTIALLY_RECEIVED">
                            Partially Received
                        </option>

                        <option value="RECEIVED">
                            Received
                        </option>

                        <option value="CANCELLED">
                            Cancelled
                        </option>
                    </select>
                </div>
            </div>

            {/* =================================================
                TABLE
            ================================================== */}

            <div className="table-card">
                {loading ? (
                    <div className="empty-state">
                        <PackagePlus
                            size={32}
                        />

                        <p>
                            Loading purchases...
                        </p>
                    </div>
                ) : filteredPurchases.length ===
                0 ? (
                    <div className="empty-state">
                        <PackagePlus
                            size={32}
                        />

                        <h3>
                            No purchases found
                        </h3>

                        <p>
                            Create your first
                            purchase order to
                            get started.
                        </p>
                    </div>
                ) : (
                    <div className="table-wrapper">
                        <table>
                            <thead>
                            <tr>
                                <th>
                                    Purchase
                                </th>

                                <th>
                                    Vendor
                                </th>

                                <th>
                                    Invoice
                                </th>

                                <th>
                                    Date
                                </th>

                                <th>
                                    Items
                                </th>

                                <th>
                                    Total
                                </th>

                                <th>
                                    Status
                                </th>

                                <th>
                                    Payment
                                </th>

                                <th>
                                    Actions
                                </th>
                            </tr>
                            </thead>

                            <tbody>
                            {filteredPurchases.map(
                                (
                                    purchase
                                ) => {
                                    const paymentStatus =
                                        getPaymentStatus(
                                            purchase
                                        );

                                    return (
                                        <tr
                                            key={
                                                purchase.id
                                            }
                                        >
                                            <td>
                                                <strong>
                                                    {
                                                        purchase.purchaseNumber
                                                    }
                                                </strong>
                                            </td>

                                            <td>
                                                <div>
                                                    <strong>
                                                        {
                                                            purchase.vendorName
                                                        }
                                                    </strong>

                                                    <small>
                                                        {
                                                            purchase.vendorCode
                                                        }
                                                    </small>
                                                </div>
                                            </td>

                                            <td>
                                                {
                                                    purchase.invoiceNumber ||
                                                    "-"
                                                }
                                            </td>

                                            <td>
                                                {formatDate(
                                                    purchase.purchaseDate
                                                )}
                                            </td>

                                            <td>
                                                {
                                                    purchase
                                                        .items
                                                        ?.length ??
                                                    0
                                                }
                                            </td>

                                            <td>
                                                <strong>
                                                    {money(
                                                        purchase.totalAmount
                                                    )}
                                                </strong>
                                            </td>

                                            <td>
                                                    <span
                                                        className={`status-badge status-${String(
                                                            purchase.status ||
                                                            ""
                                                        ).toLowerCase()}`}
                                                    >
                                                        {getStatusLabel(
                                                            purchase.status
                                                        )}
                                                    </span>
                                            </td>

                                            <td>
                                                    <span
                                                        className={`payment-badge payment-${paymentStatus.toLowerCase()}`}
                                                    >
                                                        {
                                                            paymentStatus
                                                        }
                                                    </span>
                                            </td>

                                            <td>
                                                <div className="action-buttons">
                                                    <button
                                                        title="View"
                                                        onClick={() =>
                                                            openDetails(
                                                                purchase
                                                            )
                                                        }
                                                    >
                                                        <Eye
                                                            size={
                                                                17
                                                            }
                                                        />
                                                    </button>

                                                    {purchase.status ===
                                                        "DRAFT" && (
                                                            <button
                                                                title="Mark Ordered"
                                                                disabled={
                                                                    actionLoading ===
                                                                    purchase.id
                                                                }
                                                                onClick={() =>
                                                                    handleOrder(
                                                                        purchase
                                                                    )
                                                                }
                                                            >
                                                                <Truck
                                                                    size={
                                                                        17
                                                                    }
                                                                />
                                                            </button>
                                                        )}

                                                    {purchase.status ===
                                                        "ORDERED" && (
                                                            <button
                                                                title="Receive Purchase"
                                                                disabled={
                                                                    actionLoading ===
                                                                    purchase.id
                                                                }
                                                                onClick={() =>
                                                                    handleReceive(
                                                                        purchase
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

                                                    {(purchase.status ===
                                                        "DRAFT" ||
                                                        purchase.status ===
                                                        "ORDERED") && (
                                                        <button
                                                            title="Cancel"
                                                            disabled={
                                                                actionLoading ===
                                                                purchase.id
                                                            }
                                                            onClick={() =>
                                                                handleCancel(
                                                                    purchase
                                                                )
                                                            }
                                                        >
                                                            <XCircle
                                                                size={
                                                                    17
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
                    </div>
                )}
            </div>

            {/* =================================================
                CREATE PURCHASE MODAL
            ================================================== */}

            {showForm && (
                <div className="modal-overlay">
                    <div className="modal purchase-form-modal">
                        <div className="modal-header">
                            <div>
                                <h2>
                                    New Purchase
                                </h2>

                                <p>
                                    Create a new
                                    purchase order.
                                </p>
                            </div>

                            <button
                                onClick={
                                    resetForm
                                }
                                disabled={
                                    saving
                                }
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form
                            onSubmit={
                                handleCreatePurchase
                            }
                        >
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>
                                        Vendor *
                                    </label>

                                    <select
                                        value={
                                            form.vendorId
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            updateFormField(
                                                "vendorId",
                                                event
                                                    .target
                                                    .value
                                            )
                                        }
                                        required
                                    >
                                        <option value="">
                                            Select Vendor
                                        </option>

                                        {vendors.map(
                                            (
                                                vendor
                                            ) => (
                                                <option
                                                    key={
                                                        vendor.id
                                                    }
                                                    value={
                                                        vendor.id
                                                    }
                                                >
                                                    {
                                                        vendor.vendorName
                                                    }{" "}
                                                    (
                                                    {
                                                        vendor.vendorCode
                                                    }
                                                    )
                                                </option>
                                            )
                                        )}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>
                                        Purchase Date
                                    </label>

                                    <input
                                        type="date"
                                        value={
                                            form.purchaseDate
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            updateFormField(
                                                "purchaseDate",
                                                event
                                                    .target
                                                    .value
                                            )
                                        }
                                    />
                                </div>

                                <div className="form-group">
                                    <label>
                                        Expected Date
                                    </label>

                                    <input
                                        type="date"
                                        value={
                                            form.expectedDate
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            updateFormField(
                                                "expectedDate",
                                                event
                                                    .target
                                                    .value
                                            )
                                        }
                                    />
                                </div>

                                <div className="form-group">
                                    <label>
                                        Invoice Number
                                    </label>

                                    <input
                                        type="text"
                                        placeholder="Vendor invoice number"
                                        value={
                                            form.invoiceNumber
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            updateFormField(
                                                "invoiceNumber",
                                                event
                                                    .target
                                                    .value
                                            )
                                        }
                                    />
                                </div>

                                <div className="form-group">
                                    <label>
                                        Invoice Date
                                    </label>

                                    <input
                                        type="date"
                                        value={
                                            form.invoiceDate
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            updateFormField(
                                                "invoiceDate",
                                                event
                                                    .target
                                                    .value
                                            )
                                        }
                                    />
                                </div>

                                <div className="form-group form-group-full">
                                    <label>
                                        Notes
                                    </label>

                                    <textarea
                                        rows="3"
                                        placeholder="Optional notes"
                                        value={
                                            form.notes
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            updateFormField(
                                                "notes",
                                                event
                                                    .target
                                                    .value
                                            )
                                        }
                                    />
                                </div>
                            </div>

                            {/* ITEMS */}

                            <div className="purchase-items-section">
                                <div className="section-header">
                                    <div>
                                        <h3>
                                            Purchase Items
                                        </h3>

                                        <span>
                                            {
                                                form.items
                                                    .length
                                            }{" "}
                                            item
                                            {form.items
                                                .length !==
                                            1
                                                ? "s"
                                                : ""}
                                        </span>
                                    </div>

                                    <button
                                        type="button"
                                        className="secondary-btn"
                                        onClick={
                                            addItem
                                        }
                                    >
                                        <Plus
                                            size={
                                                16
                                            }
                                        />
                                        Add Item
                                    </button>
                                </div>

                                <div className="purchase-items">
                                    {form.items.map(
                                        (
                                            item,
                                            index
                                        ) => {
                                            const calculated =
                                                calculateItem(
                                                    item
                                                );

                                            return (
                                                <div
                                                    className="purchase-item-row"
                                                    key={
                                                        index
                                                    }
                                                >
                                                    <div className="form-group">
                                                        <label>
                                                            Inventory Item *
                                                        </label>

                                                        <select
                                                            value={
                                                                item.inventoryItemId
                                                            }
                                                            onChange={(
                                                                event
                                                            ) =>
                                                                handleInventoryChange(
                                                                    index,
                                                                    event
                                                                        .target
                                                                        .value
                                                                )
                                                            }
                                                            required
                                                        >
                                                            <option value="">
                                                                Select Item
                                                            </option>

                                                            {inventoryItems.map(
                                                                (
                                                                    inventoryItem
                                                                ) => (
                                                                    <option
                                                                        key={
                                                                            inventoryItem.id
                                                                        }
                                                                        value={
                                                                            inventoryItem.id
                                                                        }
                                                                    >
                                                                        {
                                                                            inventoryItem.partCode
                                                                        }{" "}
                                                                        -{" "}
                                                                        {
                                                                            inventoryItem.partName
                                                                        }
                                                                    </option>
                                                                )
                                                            )}
                                                        </select>
                                                    </div>

                                                    <div className="form-group">
                                                        <label>
                                                            Qty
                                                        </label>

                                                        <input
                                                            type="number"
                                                            min="0.001"
                                                            step="0.001"
                                                            value={
                                                                item.quantity
                                                            }
                                                            onChange={(
                                                                event
                                                            ) =>
                                                                updateItem(
                                                                    index,
                                                                    "quantity",
                                                                    event
                                                                        .target
                                                                        .value
                                                                )
                                                            }
                                                            required
                                                        />
                                                    </div>

                                                    <div className="form-group">
                                                        <label>
                                                            Unit Price
                                                        </label>

                                                        <input
                                                            type="number"
                                                            min="0"
                                                            step="0.01"
                                                            value={
                                                                item.unitPrice
                                                            }
                                                            onChange={(
                                                                event
                                                            ) =>
                                                                updateItem(
                                                                    index,
                                                                    "unitPrice",
                                                                    event
                                                                        .target
                                                                        .value
                                                                )
                                                            }
                                                            required
                                                        />
                                                    </div>

                                                    <div className="form-group">
                                                        <label>
                                                            Discount
                                                        </label>

                                                        <input
                                                            type="number"
                                                            min="0"
                                                            step="0.01"
                                                            value={
                                                                item.discountAmount
                                                            }
                                                            onChange={(
                                                                event
                                                            ) =>
                                                                updateItem(
                                                                    index,
                                                                    "discountAmount",
                                                                    event
                                                                        .target
                                                                        .value
                                                                )
                                                            }
                                                        />
                                                    </div>

                                                    <div className="form-group">
                                                        <label>
                                                            Tax %
                                                        </label>

                                                        <input
                                                            type="number"
                                                            min="0"
                                                            step="0.01"
                                                            value={
                                                                item.taxPercent
                                                            }
                                                            onChange={(
                                                                event
                                                            ) =>
                                                                updateItem(
                                                                    index,
                                                                    "taxPercent",
                                                                    event
                                                                        .target
                                                                        .value
                                                                )
                                                            }
                                                        />
                                                    </div>

                                                    <div className="form-group item-total">
                                                        <label>
                                                            Total
                                                        </label>

                                                        <strong>
                                                            {money(
                                                                calculated.total
                                                            )}
                                                        </strong>
                                                    </div>

                                                    <button
                                                        type="button"
                                                        className="remove-item-btn"
                                                        onClick={() =>
                                                            removeItem(
                                                                index
                                                            )
                                                        }
                                                        disabled={
                                                            form
                                                                .items
                                                                .length ===
                                                            1
                                                        }
                                                        title="Remove item"
                                                    >
                                                        <X
                                                            size={
                                                                17
                                                            }
                                                        />
                                                    </button>
                                                </div>
                                            );
                                        }
                                    )}
                                </div>
                            </div>

                            {/* TOTALS */}

                            <div className="purchase-summary">
                                <div>
                                    <span>
                                        Subtotal
                                    </span>

                                    <strong>
                                        {money(
                                            formTotals.subtotal
                                        )}
                                    </strong>
                                </div>

                                <div>
                                    <span>
                                        Discount
                                    </span>

                                    <strong>
                                        {money(
                                            formTotals.discountAmount
                                        )}
                                    </strong>
                                </div>

                                <div>
                                    <span>
                                        Tax
                                    </span>

                                    <strong>
                                        {money(
                                            formTotals.taxAmount
                                        )}
                                    </strong>
                                </div>

                                <div className="grand-total">
                                    <span>
                                        Total
                                    </span>

                                    <strong>
                                        {money(
                                            formTotals.totalAmount
                                        )}
                                    </strong>
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="secondary-btn"
                                    onClick={
                                        resetForm
                                    }
                                    disabled={
                                        saving
                                    }
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="primary-btn"
                                    disabled={
                                        saving ||
                                        !selectedVendor ||
                                        inventoryItems.length ===
                                        0
                                    }
                                >
                                    {saving
                                        ? "Creating..."
                                        : "Create Purchase"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* =================================================
                DETAILS MODAL
            ================================================== */}

            {showDetails &&
                selectedPurchase && (
                    <div className="modal-overlay">
                        <div className="modal purchase-details-modal">
                            <div className="modal-header">
                                <div>
                                    <h2>
                                        {
                                            selectedPurchase.purchaseNumber
                                        }
                                    </h2>

                                    <p>
                                        Purchase
                                        details
                                    </p>
                                </div>

                                <button
                                    onClick={() =>
                                        setShowDetails(
                                            false
                                        )
                                    }
                                >
                                    <X
                                        size={
                                            20
                                        }
                                    />
                                </button>
                            </div>

                            <div className="details-grid">
                                <div>
                                    <span>
                                        Vendor
                                    </span>

                                    <strong>
                                        {
                                            selectedPurchase.vendorName
                                        }
                                    </strong>
                                </div>

                                <div>
                                    <span>
                                        Vendor Code
                                    </span>

                                    <strong>
                                        {
                                            selectedPurchase.vendorCode
                                        }
                                    </strong>
                                </div>

                                <div>
                                    <span>
                                        Purchase Date
                                    </span>

                                    <strong>
                                        {formatDate(
                                            selectedPurchase.purchaseDate
                                        )}
                                    </strong>
                                </div>

                                <div>
                                    <span>
                                        Expected Date
                                    </span>

                                    <strong>
                                        {formatDate(
                                            selectedPurchase.expectedDate
                                        )}
                                    </strong>
                                </div>

                                <div>
                                    <span>
                                        Invoice
                                    </span>

                                    <strong>
                                        {
                                            selectedPurchase.invoiceNumber ||
                                            "-"
                                        }
                                    </strong>
                                </div>

                                <div>
                                    <span>
                                        Status
                                    </span>

                                    <strong>
                                        {getStatusLabel(
                                            selectedPurchase.status
                                        )}
                                    </strong>
                                </div>

                                <div>
                                    <span>
                                        Total
                                    </span>

                                    <strong>
                                        {money(
                                            selectedPurchase.totalAmount
                                        )}
                                    </strong>
                                </div>

                                <div>
                                    <span>
                                        Outstanding
                                    </span>

                                    <strong>
                                        {money(
                                            selectedPurchase.outstandingAmount
                                        )}
                                    </strong>
                                </div>
                            </div>

                            <div className="details-items">
                                <h3>
                                    Items
                                </h3>

                                <div className="table-wrapper">
                                    <table>
                                        <thead>
                                        <tr>
                                            <th>
                                                Part
                                            </th>

                                            <th>
                                                Qty
                                            </th>

                                            <th>
                                                Received
                                            </th>

                                            <th>
                                                Pending
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
                                        {(
                                            selectedPurchase.items ||
                                            []
                                        ).map(
                                            (
                                                item
                                            ) => (
                                                <tr
                                                    key={
                                                        item.id
                                                    }
                                                >
                                                    <td>
                                                        <strong>
                                                            {
                                                                item.partName
                                                            }
                                                        </strong>

                                                        <small>
                                                            {
                                                                item.partCode
                                                            }
                                                        </small>
                                                    </td>

                                                    <td>
                                                        {
                                                            item.quantity
                                                        }
                                                    </td>

                                                    <td>
                                                        {
                                                            item.receivedQuantity ??
                                                            0
                                                        }
                                                    </td>

                                                    <td>
                                                        {
                                                            item.pendingQuantity ??
                                                            0
                                                        }
                                                    </td>

                                                    <td>
                                                        {money(
                                                            item.unitPrice
                                                        )}
                                                    </td>

                                                    <td>
                                                        {money(
                                                            item.taxAmount
                                                        )}
                                                    </td>

                                                    <td>
                                                        <strong>
                                                            {money(
                                                                item.totalAmount
                                                            )}
                                                        </strong>
                                                    </td>
                                                </tr>
                                            )
                                        )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {selectedPurchase.notes && (
                                <div className="purchase-notes">
                                    <span>
                                        Notes
                                    </span>

                                    <p>
                                        {
                                            selectedPurchase.notes
                                        }
                                    </p>
                                </div>
                            )}

                            <div className="modal-footer">
                                {selectedPurchase.status ===
                                    "DRAFT" && (
                                        <button
                                            className="primary-btn"
                                            disabled={
                                                actionLoading ===
                                                selectedPurchase.id
                                            }
                                            onClick={() =>
                                                handleOrder(
                                                    selectedPurchase
                                                )
                                            }
                                        >
                                            <Truck
                                                size={
                                                    17
                                                }
                                            />
                                            Mark Ordered
                                        </button>
                                    )}

                                {selectedPurchase.status ===
                                    "ORDERED" && (
                                        <button
                                            className="primary-btn"
                                            disabled={
                                                actionLoading ===
                                                selectedPurchase.id
                                            }
                                            onClick={() =>
                                                handleReceive(
                                                    selectedPurchase
                                                )
                                            }
                                        >
                                            <CheckCircle2
                                                size={
                                                    17
                                                }
                                            />
                                            Receive Purchase
                                        </button>
                                    )}

                                {(selectedPurchase.status ===
                                    "DRAFT" ||
                                    selectedPurchase.status ===
                                    "ORDERED") && (
                                    <button
                                        className="danger-btn"
                                        disabled={
                                            actionLoading ===
                                            selectedPurchase.id
                                        }
                                        onClick={() =>
                                            handleCancel(
                                                selectedPurchase
                                            )
                                        }
                                    >
                                        <XCircle
                                            size={
                                                17
                                            }
                                        />
                                        Cancel Purchase
                                    </button>
                                )}

                                <button
                                    className="secondary-btn"
                                    onClick={() =>
                                        setShowDetails(
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
export default Purchases;