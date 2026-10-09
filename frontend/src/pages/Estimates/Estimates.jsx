import { useEffect, useMemo, useState } from "react";
import {
    Plus,
    Search,
    FileText,
    Eye,
    Pencil,
    Trash2,
    CheckCircle,
    XCircle,
    Clock,
    AlertCircle,
    Car,
    User,
    IndianRupee,
    X,
    Save,
    Wrench,
    Package,
} from "lucide-react";

import "./Estimates.css";

import estimateService from "../../services/estimateService";
import jobCardService from "../../services/jobCardService";

const statusConfig = {
    DRAFT: {
        label: "Draft",
        className: "draft",
        icon: FileText,
    },
    PENDING_APPROVAL: {
        label: "Pending Approval",
        className: "pending",
        icon: Clock,
    },
    APPROVED: {
        label: "Approved",
        className: "approved",
        icon: CheckCircle,
    },
    REJECTED: {
        label: "Rejected",
        className: "rejected",
        icon: XCircle,
    },
    EXPIRED: {
        label: "Expired",
        className: "expired",
        icon: AlertCircle,
    },
};

const emptyForm = {
    id: null,
    estimateNumber: "",
    jobCardId: "",
    jobCardNumber: "",
    customerName: "",
    phone: "",
    vehicleMake: "",
    vehicleModel: "",
    vehicleNumber: "",
    estimateDate: "",
    validUntil: "",
    status: "DRAFT",
    customerNotes: "",
    internalNotes: "",
    items: [],
};

const formatCurrency = (value) =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(Number(value || 0));

