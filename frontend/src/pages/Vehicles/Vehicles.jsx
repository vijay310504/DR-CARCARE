import { useEffect, useMemo, useState } from "react";

import {
    Car,
    Eye,
    Gauge,
    Pencil,
    Plus,
    Search,
    Trash2,
    UserRound,
    X,
} from "lucide-react";

import "./Vehicles.css";

import vehicleService from "../../services/vehicleService";
import customerService from "../../services/customerService";

const emptyForm = {
    vehicleNumber: "",
    customerId: "",
    make: "",
    model: "",
    variant: "",
    manufacturingYear: "",
    color: "",
    fuelType: "Petrol",
    vin: "",
    engineNumber: "",
    currentMileage: "",
};

function Vehicles() {
    const [vehicles, setVehicles] = useState([]);
    const [customers, setCustomers] = useState([]);

    const [loading, setLoading] = useState(true);
    const [customersLoading, setCustomersLoading] =
        useState(true);

    const [error, setError] = useState("");

    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] =
        useState("All");

    const [modalType, setModalType] = useState(null);
    const [selectedVehicle, setSelectedVehicle] =
        useState(null);

    const [formData, setFormData] =
        useState(emptyForm);

    const [saving, setSaving] = useState(false);

    // =========================================================
    // LOAD VEHICLES
    // =========================================================

    const loadVehicles = async () => {
        try {
            setLoading(true);
            setError("");

            const data =
                await vehicleService.getAllVehicles();

            setVehicles(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error(
                "Failed to load vehicles:",
                err
            );

            setError(
                err.response?.data?.message ||
                err.response?.data?.error ||
                "Failed to load vehicles."
            );
        } finally {
            setLoading(false);
        }
    };

    // =========================================================
    // LOAD CUSTOMERS
    // =========================================================

    const loadCustomers = async () => {
        try {
            setCustomersLoading(true);

            const data =
                await customerService.getAllCustomers();

            setCustomers(
                Array.isArray(data) ? data : []
            );
        } catch (err) {
            console.error(
                "Failed to load customers:",
                err
            );
        } finally {
            setCustomersLoading(false);
        }
    };

    useEffect(() => {
        loadVehicles();
        loadCustomers();
    }, []);

    // =========================================================
    // FILTER
    // =========================================================

    const filteredVehicles = useMemo(() => {
        const search =
            searchTerm.trim().toLowerCase();

        return vehicles.filter((vehicle) => {
            const matchesSearch =
                !search ||
                vehicle.vehicleNumber
                    ?.toLowerCase()
                    .includes(search) ||
                vehicle.customerName
                    ?.toLowerCase()
                    .includes(search) ||
                vehicle.make
                    ?.toLowerCase()
                    .includes(search) ||
                vehicle.model
                    ?.toLowerCase()
                    .includes(search) ||
                vehicle.variant
                    ?.toLowerCase()
                    .includes(search) ||
                vehicle.fuelType
                    ?.toLowerCase()
                    .includes(search);

            const matchesStatus =
                statusFilter === "All" ||
                (statusFilter === "Active"
                    ? vehicle.active === true
                    : vehicle.active === false);

            return (
                matchesSearch &&
                matchesStatus
            );
        });
    }, [
        vehicles,
        searchTerm,
        statusFilter,
    ]);

    // =========================================================
    // STATISTICS
    // =========================================================

    const totalVehicles = vehicles.length;

    const activeVehicles =
        vehicles.filter(
            (vehicle) => vehicle.active === true
        ).length;

    const inactiveVehicles =
        vehicles.filter(
            (vehicle) => vehicle.active === false
        ).length;

    const uniqueCustomers =
        new Set(
            vehicles
                .map(
                    (vehicle) =>
                        vehicle.customerId
                )
                .filter(Boolean)
        ).size;

    // =========================================================
    // MODALS
    // =========================================================

    const openAddModal = () => {
        setSelectedVehicle(null);
        setFormData({
            ...emptyForm,
            fuelType: "Petrol",
        });
        setModalType("form");
        setError("");
    };

    const openEditModal = (vehicle) => {
        setSelectedVehicle(vehicle);

        setFormData({
            vehicleNumber:
                vehicle.vehicleNumber || "",

            customerId:
                vehicle.customerId || "",

            make:
                vehicle.make || "",

            model:
                vehicle.model || "",

            variant:
                vehicle.variant || "",

            manufacturingYear:
                vehicle.manufacturingYear || "",

            color:
                vehicle.color || "",

            fuelType:
                vehicle.fuelType || "Petrol",

            vin:
                vehicle.vin || "",

            engineNumber:
                vehicle.engineNumber || "",

            currentMileage:
                vehicle.currentMileage ?? "",
        });

        setModalType("form");
        setError("");
    };

    const openViewModal = (vehicle) => {
        setSelectedVehicle(vehicle);
        setModalType("view");
    };

    const closeModal = () => {
        setModalType(null);
        setSelectedVehicle(null);
        setFormData({
            ...emptyForm,
            fuelType: "Petrol",
        });
        setError("");
    };

    // =========================================================
    // INPUT
    // =========================================================

    const handleInputChange = (event) => {
        const {
            name,
            value,
        } = event.target;

        setFormData((current) => ({
            ...current,
            [name]: value,
        }));
    };

    // =========================================================
    // CREATE / UPDATE
    // =========================================================

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (
            !formData.vehicleNumber.trim() ||
            !formData.customerId ||
            !formData.make.trim() ||
            !formData.model.trim()
        ) {
            setError(
                "Vehicle number, customer, make and model are required."
            );

            return;
        }

        try {
            setSaving(true);
            setError("");

            const payload = {
                vehicleNumber:
                    formData.vehicleNumber.trim(),

                customerId:
                    Number(formData.customerId),

                make:
                    formData.make.trim(),

                model:
                    formData.model.trim(),

                variant:
                    formData.variant.trim() || null,

                manufacturingYear:
                    formData.manufacturingYear
                        ? Number(
                            formData.manufacturingYear
                        )
                        : null,

                color:
                    formData.color.trim() || null,

                fuelType:
                    formData.fuelType || null,

                vin:
                    formData.vin.trim() || null,

                engineNumber:
                    formData.engineNumber.trim() ||
                    null,

                currentMileage:
                    formData.currentMileage !== ""
                        ? Number(
                            formData.currentMileage
                        )
                        : null,
            };

            if (selectedVehicle) {
                await vehicleService.updateVehicle(
                    selectedVehicle.id,
                    payload
                );
            } else {
                await vehicleService.createVehicle(
                    payload
                );
            }

            await loadVehicles();

            closeModal();
        } catch (err) {
            console.error(
                "Failed to save vehicle:",
                err
            );

            setError(
                err.response?.data?.message ||
                err.response?.data?.error ||
                "Failed to save vehicle."
            );
        } finally {
            setSaving(false);
        }
    };

    // =========================================================
    // DEACTIVATE
    // =========================================================

    const deactivateVehicle = async (vehicle) => {
        const action =
            vehicle.active
                ? "Deactivate"
                : "Activate";

        const confirmed =
            window.confirm(
                `${action} ${vehicle.vehicleNumber}?`
            );

        if (!confirmed) {
            return;
        }

        /*
         * Current backend supports DEACTIVATE only.
         * It does not contain an activateVehicle method.
         */
        if (!vehicle.active) {
            window.alert(
                "This vehicle is already inactive. The current backend does not provide an activate operation."
            );

            return;
        }

        try {
            await vehicleService.deactivateVehicle(
                vehicle.id
            );

            await loadVehicles();
        } catch (err) {
            console.error(
                "Failed to deactivate vehicle:",
                err
            );

            window.alert(
                err.response?.data?.message ||
                err.response?.data?.error ||
                "Failed to deactivate vehicle."
            );
        }
    };

    // =========================================================
    // CUSTOMER NAME
    // =========================================================

    const getCustomerName = (customerId) => {
        const customer =
            customers.find(
                (item) =>
                    Number(item.id) ===
                    Number(customerId)
            );

        return (
            customer?.name ||
            "Unknown Customer"
        );
    };

    return (
        <div className="vehicles-page">

            {/* =================================================
                PAGE HEADER
            ================================================= */}

            <section className="vehicles-header">

                <div className="vehicles-title-area">

                    <div className="vehicles-title-icon">
                        <Car size={24} />
                    </div>

                    <div>
                        <span className="vehicles-eyebrow">
                            VEHICLE MANAGEMENT
                        </span>

                        <h1>Vehicles</h1>

                        <p>
                            Manage vehicle profiles,
                            ownership and service
                            information.
                        </p>
                    </div>

                </div>

                <button
                    type="button"
                    className="vehicles-primary-button"
                    onClick={openAddModal}
                >
                    <Plus size={17} />
                    Add Vehicle
                </button>

            </section>

            {/* =================================================
                ERROR
            ================================================= */}

            {error && !modalType && (
                <div
                    style={{
                        marginBottom: "16px",
                        padding: "12px 16px",
                        borderRadius: "10px",
                        background: "var(--surface)",
                        border:
                            "1px solid var(--danger)",
                        color: "var(--danger)",
                    }}
                >
                    {error}
                </div>
            )}

            {/* =================================================
                STATISTICS
            ================================================= */}

            <section className="vehicle-stat-grid">

                <div className="vehicle-stat-card">

                    <div className="vehicle-stat-icon">
                        <Car size={19} />
                    </div>

                    <div>
                        <span>Total Vehicles</span>
                        <strong>
                            {totalVehicles}
                        </strong>
                    </div>

                </div>

                <div className="vehicle-stat-card">

                    <div className="vehicle-stat-icon success">
                        <Gauge size={19} />
                    </div>

                    <div>
                        <span>Active Vehicles</span>
                        <strong>
                            {activeVehicles}
                        </strong>
                    </div>

                </div>

                <div className="vehicle-stat-card">

                    <div className="vehicle-stat-icon warning">
                        <UserRound size={19} />
                    </div>

                    <div>
                        <span>Vehicle Owners</span>
                        <strong>
                            {uniqueCustomers}
                        </strong>
                    </div>

                </div>

                <div className="vehicle-stat-card">

                    <div className="vehicle-stat-icon danger">
                        <Trash2 size={19} />
                    </div>

                    <div>
                        <span>Inactive Vehicles</span>
                        <strong>
                            {inactiveVehicles}
                        </strong>
                    </div>

                </div>

            </section>

            {/* =================================================
                TABLE
            ================================================= */}

            <section className="vehicles-table-card">

                <div className="vehicles-toolbar">

                    <div className="vehicle-search">

                        <Search size={17} />

                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(event) =>
                                setSearchTerm(
                                    event.target.value
                                )
                            }
                            placeholder="Search registration, customer, make or model..."
                        />

                        {searchTerm && (
                            <button
                                type="button"
                                onClick={() =>
                                    setSearchTerm("")
                                }
                                className="clear-search"
                            >
                                <X size={15} />
                            </button>
                        )}

                    </div>

                    <select
                        value={statusFilter}
                        onChange={(event) =>
                            setStatusFilter(
                                event.target.value
                            )
                        }
                        className="vehicle-filter"
                    >
                        <option value="All">
                            All Vehicles
                        </option>

                        <option value="Active">
                            Active
                        </option>

                        <option value="Inactive">
                            Inactive
                        </option>
                    </select>

                </div>

                {/* =================================================
                    TABLE
                ================================================= */}

                <div className="vehicles-table-wrapper">

                    <table className="vehicles-table">

                        <thead>
                        <tr>
                            <th>VEHICLE</th>
                            <th>OWNER</th>
                            <th>VEHICLE DETAILS</th>
                            <th>MILEAGE</th>
                            <th>STATUS</th>
                            <th>ACTIONS</th>
                        </tr>
                        </thead>

                        <tbody>

                        {loading ? (
                            <tr>
                                <td
                                    colSpan="6"
                                    className="vehicle-empty"
                                >
                                    <Car size={28} />

                                    <strong>
                                        Loading vehicles...
                                    </strong>

                                    <span>
                                        Please wait.
                                    </span>
                                </td>
                            </tr>
                        ) : filteredVehicles.length ===
                        0 ? (
                            <tr>
                                <td
                                    colSpan="6"
                                    className="vehicle-empty"
                                >
                                    <Car size={28} />

                                    <strong>
                                        No vehicles found
                                    </strong>

                                    <span>
                                        Try changing your
                                        search or filter.
                                    </span>
                                </td>
                            </tr>
                        ) : (
                            filteredVehicles.map(
                                (vehicle) => (
                                    <tr
                                        key={
                                            vehicle.id
                                        }
                                    >

                                        <td>
                                            <div className="vehicle-main">

                                                <div className="vehicle-avatar">
                                                    <Car size={17} />
                                                </div>

                                                <div>
                                                    <strong>
                                                        {
                                                            vehicle.vehicleNumber
                                                        }
                                                    </strong>

                                                    <span>
                                                        {
                                                            vehicle.manufacturingYear ||
                                                            "Year N/A"
                                                        }{" "}
                                                        •{" "}
                                                        {
                                                            vehicle.color ||
                                                            "Color N/A"
                                                        }
                                                    </span>
                                                </div>

                                            </div>
                                        </td>

                                        <td>
                                            <div className="vehicle-owner">

                                                <strong>
                                                    {
                                                        vehicle.customerName ||
                                                        getCustomerName(
                                                            vehicle.customerId
                                                        )
                                                    }
                                                </strong>

                                                <span>
                                                    Customer ID:{" "}
                                                    {
                                                        vehicle.customerId
                                                    }
                                                </span>

                                            </div>
                                        </td>

                                        <td>
                                            <div className="vehicle-details">

                                                <strong>
                                                    {
                                                        vehicle.make
                                                    }{" "}
                                                    {
                                                        vehicle.model
                                                    }
                                                </strong>

                                                <span>
                                                    {
                                                        vehicle.variant ||
                                                        vehicle.fuelType ||
                                                        "Vehicle"
                                                    }
                                                </span>

                                            </div>
                                        </td>

                                        <td>
                                            <span className="mileage-value">
                                                {vehicle.currentMileage !=
                                                null
                                                    ? Number(
                                                        vehicle.currentMileage
                                                    ).toLocaleString(
                                                        "en-IN"
                                                    )
                                                    : "—"}{" "}
                                                {vehicle.currentMileage !=
                                                    null &&
                                                    "km"}
                                            </span>
                                        </td>

                                        <td>
                                            <span
                                                className={[
                                                    "vehicle-status",
                                                    vehicle.active
                                                        ? "active"
                                                        : "inactive",
                                                ].join(
                                                    " "
                                                )}
                                            >
                                                <span />
                                                {
                                                    vehicle.active
                                                        ? "Active"
                                                        : "Inactive"
                                                }
                                            </span>
                                        </td>

                                        <td>

                                            <div className="vehicle-actions">

                                                <button
                                                    type="button"
                                                    title="View vehicle"
                                                    onClick={() =>
                                                        openViewModal(
                                                            vehicle
                                                        )
                                                    }
                                                >
                                                    <Eye size={16} />
                                                </button>

                                                <button
                                                    type="button"
                                                    title="Edit vehicle"
                                                    onClick={() =>
                                                        openEditModal(
                                                            vehicle
                                                        )
                                                    }
                                                >
                                                    <Pencil size={16} />
                                                </button>

                                                <button
                                                    type="button"
                                                    title={
                                                        vehicle.active
                                                            ? "Deactivate"
                                                            : "Activate"
                                                    }
                                                    onClick={() =>
                                                        deactivateVehicle(
                                                            vehicle
                                                        )
                                                    }
                                                >
                                                    <Trash2 size={16} />
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

                <div className="vehicles-table-footer">

                    Showing{" "}
                    <strong>
                        {filteredVehicles.length}
                    </strong>{" "}
                    of{" "}
                    <strong>
                        {vehicles.length}
                    </strong>{" "}
                    vehicles

                </div>

            </section>

            {/* =================================================
                FORM MODAL
            ================================================= */}

            {modalType === "form" && (
                <div
                    className="vehicle-modal-overlay"
                    onMouseDown={closeModal}
                >

                    <div
                        className="vehicle-modal"
                        onMouseDown={(event) =>
                            event.stopPropagation()
                        }
                    >

                        <div className="vehicle-modal-header">

                            <div>
                                <span>
                                    {selectedVehicle
                                        ? "UPDATE VEHICLE"
                                        : "NEW VEHICLE"}
                                </span>

                                <h2>
                                    {selectedVehicle
                                        ? "Edit Vehicle"
                                        : "Add Vehicle"}
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
                            <div
                                style={{
                                    margin:
                                        "0 24px 16px",
                                    padding:
                                        "10px 12px",
                                    borderRadius:
                                        "8px",
                                    color:
                                        "var(--danger)",
                                    border:
                                        "1px solid var(--danger)",
                                    background:
                                        "var(--surface)",
                                }}
                            >
                                {error}
                            </div>
                        )}

                        <form
                            className="vehicle-form"
                            onSubmit={handleSubmit}
                        >

                            <div className="vehicle-form-section">

                                <h3>
                                    Vehicle Information
                                </h3>

                                <div className="vehicle-form-grid">

                                    <label>
                                        Registration Number
                                        <input
                                            name="vehicleNumber"
                                            value={
                                                formData.vehicleNumber
                                            }
                                            onChange={
                                                handleInputChange
                                            }
                                            placeholder="TN 57 AB 1234"
                                            required
                                        />
                                    </label>

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
                                            disabled={
                                                customersLoading
                                            }
                                        >
                                            <option value="">
                                                {customersLoading
                                                    ? "Loading customers..."
                                                    : "Select customer"}
                                            </option>

                                            {customers
                                                .filter(
                                                    (customer) =>
                                                        customer.active !==
                                                        false
                                                )
                                                .map(
                                                    (
                                                        customer
                                                    ) => (
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
                                                            }{" "}
                                                            —{" "}
                                                            {
                                                                customer.customerCode
                                                            }
                                                        </option>
                                                    )
                                                )}
                                        </select>
                                    </label>

                                    <label>
                                        Make
                                        <input
                                            name="make"
                                            value={
                                                formData.make
                                            }
                                            onChange={
                                                handleInputChange
                                            }
                                            placeholder="Hyundai"
                                            required
                                        />
                                    </label>

                                    <label>
                                        Model
                                        <input
                                            name="model"
                                            value={
                                                formData.model
                                            }
                                            onChange={
                                                handleInputChange
                                            }
                                            placeholder="Creta"
                                            required
                                        />
                                    </label>

                                    <label>
                                        Variant
                                        <input
                                            name="variant"
                                            value={
                                                formData.variant
                                            }
                                            onChange={
                                                handleInputChange
                                            }
                                            placeholder="SX(O)"
                                        />
                                    </label>

                                    <label>
                                        Manufacturing Year
                                        <input
                                            type="number"
                                            name="manufacturingYear"
                                            min="1950"
                                            max="2035"
                                            value={
                                                formData.manufacturingYear
                                            }
                                            onChange={
                                                handleInputChange
                                            }
                                            placeholder="2024"
                                        />
                                    </label>

                                    <label>
                                        Fuel Type
                                        <select
                                            name="fuelType"
                                            value={
                                                formData.fuelType
                                            }
                                            onChange={
                                                handleInputChange
                                            }
                                        >
                                            <option value="Petrol">
                                                Petrol
                                            </option>

                                            <option value="Diesel">
                                                Diesel
                                            </option>

                                            <option value="CNG">
                                                CNG
                                            </option>

                                            <option value="Electric">
                                                Electric
                                            </option>

                                            <option value="Hybrid">
                                                Hybrid
                                            </option>
                                        </select>
                                    </label>

                                    <label>
                                        Color
                                        <input
                                            name="color"
                                            value={
                                                formData.color
                                            }
                                            onChange={
                                                handleInputChange
                                            }
                                            placeholder="White"
                                        />
                                    </label>

                                    <label>
                                        Current Mileage
                                        <input
                                            type="number"
                                            min="0"
                                            name="currentMileage"
                                            value={
                                                formData.currentMileage
                                            }
                                            onChange={
                                                handleInputChange
                                            }
                                            placeholder="25000"
                                        />
                                    </label>

                                    <label>
                                        VIN
                                        <input
                                            name="vin"
                                            value={
                                                formData.vin
                                            }
                                            onChange={
                                                handleInputChange
                                            }
                                            placeholder="Vehicle Identification Number"
                                        />
                                    </label>

                                    <label>
                                        Engine Number
                                        <input
                                            name="engineNumber"
                                            value={
                                                formData.engineNumber
                                            }
                                            onChange={
                                                handleInputChange
                                            }
                                            placeholder="Engine number"
                                        />
                                    </label>

                                </div>

                            </div>

                            <div className="vehicle-modal-actions">

                                <button
                                    type="button"
                                    className="vehicle-cancel-button"
                                    onClick={closeModal}
                                    disabled={saving}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="vehicle-save-button"
                                    disabled={saving}
                                >
                                    {saving
                                        ? "Saving..."
                                        : selectedVehicle
                                            ? "Update Vehicle"
                                            : "Save Vehicle"}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>
            )}

            {/* =================================================
                VIEW MODAL
            ================================================= */}

            {modalType === "view" &&
                selectedVehicle && (
                    <div
                        className="vehicle-modal-overlay"
                        onMouseDown={closeModal}
                    >

                        <div
                            className="vehicle-modal vehicle-view-modal"
                            onMouseDown={(event) =>
                                event.stopPropagation()
                            }
                        >

                            <div className="vehicle-modal-header">

                                <div>
                                    <span>
                                        VEHICLE PROFILE
                                    </span>

                                    <h2>
                                        {
                                            selectedVehicle.vehicleNumber
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

                            <div className="vehicle-profile-card">

                                <div className="vehicle-profile-icon">
                                    <Car size={27} />
                                </div>

                                <div>
                                    <h3>
                                        {
                                            selectedVehicle.make
                                        }{" "}
                                        {
                                            selectedVehicle.model
                                        }
                                    </h3>

                                    <span>
                                        {
                                            selectedVehicle.manufacturingYear ||
                                            "Year N/A"
                                        }{" "}
                                        •{" "}
                                        {
                                            selectedVehicle.color ||
                                            "Color N/A"
                                        }{" "}
                                        •{" "}
                                        {
                                            selectedVehicle.fuelType ||
                                            "Fuel N/A"
                                        }
                                    </span>
                                </div>

                            </div>

                            <div className="vehicle-info-grid">

                                <div>
                                    <span>
                                        Owner
                                    </span>

                                    <strong>
                                        {
                                            selectedVehicle.customerName ||
                                            getCustomerName(
                                                selectedVehicle.customerId
                                            )
                                        }
                                    </strong>
                                </div>

                                <div>
                                    <span>
                                        Customer ID
                                    </span>

                                    <strong>
                                        {
                                            selectedVehicle.customerId
                                        }
                                    </strong>
                                </div>

                                <div>
                                    <span>
                                        Variant
                                    </span>

                                    <strong>
                                        {
                                            selectedVehicle.variant ||
                                            "—"
                                        }
                                    </strong>
                                </div>

                                <div>
                                    <span>
                                        Mileage
                                    </span>

                                    <strong>
                                        {selectedVehicle.currentMileage !=
                                        null
                                            ? Number(
                                                selectedVehicle.currentMileage
                                            ).toLocaleString(
                                                "en-IN"
                                            )
                                            : "—"}{" "}
                                        {selectedVehicle.currentMileage !=
                                            null &&
                                            "km"}
                                    </strong>
                                </div>

                                <div>
                                    <span>
                                        VIN
                                    </span>

                                    <strong>
                                        {
                                            selectedVehicle.vin ||
                                            "—"
                                        }
                                    </strong>
                                </div>

                                <div>
                                    <span>
                                        Engine Number
                                    </span>

                                    <strong>
                                        {
                                            selectedVehicle.engineNumber ||
                                            "—"
                                        }
                                    </strong>
                                </div>

                                <div>
                                    <span>
                                        Created
                                    </span>

                                    <strong>
                                        {
                                            selectedVehicle.createdAt
                                                ? new Date(
                                                    selectedVehicle.createdAt
                                                ).toLocaleDateString(
                                                    "en-IN"
                                                )
                                                : "—"
                                        }
                                    </strong>
                                </div>

                                <div>
                                    <span>
                                        Status
                                    </span>

                                    <strong>
                                        {
                                            selectedVehicle.active
                                                ? "Active"
                                                : "Inactive"
                                        }
                                    </strong>
                                </div>

                            </div>

                            <div className="vehicle-modal-actions">

                                <button
                                    type="button"
                                    className="vehicle-cancel-button"
                                    onClick={closeModal}
                                >
                                    Close
                                </button>

                                <button
                                    type="button"
                                    className="vehicle-save-button"
                                    onClick={() =>
                                        openEditModal(
                                            selectedVehicle
                                        )
                                    }
                                >
                                    <Pencil size={15} />
                                    Edit Vehicle
                                </button>

                            </div>

                        </div>

                    </div>
                )}

        </div>
    );
}

export default Vehicles;