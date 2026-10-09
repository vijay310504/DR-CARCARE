import { useEffect, useMemo, useState } from "react";
import {
    AlertTriangle,
    Boxes,
    CheckCircle2,
    ChevronDown,
    Edit3,
    Eye,
    Filter,
    History,
    Package,
    Plus,
    Search,
    Trash2,
    X,
    XCircle,
} from "lucide-react";

import "./Inventory.css";
import inventoryService from "../../services/inventoryService";

const categories = [
    "Engine",
    "Brakes",
    "Filters",
    "Battery",
    "AC",
    "Fluids",
    "Suspension",
    "Electrical",
    "Body",
    "Tyres",
];

const emptyForm = {
    partCode: "",
    partName: "",
    category: "Engine",
    brand: "",
    unit: "PCS",
    description: "",
    purchasePrice: "",
    sellingPrice: "",
    minimumStock: "",
    maximumStock: "",
    active: true,
};

const emptyAdjustment = {
    type: "ADD",
    quantity: "",
    reason: "",
};

function formatCurrency(value) {
    return `₹${Number(value || 0).toLocaleString("en-IN", {
        maximumFractionDigits: 2,
    })}`;
}

function getStockStatus(item) {
    if (!item.active) {
        return "INACTIVE";
    }

    const stock = Number(item.currentStock || 0);
    const minimum = Number(item.minimumStock || 0);

    if (stock === 0) {
        return "OUT_OF_STOCK";
    }

    if (stock <= minimum) {
        return "LOW_STOCK";
    }

    return "ACTIVE";
}

function getStatusLabel(status) {
    const labels = {
        ACTIVE: "In Stock",
        LOW_STOCK: "Low Stock",
        OUT_OF_STOCK: "Out of Stock",
        INACTIVE: "Inactive",
    };

    return labels[status] || status;
}

function mapBackendItem(item) {
    return {
        ...item,

        // UI-compatible names
        partId: item.partCode,
        name: item.partName,
        stock: Number(item.currentStock || 0),
        minStock: Number(item.minimumStock || 0),

        status: getStockStatus(item),
    };
}

