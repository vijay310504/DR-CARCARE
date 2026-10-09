import { useEffect, useMemo, useState } from "react";
import {
    Search,
    Plus,
    Eye,
    Edit3,
    Car,
    User,
    CalendarDays,
    Wrench,
    Clock3,
    X,
    ClipboardList,
    CheckCircle2,
    AlertCircle,
    CircleDot,
    ArrowRight,
} from "lucide-react";
import "./JobCards.css";
import jobCardService from "../../services/jobCardService";
import bookingService from "../../services/bookingService";
import customerService from "../../services/customerService";
import vehicleService from "../../services/vehicleService";
const statusConfig = {
    RECEIVED: {
        label: "Received",
        className: "received",
        icon: CircleDot,
    },

    INSPECTION: {
        label: "Inspection",
        className: "inspection",
        icon: ClipboardList,
    },

    ESTIMATE: {
        label: "Estimate",
        className: "estimate",
        icon: ClipboardList,
    },

    WAITING_APPROVAL: {
        label: "Waiting Approval",
        className: "waiting",
        icon: Clock3,
    },

    APPROVED: {
        label: "Approved",
        className: "approved",
        icon: CheckCircle2,
    },

    UNDER_SERVICE: {
        label: "Under Service",
        className: "service",
        icon: Wrench,
    },

    QUALITY_CHECK: {
        label: "Quality Check",
        className: "quality",
        icon: AlertCircle,
    },

    READY: {
        label: "Ready",
        className: "ready",
        icon: CheckCircle2,
    },

    DELIVERED: {
        label: "Delivered",
        className: "delivered",
        icon: CheckCircle2,
    },
};

const workflow = [
    "RECEIVED",
    "INSPECTION",
    "ESTIMATE",
    "WAITING_APPROVAL",
    "APPROVED",
    "UNDER_SERVICE",
    "QUALITY_CHECK",
    "READY",
    "DELIVERED",
];

const emptyForm = {
    bookingId: "",
    openingMileage: "",
    fuelLevel: "",
    customerComplaint: "",
    advisorNotes: "",
};