const formatDate = (value) => {
    if (!value) return "";

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

const toInputDate = (value) => {
    if (!value) return "";

    if (typeof value === "string") {
        return value.substring(0, 10);
    }

    return "";
};

const normalizeItem = (item) => ({
    id: item.id ?? null,
    estimateId: item.estimateId ?? null,
    itemType: item.itemType || "SERVICE",
    description: item.description || "",
    quantity: Number(item.quantity ?? 1),
    unitPrice: Number(item.unitPrice ?? 0),
    discountAmount: Number(item.discountAmount ?? 0),
    taxPercent: Number(item.taxPercent ?? 0),
    taxAmount: Number(item.taxAmount ?? 0),
    totalAmount: Number(item.totalAmount ?? 0),
    notes: item.notes || "",
});

const calculateItem = (item) => {
    const quantity = Number(item.quantity || 0);
    const unitPrice = Number(item.unitPrice || 0);
    const discount = Number(item.discountAmount || 0);
    const taxPercent = Number(item.taxPercent || 0);

    const subtotal = Math.max(
        0,
        quantity * unitPrice - discount
    );

    const taxAmount =
        (subtotal * taxPercent) / 100;

    const totalAmount =
        subtotal + taxAmount;

    return {
        ...item,
        quantity,
        unitPrice,
        discountAmount: discount,
        taxPercent,
        taxAmount,
        totalAmount,
    };
};

function Estimates() {
    const [estimates, setEstimates] = useState([]);
    const [jobCards, setJobCards] = useState([]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");

    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState("create");

    const [selectedEstimate, setSelectedEstimate] = useState(null);

    const [form, setForm] = useState(emptyForm);

    // =========================================================
    // LOAD DATA
    // =========================================================

    const loadData = async () => {
        try {
            setLoading(true);
            setError("");

            const [estimateData, jobCardData] =
                await Promise.all([
                    estimateService.getAllEstimates(),
                    jobCardService.getAllJobCards(),
                ]);

            setEstimates(estimateData || []);
            setJobCards(jobCardData || []);
        } catch (err) {
            console.error("Failed to load estimates:", err);

            setError(
                err.response?.data?.message ||
                err.response?.data?.error ||
                "Failed to load estimates."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // =========================================================
    // SEARCH + FILTER
    // =========================================================

    const filteredEstimates = useMemo(() => {
        const searchValue = search
            .toLowerCase()
            .trim();

        return estimates.filter((estimate) => {
            const matchesSearch =
                !searchValue ||
                String(
                    estimate.estimateNumber || ""
                )
                    .toLowerCase()
                    .includes(searchValue) ||
                String(
                    estimate.jobCardNumber || ""
                )
                    .toLowerCase()
                    .includes(searchValue) ||
                String(
                    estimate.customerName || ""
                )
                    .toLowerCase()
                    .includes(searchValue) ||
                String(
                    estimate.vehicleNumber || ""
                )
                    .toLowerCase()
                    .includes(searchValue) ||
                String(
                    estimate.vehicleMake || ""
                )
                    .toLowerCase()
                    .includes(searchValue) ||
                String(
                    estimate.vehicleModel || ""
                )
                    .toLowerCase()
                    .includes(searchValue);

            const matchesStatus =
                statusFilter === "ALL" ||
                estimate.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [estimates, search, statusFilter]);

    // =========================================================
    // STATS
    // =========================================================

    const stats = useMemo(() => {
        const totalValue = estimates.reduce(
            (sum, estimate) =>
                sum +
                Number(estimate.totalAmount || 0),
            0
        );

        const approvedValue = estimates
            .filter(
                (estimate) =>
                    estimate.status === "APPROVED"
            )
            .reduce(
                (sum, estimate) =>
                    sum +
                    Number(
                        estimate.totalAmount || 0
                    ),
                0
            );

        return {
            total: estimates.length,

            pending: estimates.filter(
                (estimate) =>
                    estimate.status ===
                    "PENDING_APPROVAL"
            ).length,

            approved: estimates.filter(
                (estimate) =>
                    estimate.status === "APPROVED"
            ).length,

            rejected: estimates.filter(
                (estimate) =>
                    estimate.status === "REJECTED"
            ).length,

            totalValue,
            approvedValue,
        };
    }, [estimates]);

    // =========================================================
    // MODAL
    // =========================================================

    const openCreateModal = () => {
        setModalMode("create");

        setForm({
            ...emptyForm,
            estimateDate:
                new Date()
                    .toISOString()
                    .substring(0, 10),
        });

        setShowModal(true);
        setError("");
    };

    const openEditModal = (estimate) => {
        if (estimate.status !== "DRAFT") {
            alert(
                "Only Draft estimates can be edited."
            );
            return;
        }

        setModalMode("edit");

        setForm({
            id: estimate.id,

            estimateNumber:
                estimate.estimateNumber || "",

            jobCardId:
                estimate.jobCardId || "",

            jobCardNumber:
                estimate.jobCardNumber || "",

            customerName:
                estimate.customerName || "",

            phone: "",

            vehicleMake:
                estimate.vehicleMake || "",

            vehicleModel:
                estimate.vehicleModel || "",

            vehicleNumber:
                estimate.vehicleNumber || "",

            estimateDate:
                toInputDate(
                    estimate.estimateDate
                ),

            validUntil:
                toInputDate(
                    estimate.validUntil
                ),

            status:
                estimate.status || "DRAFT",

            customerNotes:
                estimate.customerNotes || "",

            internalNotes:
                estimate.internalNotes || "",

            items:
                (estimate.items || []).map(
                    normalizeItem
                ),
        });

        setShowModal(true);
        setError("");
    };

    const closeModal = () => {
        if (saving) return;

        setShowModal(false);
        setForm(emptyForm);
        setError("");
    };

    // =========================================================
    // FORM
    // =========================================================

    const handleFormChange = (
        field,
        value
    ) => {
        setForm((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleJobCardChange = (
        jobCardId
    ) => {
        const jobCard = jobCards.find(
            (item) =>
                String(item.id) ===
                String(jobCardId)
        );

        if (!jobCard) {
            setForm((prev) => ({
                ...prev,
                jobCardId,
                jobCardNumber: "",
                customerName: "",
                vehicleMake: "",
                vehicleModel: "",
                vehicleNumber: "",
            }));

            return;
        }

        setForm((prev) => ({
            ...prev,

            jobCardId: jobCard.id,

            jobCardNumber:
                jobCard.jobCardNumber || "",

            customerName:
                jobCard.customerName || "",

            vehicleMake:
                jobCard.vehicleMake || "",

            vehicleModel:
                jobCard.vehicleModel || "",

            vehicleNumber:
                jobCard.vehicleNumber || "",
        }));
    };

    // =========================================================
    // LINE ITEMS
    // =========================================================

    const addLineItem = () => {
        setForm((prev) => ({
            ...prev,

            items: [
                ...prev.items,

                {
                    id: null,
                    estimateId: null,
                    itemType: "SERVICE",
                    description: "",
                    quantity: 1,
                    unitPrice: 0,
                    discountAmount: 0,
                    taxPercent: 0,
                    taxAmount: 0,
                    totalAmount: 0,
                    notes: "",
                },
            ],
        }));
    };

    const updateLineItem = (
        index,
        field,
        value
    ) => {
        setForm((prev) => {
            const updated = [
                ...prev.items,
            ];

            updated[index] =
                calculateItem({
                    ...updated[index],
                    [field]:
                        field === "quantity" ||
                        field === "unitPrice" ||
                        field ===
                        "discountAmount" ||
                        field === "taxPercent"
                            ? Number(value)
                            : value,
                });

            return {
                ...prev,
                items: updated,
            };
        });
    };

    const removeLineItem = (index) => {
        setForm((prev) => ({
            ...prev,

            items: prev.items.filter(
                (_, itemIndex) =>
                    itemIndex !== index
            ),
        }));
    };

    // =========================================================
    // TOTALS
    // =========================================================

    const formTotals = useMemo(() => {
        let subtotal = 0;
        let discount = 0;
        let tax = 0;
        let total = 0;

        form.items.forEach((item) => {
            const calculated =
                calculateItem(item);

            subtotal +=
                calculated.quantity *
                calculated.unitPrice;

            discount +=
                calculated.discountAmount;

            tax +=
                calculated.taxAmount;

            total +=
                calculated.totalAmount;
        });

        return {
            subtotal,
            discount,
            tax,
            total,
        };
    }, [form.items]);

    // =========================================================
    // SAVE
    // =========================================================

    const handleSubmit = async (
        event
    ) => {
        event.preventDefault();

        if (!form.jobCardId) {
            setError(
                "Please select a Job Card."
            );
            return;
        }

        if (form.items.length === 0) {
            setError(
                "Please add at least one service or part."
            );
            return;
        }

        try {
            setSaving(true);
            setError("");

            const estimatePayload = {
                jobCardId:
                    Number(form.jobCardId),

                estimateDate:
                    form.estimateDate || null,

                validUntil:
                    form.validUntil || null,

                customerNotes:
                    form.customerNotes || null,

                internalNotes:
                    form.internalNotes || null,
            };

            let savedEstimate;

            // -------------------------------------------------
            // CREATE
            // -------------------------------------------------

            if (modalMode === "create") {
                savedEstimate =
                    await estimateService.createEstimate(
                        estimatePayload
                    );

                for (const item of form.items) {
                    const calculated =
                        calculateItem(item);

                    await estimateService.addItem(
                        savedEstimate.id,
                        {
                            itemType:
                            calculated.itemType,

                            description:
                            calculated.description,

                            quantity:
                            calculated.quantity,

                            unitPrice:
                            calculated.unitPrice,

                            discountAmount:
                            calculated.discountAmount,

                            taxPercent:
                            calculated.taxPercent,

                            notes:
                                calculated.notes || null,
                        }
                    );
                }

                // Reload complete estimate
                savedEstimate =
                    await estimateService.getEstimateById(
                        savedEstimate.id
                    );

                setEstimates((prev) => [
                    savedEstimate,
                    ...prev,
                ]);
            }

                // -------------------------------------------------
                // EDIT
            // -------------------------------------------------

            else {
                savedEstimate =
                    await estimateService.updateEstimate(
                        form.id,
                        estimatePayload
                    );

                const original =
                    estimates.find(
                        (item) =>
                            item.id === form.id
                    );

                const originalItems =
                    original?.items || [];

                const currentItems =
                    form.items;

                // ---------------------------------------------
                // DELETE REMOVED ITEMS
                // ---------------------------------------------

                const currentItemIds =
                    currentItems
                        .filter(
                            (item) => item.id
                        )
                        .map(
                            (item) =>
                                item.id
                        );

                for (
                    const oldItem
                    of originalItems
                    ) {
                    if (
                        oldItem.id &&
                        !currentItemIds.includes(
                            oldItem.id
                        )
                    ) {
                        await estimateService.deleteItem(
                            form.id,
                            oldItem.id
                        );
                    }
                }

                // ---------------------------------------------
                // UPDATE EXISTING / CREATE NEW
                // ---------------------------------------------

                for (
                    const item
                    of currentItems
                    ) {
                    const calculated =
                        calculateItem(item);

                    const payload = {
                        itemType:
                        calculated.itemType,

                        description:
                        calculated.description,

                        quantity:
                        calculated.quantity,

                        unitPrice:
                        calculated.unitPrice,

                        discountAmount:
                        calculated.discountAmount,

                        taxPercent:
                        calculated.taxPercent,

                        notes:
                            calculated.notes || null,
                    };

                    if (item.id) {
                        await estimateService.updateItem(
                            form.id,
                            item.id,
                            payload
                        );
                    } else {
                        await estimateService.addItem(
                            form.id,
                            payload
                        );
                    }
                }

                // Get final server version
                savedEstimate =
                    await estimateService.getEstimateById(
                        form.id
                    );

                setEstimates((prev) =>
                    prev.map(
                        (estimate) =>
                            estimate.id ===
                            form.id
                                ? savedEstimate
                                : estimate
                    )
                );
            }

            setSelectedEstimate(
                savedEstimate
            );

            closeModal();

            alert(
                "Estimate saved successfully."
            );
        } catch (err) {
            console.error(
                "Failed to save estimate:",
                err
            );

            setError(
                err.response?.data?.message ||
                err.response?.data?.error ||
                "Failed to save estimate."
            );
        } finally {
            setSaving(false);
        }
    };

    // =========================================================
    // STATUS
    // =========================================================

    const submitEstimate = async (
        estimateId
    ) => {
        try {
            const updated =
                await estimateService.submitEstimate(
                    estimateId
                );

            setEstimates((prev) =>
                prev.map((estimate) =>
                    estimate.id === estimateId
                        ? updated
                        : estimate
                )
            );

            setSelectedEstimate(updated);
        } catch (err) {
            alert(
                err.response?.data?.message ||
                "Failed to submit estimate."
            );
        }
    };

    const approveEstimate = async (
        estimateId
    ) => {
        try {
            const updated =
                await estimateService.approveEstimate(
                    estimateId
                );

            setEstimates((prev) =>
                prev.map((estimate) =>
                    estimate.id === estimateId
                        ? updated
                        : estimate
                )
            );

            setSelectedEstimate(updated);
        } catch (err) {
            alert(
                err.response?.data?.message ||
                "Failed to approve estimate."
            );
        }
    };

    const rejectEstimate = async (
        estimateId
    ) => {
        const reason =
            window.prompt(
                "Enter rejection reason:"
            );

        if (
            !reason ||
            !reason.trim()
        ) {
            return;
        }

        try {
            const updated =
                await estimateService.rejectEstimate(
                    estimateId,
                    reason.trim()
                );

            setEstimates((prev) =>
                prev.map((estimate) =>
                    estimate.id === estimateId
                        ? updated
                        : estimate
                )
            );

            setSelectedEstimate(updated);
        } catch (err) {
            alert(
                err.response?.data?.message ||
                "Failed to reject estimate."
            );
        }
    };

    // =========================================================
    // DELETE
    // =========================================================

    const deleteEstimate = async (
        estimateId
    ) => {
        const estimate =
            estimates.find(
                (item) =>
                    item.id === estimateId
            );

        if (
            estimate &&
            estimate.status !== "DRAFT"
        ) {
            alert(
                "Only Draft estimates can be deleted."
            );
            return;
        }

        const confirmed =
            window.confirm(
                "Are you sure you want to delete this estimate?"
            );

        if (!confirmed) return;

        try {
            await estimateService.deleteEstimate(
                estimateId
            );

            setEstimates((prev) =>
                prev.filter(
                    (estimate) =>
                        estimate.id !==
                        estimateId
                )
            );

            if (
                selectedEstimate?.id ===
                estimateId
            ) {
                setSelectedEstimate(null);
            }

            alert(
                "Estimate deleted successfully."
            );
        } catch (err) {
            alert(
                err.response?.data?.message ||
                "Failed to delete estimate."
            );
        }
    };

    const getStatus = (status) =>
        statusConfig[status] ||
        statusConfig.DRAFT;

    // =========================================================
    // RENDER
    // =========================================================

    return (
        <div className="estimates-page">

            {/* HEADER */}

            <div className="estimates-header">
                <div>
                    <div className="estimates-title-row">
                        <div className="estimates-title-icon">
                            <FileText size={22} />
                        </div>

                        <div>
                            <h1>Estimates</h1>

                            <p>
                                Create, manage and track service estimates
                                before approval.
                            </p>
                        </div>
                    </div>
                </div>

                <button
                    className="primary-button"
                    onClick={openCreateModal}
                >
                    <Plus size={18} />
                    New Estimate
                </button>
            </div>

            {/* ERROR */}

            {error && !showModal && (
                <div className="error-message">
                    <AlertCircle size={18} />
                    {error}
                </div>
            )}

            {/* STATS */}

            <div className="estimate-stats">

                <div className="estimate-stat-card">
                    <div className="estimate-stat-icon blue">
                        <FileText size={20} />
                    </div>

                    <div>
                        <span>Total Estimates</span>
                        <strong>{stats.total}</strong>
                    </div>
                </div>

                <div className="estimate-stat-card">
                    <div className="estimate-stat-icon orange">
                        <Clock size={20} />
                    </div>

                    <div>
                        <span>Pending Approval</span>
                        <strong>{stats.pending}</strong>
                    </div>
                </div>

                <div className="estimate-stat-card">
                    <div className="estimate-stat-icon green">
                        <CheckCircle size={20} />
                    </div>

                    <div>
                        <span>Approved</span>
                        <strong>{stats.approved}</strong>
                    </div>
                </div>

                <div className="estimate-stat-card">
                    <div className="estimate-stat-icon red">
                        <XCircle size={20} />
                    </div>

                    <div>
                        <span>Rejected</span>
                        <strong>{stats.rejected}</strong>
                    </div>
                </div>

                <div className="estimate-stat-card">
                    <div className="estimate-stat-icon purple">
                        <IndianRupee size={20} />
                    </div>

                    <div>
                        <span>Total Estimate Value</span>

                        <strong>
                            {formatCurrency(
                                stats.totalValue
                            )}
                        </strong>
                    </div>
                </div>

                <div className="estimate-stat-card">
                    <div className="estimate-stat-icon teal">
                        <CheckCircle size={20} />
                    </div>

                    <div>
                        <span>Approved Value</span>

                        <strong>
                            {formatCurrency(
                                stats.approvedValue
                            )}
                        </strong>
                    </div>
                </div>

            </div>

            {/* TOOLBAR */}

            <div className="estimate-toolbar">

                <div className="estimate-search">
                    <Search size={18} />

                    <input
                        type="text"
                        placeholder="Search estimate, customer, vehicle..."
                        value={search}
                        onChange={(event) =>
                            setSearch(
                                event.target.value
                            )
                        }
                    />
                </div>

                <div className="estimate-filters">
                    {[
                        ["ALL", "All"],
                        ["DRAFT", "Draft"],
                        [
                            "PENDING_APPROVAL",
                            "Pending",
                        ],
                        [
                            "APPROVED",
                            "Approved",
                        ],
                        [
                            "REJECTED",
                            "Rejected",
                        ],
                        [
                            "EXPIRED",
                            "Expired",
                        ],
                    ].map(
                        ([value, label]) => (
                            <button
                                key={value}
                                className={
                                    statusFilter ===
                                    value
                                        ? "filter-button active"
                                        : "filter-button"
                                }
                                onClick={() =>
                                    setStatusFilter(
                                        value
                                    )
                                }
                            >
                                {label}
                            </button>
                        )
                    )}
                </div>
            </div>

            {/* TABLE */}

            <div className="estimates-table-card">

                <div className="table-header">
                    <div>
                        <h2>
                            Estimate Records
                        </h2>

                        <span>
                            Showing{" "}
                            {
                                filteredEstimates.length
                            }{" "}
                            of{" "}
                            {
                                estimates.length
                            }{" "}
                            estimates
                        </span>
                    </div>
                </div>

                <div className="table-wrapper">

                    <table className="estimates-table">

                        <thead>
                        <tr>
                            <th>Estimate</th>
                            <th>Customer</th>
                            <th>Vehicle</th>
                            <th>Date</th>
                            <th>Valid Until</th>
                            <th>Amount</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                        </thead>

                        <tbody>

                        {loading ? (
                            <tr>
                                <td
                                    colSpan="8"
                                    className="empty-table"
                                >
                                    Loading estimates...
                                </td>
                            </tr>
                        ) : filteredEstimates.length === 0 ? (
                            <tr>
                                <td
                                    colSpan="8"
                                    className="empty-table"
                                >
                                    <FileText size={36} />

                                    <strong>
                                        No estimates found
                                    </strong>

                                    <span>
                                            Try changing your search or filters.
                                        </span>
                                </td>
                            </tr>
                        ) : (
                            filteredEstimates.map(
                                (estimate) => {
                                    const status =
                                        getStatus(
                                            estimate.status
                                        );

                                    const StatusIcon =
                                        status.icon;

                                    return (
                                        <tr
                                            key={
                                                estimate.id
                                            }
                                        >

                                            <td>
                                                <div className="estimate-number">
                                                    <strong>
                                                        {
                                                            estimate.estimateNumber
                                                        }
                                                    </strong>

                                                    <span>
                                                            {
                                                                estimate.jobCardNumber
                                                            }
                                                        </span>
                                                </div>
                                            </td>

                                            <td>
                                                <div className="customer-cell">

                                                    <div className="avatar">
                                                        <User
                                                            size={
                                                                16
                                                            }
                                                        />
                                                    </div>

                                                    <div>
                                                        <strong>
                                                            {
                                                                estimate.customerName
                                                            }
                                                        </strong>
                                                    </div>

                                                </div>
                                            </td>

                                            <td>
                                                <div className="vehicle-cell">

                                                    <Car
                                                        size={
                                                            17
                                                        }
                                                    />

                                                    <div>
                                                        <strong>
                                                            {
                                                                estimate.vehicleMake
                                                            }{" "}
                                                            {
                                                                estimate.vehicleModel
                                                            }
                                                        </strong>

                                                        <span>
                                                                {
                                                                    estimate.vehicleNumber
                                                                }
                                                            </span>
                                                    </div>

                                                </div>
                                            </td>

                                            <td>
                                                {formatDate(
                                                    estimate.estimateDate
                                                )}
                                            </td>

                                            <td>
                                                {formatDate(
                                                    estimate.validUntil
                                                )}
                                            </td>

                                            <td>
                                                <strong className="amount">
                                                    {formatCurrency(
                                                        estimate.totalAmount
                                                    )}
                                                </strong>
                                            </td>

                                            <td>
                                                    <span
                                                        className={`status-badge ${status.className}`}
                                                    >
                                                        <StatusIcon
                                                            size={
                                                                14
                                                            }
                                                        />

                                                        {
                                                            status.label
                                                        }
                                                    </span>
                                            </td>

                                            <td>
                                                <div className="action-buttons">

                                                    <button
                                                        className="icon-button"
                                                        title="View"
                                                        onClick={() =>
                                                            setSelectedEstimate(
                                                                estimate
                                                            )
                                                        }
                                                    >
                                                        <Eye
                                                            size={
                                                                17
                                                            }
                                                        />
                                                    </button>

                                                    <button
                                                        className="icon-button"
                                                        title="Edit"
                                                        onClick={() =>
                                                            openEditModal(
                                                                estimate
                                                            )
                                                        }
                                                    >
                                                        <Pencil
                                                            size={
                                                                17
                                                            }
                                                        />
                                                    </button>

                                                    <button
                                                        className="icon-button danger"
                                                        title="Delete"
                                                        onClick={() =>
                                                            deleteEstimate(
                                                                estimate.id
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

            {/* CREATE / EDIT MODAL */}

            {showModal && (
                <div
                    className="modal-overlay"
                    onMouseDown={(event) => {
                        if (
                            event.target ===
                            event.currentTarget
                        ) {
                            closeModal();
                        }
                    }}
                >

                    <div className="estimate-modal">

                        <div className="modal-header">

                            <div>
                                <h2>
                                    {modalMode ===
                                    "create"
                                        ? "Create New Estimate"
                                        : "Edit Estimate"}
                                </h2>

                                <p>
                                    Add service and parts details for customer approval.
                                </p>
                            </div>

                            <button
                                className="modal-close"
                                onClick={closeModal}
                                disabled={saving}
                            >
                                <X size={20} />
                            </button>

                        </div>

                        <form
                            className="estimate-form"
                            onSubmit={
                                handleSubmit
                            }
                        >

                            {/* ESTIMATE INFORMATION */}

                            <div className="form-section">

                                <div className="form-section-title">
                                    <FileText
                                        size={18}
                                    />

                                    <span>
                                        Estimate Information
                                    </span>
                                </div>

                                <div className="form-grid">

                                    <label>
                                        Estimate No.

                                        <input
                                            type="text"
                                            value={
                                                modalMode ===
                                                "edit"
                                                    ? form.estimateNumber
                                                    : "Generated by backend"
                                            }
                                            disabled
                                        />
                                    </label>

                                    <label>
                                        Job Card

                                        <select
                                            value={
                                                form.jobCardId
                                            }
                                            onChange={(
                                                event
                                            ) =>
                                                handleJobCardChange(
                                                    event
                                                        .target
                                                        .value
                                                )
                                            }
                                            required
                                            disabled={
                                                modalMode ===
                                                "edit"
                                            }
                                        >
                                            <option value="">
                                                Select Job Card
                                            </option>

                                            {jobCards.map(
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
                                                        {
                                                            jobCard.jobCardNumber
                                                        }{" "}
                                                        -{" "}
                                                        {
                                                            jobCard.customerName
                                                        }{" "}
                                                        -{" "}
                                                        {
                                                            jobCard.vehicleNumber
                                                        }
                                                    </option>
                                                )
                                            )}
                                        </select>
                                    </label>

                                    <label>
                                        Customer

                                        <input
                                            type="text"
                                            value={
                                                form.customerName
                                            }
                                            disabled
                                        />
                                    </label>

                                    <label>
                                        Vehicle

                                        <input
                                            type="text"
                                            value={
                                                `${form.vehicleMake || ""} ${form.vehicleModel || ""}`
                                            }
                                            disabled
                                        />
                                    </label>

                                    <label>
                                        Registration No.

                                        <input
                                            type="text"
                                            value={
                                                form.vehicleNumber
                                            }
                                            disabled
                                        />
                                    </label>

                                    <label>
                                        Estimate Date

                                        <input
                                            type="date"
                                            value={
                                                form.estimateDate
                                            }
                                            onChange={(
                                                event
                                            ) =>
                                                handleFormChange(
                                                    "estimateDate",
                                                    event
                                                        .target
                                                        .value
                                                )
                                            }
                                            required
                                        />
                                    </label>

                                    <label>
                                        Valid Until

                                        <input
                                            type="date"
                                            value={
                                                form.validUntil
                                            }
                                            onChange={(
                                                event
                                            ) =>
                                                handleFormChange(
                                                    "validUntil",
                                                    event
                                                        .target
                                                        .value
                                                )
                                            }
                                        />
                                    </label>

                                </div>

                            </div>

                            {/* ITEMS */}

                            <div className="form-section">

                                <div className="line-items-header">

                                    <div className="form-section-title">
                                        <Wrench
                                            size={18}
                                        />

                                        <span>
                                            Services & Parts
                                        </span>
                                    </div>

                                    <button
                                        type="button"
                                        className="secondary-button"
                                        onClick={
                                            addLineItem
                                        }
                                    >
                                        <Plus
                                            size={16}
                                        />

                                        Add Item
                                    </button>

                                </div>

                                {form.items
                                    .length ===
                                0 ? (
                                    <div className="no-items">

                                        <Package
                                            size={
                                                32
                                            }
                                        />

                                        <strong>
                                            No items added
                                        </strong>

                                        <span>
                                            Add services or parts to calculate the estimate.
                                        </span>

                                    </div>
                                ) : (
                                    <div className="line-items">

                                        {form.items.map(
                                            (
                                                item,
                                                index
                                            ) => (
                                                <div
                                                    className="line-item"
                                                    key={
                                                        item.id ||
                                                        `new-${index}`
                                                    }
                                                >

                                                    <div className="line-item-name">
                                                        <label>
                                                            Item

                                                            <input
                                                                type="text"
                                                                placeholder="Service or part"
                                                                value={
                                                                    item.description
                                                                }
                                                                onChange={(
                                                                    event
                                                                ) =>
                                                                    updateLineItem(
                                                                        index,
                                                                        "description",
                                                                        event
                                                                            .target
                                                                            .value
                                                                    )
                                                                }
                                                                required
                                                            />
                                                        </label>
                                                    </div>

                                                    <label>
                                                        Type

                                                        <select
                                                            value={
                                                                item.itemType
                                                            }
                                                            onChange={(
                                                                event
                                                            ) =>
                                                                updateLineItem(
                                                                    index,
                                                                    "itemType",
                                                                    event
                                                                        .target
                                                                        .value
                                                                )
                                                            }
                                                        >
                                                            <option value="SERVICE">
                                                                Service
                                                            </option>

                                                            <option value="PART">
                                                                Part
                                                            </option>

                                                            <option value="LABOUR">
                                                                Labour
                                                            </option>

                                                            <option value="OTHER">
                                                                Other
                                                            </option>
                                                        </select>
                                                    </label>

                                                    <label>
                                                        Qty

                                                        <input
                                                            type="number"
                                                            min="0.01"
                                                            step="0.01"
                                                            value={
                                                                item.quantity
                                                            }
                                                            onChange={(
                                                                event
                                                            ) =>
                                                                updateLineItem(
                                                                    index,
                                                                    "quantity",
                                                                    event
                                                                        .target
                                                                        .value
                                                                )
                                                            }
                                                        />
                                                    </label>

                                                    <label>
                                                        Rate

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
                                                                updateLineItem(
                                                                    index,
                                                                    "unitPrice",
                                                                    event
                                                                        .target
                                                                        .value
                                                                )
                                                            }
                                                        />
                                                    </label>

                                                    <div className="line-item-total">

                                                        <span>
                                                            Amount
                                                        </span>

                                                        <strong>
                                                            {formatCurrency(
                                                                item.totalAmount
                                                            )}
                                                        </strong>

                                                    </div>

                                                    <button
                                                        type="button"
                                                        className="remove-item"
                                                        onClick={() =>
                                                            removeLineItem(
                                                                index
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
                                            )
                                        )}

                                    </div>
                                )}

                            </div>

                            {/* TOTALS */}

                            <div className="form-section">

                                <div className="estimate-summary">

                                    <div>
                                        <span>
                                            Subtotal
                                        </span>

                                        <strong>
                                            {formatCurrency(
                                                formTotals.subtotal
                                            )}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>
                                            Discount
                                        </span>

                                        <strong>
                                            {formatCurrency(
                                                formTotals.discount
                                            )}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>
                                            Tax
                                        </span>

                                        <strong>
                                            {formatCurrency(
                                                formTotals.tax
                                            )}
                                        </strong>
                                    </div>

                                    <div className="grand-total">
                                        <span>
                                            Estimated Total
                                        </span>

                                        <strong>
                                            {formatCurrency(
                                                formTotals.total
                                            )}
                                        </strong>
                                    </div>

                                </div>

                            </div>

                            {/* NOTES */}

                            <div className="form-section">

                                <label className="full-width">
                                    Customer Notes

                                    <textarea
                                        rows="3"
                                        value={
                                            form.customerNotes
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            handleFormChange(
                                                "customerNotes",
                                                event
                                                    .target
                                                    .value
                                            )
                                        }
                                    />
                                </label>

                                <label className="full-width">
                                    Internal Notes

                                    <textarea
                                        rows="3"
                                        value={
                                            form.internalNotes
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            handleFormChange(
                                                "internalNotes",
                                                event
                                                    .target
                                                    .value
                                            )
                                        }
                                    />
                                </label>

                            </div>

                            {error && (
                                <div className="error-message">
                                    <AlertCircle
                                        size={18}
                                    />

                                    {error}
                                </div>
                            )}

                            {/* FOOTER */}

                            <div className="modal-footer">

                                <button
                                    type="button"
                                    className="cancel-button"
                                    onClick={
                                        closeModal
                                    }
                                    disabled={
                                        saving
                                    }
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="primary-button"
                                    disabled={
                                        saving
                                    }
                                >
                                    <Save
                                        size={17}
                                    />

                                    {saving
                                        ? "Saving..."
                                        : modalMode ===
                                        "create"
                                            ? "Create Estimate"
                                            : "Save Changes"}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>
            )}

            {/* VIEW MODAL */}

            {selectedEstimate && (
                <div
                    className="modal-overlay"
                    onMouseDown={(event) => {
                        if (
                            event.target ===
                            event.currentTarget
                        ) {
                            setSelectedEstimate(
                                null
                            );
                        }
                    }}
                >

                    <div className="view-estimate-modal">

                        <div className="modal-header">

                            <div>
                                <div className="view-title-row">

                                    <div className="estimate-view-icon">
                                        <FileText
                                            size={
                                                22
                                            }
                                        />
                                    </div>

                                    <div>
                                        <h2>
                                            {
                                                selectedEstimate.estimateNumber
                                            }
                                        </h2>

                                        <span>
                                            {
                                                selectedEstimate.jobCardNumber
                                            }
                                        </span>
                                    </div>

                                </div>
                            </div>

                            <button
                                className="modal-close"
                                onClick={() =>
                                    setSelectedEstimate(
                                        null
                                    )
                                }
                            >
                                <X size={20} />
                            </button>

                        </div>

                        <div className="view-estimate-content">

                            <div className="view-top-info">

                                <div>
                                    <span>
                                        Customer
                                    </span>

                                    <strong>
                                        {
                                            selectedEstimate.customerName
                                        }
                                    </strong>
                                </div>

                                <div>
                                    <span>
                                        Vehicle
                                    </span>

                                    <strong>
                                        {
                                            selectedEstimate.vehicleMake
                                        }{" "}
                                        {
                                            selectedEstimate.vehicleModel
                                        }
                                    </strong>
                                </div>

                                <div>
                                    <span>
                                        Registration
                                    </span>

                                    <strong>
                                        {
                                            selectedEstimate.vehicleNumber
                                        }
                                    </strong>
                                </div>

                                <div>
                                    <span>
                                        Date
                                    </span>

                                    <strong>
                                        {formatDate(
                                            selectedEstimate.estimateDate
                                        )}
                                    </strong>
                                </div>

                                <div>
                                    <span>
                                        Valid Until
                                    </span>

                                    <strong>
                                        {formatDate(
                                            selectedEstimate.validUntil
                                        )}
                                    </strong>
                                </div>

                                <div>
                                    <span>
                                        Status
                                    </span>

                                    {(() => {
                                        const status =
                                            getStatus(
                                                selectedEstimate.status
                                            );

                                        const StatusIcon =
                                            status.icon;

                                        return (
                                            <span
                                                className={`status-badge ${status.className}`}
                                            >
                                                <StatusIcon
                                                    size={
                                                        14
                                                    }
                                                />

                                                {
                                                    status.label
                                                }
                                            </span>
                                        );
                                    })()}

                                </div>

                            </div>

                            <div className="view-section">

                                <div className="view-section-title">
                                    <Wrench
                                        size={
                                            18
                                        }
                                    />

                                    <h3>
                                        Services & Parts
                                    </h3>
                                </div>

                                <div className="view-items">

                                    {(
                                        selectedEstimate.items ||
                                        []
                                    ).map(
                                        (
                                            item
                                        ) => (
                                            <div
                                                className="view-item"
                                                key={
                                                    item.id
                                                }
                                            >

                                                <div className="view-item-name">

                                                    <div
                                                        className={
                                                            item.itemType ===
                                                            "PART"
                                                                ? "item-icon part"
                                                                : "item-icon service"
                                                        }
                                                    >
                                                        {item.itemType ===
                                                        "PART" ? (
                                                            <Package
                                                                size={
                                                                    15
                                                                }
                                                            />
                                                        ) : (
                                                            <Wrench
                                                                size={
                                                                    15
                                                                }
                                                            />
                                                        )}
                                                    </div>

                                                    <div>
                                                        <strong>
                                                            {
                                                                item.description
                                                            }
                                                        </strong>

                                                        <span>
                                                            {
                                                                item.itemType
                                                            }
                                                        </span>
                                                    </div>

                                                </div>

                                                <span>
                                                    {
                                                        item.quantity
                                                    }{" "}
                                                    ×{" "}
                                                    {formatCurrency(
                                                        item.unitPrice
                                                    )}
                                                </span>

                                                <strong>
                                                    {formatCurrency(
                                                        item.totalAmount
                                                    )}
                                                </strong>

                                            </div>
                                        )
                                    )}

                                </div>

                            </div>

                            <div className="view-bottom">

                                <div className="view-notes">

                                    <span>
                                        Customer Notes
                                    </span>

                                    <p>
                                        {
                                            selectedEstimate.customerNotes
                                        }
                                    </p>

                                    <span>
                                        Internal Notes
                                    </span>

                                    <p>
                                        {
                                            selectedEstimate.internalNotes
                                        }
                                    </p>

                                </div>

                                <div className="view-total-box">

                                    <div>
                                        <span>
                                            Subtotal
                                        </span>

                                        <strong>
                                            {formatCurrency(
                                                selectedEstimate.subtotal
                                            )}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>
                                            Discount
                                        </span>

                                        <strong>
                                            {formatCurrency(
                                                selectedEstimate.discountAmount
                                            )}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>
                                            Tax
                                        </span>

                                        <strong>
                                            {formatCurrency(
                                                selectedEstimate.taxAmount
                                            )}
                                        </strong>
                                    </div>

                                    <div className="view-grand-total">

                                        <span>
                                            Total
                                        </span>

                                        <strong>
                                            {formatCurrency(
                                                selectedEstimate.totalAmount
                                            )}
                                        </strong>

                                    </div>

                                </div>

                            </div>

                        </div>

                        <div className="view-footer">

                            {selectedEstimate.status ===
                                "PENDING_APPROVAL" && (
                                    <>
                                        <button
                                            className="reject-button"
                                            onClick={() =>
                                                rejectEstimate(
                                                    selectedEstimate.id
                                                )
                                            }
                                        >
                                            <XCircle
                                                size={
                                                    17
                                                }
                                            />

                                            Reject
                                        </button>

                                        <button
                                            className="approve-button"
                                            onClick={() =>
                                                approveEstimate(
                                                    selectedEstimate.id
                                                )
                                            }
                                        >
                                            <CheckCircle
                                                size={
                                                    17
                                                }
                                            />

                                            Approve Estimate
                                        </button>
                                    </>
                                )}

                            {selectedEstimate.status ===
                                "DRAFT" && (
                                    <button
                                        className="approve-button"
                                        onClick={() =>
                                            submitEstimate(
                                                selectedEstimate.id
                                            )
                                        }
                                    >
                                        <Clock
                                            size={
                                                17
                                            }
                                        />

                                        Send for Approval
                                    </button>
                                )}

                            <button
                                className="cancel-button"
                                onClick={() =>
                                    setSelectedEstimate(
                                        null
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

export default Estimates;