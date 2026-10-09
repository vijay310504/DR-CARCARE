import { useEffect, useMemo, useState } from "react";

import {
    CalendarDays,
    Car,
    CheckCircle2,
    Clock3,
    Eye,
    Pencil,
    Phone,
    Plus,
    Search,
    X,
    XCircle,
} from "lucide-react";

import "./Bookings.css";

import bookingService from "../../services/bookingService";
import customerService from "../../services/customerService";
import vehicleService from "../../services/vehicleService";

const emptyForm = {
    customerId: "",
    vehicleId: "",
    serviceType: "General Service",
    date: "",
    time: "",
    customerComplaint: "",
    notes: "",
};

function Bookings() {
    const [bookings, setBookings] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [vehicles, setVehicles] = useState([]);

    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");

    const [modalType, setModalType] = useState(null);
    const [selectedBooking, setSelectedBooking] = useState(null);

    const [formData, setFormData] = useState(emptyForm);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    // =========================================================
    // LOAD DATA
    // =========================================================

    const loadBookings = async () => {
        try {
            setLoading(true);
            setError("");

            const data = await bookingService.getAllBookings();

            setBookings(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Failed to load bookings:", err);

            setError(
                err.response?.data?.message ||
                err.response?.data?.error ||
                "Failed to load bookings."
            );
        } finally {
            setLoading(false);
        }
    };

    const loadCustomers = async () => {
        try {
            const data = await customerService.getAllCustomers();

            setCustomers(
                Array.isArray(data)
                    ? data.filter((customer) => customer.active !== false)
                    : []
            );
        } catch (err) {
            console.error("Failed to load customers:", err);
        }
    };

    const loadVehicles = async () => {
        try {
            const data = await vehicleService.getAllVehicles();

            setVehicles(
                Array.isArray(data)
                    ? data.filter((vehicle) => vehicle.active !== false)
                    : []
            );
        } catch (err) {
            console.error("Failed to load vehicles:", err);
        }
    };

    useEffect(() => {
        loadBookings();
        loadCustomers();
        loadVehicles();
    }, []);

    // =========================================================
    // CUSTOMER / VEHICLE HELPERS
    // =========================================================

    const selectedCustomer = useMemo(() => {
        return customers.find(
            (customer) =>
                String(customer.id) === String(formData.customerId)
        );
    }, [customers, formData.customerId]);

    const customerVehicles = useMemo(() => {
        if (!formData.customerId) {
            return [];
        }

        return vehicles.filter(
            (vehicle) =>
                String(vehicle.customerId) ===
                String(formData.customerId)
        );
    }, [vehicles, formData.customerId]);

    // =========================================================
    // SEARCH / FILTER
    // =========================================================

    const filteredBookings = useMemo(() => {
        const search = searchTerm.trim().toLowerCase();

        return bookings.filter((booking) => {
            const vehicleName = [
                booking.vehicleMake,
                booking.vehicleModel,
            ]
                .filter(Boolean)
                .join(" ");

            const matchesSearch =
                !search ||
                booking.bookingCode
                    ?.toLowerCase()
                    .includes(search) ||
                booking.customerName
                    ?.toLowerCase()
                    .includes(search) ||
                vehicleName
                    .toLowerCase()
                    .includes(search) ||
                booking.vehicleNumber
                    ?.toLowerCase()
                    .includes(search) ||
                booking.serviceType
                    ?.toLowerCase()
                    .includes(search) ||
                booking.customerComplaint
                    ?.toLowerCase()
                    .includes(search);

            const matchesStatus =
                statusFilter === "All" ||
                booking.status === statusFilter.toUpperCase();

            return matchesSearch && matchesStatus;
        });
    }, [bookings, searchTerm, statusFilter]);

    // =========================================================
    // STATISTICS
    // =========================================================

    const totalBookings = bookings.length;

    const bookedCount = bookings.filter(
        (booking) => booking.status === "BOOKED"
    ).length;

    const confirmedCount = bookings.filter(
        (booking) => booking.status === "CONFIRMED"
    ).length;

    const arrivedCount = bookings.filter(
        (booking) => booking.status === "ARRIVED"
    ).length;

    // =========================================================
    // MODALS
    // =========================================================

    const openAddModal = () => {
        setSelectedBooking(null);
        setFormData(emptyForm);
        setError("");
        setModalType("form");
    };

    const openEditModal = (booking) => {
        setSelectedBooking(booking);
        setError("");

        setFormData({
            customerId: booking.customerId || "",
            vehicleId: booking.vehicleId || "",
            serviceType: booking.serviceType || "General Service",
            date: booking.bookingDate || "",
            time: booking.expectedArrivalTime || "",
            customerComplaint:
                booking.customerComplaint || "",
            notes: booking.notes || "",
        });

        setModalType("form");
    };

    const openViewModal = (booking) => {
        setSelectedBooking(booking);
        setError("");
        setModalType("view");
    };

    const closeModal = () => {
        setModalType(null);
        setSelectedBooking(null);
        setFormData(emptyForm);
        setError("");
    };

    // =========================================================
    // INPUT
    // =========================================================

    const handleInputChange = (event) => {
        const { name, value } = event.target;

        setFormData((current) => ({
            ...current,
            [name]: value,
        }));

        // When customer changes, reset vehicle
        if (name === "customerId") {
            setFormData((current) => ({
                ...current,
                customerId: value,
                vehicleId: "",
            }));
        }
    };

    // =========================================================
    // CREATE / UPDATE
    // =========================================================

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (
            !formData.customerId ||
            !formData.vehicleId ||
            !formData.serviceType ||
            !formData.date
        ) {
            setError(
                "Please select customer, vehicle, service type and date."
            );
            return;
        }

        try {
            setSaving(true);
            setError("");

            const payload = {
                customerId: Number(formData.customerId),
                vehicleId: Number(formData.vehicleId),
                bookingDate: formData.date,
                expectedArrivalTime:
                    formData.time || null,
                serviceType: formData.serviceType,
                customerComplaint:
                    formData.customerComplaint?.trim() || null,
                notes:
                    formData.notes?.trim() || null,
            };

            if (selectedBooking) {
                await bookingService.updateBooking(
                    selectedBooking.id,
                    payload
                );
            } else {
                await bookingService.createBooking(payload);
            }

            await loadBookings();

            closeModal();
        } catch (err) {
            console.error("Failed to save booking:", err);

            setError(
                err.response?.data?.message ||
                err.response?.data?.error ||
                "Failed to save booking."
            );
        } finally {
            setSaving(false);
        }
    };

    // =========================================================
    // STATUS
    // =========================================================

    const changeBookingStatus = async (
        booking,
        newStatus
    ) => {
        try {
            setError("");

            const updatedBooking =
                await bookingService.updateBookingStatus(
                    booking.id,
                    newStatus
                );

            setBookings((current) =>
                current.map((item) =>
                    item.id === booking.id
                        ? updatedBooking
                        : item
                )
            );

            setSelectedBooking(updatedBooking);
        } catch (err) {
            console.error(
                "Failed to update booking status:",
                err
            );

            setError(
                err.response?.data?.message ||
                err.response?.data?.error ||
                "Failed to update booking status."
            );
        }
    };

    // =========================================================
    // CANCEL
    // =========================================================

    const cancelBooking = async (booking) => {
        try {
            setError("");

            await bookingService.cancelBooking(
                booking.id
            );

            const updatedBooking = {
                ...booking,
                status: "CANCELLED",
            };

            setBookings((current) =>
                current.map((item) =>
                    item.id === booking.id
                        ? updatedBooking
                        : item
                )
            );

            setSelectedBooking(updatedBooking);
        } catch (err) {
            console.error(
                "Failed to cancel booking:",
                err
            );

            setError(
                err.response?.data?.message ||
                err.response?.data?.error ||
                "Failed to cancel booking."
            );
        }
    };

    // =========================================================
    // FORMATTERS
    // =========================================================

    const formatDate = (date) => {
        if (!date) {
            return "-";
        }

        const parsedDate = new Date(`${date}T00:00:00`);

        if (Number.isNaN(parsedDate.getTime())) {
            return date;
        }

        return parsedDate.toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
            }
        );
    };

    const formatTime = (time) => {
        if (!time) {
            return "-";
        }

        const [hours, minutes] =
            time.split(":");

        const date = new Date();

        date.setHours(
            Number(hours),
            Number(minutes),
            0,
            0
        );

        return date.toLocaleTimeString(
            "en-IN",
            {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
            }
        );
    };

    const getVehicleName = (booking) => {
        return [
            booking.vehicleMake,
            booking.vehicleModel,
        ]
            .filter(Boolean)
            .join(" ") || "-";
    };

    // =========================================================
    // RENDER
    // =========================================================

    return (
        <div className="bookings-page">

            {/* HEADER */}

            <section className="bookings-header">

                <div className="bookings-title-area">

                    <div className="bookings-title-icon">
                        <CalendarDays size={24} />
                    </div>

                    <div>
                        <span className="bookings-eyebrow">
                            WORKSHOP SCHEDULING
                        </span>

                        <h1>Bookings</h1>

                        <p>
                            Manage customer appointments
                            and workshop schedules.
                        </p>
                    </div>

                </div>

                <button
                    type="button"
                    className="bookings-primary-button"
                    onClick={openAddModal}
                >
                    <Plus size={17} />
                    New Booking
                </button>

            </section>

            {/* ERROR */}

            {error && !modalType && (
                <div className="booking-error">
                    {error}
                </div>
            )}

            {/* STATISTICS */}

            <section className="booking-stat-grid">

                <div className="booking-stat-card">
                    <div className="booking-stat-icon">
                        <CalendarDays size={19} />
                    </div>

                    <div>
                        <span>Total Bookings</span>
                        <strong>{totalBookings}</strong>
                    </div>
                </div>

                <div className="booking-stat-card">
                    <div className="booking-stat-icon warning">
                        <Clock3 size={19} />
                    </div>

                    <div>
                        <span>Booked</span>
                        <strong>{bookedCount}</strong>
                    </div>
                </div>

                <div className="booking-stat-card">
                    <div className="booking-stat-icon success">
                        <CheckCircle2 size={19} />
                    </div>

                    <div>
                        <span>Confirmed</span>
                        <strong>{confirmedCount}</strong>
                    </div>
                </div>

                <div className="booking-stat-card">
                    <div className="booking-stat-icon info">
                        <Car size={19} />
                    </div>

                    <div>
                        <span>Arrived</span>
                        <strong>{arrivedCount}</strong>
                    </div>
                </div>

            </section>

            {/* TABLE */}

            <section className="bookings-table-card">

                <div className="bookings-toolbar">

                    <div className="booking-search">

                        <Search size={17} />

                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(event) =>
                                setSearchTerm(
                                    event.target.value
                                )
                            }
                            placeholder="Search booking, customer, vehicle or service..."
                        />

                        {searchTerm && (
                            <button
                                type="button"
                                className="booking-clear-search"
                                onClick={() =>
                                    setSearchTerm("")
                                }
                            >
                                <X size={15} />
                            </button>
                        )}

                    </div>

                    <select
                        className="booking-filter"
                        value={statusFilter}
                        onChange={(event) =>
                            setStatusFilter(
                                event.target.value
                            )
                        }
                    >
                        <option value="All">
                            All Status
                        </option>

                        <option value="Booked">
                            Booked
                        </option>

                        <option value="Confirmed">
                            Confirmed
                        </option>

                        <option value="Arrived">
                            Arrived
                        </option>

                        <option value="Cancelled">
                            Cancelled
                        </option>
                    </select>

                </div>

                <div className="bookings-table-wrapper">

                    <table className="bookings-table">

                        <thead>
                        <tr>
                            <th>BOOKING</th>
                            <th>CUSTOMER</th>
                            <th>VEHICLE</th>
                            <th>SERVICE</th>
                            <th>DATE & TIME</th>
                            <th>STATUS</th>
                            <th>ACTIONS</th>
                        </tr>
                        </thead>

                        <tbody>

                        {loading ? (
                            <tr>
                                <td
                                    colSpan="7"
                                    className="booking-empty"
                                >
                                    <Clock3 size={28} />

                                    <strong>
                                        Loading bookings...
                                    </strong>

                                    <span>
                                        Please wait.
                                    </span>
                                </td>
                            </tr>
                        ) : filteredBookings.length === 0 ? (
                            <tr>
                                <td
                                    colSpan="7"
                                    className="booking-empty"
                                >
                                    <CalendarDays size={28} />

                                    <strong>
                                        No bookings found
                                    </strong>

                                    <span>
                                        Try changing your
                                        search or status filter.
                                    </span>
                                </td>
                            </tr>
                        ) : (
                            filteredBookings.map(
                                (booking) => (
                                    <tr key={booking.id}>

                                        <td>
                                            <div className="booking-number">

                                                <div className="booking-number-icon">
                                                    <CalendarDays size={16} />
                                                </div>

                                                <div>
                                                    <strong>
                                                        {booking.bookingCode}
                                                    </strong>

                                                    <span>
                                                        ID #{booking.id}
                                                    </span>
                                                </div>

                                            </div>
                                        </td>

                                        <td>
                                            <div className="booking-customer">

                                                <strong>
                                                    {booking.customerName}
                                                </strong>

                                                <span>
                                                    <Phone size={12} />
                                                    Customer ID #
                                                    {booking.customerId}
                                                </span>

                                            </div>
                                        </td>

                                        <td>
                                            <div className="booking-vehicle">

                                                <strong>
                                                    {getVehicleName(
                                                        booking
                                                    )}
                                                </strong>

                                                <span>
                                                    {
                                                        booking.vehicleNumber
                                                    }
                                                </span>

                                            </div>
                                        </td>

                                        <td>
                                            <span className="booking-service">
                                                {booking.serviceType}
                                            </span>
                                        </td>

                                        <td>
                                            <div className="booking-datetime">

                                                <strong>
                                                    {formatDate(
                                                        booking.bookingDate
                                                    )}
                                                </strong>

                                                <span>
                                                    {formatTime(
                                                        booking.expectedArrivalTime
                                                    )}
                                                </span>

                                            </div>
                                        </td>

                                        <td>
                                            <span
                                                className={[
                                                    "booking-status",
                                                    booking.status
                                                        ?.toLowerCase(),
                                                ].join(" ")}
                                            >
                                                <span />
                                                {booking.status}
                                            </span>
                                        </td>

                                        <td>
                                            <div className="booking-actions">

                                                <button
                                                    type="button"
                                                    title="View booking"
                                                    onClick={() =>
                                                        openViewModal(
                                                            booking
                                                        )
                                                    }
                                                >
                                                    <Eye size={16} />
                                                </button>

                                                <button
                                                    type="button"
                                                    title="Edit booking"
                                                    onClick={() =>
                                                        openEditModal(
                                                            booking
                                                        )
                                                    }
                                                >
                                                    <Pencil size={16} />
                                                </button>

                                            </div>
                                        </td>

                                    </tr>
                                )
                            )
                        )}

                        </tbody>

                    </table>

                </div>

                <div className="bookings-table-footer">
                    Showing{" "}
                    <strong>
                        {filteredBookings.length}
                    </strong>{" "}
                    of{" "}
                    <strong>
                        {bookings.length}
                    </strong>{" "}
                    bookings
                </div>

            </section>

            {/* =====================================================
                FORM MODAL
            ===================================================== */}

            {modalType === "form" && (
                <div
                    className="booking-modal-overlay"
                    onMouseDown={closeModal}
                >

                    <div
                        className="booking-modal"
                        onMouseDown={(event) =>
                            event.stopPropagation()
                        }
                    >

                        <div className="booking-modal-header">

                            <div>
                                <span>
                                    {selectedBooking
                                        ? "UPDATE BOOKING"
                                        : "NEW APPOINTMENT"}
                                </span>

                                <h2>
                                    {selectedBooking
                                        ? "Edit Booking"
                                        : "Create Booking"}
                                </h2>
                            </div>

                            <button
                                type="button"
                                onClick={closeModal}
                            >
                                <X size={18} />
                            </button>

                        </div>

                        {error && (
                            <div className="booking-error">
                                {error}
                            </div>
                        )}

                        <form
                            className="booking-form"
                            onSubmit={handleSubmit}
                        >

                            {/* CUSTOMER / VEHICLE */}

                            <div className="booking-form-section">

                                <h3>
                                    Customer & Vehicle
                                </h3>

                                <div className="booking-form-grid">

                                    <label>
                                        Customer

                                        <select
                                            name="customerId"
                                            value={
                                                formData.customerId
                                            }
                                            onChange={
                                                handleInputChange
                                            }
                                            required
                                        >
                                            <option value="">
                                                Select customer
                                            </option>

                                            {customers.map(
                                                (customer) => (
                                                    <option
                                                        key={
                                                            customer.id
                                                        }
                                                        value={
                                                            customer.id
                                                        }
                                                    >
                                                        {
                                                            customer.name
                                                        }
                                                    </option>
                                                )
                                            )}
                                        </select>
                                    </label>

                                    <label>
                                        Phone Number

                                        <input
                                            type="text"
                                            value={
                                                selectedCustomer?.phone ||
                                                ""
                                            }
                                            placeholder="Customer phone"
                                            readOnly
                                        />
                                    </label>

                                    <label>
                                        Vehicle

                                        <select
                                            name="vehicleId"
                                            value={
                                                formData.vehicleId
                                            }
                                            onChange={
                                                handleInputChange
                                            }
                                            required
                                            disabled={
                                                !formData.customerId
                                            }
                                        >
                                            <option value="">
                                                {!formData.customerId
                                                    ? "Select customer first"
                                                    : "Select vehicle"}
                                            </option>

                                            {customerVehicles.map(
                                                (vehicle) => (
                                                    <option
                                                        key={
                                                            vehicle.id
                                                        }
                                                        value={
                                                            vehicle.id
                                                        }
                                                    >
                                                        {
                                                            vehicle.vehicleNumber
                                                        }{" "}
                                                        —{" "}
                                                        {
                                                            vehicle.make
                                                        }{" "}
                                                        {
                                                            vehicle.model
                                                        }
                                                    </option>
                                                )
                                            )}
                                        </select>
                                    </label>

                                    <label>
                                        Registration Number

                                        <input
                                            type="text"
                                            value={
                                                vehicles.find(
                                                    (vehicle) =>
                                                        String(
                                                            vehicle.id
                                                        ) ===
                                                        String(
                                                            formData.vehicleId
                                                        )
                                                )
                                                    ?.vehicleNumber ||
                                                ""
                                            }
                                            placeholder="Vehicle registration"
                                            readOnly
                                        />
                                    </label>

                                </div>

                            </div>

                            {/* APPOINTMENT */}

                            <div className="booking-form-section">

                                <h3>
                                    Appointment Details
                                </h3>

                                <div className="booking-form-grid">

                                    <label>
                                        Service Type

                                        <select
                                            name="serviceType"
                                            value={
                                                formData.serviceType
                                            }
                                            onChange={
                                                handleInputChange
                                            }
                                            required
                                        >
                                            <option>
                                                General Service
                                            </option>

                                            <option>
                                                Periodic Service
                                            </option>

                                            <option>
                                                Full Service
                                            </option>

                                            <option>
                                                AC Service
                                            </option>

                                            <option>
                                                Brake Service
                                            </option>

                                            <option>
                                                Engine Service
                                            </option>

                                            <option>
                                                Electrical Service
                                            </option>

                                            <option>
                                                Inspection
                                            </option>
                                        </select>
                                    </label>

                                    <label>
                                        Date

                                        <input
                                            type="date"
                                            name="date"
                                            value={
                                                formData.date
                                            }
                                            onChange={
                                                handleInputChange
                                            }
                                            required
                                        />
                                    </label>

                                    <label>
                                        Time

                                        <input
                                            type="time"
                                            name="time"
                                            value={
                                                formData.time
                                            }
                                            onChange={
                                                handleInputChange
                                            }
                                        />
                                    </label>

                                    <label className="booking-full-width">
                                        Customer Complaint

                                        <textarea
                                            name="customerComplaint"
                                            value={
                                                formData.customerComplaint
                                            }
                                            onChange={
                                                handleInputChange
                                            }
                                            placeholder="Describe customer complaint or vehicle issue..."
                                            rows="3"
                                        />
                                    </label>

                                    <label className="booking-full-width">
                                        Notes

                                        <textarea
                                            name="notes"
                                            value={
                                                formData.notes
                                            }
                                            onChange={
                                                handleInputChange
                                            }
                                            placeholder="Additional booking notes..."
                                            rows="3"
                                        />
                                    </label>

                                </div>

                            </div>

                            <div className="booking-modal-actions">

                                <button
                                    type="button"
                                    className="booking-cancel-button"
                                    onClick={closeModal}
                                    disabled={saving}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="booking-save-button"
                                    disabled={saving}
                                >
                                    {saving
                                        ? "Saving..."
                                        : selectedBooking
                                            ? "Update Booking"
                                            : "Create Booking"}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>
            )}

            {/* =====================================================
                VIEW MODAL
            ===================================================== */}

            {modalType === "view" &&
                selectedBooking && (
                    <div
                        className="booking-modal-overlay"
                        onMouseDown={closeModal}
                    >

                        <div
                            className="booking-modal booking-view-modal"
                            onMouseDown={(event) =>
                                event.stopPropagation()
                            }
                        >

                            <div className="booking-modal-header">

                                <div>
                                    <span>
                                        BOOKING DETAILS
                                    </span>

                                    <h2>
                                        {
                                            selectedBooking.bookingCode
                                        }
                                    </h2>
                                </div>

                                <button
                                    type="button"
                                    onClick={closeModal}
                                >
                                    <X size={18} />
                                </button>

                            </div>

                            {error && (
                                <div className="booking-error">
                                    {error}
                                </div>
                            )}

                            <div className="booking-profile-card">

                                <div className="booking-profile-icon">
                                    <CalendarDays size={25} />
                                </div>

                                <div>
                                    <h3>
                                        {
                                            selectedBooking.serviceType
                                        }
                                    </h3>

                                    <span>
                                        {
                                            formatDate(
                                                selectedBooking.bookingDate
                                            )
                                        }{" "}
                                        •{" "}
                                        {
                                            formatTime(
                                                selectedBooking.expectedArrivalTime
                                            )
                                        }
                                    </span>
                                </div>

                            </div>

                            <div className="booking-info-grid">

                                <div>
                                    <span>Customer</span>
                                    <strong>
                                        {
                                            selectedBooking.customerName
                                        }
                                    </strong>
                                </div>

                                <div>
                                    <span>Customer ID</span>
                                    <strong>
                                        #
                                        {
                                            selectedBooking.customerId
                                        }
                                    </strong>
                                </div>

                                <div>
                                    <span>Vehicle</span>
                                    <strong>
                                        {
                                            getVehicleName(
                                                selectedBooking
                                            )
                                        }
                                    </strong>
                                </div>

                                <div>
                                    <span>Registration</span>
                                    <strong>
                                        {
                                            selectedBooking.vehicleNumber
                                        }
                                    </strong>
                                </div>

                                <div>
                                    <span>Service</span>
                                    <strong>
                                        {
                                            selectedBooking.serviceType
                                        }
                                    </strong>
                                </div>

                                <div>
                                    <span>Status</span>
                                    <strong>
                                        {
                                            selectedBooking.status
                                        }
                                    </strong>
                                </div>

                            </div>

                            <div className="booking-notes">

                                <span>
                                    Customer Complaint
                                </span>

                                <p>
                                    {
                                        selectedBooking.customerComplaint ||
                                        "No complaint recorded."
                                    }
                                </p>

                            </div>

                            <div className="booking-notes">

                                <span>
                                    Notes
                                </span>

                                <p>
                                    {
                                        selectedBooking.notes ||
                                        "No notes added."
                                    }
                                </p>

                            </div>

                            {/* STATUS ACTIONS */}

                            {selectedBooking.status !==
                                "CANCELLED" && (
                                    <div className="booking-status-actions">

                                        <span>
                                            Update Status
                                        </span>

                                        <div>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    changeBookingStatus(
                                                        selectedBooking,
                                                        "CONFIRMED"
                                                    )
                                                }
                                            >
                                                <CheckCircle2 size={14} />
                                                Confirm
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    changeBookingStatus(
                                                        selectedBooking,
                                                        "ARRIVED"
                                                    )
                                                }
                                            >
                                                <Car size={14} />
                                                Arrived
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    cancelBooking(
                                                        selectedBooking
                                                    )
                                                }
                                            >
                                                <XCircle size={14} />
                                                Cancel
                                            </button>

                                        </div>

                                    </div>
                                )}

                            <div className="booking-modal-actions">

                                <button
                                    type="button"
                                    className="booking-cancel-button"
                                    onClick={closeModal}
                                >
                                    Close
                                </button>

                                <button
                                    type="button"
                                    className="booking-save-button"
                                    onClick={() =>
                                        openEditModal(
                                            selectedBooking
                                        )
                                    }
                                >
                                    <Pencil size={15} />
                                    Edit Booking
                                </button>

                            </div>

                        </div>

                    </div>
                )}

        </div>
    );
}

export default Bookings;