const formatDate = (dateValue) => {
    if (!dateValue) {
        return "-";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
        return dateValue;
    }

    return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

const formatDateTime = (dateValue) => {
    if (!dateValue) {
        return "-";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
        return dateValue;
    }

    return date.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};

function JobCards() {
    const [jobCards, setJobCards] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [vehicles, setVehicles] = useState([]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");

    const [showModal, setShowModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);

    const [editingJobCard, setEditingJobCard] = useState(null);
    const [selectedJobCard, setSelectedJobCard] = useState(null);

    const [formData, setFormData] = useState(emptyForm);

    /*
     * ---------------------------------------------------------
     * LOAD DATA
     * ---------------------------------------------------------
     */

    const loadData = async () => {
        setLoading(true);
        setError("");

        try {
            const [
                jobCardData,
                bookingData,
                customerData,
                vehicleData,
            ] = await Promise.all([
                jobCardService.getAllJobCards(),
                bookingService.getAllBookings(),
                customerService.getAllCustomers(),
                vehicleService.getAllVehicles(),
            ]);

            setJobCards(Array.isArray(jobCardData) ? jobCardData : []);
            setBookings(Array.isArray(bookingData) ? bookingData : []);
            setCustomers(Array.isArray(customerData) ? customerData : []);
            setVehicles(Array.isArray(vehicleData) ? vehicleData : []);
        } catch (err) {
            console.error("Failed to load Job Card data:", err);

            setError(
                err.response?.data?.message ||
                err.response?.data?.error ||
                "Failed to load Job Card data."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    /*
     * ---------------------------------------------------------
     * LOOKUPS
     * ---------------------------------------------------------
     */

    const customerMap = useMemo(() => {
        const map = {};

        customers.forEach((customer) => {
            map[customer.id] = customer;
        });

        return map;
    }, [customers]);

    const vehicleMap = useMemo(() => {
        const map = {};

        vehicles.forEach((vehicle) => {
            map[vehicle.id] = vehicle;
        });

        return map;
    }, [vehicles]);

    const bookingMap = useMemo(() => {
        const map = {};

        bookings.forEach((booking) => {
            map[booking.id] = booking;
        });

        return map;
    }, [bookings]);

    /*
     * ---------------------------------------------------------
     * STATS
     * ---------------------------------------------------------
     */

    const stats = useMemo(() => {
        return {
            total: jobCards.length,

            active: jobCards.filter(
                (job) =>
                    !["DELIVERED", "READY"].includes(job.status)
            ).length,

            underService: jobCards.filter(
                (job) => job.status === "UNDER_SERVICE"
            ).length,

            ready: jobCards.filter(
                (job) => job.status === "READY"
            ).length,
        };
    }, [jobCards]);

    /*
     * ---------------------------------------------------------
     * SEARCH / FILTER
     * ---------------------------------------------------------
     */

    const filteredJobCards = useMemo(() => {
        const query = search.trim().toLowerCase();

        return jobCards.filter((job) => {
            const customer =
                job.customerName?.toLowerCase() || "";

            const vehicle =
                job.vehicleNumber?.toLowerCase() || "";

            const make =
                job.vehicleMake?.toLowerCase() || "";

            const model =
                job.vehicleModel?.toLowerCase() || "";

            const jobNumber =
                job.jobCardNumber?.toLowerCase() || "";

            const bookingCode =
                job.bookingCode?.toLowerCase() || "";

            const complaint =
                job.customerComplaint?.toLowerCase() || "";

            const matchesSearch =
                !query ||
                jobNumber.includes(query) ||
                bookingCode.includes(query) ||
                customer.includes(query) ||
                vehicle.includes(query) ||
                make.includes(query) ||
                model.includes(query) ||
                complaint.includes(query);

            const matchesStatus =
                statusFilter === "ALL" ||
                job.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [jobCards, search, statusFilter]);

    /*
     * ---------------------------------------------------------
     * FORM
     * ---------------------------------------------------------
     */

    const resetForm = () => {
        setFormData({
            ...emptyForm,
        });
    };

    const openCreateModal = () => {
        setEditingJobCard(null);
        resetForm();
        setError("");
        setShowModal(true);
    };

    const openEditModal = (job) => {
        setEditingJobCard(job);

        setFormData({
            bookingId: job.bookingId || "",
            openingMileage:
                job.openingMileage !== null &&
                job.openingMileage !== undefined
                    ? job.openingMileage
                    : "",
            fuelLevel: job.fuelLevel || "",
            customerComplaint:
                job.customerComplaint || "",
            advisorNotes:
                job.advisorNotes || "",
        });

        setError("");
        setShowModal(true);
    };

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    /*
     * ---------------------------------------------------------
     * BOOKING SELECTION
     * ---------------------------------------------------------
     */

    const selectedBooking = useMemo(() => {
        if (!formData.bookingId) {
            return null;
        }

        return (
            bookingMap[Number(formData.bookingId)] ||
            null
        );
    }, [formData.bookingId, bookingMap]);

    const selectedBookingCustomer = selectedBooking
        ? customerMap[selectedBooking.customerId]
        : null;

    const selectedBookingVehicle = selectedBooking
        ? vehicleMap[selectedBooking.vehicleId]
        : null;

    /*
     * ---------------------------------------------------------
     * CREATE / UPDATE
     * ---------------------------------------------------------
     */

    const handleSubmit = async (event) => {
        event.preventDefault();

        setSaving(true);
        setError("");

        try {
            const payload = {
                bookingId: Number(formData.bookingId),

                openingMileage:
                    formData.openingMileage === ""
                        ? null
                        : Number(formData.openingMileage),

                fuelLevel:
                    formData.fuelLevel.trim() || null,

                customerComplaint:
                    formData.customerComplaint.trim() || null,

                advisorNotes:
                    formData.advisorNotes.trim() || null,
            };

            let response;

            if (editingJobCard) {
                response =
                    await jobCardService.updateJobCard(
                        editingJobCard.id,
                        payload
                    );

                setJobCards((previous) =>
                    previous.map((job) =>
                        job.id === editingJobCard.id
                            ? response
                            : job
                    )
                );
            } else {
                response =
                    await jobCardService.createJobCard(
                        payload
                    );

                setJobCards((previous) => [
                    response,
                    ...previous,
                ]);
            }

            setShowModal(false);
            setEditingJobCard(null);
            resetForm();
        } catch (err) {
            console.error(
                "Failed to save Job Card:",
                err
            );

            setError(
                err.response?.data?.message ||
                err.response?.data?.error ||
                "Failed to save Job Card."
            );
        } finally {
            setSaving(false);
        }
    };

    /*
     * ---------------------------------------------------------
     * VIEW
     * ---------------------------------------------------------
     */

    const openViewModal = async (job) => {
        setError("");

        try {
            const latestJobCard =
                await jobCardService.getJobCardById(
                    job.id
                );

            setSelectedJobCard(latestJobCard);
        } catch (err) {
            console.error(
                "Failed to load Job Card:",
                err
            );

            setSelectedJobCard(job);

            setError(
                err.response?.data?.message ||
                err.response?.data?.error ||
                "Failed to load Job Card details."
            );
        }

        setShowViewModal(true);
    };

    const closeViewModal = () => {
        setShowViewModal(false);
        setSelectedJobCard(null);
    };

    /*
     * ---------------------------------------------------------
     * STATUS
     * ---------------------------------------------------------
     */

    const updateStatus = async (jobId, newStatus) => {
        setError("");

        try {
            const updatedJobCard =
                await jobCardService.updateJobCardStatus(
                    jobId,
                    newStatus
                );

            setJobCards((previous) =>
                previous.map((job) =>
                    job.id === jobId
                        ? updatedJobCard
                        : job
                )
            );

            setSelectedJobCard((previous) =>
                previous &&
                previous.id === jobId
                    ? updatedJobCard
                    : previous
            );
        } catch (err) {
            console.error(
                "Failed to update Job Card status:",
                err
            );

            setError(
                err.response?.data?.message ||
                err.response?.data?.error ||
                "Failed to update Job Card status."
            );
        }
    };

    const moveToNextStatus = async (job) => {
        const currentIndex =
            workflow.indexOf(job.status);

        if (
            currentIndex === -1 ||
            currentIndex >= workflow.length - 1
        ) {
            return;
        }

        const nextStatus =
            workflow[currentIndex + 1];

        await updateStatus(
            job.id,
            nextStatus
        );
    };

    /*
     * ---------------------------------------------------------
     * STATUS DISPLAY
     * ---------------------------------------------------------
     */

    const getStatusInfo = (status) =>
        statusConfig[status] ||
        statusConfig.RECEIVED;

    /*
     * ---------------------------------------------------------
     * CUSTOMER PHONE
     * ---------------------------------------------------------
     */

    const getCustomerPhone = (customerId) => {
        return customerMap[customerId]?.phone || "-";
    };

    /*
     * ---------------------------------------------------------
     * RENDER
     * ---------------------------------------------------------
     */

    return (
        <div className="job-cards-page">

            <div className="job-cards-header">
                <div>
                    <div className="page-breadcrumb">
                        Workshop <span>/</span> Job Cards
                    </div>

                    <h1>Job Cards</h1>

                    <p>
                        Manage vehicle service jobs from
                        vehicle reception to delivery.
                    </p>
                </div>

                <button
                    className="primary-button"
                    onClick={openCreateModal}
                >
                    <Plus size={18} />
                    New Job Card
                </button>
            </div>

            {error && (
                <div
                    style={{
                        marginBottom: "16px",
                        padding: "12px 16px",
                        borderRadius: "10px",
                        background: "#fff1f2",
                        color: "#be123c",
                        border: "1px solid #fecdd3",
                    }}
                >
                    {error}
                </div>
            )}

            <div className="job-stats-grid">

                <div className="job-stat-card">
                    <div className="job-stat-icon blue">
                        <ClipboardList size={21} />
                    </div>

                    <div>
                        <span>Total Job Cards</span>
                        <strong>{stats.total}</strong>
                    </div>
                </div>

                <div className="job-stat-card">
                    <div className="job-stat-icon orange">
                        <Clock3 size={21} />
                    </div>

                    <div>
                        <span>Active Jobs</span>
                        <strong>{stats.active}</strong>
                    </div>
                </div>

                <div className="job-stat-card">
                    <div className="job-stat-icon red">
                        <Wrench size={21} />
                    </div>

                    <div>
                        <span>Under Service</span>
                        <strong>{stats.underService}</strong>
                    </div>
                </div>

                <div className="job-stat-card">
                    <div className="job-stat-icon green">
                        <CheckCircle2 size={21} />
                    </div>

                    <div>
                        <span>Ready for Delivery</span>
                        <strong>{stats.ready}</strong>
                    </div>
                </div>

            </div>

            <div className="job-cards-panel">

                <div className="job-toolbar">

                    <div className="job-search">
                        <Search size={18} />

                        <input
                            type="text"
                            placeholder="Search job card, customer, vehicle..."
                            value={search}
                            onChange={(event) =>
                                setSearch(
                                    event.target.value
                                )
                            }
                        />
                    </div>

                    <div className="job-filters">

                        <select
                            value={statusFilter}
                            onChange={(event) =>
                                setStatusFilter(
                                    event.target.value
                                )
                            }
                        >
                            <option value="ALL">
                                All Statuses
                            </option>

                            {Object.entries(
                                statusConfig
                            ).map(
                                ([value, config]) => (
                                    <option
                                        key={value}
                                        value={value}
                                    >
                                        {config.label}
                                    </option>
                                )
                            )}
                        </select>

                    </div>
                </div>

                <div className="job-table-wrapper">

                    <table className="job-table">

                        <thead>
                        <tr>
                            <th>Job Card</th>
                            <th>Customer</th>
                            <th>Vehicle</th>
                            <th>Complaint</th>
                            <th>Opened</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                        </thead>

                        <tbody>

                        {loading ? (
                            <tr>
                                <td colSpan="7">
                                    <div className="empty-state">
                                        <ClipboardList
                                            size={42}
                                        />

                                        <h3>
                                            Loading job cards...
                                        </h3>

                                        <p>
                                            Fetching workshop
                                            data from the
                                            backend.
                                        </p>
                                    </div>
                                </td>
                            </tr>
                        ) : filteredJobCards.length === 0 ? (
                            <tr>
                                <td colSpan="7">
                                    <div className="empty-state">
                                        <ClipboardList
                                            size={42}
                                        />

                                        <h3>
                                            No job cards found
                                        </h3>

                                        <p>
                                            Try changing your
                                            search or filter.
                                        </p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            filteredJobCards.map(
                                (job) => {
                                    const status =
                                        getStatusInfo(
                                            job.status
                                        );

                                    const StatusIcon =
                                        status.icon;

                                    return (
                                        <tr key={job.id}>

                                            <td>
                                                <div className="job-number">
                                                    {
                                                        job.jobCardNumber
                                                    }
                                                </div>

                                                <div className="booking-reference">
                                                    {
                                                        job.bookingCode
                                                    }
                                                </div>
                                            </td>

                                            <td>
                                                <div className="customer-cell">

                                                    <div className="avatar">
                                                        {(
                                                            job.customerName ||
                                                            "?"
                                                        ).charAt(0)}
                                                    </div>

                                                    <div>
                                                        <strong>
                                                            {
                                                                job.customerName
                                                            }
                                                        </strong>

                                                        <span>
                                                            {
                                                                getCustomerPhone(
                                                                    job.customerId
                                                                )
                                                            }
                                                        </span>
                                                    </div>

                                                </div>
                                            </td>

                                            <td>
                                                <div className="vehicle-cell">

                                                    <Car size={16} />

                                                    <div>
                                                        <strong>
                                                            {
                                                                job.vehicleMake
                                                            }{" "}
                                                            {
                                                                job.vehicleModel
                                                            }
                                                        </strong>

                                                        <span>
                                                            {
                                                                job.vehicleNumber
                                                            }
                                                        </span>
                                                    </div>

                                                </div>
                                            </td>

                                            <td>
                                                <div className="service-cell">

                                                    <strong>
                                                        Customer Request
                                                    </strong>

                                                    <span>
                                                        {
                                                            job.customerComplaint ||
                                                            "No complaint recorded"
                                                        }
                                                    </span>

                                                </div>
                                            </td>

                                            <td>
                                                <div className="delivery-cell">

                                                    <CalendarDays
                                                        size={15}
                                                    />

                                                    <span>
                                                        {formatDate(
                                                            job.openedAt
                                                        )}
                                                    </span>

                                                </div>
                                            </td>

                                            <td>
                                                <div
                                                    className={`job-status ${status.className}`}
                                                >
                                                    <StatusIcon
                                                        size={14}
                                                    />

                                                    {
                                                        status.label
                                                    }
                                                </div>
                                            </td>

                                            <td>
                                                <div className="action-buttons">

                                                    <button
                                                        className="icon-button"
                                                        title="View"
                                                        onClick={() =>
                                                            openViewModal(
                                                                job
                                                            )
                                                        }
                                                    >
                                                        <Eye
                                                            size={17}
                                                        />
                                                    </button>

                                                    <button
                                                        className="icon-button"
                                                        title="Edit"
                                                        onClick={() =>
                                                            openEditModal(
                                                                job
                                                            )
                                                        }
                                                    >
                                                        <Edit3
                                                            size={17}
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

            {showModal && (
                <div
                    className="modal-overlay"
                    onMouseDown={(event) => {
                        if (
                            event.target ===
                            event.currentTarget
                        ) {
                            setShowModal(false);
                        }
                    }}
                >

                    <div className="job-modal">

                        <div className="modal-header">

                            <div>
                                <span className="modal-eyebrow">
                                    Workshop Operations
                                </span>

                                <h2>
                                    {editingJobCard
                                        ? "Edit Job Card"
                                        : "Create Job Card"}
                                </h2>
                            </div>

                            <button
                                className="modal-close"
                                onClick={() =>
                                    setShowModal(false)
                                }
                            >
                                <X size={20} />
                            </button>

                        </div>

                        <form onSubmit={handleSubmit}>

                            <div className="form-section">

                                <div className="form-section-title">
                                    <ClipboardList size={17} />
                                    Booking
                                </div>

                                <div className="form-grid">

                                    <div className="form-field form-field-full">

                                        <label>
                                            Booking *
                                        </label>

                                        <select
                                            name="bookingId"
                                            value={
                                                formData.bookingId
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            required
                                            disabled={
                                                Boolean(
                                                    editingJobCard
                                                )
                                            }
                                        >

                                            <option value="">
                                                Select booking
                                            </option>

                                            {bookings
                                                .filter(
                                                    (booking) =>
                                                        booking.status !==
                                                        "CANCELLED"
                                                )
                                                .map(
                                                    (
                                                        booking
                                                    ) => (
                                                        <option
                                                            key={
                                                                booking.id
                                                            }
                                                            value={
                                                                booking.id
                                                            }
                                                        >
                                                            {
                                                                booking.bookingCode
                                                            }{" "}
                                                            —{" "}
                                                            {
                                                                booking.customerName
                                                            }{" "}
                                                            —{" "}
                                                            {
                                                                booking.vehicleNumber
                                                            }{" "}
                                                            —{" "}
                                                            {
                                                                booking.serviceType
                                                            }
                                                        </option>
                                                    )
                                                )}

                                        </select>

                                    </div>

                                </div>

                            </div>

                            {selectedBooking && (
                                <div className="form-section">

                                    <div className="form-section-title">
                                        <User size={17} />
                                        Customer & Vehicle
                                    </div>

                                    <div className="form-grid">

                                        <div className="form-field">

                                            <label>
                                                Customer
                                            </label>

                                            <input
                                                value={
                                                    selectedBooking.customerName ||
                                                    selectedBookingCustomer?.name ||
                                                    ""
                                                }
                                                readOnly
                                            />

                                        </div>

                                        <div className="form-field">

                                            <label>
                                                Phone
                                            </label>

                                            <input
                                                value={
                                                    selectedBookingCustomer?.phone ||
                                                    ""
                                                }
                                                readOnly
                                            />

                                        </div>

                                        <div className="form-field">

                                            <label>
                                                Vehicle
                                            </label>

                                            <input
                                                value={[
                                                    selectedBooking.vehicleMake,
                                                    selectedBooking.vehicleModel,
                                                ]
                                                    .filter(Boolean)
                                                    .join(" ")}
                                                readOnly
                                            />

                                        </div>

                                        <div className="form-field">

                                            <label>
                                                Registration Number
                                            </label>

                                            <input
                                                value={
                                                    selectedBooking.vehicleNumber ||
                                                    selectedBookingVehicle?.vehicleNumber ||
                                                    ""
                                                }
                                                readOnly
                                            />

                                        </div>

                                    </div>

                                </div>
                            )}

                            <div className="form-section">

                                <div className="form-section-title">
                                    <Car size={17} />
                                    Vehicle Reception
                                </div>

                                <div className="form-grid">

                                    <div className="form-field">

                                        <label>
                                            Opening Mileage
                                        </label>

                                        <input
                                            type="number"
                                            min="0"
                                            name="openingMileage"
                                            value={
                                                formData.openingMileage
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            placeholder="e.g. 45250"
                                        />

                                    </div>

                                    <div className="form-field">

                                        <label>
                                            Fuel Level
                                        </label>

                                        <select
                                            name="fuelLevel"
                                            value={
                                                formData.fuelLevel
                                            }
                                            onChange={
                                                handleChange
                                            }
                                        >

                                            <option value="">
                                                Select fuel level
                                            </option>

                                            <option value="Empty">
                                                Empty
                                            </option>

                                            <option value="1/4">
                                                1/4
                                            </option>

                                            <option value="1/2">
                                                1/2
                                            </option>

                                            <option value="3/4">
                                                3/4
                                            </option>

                                            <option value="Full">
                                                Full
                                            </option>

                                        </select>

                                    </div>

                                </div>

                            </div>

                            <div className="form-section">

                                <div className="form-section-title">
                                    <Wrench size={17} />
                                    Service Details
                                </div>

                                <div className="form-grid">

                                    <div className="form-field form-field-full">

                                        <label>
                                            Customer Complaint /
                                            Request
                                        </label>

                                        <textarea
                                            name="customerComplaint"
                                            value={
                                                formData.customerComplaint
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            placeholder="Describe the customer's complaint or requested work..."
                                            rows="3"
                                        />

                                    </div>

                                    <div className="form-field form-field-full">

                                        <label>
                                            Advisor Notes
                                        </label>

                                        <textarea
                                            name="advisorNotes"
                                            value={
                                                formData.advisorNotes
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            placeholder="Add internal workshop notes..."
                                            rows="3"
                                        />

                                    </div>

                                </div>

                            </div>

                            <div className="modal-footer">

                                <button
                                    type="button"
                                    className="secondary-button"
                                    onClick={() =>
                                        setShowModal(false)
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
                                    <CheckCircle2
                                        size={17}
                                    />

                                    {saving
                                        ? "Saving..."
                                        : editingJobCard
                                            ? "Update Job Card"
                                            : "Create Job Card"}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>
            )}

            {showViewModal &&
                selectedJobCard && (
                    <div
                        className="modal-overlay"
                        onMouseDown={(event) => {
                            if (
                                event.target ===
                                event.currentTarget
                            ) {
                                closeViewModal();
                            }
                        }}
                    >

                        <div className="job-view-modal">

                            <div className="modal-header">

                                <div>

                                    <span className="modal-eyebrow">
                                        {
                                            selectedJobCard.bookingCode
                                        }
                                    </span>

                                    <h2>
                                        {
                                            selectedJobCard.jobCardNumber
                                        }
                                    </h2>

                                </div>

                                <button
                                    className="modal-close"
                                    onClick={
                                        closeViewModal
                                    }
                                >
                                    <X size={20} />
                                </button>

                            </div>

                            <div className="job-view-content">

                                <div className="job-view-top">

                                    <div>

                                        <span>
                                            Current Status
                                        </span>

                                        <div
                                            className={`job-status ${
                                                getStatusInfo(
                                                    selectedJobCard.status
                                                ).className
                                            }`}
                                        >

                                            {(() => {
                                                const Icon =
                                                    getStatusInfo(
                                                        selectedJobCard.status
                                                    ).icon;

                                                return (
                                                    <Icon
                                                        size={15}
                                                    />
                                                );
                                            })()}

                                            {
                                                getStatusInfo(
                                                    selectedJobCard.status
                                                ).label
                                            }

                                        </div>

                                    </div>

                                    <div className="progress-summary">

                                        <div className="progress-label">

                                            <span>
                                                Job Progress
                                            </span>

                                            <strong>
                                                {Math.round(
                                                    ((workflow.indexOf(
                                                            selectedJobCard.status
                                                        ) + 1) /
                                                        workflow.length) *
                                                    100
                                                )}%
                                            </strong>

                                        </div>

                                        <div className="progress-track">

                                            <div
                                                className="progress-value"
                                                style={{
                                                    width: `${Math.round(
                                                        ((workflow.indexOf(
                                                                selectedJobCard.status
                                                            ) + 1) /
                                                            workflow.length) *
                                                        100
                                                    )}%`,
                                                }}
                                            />

                                        </div>

                                    </div>

                                </div>

                                <div className="workflow-section">

                                    <div className="workflow-title">
                                        Job Workflow
                                    </div>

                                    <div className="workflow">

                                        {workflow.map(
                                            (
                                                step,
                                                index
                                            ) => {

                                                const currentIndex =
                                                    workflow.indexOf(
                                                        selectedJobCard.status
                                                    );

                                                const completed =
                                                    index <=
                                                    currentIndex;

                                                const stepInfo =
                                                    getStatusInfo(
                                                        step
                                                    );

                                                return (
                                                    <div
                                                        className={`workflow-step ${
                                                            completed
                                                                ? "completed"
                                                                : ""
                                                        } ${
                                                            step ===
                                                            selectedJobCard.status
                                                                ? "current"
                                                                : ""
                                                        }`}
                                                        key={
                                                            step
                                                        }
                                                    >

                                                        <div className="workflow-dot">

                                                            {completed ? (
                                                                <CheckCircle2
                                                                    size={
                                                                        14
                                                                    }
                                                                />
                                                            ) : (
                                                                <CircleDot
                                                                    size={
                                                                        14
                                                                    }
                                                                />
                                                            )}

                                                        </div>

                                                        <span>
                                                            {
                                                                stepInfo.label
                                                            }
                                                        </span>

                                                        {index <
                                                            workflow.length -
                                                            1 && (
                                                                <div className="workflow-line" />
                                                            )}

                                                    </div>
                                                );
                                            }
                                        )}

                                    </div>

                                </div>

                                <div className="job-detail-grid">

                                    <div className="job-detail-card">

                                        <div className="detail-card-title">
                                            <User
                                                size={17}
                                            />
                                            Customer
                                        </div>

                                        <strong>
                                            {
                                                selectedJobCard.customerName
                                            }
                                        </strong>

                                        <span>
                                            {getCustomerPhone(
                                                selectedJobCard.customerId
                                            )}
                                        </span>

                                    </div>

                                    <div className="job-detail-card">

                                        <div className="detail-card-title">
                                            <Car
                                                size={17}
                                            />
                                            Vehicle
                                        </div>

                                        <strong>
                                            {
                                                selectedJobCard.vehicleMake
                                            }{" "}
                                            {
                                                selectedJobCard.vehicleModel
                                            }
                                        </strong>

                                        <span>
                                            {
                                                selectedJobCard.vehicleNumber
                                            }
                                        </span>

                                    </div>

                                    <div className="job-detail-card">

                                        <div className="detail-card-title">
                                            <CalendarDays
                                                size={17}
                                            />
                                            Opened
                                        </div>

                                        <strong>
                                            {formatDate(
                                                selectedJobCard.openedAt
                                            )}
                                        </strong>

                                        <span>
                                            {formatDateTime(
                                                selectedJobCard.openedAt
                                            )}
                                        </span>

                                    </div>

                                    <div className="job-detail-card">

                                        <div className="detail-card-title">
                                            <Clock3
                                                size={17}
                                            />
                                            Last Updated
                                        </div>

                                        <strong>
                                            {formatDate(
                                                selectedJobCard.updatedAt
                                            )}
                                        </strong>

                                        <span>
                                            {formatDateTime(
                                                selectedJobCard.updatedAt
                                            )}
                                        </span>

                                    </div>

                                </div>

                                <div className="job-detail-grid">

                                    <div className="job-detail-card">

                                        <div className="detail-card-title">
                                            <Car
                                                size={17}
                                            />
                                            Opening Mileage
                                        </div>

                                        <strong>
                                            {selectedJobCard.openingMileage ??
                                                "-"}
                                        </strong>

                                        <span>
                                            Vehicle reception
                                        </span>

                                    </div>

                                    <div className="job-detail-card">

                                        <div className="detail-card-title">
                                            <CircleDot
                                                size={17}
                                            />
                                            Fuel Level
                                        </div>

                                        <strong>
                                            {selectedJobCard.fuelLevel ||
                                                "-"}
                                        </strong>

                                        <span>
                                            Recorded at reception
                                        </span>

                                    </div>

                                </div>

                                <div className="complaint-card">

                                    <div className="detail-card-title">
                                        <ClipboardList
                                            size={17}
                                        />
                                        Customer Complaint
                                    </div>

                                    <p>
                                        {
                                            selectedJobCard.customerComplaint ||
                                            "No complaint recorded."
                                        }
                                    </p>

                                </div>

                                {selectedJobCard.advisorNotes && (
                                    <div className="complaint-card">

                                        <div className="detail-card-title">
                                            <Wrench
                                                size={17}
                                            />
                                            Advisor Notes
                                        </div>

                                        <p>
                                            {
                                                selectedJobCard.advisorNotes
                                            }
                                        </p>

                                    </div>
                                )}

                                <div className="financial-summary">

                                    <div>
                                        <span>
                                            Booking Reference
                                        </span>

                                        <strong>
                                            {
                                                selectedJobCard.bookingCode
                                            }
                                        </strong>
                                    </div>

                                    <div>
                                        <span>
                                            Job Card
                                        </span>

                                        <strong>
                                            {
                                                selectedJobCard.jobCardNumber
                                            }
                                        </strong>
                                    </div>

                                    <div>
                                        <span>
                                            Status
                                        </span>

                                        <strong>
                                            {
                                                getStatusInfo(
                                                    selectedJobCard.status
                                                ).label
                                            }
                                        </strong>
                                    </div>

                                </div>

                                <div className="view-actions">

                                    <button
                                        className="secondary-button"
                                        onClick={() => {
                                            closeViewModal();

                                            openEditModal(
                                                selectedJobCard
                                            );
                                        }}
                                    >
                                        <Edit3
                                            size={17}
                                        />

                                        Edit Job Card
                                    </button>

                                    {selectedJobCard.status !==
                                        "DELIVERED" && (
                                            <button
                                                className="primary-button"
                                                onClick={() =>
                                                    moveToNextStatus(
                                                        selectedJobCard
                                                    )
                                                }
                                            >
                                                Move to Next Stage

                                                <ArrowRight
                                                    size={17}
                                                />
                                            </button>
                                        )}

                                </div>

                            </div>

                        </div>

                    </div>
                )}
        </div>
    );
}

export default JobCards;