function Inventory() {
    const [inventory, setInventory] = useState([]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [categoryFilter, setCategoryFilter] = useState("ALL");

    const [showForm, setShowForm] = useState(false);
    const [showView, setShowView] = useState(false);
    const [showAdjustment, setShowAdjustment] = useState(false);
    const [showTransactions, setShowTransactions] = useState(false);

    const [editingPart, setEditingPart] = useState(null);
    const [selectedPart, setSelectedPart] = useState(null);

    const [form, setForm] = useState(emptyForm);
    const [adjustment, setAdjustment] = useState(emptyAdjustment);

    const [transactions, setTransactions] = useState([]);
    const [transactionsLoading, setTransactionsLoading] = useState(false);

    // ============================================================
    // LOAD INVENTORY
    // ============================================================

    const loadInventory = async () => {
        try {
            setLoading(true);
            setError("");

            const data = await inventoryService.getAllItems();

            setInventory(
                Array.isArray(data)
                    ? data.map(mapBackendItem)
                    : []
            );
        } catch (err) {
            console.error("Failed to load inventory:", err);

            setError(
                err.response?.data?.message ||
                err.response?.data?.error ||
                "Failed to load inventory."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadInventory();
    }, []);

    // ============================================================
    // FILTERING
    // ============================================================

    const filteredInventory = useMemo(() => {
        return inventory.filter((item) => {
            const search = searchTerm.toLowerCase().trim();

            const matchesSearch =
                !search ||
                String(item.partCode || "")
                    .toLowerCase()
                    .includes(search) ||
                String(item.partName || "")
                    .toLowerCase()
                    .includes(search) ||
                String(item.brand || "")
                    .toLowerCase()
                    .includes(search) ||
                String(item.category || "")
                    .toLowerCase()
                    .includes(search) ||
                String(item.description || "")
                    .toLowerCase()
                    .includes(search);

            const matchesStatus =
                statusFilter === "ALL" ||
                item.status === statusFilter;

            const matchesCategory =
                categoryFilter === "ALL" ||
                item.category === categoryFilter;

            return (
                matchesSearch &&
                matchesStatus &&
                matchesCategory
            );
        });
    }, [
        inventory,
        searchTerm,
        statusFilter,
        categoryFilter,
    ]);

    // ============================================================
    // STATISTICS
    // ============================================================

    const stats = useMemo(() => {
        const activeItems = inventory.filter(
            (item) => item.active
        );

        const totalParts = activeItems.length;

        const totalStock = activeItems.reduce(
            (total, item) =>
                total + Number(item.currentStock || 0),
            0
        );

        const lowStock = activeItems.filter(
            (item) =>
                Number(item.currentStock || 0) > 0 &&
                Number(item.currentStock || 0) <=
                Number(item.minimumStock || 0)
        ).length;

        const outOfStock = activeItems.filter(
            (item) =>
                Number(item.currentStock || 0) === 0
        ).length;

        const inventoryValue = activeItems.reduce(
            (total, item) =>
                total +
                Number(item.currentStock || 0) *
                Number(item.purchasePrice || 0),
            0
        );

        return {
            totalParts,
            totalStock,
            lowStock,
            outOfStock,
            inventoryValue,
        };
    }, [inventory]);

    // ============================================================
    // ADD
    // ============================================================

    const openAddModal = () => {
        setEditingPart(null);

        setForm({
            ...emptyForm,
            partCode: `PRT-${String(
                inventory.length + 1
            ).padStart(3, "0")}`,
        });

        setError("");
        setShowForm(true);
    };

    // ============================================================
    // EDIT
    // ============================================================

    const openEditModal = (part) => {
        setEditingPart(part);

        setForm({
            partCode: part.partCode || "",
            partName: part.partName || "",
            category: part.category || "Engine",
            brand: part.brand || "",
            unit: part.unit || "PCS",
            description: part.description || "",
            purchasePrice: part.purchasePrice ?? "",
            sellingPrice: part.sellingPrice ?? "",
            minimumStock: part.minimumStock ?? "",
            maximumStock: part.maximumStock ?? "",
            active: part.active !== false,
        });

        setError("");
        setShowForm(true);
    };

    // ============================================================
    // VIEW
    // ============================================================

    const openViewModal = (part) => {
        setSelectedPart(part);
        setShowView(true);
    };

    // ============================================================
    // STOCK ADJUSTMENT
    // ============================================================

    const openAdjustmentModal = (part) => {
        setSelectedPart(part);

        setAdjustment({
            ...emptyAdjustment,
        });

        setError("");
        setShowAdjustment(true);
    };

    // ============================================================
    // TRANSACTIONS
    // ============================================================

    const openTransactionsModal = async (part) => {
        try {
            setSelectedPart(part);
            setTransactions([]);
            setTransactionsLoading(true);
            setError("");

            const data =
                await inventoryService.getTransactions(
                    part.id
                );

            setTransactions(
                Array.isArray(data) ? data : []
            );

            setShowTransactions(true);
        } catch (err) {
            console.error(
                "Failed to load transactions:",
                err
            );

            setError(
                err.response?.data?.message ||
                err.response?.data?.error ||
                "Failed to load transaction history."
            );
        } finally {
            setTransactionsLoading(false);
        }
    };

    // ============================================================
    // FORM CHANGE
    // ============================================================

    const handleFormChange = (event) => {
        const { name, value, type, checked } =
            event.target;

        setForm((previous) => ({
            ...previous,
            [name]:
                type === "checkbox"
                    ? checked
                    : value,
        }));
    };

    // ============================================================
    // ADJUSTMENT CHANGE
    // ============================================================

    const handleAdjustmentChange = (event) => {
        const { name, value } = event.target;

        setAdjustment((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    // ============================================================
    // CREATE / UPDATE
    // ============================================================

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (
            !form.partCode.trim() ||
            !form.partName.trim()
        ) {
            setError(
                "Part code and part name are required."
            );
            return;
        }

        try {
            setSaving(true);
            setError("");

            const payload = {
                partCode: form.partCode.trim(),
                partName: form.partName.trim(),
                category: form.category || null,
                brand: form.brand.trim() || null,
                unit: form.unit || "PCS",
                description:
                    form.description.trim() || null,

                purchasePrice:
                    Number(form.purchasePrice) || 0,

                sellingPrice:
                    Number(form.sellingPrice) || 0,

                minimumStock:
                    Number(form.minimumStock) || 0,

                maximumStock:
                    form.maximumStock === "" ||
                    form.maximumStock === null
                        ? null
                        : Number(form.maximumStock),

                active: form.active,
            };

            if (editingPart) {
                const updated =
                    await inventoryService.updateItem(
                        editingPart.id,
                        payload
                    );

                setInventory((previous) =>
                    previous.map((item) =>
                        item.id === editingPart.id
                            ? mapBackendItem(updated)
                            : item
                    )
                );
            } else {
                const created =
                    await inventoryService.createItem(
                        payload
                    );

                const mappedCreated =
                    mapBackendItem(created);

                setInventory((previous) => [
                    mappedCreated,
                    ...previous,
                ]);

                /*
                 * Backend intentionally creates new items
                 * with currentStock = 0.
                 *
                 * If the user entered opening stock,
                 * create a proper inventory transaction.
                 */
                const openingStock =
                    Number(form.stock) || 0;

                if (openingStock > 0) {
                    try {
                        const transaction =
                            await inventoryService.adjustStock(
                                created.id,
                                {
                                    transactionType:
                                        "ADJUSTMENT_IN",
                                    quantity: openingStock,
                                    notes:
                                        "Opening stock",
                                }
                            );

                        const updatedStock =
                            Number(
                                transaction.stockAfter || 0
                            );

                        setInventory((previous) =>
                            previous.map((item) =>
                                item.id === created.id
                                    ? {
                                        ...item,
                                        currentStock:
                                        updatedStock,
                                        stock:
                                        updatedStock,
                                        status:
                                            getStockStatus(
                                                {
                                                    ...item,
                                                    currentStock:
                                                    updatedStock,
                                                }
                                            ),
                                    }
                                    : item
                            )
                        );
                    } catch (stockError) {
                        console.error(
                            "Opening stock failed:",
                            stockError
                        );

                        setError(
                            "Part was created, but opening stock could not be added."
                        );
                    }
                }
            }

            setShowForm(false);
            setEditingPart(null);
            setForm(emptyForm);
        } catch (err) {
            console.error(
                "Failed to save inventory item:",
                err
            );

            setError(
                err.response?.data?.message ||
                err.response?.data?.error ||
                "Failed to save inventory item."
            );
        } finally {
            setSaving(false);
        }
    };

    // ============================================================
    // DEACTIVATE
    // ============================================================

    const handleDelete = async (part) => {
        const confirmed = window.confirm(
            `Deactivate "${part.partName}" from Inventory?`
        );

        if (!confirmed) {
            return;
        }

        try {
            setSaving(true);
            setError("");

            const payload = {
                partCode: part.partCode,
                partName: part.partName,
                category: part.category,
                brand: part.brand,
                unit: part.unit,
                description: part.description,
                purchasePrice:
                    Number(part.purchasePrice || 0),
                sellingPrice:
                    Number(part.sellingPrice || 0),
                minimumStock:
                    Number(part.minimumStock || 0),
                maximumStock:
                    part.maximumStock ?? null,
                active: false,
            };

            const updated =
                await inventoryService.updateItem(
                    part.id,
                    payload
                );

            setInventory((previous) =>
                previous.map((item) =>
                    item.id === part.id
                        ? mapBackendItem(updated)
                        : item
                )
            );
        } catch (err) {
            console.error(
                "Failed to deactivate item:",
                err
            );

            setError(
                err.response?.data?.message ||
                err.response?.data?.error ||
                "Failed to deactivate inventory item."
            );
        } finally {
            setSaving(false);
        }
    };

    // ============================================================
    // STOCK ADJUSTMENT SUBMIT
    // ============================================================

    const handleAdjustmentSubmit = async (event) => {
        event.preventDefault();

        if (
            !selectedPart ||
            !adjustment.quantity
        ) {
            return;
        }

        const quantity =
            Number(adjustment.quantity);

        if (quantity <= 0) {
            setError(
                "Quantity must be greater than zero."
            );
            return;
        }

        const currentStock =
            Number(
                selectedPart.currentStock || 0
            );

        let transactionType;
        let actualQuantity = quantity;

        if (adjustment.type === "ADD") {
            transactionType = "ADJUSTMENT_IN";
        }

        if (adjustment.type === "REMOVE") {
            transactionType = "ADJUSTMENT_OUT";
        }

        if (adjustment.type === "SET") {
            const targetStock = quantity;

            if (targetStock === currentStock) {
                setError(
                    "New stock level is the same as current stock."
                );
                return;
            }

            if (targetStock > currentStock) {
                transactionType =
                    "ADJUSTMENT_IN";

                actualQuantity =
                    targetStock - currentStock;
            } else {
                transactionType =
                    "ADJUSTMENT_OUT";

                actualQuantity =
                    currentStock - targetStock;
            }
        }

        try {
            setSaving(true);
            setError("");

            const response =
                await inventoryService.adjustStock(
                    selectedPart.id,
                    {
                        transactionType,
                        quantity: actualQuantity,
                        notes:
                            adjustment.reason.trim() ||
                            "Manual stock adjustment",
                    }
                );

            const updatedStock =
                Number(response.stockAfter || 0);

            setInventory((previous) =>
                previous.map((item) => {
                    if (
                        item.id !== selectedPart.id
                    ) {
                        return item;
                    }

                    const updatedItem = {
                        ...item,
                        currentStock:
                        updatedStock,
                        stock:
                        updatedStock,
                    };

                    return {
                        ...updatedItem,
                        status:
                            getStockStatus(
                                updatedItem
                            ),
                    };
                })
            );

            setSelectedPart((previous) => {
                if (!previous) {
                    return previous;
                }

                const updated = {
                    ...previous,
                    currentStock:
                    updatedStock,
                    stock:
                    updatedStock,
                };

                return {
                    ...updated,
                    status:
                        getStockStatus(updated),
                };
            });

            setShowAdjustment(false);
            setAdjustment(emptyAdjustment);
        } catch (err) {
            console.error(
                "Stock adjustment failed:",
                err
            );

            setError(
                err.response?.data?.message ||
                err.response?.data?.error ||
                "Stock adjustment failed."
            );
        } finally {
            setSaving(false);
        }
    };

    // ============================================================
    // CLEAR FILTERS
    // ============================================================

    const clearFilters = () => {
        setSearchTerm("");
        setStatusFilter("ALL");
        setCategoryFilter("ALL");
    };

    // ============================================================
    // LOADING
    // ============================================================

    if (loading) {
        return (
            <div className="inventory-page">
                <div className="inventory-header">
                    <div>
                        <div className="inventory-breadcrumb">
                            Workshop <span>/</span> Inventory
                        </div>

                        <h1>Inventory Management</h1>

                        <p>
                            Manage workshop parts, stock levels,
                            pricing and inventory movements.
                        </p>
                    </div>
                </div>

                <div className="inventory-panel">
                    <div className="inventory-empty">
                        <Package size={40} />
                        <h3>Loading inventory...</h3>
                        <p>
                            Fetching inventory data from the
                            workshop database.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="inventory-page">

            {/* ==================================================
                PAGE HEADER
            ================================================== */}

            <div className="inventory-header">
                <div>
                    <div className="inventory-breadcrumb">
                        Workshop <span>/</span> Inventory
                    </div>

                    <h1>Inventory Management</h1>

                    <p>
                        Manage workshop parts, stock levels,
                        pricing and inventory movements.
                    </p>
                </div>

                <button
                    className="inventory-primary-btn"
                    onClick={openAddModal}
                >
                    <Plus size={18} />
                    Add Part
                </button>
            </div>

            {/* ==================================================
                ERROR MESSAGE
            ================================================== */}

            {error && (
                <div
                    style={{
                        marginBottom: "16px",
                        padding: "12px 16px",
                        borderRadius: "10px",
                        background: "#fff1f2",
                        color: "#b91c1c",
                        border: "1px solid #fecdd3",
                    }}
                >
                    {error}

                    <button
                        type="button"
                        onClick={() => setError("")}
                        style={{
                            marginLeft: "12px",
                            border: "none",
                            background: "transparent",
                            cursor: "pointer",
                            fontWeight: 600,
                        }}
                    >
                        ×
                    </button>
                </div>
            )}

            {/* ==================================================
                STAT CARDS
            ================================================== */}

            <div className="inventory-stat-grid">

                <div className="inventory-stat-card">
                    <div className="inventory-stat-icon blue">
                        <Package size={21} />
                    </div>

                    <div>
                        <span>Total Parts</span>
                        <strong>
                            {stats.totalParts}
                        </strong>
                    </div>
                </div>

                <div className="inventory-stat-card">
                    <div className="inventory-stat-icon purple">
                        <Boxes size={21} />
                    </div>

                    <div>
                        <span>Available Stock</span>
                        <strong>
                            {stats.totalStock}
                        </strong>
                    </div>
                </div>

                <div className="inventory-stat-card">
                    <div className="inventory-stat-icon orange">
                        <AlertTriangle size={21} />
                    </div>

                    <div>
                        <span>Low Stock</span>
                        <strong>
                            {stats.lowStock}
                        </strong>
                    </div>
                </div>

                <div className="inventory-stat-card">
                    <div className="inventory-stat-icon red">
                        <XCircle size={21} />
                    </div>

                    <div>
                        <span>Out of Stock</span>
                        <strong>
                            {stats.outOfStock}
                        </strong>
                    </div>
                </div>

                <div className="inventory-stat-card value-card">
                    <div className="inventory-stat-icon green">
                        <Package size={21} />
                    </div>

                    <div>
                        <span>Inventory Value</span>
                        <strong>
                            {formatCurrency(
                                stats.inventoryValue
                            )}
                        </strong>
                    </div>
                </div>
            </div>

            {/* ==================================================
                INVENTORY PANEL
            ================================================== */}

            <div className="inventory-panel">

                <div className="inventory-panel-header">
                    <div>
                        <h2>Parts Inventory</h2>

                        <p>
                            {filteredInventory.length} parts
                            displayed
                        </p>
                    </div>

                    <button
                        className="inventory-filter-btn"
                        onClick={clearFilters}
                    >
                        <Filter size={16} />
                        Clear Filters
                    </button>
                </div>

                {/* ==================================================
                    FILTERS
                ================================================== */}

                <div className="inventory-filters">

                    <div className="inventory-search">
                        <Search size={18} />

                        <input
                            type="text"
                            placeholder="Search part, code, brand or category..."
                            value={searchTerm}
                            onChange={(event) =>
                                setSearchTerm(
                                    event.target.value
                                )
                            }
                        />

                        {searchTerm && (
                            <button
                                onClick={() =>
                                    setSearchTerm("")
                                }
                            >
                                <X size={16} />
                            </button>
                        )}
                    </div>

                    <div className="inventory-select">
                        <select
                            value={categoryFilter}
                            onChange={(event) =>
                                setCategoryFilter(
                                    event.target.value
                                )
                            }
                        >
                            <option value="ALL">
                                All Categories
                            </option>

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

                        <ChevronDown size={16} />
                    </div>

                    <div className="inventory-select">
                        <select
                            value={statusFilter}
                            onChange={(event) =>
                                setStatusFilter(
                                    event.target.value
                                )
                            }
                        >
                            <option value="ALL">
                                All Stock Status
                            </option>

                            <option value="ACTIVE">
                                In Stock
                            </option>

                            <option value="LOW_STOCK">
                                Low Stock
                            </option>

                            <option value="OUT_OF_STOCK">
                                Out of Stock
                            </option>

                            <option value="INACTIVE">
                                Inactive
                            </option>
                        </select>

                        <ChevronDown size={16} />
                    </div>
                </div>

                {/* ==================================================
                    TABLE
                ================================================== */}

                <div className="inventory-table-wrapper">

                    <table className="inventory-table">

                        <thead>
                        <tr>
                            <th>Part</th>
                            <th>Category</th>
                            <th>Brand</th>
                            <th>Stock</th>
                            <th>Pricing</th>
                            <th>Status</th>
                            <th>Unit</th>
                            <th>Actions</th>
                        </tr>
                        </thead>

                        <tbody>

                        {filteredInventory.length > 0 ? (
                            filteredInventory.map(
                                (part) => (
                                    <tr key={part.id}>

                                        {/* PART */}

                                        <td>
                                            <div className="part-cell">

                                                <div className="part-icon">
                                                    <Package
                                                        size={17}
                                                    />
                                                </div>

                                                <div>
                                                    <strong>
                                                        {
                                                            part.partName
                                                        }
                                                    </strong>

                                                    <span>
                                                        {
                                                            part.partCode
                                                        }
                                                    </span>

                                                    <small>
                                                        {
                                                            part.description ||
                                                            "No description"
                                                        }
                                                    </small>
                                                </div>

                                            </div>
                                        </td>

                                        {/* CATEGORY */}

                                        <td>
                                            <span className="category-badge">
                                                {part.category ||
                                                    "General"}
                                            </span>
                                        </td>

                                        {/* BRAND */}

                                        <td>
                                            {part.brand ||
                                                "—"}
                                        </td>

                                        {/* STOCK */}

                                        <td>
                                            <div className="stock-cell">

                                                <strong>
                                                    {
                                                        part.currentStock
                                                    }
                                                </strong>

                                                <span>
                                                    Min:{" "}
                                                    {
                                                        part.minimumStock
                                                    }
                                                </span>

                                            </div>
                                        </td>

                                        {/* PRICING */}

                                        <td>
                                            <div className="price-cell">

                                                <strong>
                                                    {formatCurrency(
                                                        part.sellingPrice
                                                    )}
                                                </strong>

                                                <span>
                                                    Buy:{" "}
                                                    {formatCurrency(
                                                        part.purchasePrice
                                                    )}
                                                </span>

                                            </div>
                                        </td>

                                        {/* STATUS */}

                                        <td>

                                            <span
                                                className={`inventory-status ${String(
                                                    part.status
                                                ).toLowerCase()}`}
                                            >

                                                {part.status ===
                                                    "ACTIVE" && (
                                                        <CheckCircle2
                                                            size={14}
                                                        />
                                                    )}

                                                {part.status ===
                                                    "LOW_STOCK" && (
                                                        <AlertTriangle
                                                            size={14}
                                                        />
                                                    )}

                                                {part.status ===
                                                    "OUT_OF_STOCK" && (
                                                        <XCircle
                                                            size={14}
                                                        />
                                                    )}

                                                {part.status ===
                                                    "INACTIVE" && (
                                                        <XCircle
                                                            size={14}
                                                        />
                                                    )}

                                                {getStatusLabel(
                                                    part.status
                                                )}

                                            </span>

                                        </td>

                                        {/* UNIT */}

                                        <td>
                                            <span className="location-badge">
                                                {part.unit}
                                            </span>
                                        </td>

                                        {/* ACTIONS */}

                                        <td>

                                            <div className="inventory-actions">

                                                <button
                                                    className="icon-btn"
                                                    title="View"
                                                    onClick={() =>
                                                        openViewModal(
                                                            part
                                                        )
                                                    }
                                                >
                                                    <Eye size={16} />
                                                </button>

                                                <button
                                                    className="icon-btn"
                                                    title="Stock Adjustment"
                                                    onClick={() =>
                                                        openAdjustmentModal(
                                                            part
                                                        )
                                                    }
                                                >
                                                    <History
                                                        size={16}
                                                    />
                                                </button>

                                                <button
                                                    className="icon-btn"
                                                    title="Transaction History"
                                                    onClick={() =>
                                                        openTransactionsModal(
                                                            part
                                                        )
                                                    }
                                                >
                                                    <History
                                                        size={16}
                                                    />
                                                </button>

                                                <button
                                                    className="icon-btn"
                                                    title="Edit"
                                                    onClick={() =>
                                                        openEditModal(
                                                            part
                                                        )
                                                    }
                                                >
                                                    <Edit3
                                                        size={16}
                                                    />
                                                </button>

                                                {part.active && (
                                                    <button
                                                        className="icon-btn danger"
                                                        title="Deactivate"
                                                        onClick={() =>
                                                            handleDelete(
                                                                part
                                                            )
                                                        }
                                                    >
                                                        <Trash2
                                                            size={16}
                                                        />
                                                    </button>
                                                )}

                                            </div>

                                        </td>

                                    </tr>
                                )
                            )
                        ) : (
                            <tr>
                                <td colSpan="8">

                                    <div className="inventory-empty">

                                        <Package size={40} />

                                        <h3>
                                            No inventory found
                                        </h3>

                                        <p>
                                            Try changing your
                                            search or filter
                                            criteria.
                                        </p>

                                    </div>

                                </td>
                            </tr>
                        )}

                        </tbody>
                    </table>
                </div>
            </div>

            {/* ==================================================
                ADD / EDIT MODAL
            ================================================== */}

            {showForm && (
                <div
                    className="inventory-modal-overlay"
                    onMouseDown={() =>
                        !saving &&
                        setShowForm(false)
                    }
                >

                    <div
                        className="inventory-modal large"
                        onMouseDown={(event) =>
                            event.stopPropagation()
                        }
                    >

                        <div className="inventory-modal-header">

                            <div>

                                <span className="modal-kicker">
                                    {editingPart
                                        ? "INVENTORY UPDATE"
                                        : "NEW INVENTORY ITEM"}
                                </span>

                                <h2>
                                    {editingPart
                                        ? "Edit Part"
                                        : "Add New Part"}
                                </h2>

                            </div>

                            <button
                                className="modal-close"
                                onClick={() =>
                                    setShowForm(false)
                                }
                                disabled={saving}
                            >
                                <X size={20} />
                            </button>

                        </div>

                        <form onSubmit={handleSubmit}>

                            <div className="inventory-form-grid">

                                <div className="inventory-form-group">
                                    <label>
                                        Part Code *
                                    </label>

                                    <input
                                        name="partCode"
                                        value={
                                            form.partCode
                                        }
                                        onChange={
                                            handleFormChange
                                        }
                                        placeholder="PRT-001"
                                        required
                                    />
                                </div>

                                <div className="inventory-form-group">
                                    <label>
                                        Part Name *
                                    </label>

                                    <input
                                        name="partName"
                                        value={
                                            form.partName
                                        }
                                        onChange={
                                            handleFormChange
                                        }
                                        placeholder="Engine Oil 5W-30"
                                        required
                                    />
                                </div>

                                <div className="inventory-form-group">
                                    <label>
                                        Category
                                    </label>

                                    <select
                                        name="category"
                                        value={
                                            form.category
                                        }
                                        onChange={
                                            handleFormChange
                                        }
                                    >
                                        {categories.map(
                                            (category) => (
                                                <option
                                                    key={
                                                        category
                                                    }
                                                    value={
                                                        category
                                                    }
                                                >
                                                    {category}
                                                </option>
                                            )
                                        )}
                                    </select>
                                </div>

                                <div className="inventory-form-group">
                                    <label>
                                        Brand
                                    </label>

                                    <input
                                        name="brand"
                                        value={
                                            form.brand
                                        }
                                        onChange={
                                            handleFormChange
                                        }
                                        placeholder="Bosch"
                                    />
                                </div>

                                <div className="inventory-form-group">
                                    <label>
                                        Unit *
                                    </label>

                                    <select
                                        name="unit"
                                        value={
                                            form.unit
                                        }
                                        onChange={
                                            handleFormChange
                                        }
                                    >
                                        <option value="PCS">
                                            Piece
                                        </option>

                                        <option value="SET">
                                            Set
                                        </option>

                                        <option value="BOTTLE">
                                            Bottle
                                        </option>

                                        <option value="CAN">
                                            Can
                                        </option>

                                        <option value="LITRE">
                                            Litre
                                        </option>

                                        <option value="BOX">
                                            Box
                                        </option>
                                    </select>
                                </div>

                                <div className="inventory-form-group full">
                                    <label>
                                        Description
                                    </label>

                                    <textarea
                                        name="description"
                                        value={
                                            form.description
                                        }
                                        onChange={
                                            handleFormChange
                                        }
                                        placeholder="Describe this inventory item..."
                                        rows="3"
                                    />
                                </div>

                                <div className="inventory-form-group">
                                    <label>
                                        Purchase Price
                                    </label>

                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        name="purchasePrice"
                                        value={
                                            form.purchasePrice
                                        }
                                        onChange={
                                            handleFormChange
                                        }
                                        placeholder="0"
                                    />
                                </div>

                                <div className="inventory-form-group">
                                    <label>
                                        Selling Price
                                    </label>

                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        name="sellingPrice"
                                        value={
                                            form.sellingPrice
                                        }
                                        onChange={
                                            handleFormChange
                                        }
                                        placeholder="0"
                                    />
                                </div>

                                <div className="inventory-form-group">
                                    <label>
                                        Minimum Stock
                                    </label>

                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        name="minimumStock"
                                        value={
                                            form.minimumStock
                                        }
                                        onChange={
                                            handleFormChange
                                        }
                                        placeholder="5"
                                    />
                                </div>

                                <div className="inventory-form-group">
                                    <label>
                                        Maximum Stock
                                    </label>

                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        name="maximumStock"
                                        value={
                                            form.maximumStock
                                        }
                                        onChange={
                                            handleFormChange
                                        }
                                        placeholder="100"
                                    />
                                </div>

                                {!editingPart && (
                                    <div className="inventory-form-group">
                                        <label>
                                            Opening Stock
                                        </label>

                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            name="stock"
                                            value={
                                                form.stock ||
                                                ""
                                            }
                                            onChange={
                                                handleFormChange
                                            }
                                            placeholder="0"
                                        />

                                        <small>
                                            Opening stock is
                                            recorded as an
                                            inventory transaction.
                                        </small>
                                    </div>
                                )}

                                {editingPart && (
                                    <div className="inventory-form-group">
                                        <label>
                                            Current Stock
                                        </label>

                                        <input
                                            value={
                                                editingPart.currentStock ??
                                                0
                                            }
                                            disabled
                                        />

                                        <small>
                                            Use Stock Adjustment
                                            to change stock.
                                        </small>
                                    </div>
                                )}

                                <div className="inventory-form-group">

                                    <label>
                                        Status
                                    </label>

                                    <select
                                        name="active"
                                        value={
                                            form.active
                                                ? "true"
                                                : "false"
                                        }
                                        onChange={(event) =>
                                            setForm(
                                                (
                                                    previous
                                                ) => ({
                                                    ...previous,
                                                    active:
                                                        event
                                                            .target
                                                            .value ===
                                                        "true",
                                                })
                                            )
                                        }
                                    >
                                        <option value="true">
                                            Active
                                        </option>

                                        <option value="false">
                                            Inactive
                                        </option>
                                    </select>

                                </div>

                            </div>

                            <div className="inventory-modal-footer">

                                <button
                                    type="button"
                                    className="secondary-btn"
                                    onClick={() =>
                                        setShowForm(false)
                                    }
                                    disabled={saving}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="inventory-primary-btn"
                                    disabled={saving}
                                >
                                    <CheckCircle2 size={17} />

                                    {saving
                                        ? "Saving..."
                                        : editingPart
                                            ? "Save Changes"
                                            : "Add Part"}
                                </button>

                            </div>

                        </form>
                    </div>
                </div>
            )}

            {/* ==================================================
                VIEW MODAL
            ================================================== */}

            {showView && selectedPart && (
                <div
                    className="inventory-modal-overlay"
                    onMouseDown={() =>
                        setShowView(false)
                    }
                >

                    <div
                        className="inventory-modal"
                        onMouseDown={(event) =>
                            event.stopPropagation()
                        }
                    >

                        <div className="inventory-modal-header">

                            <div>

                                <span className="modal-kicker">
                                    {
                                        selectedPart.partCode
                                    }
                                </span>

                                <h2>
                                    {
                                        selectedPart.partName
                                    }
                                </h2>

                            </div>

                            <button
                                className="modal-close"
                                onClick={() =>
                                    setShowView(false)
                                }
                            >
                                <X size={20} />
                            </button>

                        </div>

                        <div className="part-detail-card">

                            <div className="part-detail-icon">
                                <Package size={28} />
                            </div>

                            <div>
                                <strong>
                                    {
                                        selectedPart.partName
                                    }
                                </strong>

                                <span>
                                    {
                                        selectedPart.partCode
                                    }
                                </span>
                            </div>

                            <span
                                className={`inventory-status ${String(
                                    selectedPart.status
                                ).toLowerCase()}`}
                            >
                                {getStatusLabel(
                                    selectedPart.status
                                )}
                            </span>

                        </div>

                        <div className="part-detail-grid">

                            <div>
                                <span>Category</span>
                                <strong>
                                    {selectedPart.category ||
                                        "—"}
                                </strong>
                            </div>

                            <div>
                                <span>Brand</span>
                                <strong>
                                    {selectedPart.brand ||
                                        "—"}
                                </strong>
                            </div>

                            <div>
                                <span>Unit</span>
                                <strong>
                                    {
                                        selectedPart.unit
                                    }
                                </strong>
                            </div>

                            <div>
                                <span>Purchase Price</span>
                                <strong>
                                    {formatCurrency(
                                        selectedPart.purchasePrice
                                    )}
                                </strong>
                            </div>

                            <div>
                                <span>Selling Price</span>
                                <strong>
                                    {formatCurrency(
                                        selectedPart.sellingPrice
                                    )}
                                </strong>
                            </div>

                            <div>
                                <span>Current Stock</span>
                                <strong>
                                    {
                                        selectedPart.currentStock
                                    }{" "}
                                    {
                                        selectedPart.unit
                                    }
                                </strong>
                            </div>

                            <div>
                                <span>Minimum Stock</span>
                                <strong>
                                    {
                                        selectedPart.minimumStock
                                    }{" "}
                                    {
                                        selectedPart.unit
                                    }
                                </strong>
                            </div>

                            <div>
                                <span>Maximum Stock</span>
                                <strong>
                                    {selectedPart.maximumStock ??
                                        "No limit"}
                                </strong>
                            </div>

                            <div>
                                <span>Inventory Value</span>
                                <strong>
                                    {formatCurrency(
                                        Number(
                                            selectedPart.currentStock ||
                                            0
                                        ) *
                                        Number(
                                            selectedPart.purchasePrice ||
                                            0
                                        )
                                    )}
                                </strong>
                            </div>

                            <div>
                                <span>Created</span>
                                <strong>
                                    {selectedPart.createdAt
                                        ? new Date(
                                            selectedPart.createdAt
                                        ).toLocaleString(
                                            "en-IN"
                                        )
                                        : "—"}
                                </strong>
                            </div>

                            <div>
                                <span>Last Updated</span>
                                <strong>
                                    {selectedPart.updatedAt
                                        ? new Date(
                                            selectedPart.updatedAt
                                        ).toLocaleString(
                                            "en-IN"
                                        )
                                        : "—"}
                                </strong>
                            </div>

                            <div>
                                <span>Description</span>
                                <strong>
                                    {
                                        selectedPart.description ||
                                        "No description"
                                    }
                                </strong>
                            </div>

                        </div>

                        <div className="inventory-modal-footer">

                            <button
                                className="secondary-btn"
                                onClick={() =>
                                    setShowView(false)
                                }
                            >
                                Close
                            </button>

                            <button
                                className="inventory-primary-btn"
                                onClick={() => {
                                    setShowView(false);
                                    openAdjustmentModal(
                                        selectedPart
                                    );
                                }}
                            >
                                <History size={17} />
                                Adjust Stock
                            </button>

                        </div>

                    </div>
                </div>
            )}

            {/* ==================================================
                STOCK ADJUSTMENT MODAL
            ================================================== */}

            {showAdjustment && selectedPart && (
                <div
                    className="inventory-modal-overlay"
                    onMouseDown={() =>
                        !saving &&
                        setShowAdjustment(false)
                    }
                >

                    <div
                        className="inventory-modal small"
                        onMouseDown={(event) =>
                            event.stopPropagation()
                        }
                    >

                        <div className="inventory-modal-header">

                            <div>

                                <span className="modal-kicker">
                                    STOCK OPERATION
                                </span>

                                <h2>
                                    Adjust Stock
                                </h2>

                            </div>

                            <button
                                className="modal-close"
                                onClick={() =>
                                    setShowAdjustment(false)
                                }
                                disabled={saving}
                            >
                                <X size={20} />
                            </button>

                        </div>

                        <div className="adjustment-part">

                            <div className="part-detail-icon">
                                <Package size={24} />
                            </div>

                            <div>
                                <strong>
                                    {
                                        selectedPart.partName
                                    }
                                </strong>

                                <span>
                                    {
                                        selectedPart.partCode
                                    }
                                </span>
                            </div>

                            <div className="adjustment-current">

                                <span>
                                    Current
                                </span>

                                <strong>
                                    {
                                        selectedPart.currentStock
                                    }{" "}
                                    {
                                        selectedPart.unit
                                    }
                                </strong>

                            </div>

                        </div>

                        <form
                            onSubmit={
                                handleAdjustmentSubmit
                            }
                        >

                            <div className="inventory-form-group">

                                <label>
                                    Operation
                                </label>

                                <select
                                    name="type"
                                    value={
                                        adjustment.type
                                    }
                                    onChange={
                                        handleAdjustmentChange
                                    }
                                >
                                    <option value="ADD">
                                        Add Stock
                                    </option>

                                    <option value="REMOVE">
                                        Remove Stock
                                    </option>

                                    <option value="SET">
                                        Set Stock Level
                                    </option>
                                </select>

                            </div>

                            <div className="inventory-form-group">

                                <label>
                                    {adjustment.type ===
                                    "SET"
                                        ? "New Stock Level"
                                        : "Quantity"}
                                </label>

                                <input
                                    type="number"
                                    min="1"
                                    step="0.01"
                                    name="quantity"
                                    value={
                                        adjustment.quantity
                                    }
                                    onChange={
                                        handleAdjustmentChange
                                    }
                                    placeholder="Enter quantity"
                                    required
                                />

                            </div>

                            <div className="inventory-form-group">

                                <label>
                                    Reason
                                </label>

                                <textarea
                                    name="reason"
                                    value={
                                        adjustment.reason
                                    }
                                    onChange={
                                        handleAdjustmentChange
                                    }
                                    placeholder="Enter reason for stock adjustment..."
                                    rows="4"
                                />

                            </div>

                            <div className="inventory-modal-footer">

                                <button
                                    type="button"
                                    className="secondary-btn"
                                    onClick={() =>
                                        setShowAdjustment(
                                            false
                                        )
                                    }
                                    disabled={saving}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="inventory-primary-btn"
                                    disabled={saving}
                                >
                                    <History size={17} />

                                    {saving
                                        ? "Updating..."
                                        : "Update Stock"}
                                </button>

                            </div>

                        </form>

                    </div>
                </div>
            )}

            {/* ==================================================
                TRANSACTION HISTORY MODAL
            ================================================== */}

            {showTransactions && selectedPart && (
                <div
                    className="inventory-modal-overlay"
                    onMouseDown={() =>
                        setShowTransactions(false)
                    }
                >

                    <div
                        className="inventory-modal large"
                        onMouseDown={(event) =>
                            event.stopPropagation()
                        }
                    >

                        <div className="inventory-modal-header">

                            <div>

                                <span className="modal-kicker">
                                    STOCK HISTORY
                                </span>

                                <h2>
                                    {
                                        selectedPart.partName
                                    }
                                </h2>

                            </div>

                            <button
                                className="modal-close"
                                onClick={() =>
                                    setShowTransactions(
                                        false
                                    )
                                }
                            >
                                <X size={20} />
                            </button>

                        </div>

                        {transactionsLoading ? (
                            <div className="inventory-empty">
                                <History size={36} />

                                <h3>
                                    Loading transactions...
                                </h3>
                            </div>
                        ) : transactions.length === 0 ? (
                            <div className="inventory-empty">
                                <History size={36} />

                                <h3>
                                    No transactions found
                                </h3>

                                <p>
                                    No stock movement has
                                    been recorded for this
                                    item yet.
                                </p>
                            </div>
                        ) : (
                            <div
                                className="inventory-table-wrapper"
                                style={{
                                    maxHeight: "420px",
                                    overflowY: "auto",
                                }}
                            >

                                <table className="inventory-table">

                                    <thead>
                                    <tr>
                                        <th>
                                            Date
                                        </th>

                                        <th>
                                            Type
                                        </th>

                                        <th>
                                            Quantity
                                        </th>

                                        <th>
                                            Before
                                        </th>

                                        <th>
                                            After
                                        </th>

                                        <th>
                                            Reference
                                        </th>

                                        <th>
                                            Notes
                                        </th>
                                    </tr>
                                    </thead>

                                    <tbody>

                                    {transactions.map(
                                        (transaction) => (
                                            <tr
                                                key={
                                                    transaction.id
                                                }
                                            >

                                                <td>
                                                    {transaction.transactionDate
                                                        ? new Date(
                                                            transaction.transactionDate
                                                        ).toLocaleString(
                                                            "en-IN"
                                                        )
                                                        : "—"}
                                                </td>

                                                <td>
                                                    <span className="category-badge">
                                                        {
                                                            transaction.transactionType
                                                        }
                                                    </span>
                                                </td>

                                                <td>
                                                    {
                                                        transaction.quantity
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        transaction.stockBefore
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        transaction.stockAfter
                                                    }
                                                </td>

                                                <td>
                                                    {transaction.referenceType
                                                        ? `${transaction.referenceType}${
                                                            transaction.referenceId
                                                                ? ` #${transaction.referenceId}`
                                                                : ""
                                                        }`
                                                        : "—"}
                                                </td>

                                                <td>
                                                    {
                                                        transaction.notes ||
                                                        "—"
                                                    }
                                                </td>

                                            </tr>
                                        )
                                    )}

                                    </tbody>
                                </table>

                            </div>
                        )}

                        <div className="inventory-modal-footer">

                            <button
                                className="secondary-btn"
                                onClick={() =>
                                    setShowTransactions(
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

export default Inventory;