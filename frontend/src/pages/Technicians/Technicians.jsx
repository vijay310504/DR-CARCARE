import { useEffect, useMemo, useState } from "react";

import {
  Plus,
  Search,
  Wrench,
  Eye,
  Pencil,
  Trash2,
  Phone,
  User,
  Award,
  BriefcaseBusiness,
  CheckCircle,
  XCircle,
  X,
  Save,
  CalendarDays,
  Mail,
} from "lucide-react";

import "./Technicians.css";

import technicianService from "../../services/technicianService";

const statusConfig = {
  ACTIVE: {
    label: "Active",
    className: "available",
    icon: CheckCircle,
  },

  INACTIVE: {
    label: "Inactive",
    className: "inactive",
    icon: XCircle,
  },
};

const emptyForm = {
  technicianCode: "",
  name: "",
  phone: "",
  email: "",
  specialization: "General Service",
  experienceYears: "",
  skillLevel: "INTERMEDIATE",
  status: "ACTIVE",
  joiningDate: "",
  address: "",
  notes: "",
};

function Technicians() {
  const [technicians, setTechnicians] = useState([]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("create");

  const [selectedTechnician, setSelectedTechnician] =
      useState(null);

  const [form, setForm] = useState(emptyForm);

  // =========================================================
  // LOAD TECHNICIANS
  // =========================================================

  const loadTechnicians = async () => {
    try {
      setLoading(true);
      setError("");

      const data =
          await technicianService.getAllTechnicians();

      setTechnicians(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(
          "Failed to load technicians:",
          err
      );

      setError(
          err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to load technicians."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTechnicians();
  }, []);

  // =========================================================
  // FILTER
  // =========================================================

  const filteredTechnicians = useMemo(() => {
    const searchValue = search
        .trim()
        .toLowerCase();

    return technicians.filter((technician) => {
      const matchesSearch =
          !searchValue ||
          (technician.technicianCode || "")
              .toLowerCase()
              .includes(searchValue) ||
          (technician.name || "")
              .toLowerCase()
              .includes(searchValue) ||
          (technician.phone || "")
              .toLowerCase()
              .includes(searchValue) ||
          (technician.email || "")
              .toLowerCase()
              .includes(searchValue) ||
          (technician.specialization || "")
              .toLowerCase()
              .includes(searchValue) ||
          (technician.skillLevel || "")
              .toLowerCase()
              .includes(searchValue);

      const matchesStatus =
          statusFilter === "ALL" ||
          technician.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [technicians, search, statusFilter]);

  // =========================================================
  // STATS
  // =========================================================

  const stats = useMemo(() => {
    return {
      total: technicians.length,

      active: technicians.filter(
          (technician) =>
              technician.status === "ACTIVE"
      ).length,

      inactive: technicians.filter(
          (technician) =>
              technician.status === "INACTIVE"
      ).length,
    };
  }, [technicians]);

  // =========================================================
  // CREATE
  // =========================================================

  const openCreateModal = () => {
    setModalMode("create");

    const nextNumber =
        technicians.length + 1;

    setForm({
      ...emptyForm,
      technicianCode: `TECH-${String(
          nextNumber
      ).padStart(3, "0")}`,
      joiningDate: new Date()
          .toISOString()
          .split("T")[0],
    });

    setError("");
    setShowModal(true);
  };

  // =========================================================
  // EDIT
  // =========================================================

  const openEditModal = (technician) => {
    setModalMode("edit");

    setForm({
      technicianCode:
          technician.technicianCode || "",

      name: technician.name || "",

      phone: technician.phone || "",

      email: technician.email || "",

      specialization:
          technician.specialization ||
          "General Service",

      experienceYears:
          technician.experienceYears ?? "",

      skillLevel:
          technician.skillLevel ||
          "INTERMEDIATE",

      status:
          technician.status || "ACTIVE",

      joiningDate:
          technician.joiningDate || "",

      address:
          technician.address || "",

      notes:
          technician.notes || "",

      id: technician.id,
    });

    setError("");
    setShowModal(true);
  };

  // =========================================================
  // CLOSE MODAL
  // =========================================================

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    setForm(emptyForm);
    setError("");
  };

  // =========================================================
  // FORM CHANGE
  // =========================================================

  const handleFormChange = (
      field,
      value
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  // =========================================================
  // SUBMIT
  // =========================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");

      const payload = {
        technicianCode:
            form.technicianCode.trim(),

        name: form.name.trim(),

        phone:
            form.phone.trim() || null,

        email:
            form.email.trim() || null,

        specialization:
            form.specialization.trim() ||
            null,

        experienceYears:
            form.experienceYears === ""
                ? null
                : Number(
                    form.experienceYears
                ),

        skillLevel:
            form.skillLevel.trim() ||
            null,

        status:
            form.status || "ACTIVE",

        joiningDate:
            form.joiningDate || null,

        address:
            form.address.trim() || null,

        notes:
            form.notes.trim() || null,
      };

      let savedTechnician;

      if (modalMode === "create") {
        savedTechnician =
            await technicianService.createTechnician(
                payload
            );

        setTechnicians((previous) => [
          savedTechnician,
          ...previous,
        ]);
      } else {
        savedTechnician =
            await technicianService.updateTechnician(
                form.id,
                payload
            );

        setTechnicians((previous) =>
            previous.map(
                (technician) =>
                    technician.id === form.id
                        ? savedTechnician
                        : technician
            )
        );

        if (
            selectedTechnician?.id ===
            form.id
        ) {
          setSelectedTechnician(
              savedTechnician
          );
        }
      }

      closeModal();
    } catch (err) {
      console.error(
          "Failed to save technician:",
          err
      );

      setError(
          err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to save technician."
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // DELETE
  // =========================================================

  const deleteTechnician = async (id) => {
    const confirmed = window.confirm(
        "Are you sure you want to permanently delete this technician?"
    );

    if (!confirmed) return;

    try {
      setError("");

      await technicianService.deleteTechnician(
          id
      );

      setTechnicians((previous) =>
          previous.filter(
              (technician) =>
                  technician.id !== id
          )
      );

      if (
          selectedTechnician?.id === id
      ) {
        setSelectedTechnician(null);
      }
    } catch (err) {
      console.error(
          "Failed to delete technician:",
          err
      );

      setError(
          err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to delete technician."
      );
    }
  };

  // =========================================================
  // UPDATE STATUS
  // =========================================================

  const updateStatus = async (
      id,
      status
  ) => {
    try {
      setError("");

      const updated =
          await technicianService.updateStatus(
              id,
              status
          );

      setTechnicians((previous) =>
          previous.map(
              (technician) =>
                  technician.id === id
                      ? updated
                      : technician
          )
      );

      setSelectedTechnician(
          (previous) =>
              previous &&
              previous.id === id
                  ? updated
                  : previous
      );
    } catch (err) {
      console.error(
          "Failed to update technician status:",
          err
      );

      setError(
          err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to update technician status."
      );
    }
  };

  // =========================================================
  // STATUS
  // =========================================================

  const getStatus = (status) => {
    return (
        statusConfig[status] ||
        statusConfig.ACTIVE
    );
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
        <div className="technicians-page">
          <div className="technicians-header">
            <div className="technicians-title-row">
              <div className="technicians-title-icon">
                <Wrench size={23} />
              </div>

              <div>
                <h1>Technicians</h1>

                <p>
                  Manage workshop technicians,
                  specializations and job
                  assignments.
                </p>
              </div>
            </div>
          </div>

          <div
              style={{
                padding: "60px",
                textAlign: "center",
              }}
          >
            Loading technicians...
          </div>
        </div>
    );
  }

  // =========================================================
  // UI
  // =========================================================

  return (
      <div className="technicians-page">

        {/* HEADER */}

        <div className="technicians-header">
          <div className="technicians-title-row">
            <div className="technicians-title-icon">
              <Wrench size={23} />
            </div>

            <div>
              <h1>Technicians</h1>

              <p>
                Manage workshop technicians,
                specializations and job
                assignments.
              </p>
            </div>
          </div>

          <button
              className="primary-button"
              onClick={openCreateModal}
          >
            <Plus size={18} />
            Add Technician
          </button>
        </div>

        {/* ERROR */}

        {error && (
            <div
                style={{
                  marginBottom: "16px",
                  padding: "12px 16px",
                  borderRadius: "8px",
                  background:
                      "rgba(239, 68, 68, 0.12)",
                  color: "#ef4444",
                }}
            >
              {error}
            </div>
        )}

        {/* STATS */}

        <div className="technician-stats">

          <div className="technician-stat-card">
            <div className="technician-stat-icon blue">
              <BriefcaseBusiness size={20} />
            </div>

            <div>
                        <span>
                            Total Technicians
                        </span>

              <strong>
                {stats.total}
              </strong>
            </div>
          </div>

          <div className="technician-stat-card">
            <div className="technician-stat-icon green">
              <CheckCircle size={20} />
            </div>

            <div>
              <span>Active</span>

              <strong>
                {stats.active}
              </strong>
            </div>
          </div>

          <div className="technician-stat-card">
            <div className="technician-stat-icon red">
              <XCircle size={20} />
            </div>

            <div>
              <span>Inactive</span>

              <strong>
                {stats.inactive}
              </strong>
            </div>
          </div>

          <div className="technician-stat-card">
            <div className="technician-stat-icon orange">
              <Wrench size={20} />
            </div>

            <div>
                        <span>
                            Specializations
                        </span>

              <strong>
                {
                  new Set(
                      technicians
                          .map(
                              (technician) =>
                                  technician.specialization
                          )
                          .filter(Boolean)
                  ).size
                }
              </strong>
            </div>
          </div>

        </div>

        {/* TOOLBAR */}

        <div className="technician-toolbar">

          <div className="technician-search">
            <Search size={18} />

            <input
                type="text"
                placeholder="Search technician, ID, specialization..."
                value={search}
                onChange={(event) =>
                    setSearch(
                        event.target.value
                    )
                }
            />
          </div>

          <div className="technician-filters">

            {[
              ["ALL", "All"],
              ["ACTIVE", "Active"],
              ["INACTIVE", "Inactive"],
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

        <div className="technicians-table-card">

          <div className="table-header">
            <div>
              <h2>
                Technician Records
              </h2>

              <span>
                            Showing{" "}
                {
                  filteredTechnicians.length
                }{" "}
                of{" "}
                {
                  technicians.length
                }{" "}
                technicians
                        </span>
            </div>
          </div>

          <div className="table-wrapper">

            <table className="technicians-table">

              <thead>
              <tr>
                <th>
                  Technician
                </th>

                <th>
                  Specialization
                </th>

                <th>
                  Experience
                </th>

                <th>
                  Skill Level
                </th>

                <th>
                  Phone
                </th>

                <th>
                  Joining Date
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

              {filteredTechnicians.length ===
              0 ? (
                  <tr>
                    <td
                        colSpan="8"
                        className="empty-table"
                    >
                      <Wrench size={36} />

                      <strong>
                        No technicians
                        found
                      </strong>

                      <span>
                                            Try changing
                                            your search
                                            or filter.
                                        </span>
                    </td>
                  </tr>
              ) : (
                  filteredTechnicians.map(
                      (technician) => {
                        const status =
                            getStatus(
                                technician.status
                            );

                        const StatusIcon =
                            status.icon;

                        return (
                            <tr
                                key={
                                  technician.id
                                }
                            >

                              {/* TECHNICIAN */}

                              <td>
                                <div className="technician-cell">

                                  <div className="technician-avatar">
                                    <User
                                        size={
                                          17
                                        }
                                    />
                                  </div>

                                  <div>
                                    <strong>
                                      {
                                        technician.name
                                      }
                                    </strong>

                                    <span>
                                                                {
                                                                  technician.technicianCode
                                                                }
                                                            </span>
                                  </div>

                                </div>
                              </td>

                              {/* SPECIALIZATION */}

                              <td>
                                <div className="specialization-cell">

                                  <Award
                                      size={
                                        16
                                      }
                                  />

                                  <span>
                                                            {
                                                                technician.specialization ||
                                                                "General Service"
                                                            }
                                                        </span>

                                </div>
                              </td>

                              {/* EXPERIENCE */}

                              <td>
                                <strong>
                                  {
                                      technician.experienceYears ??
                                      0
                                  }{" "}
                                  yrs
                                </strong>
                              </td>

                              {/* SKILL LEVEL */}

                              <td>
                                                    <span>
                                                        {
                                                            technician.skillLevel ||
                                                            "Not specified"
                                                        }
                                                    </span>
                              </td>

                              {/* PHONE */}

                              <td>
                                <div className="specialization-cell">
                                  <Phone
                                      size={
                                        14
                                      }
                                  />

                                  <span>
                                                            {
                                                                technician.phone ||
                                                                "Not provided"
                                                            }
                                                        </span>
                                </div>
                              </td>

                              {/* JOINING DATE */}

                              <td>
                                {
                                    technician.joiningDate ||
                                    "-"
                                }
                              </td>

                              {/* STATUS */}

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

                              {/* ACTIONS */}

                              <td>

                                <div className="action-buttons">

                                  <button
                                      className="icon-button"
                                      title="View"
                                      onClick={() =>
                                          setSelectedTechnician(
                                              technician
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
                                              technician
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
                                          deleteTechnician(
                                              technician.id
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

              <div className="technician-modal">

                <div className="modal-header">

                  <div>
                    <h2>
                      {modalMode ===
                      "create"
                          ? "Add Technician"
                          : "Edit Technician"}
                    </h2>

                    <p>
                      Add technician profile
                      and workshop
                      information.
                    </p>
                  </div>

                  <button
                      className="modal-close"
                      onClick={
                        closeModal
                      }
                  >
                    <X size={20} />
                  </button>

                </div>

                <form
                    className="technician-form"
                    onSubmit={
                      handleSubmit
                    }
                >

                  {/* PERSONAL */}

                  <div className="form-section">

                    <div className="form-section-title">
                      <User size={18} />

                      <span>
                                        Personal
                                        Information
                                    </span>
                    </div>

                    <div className="form-grid">

                      <label>
                        Technician Code

                        <input
                            type="text"
                            value={
                              form.technicianCode
                            }
                            onChange={(
                                event
                            ) =>
                                handleFormChange(
                                    "technicianCode",
                                    event
                                        .target
                                        .value
                                )
                            }
                            required
                            maxLength={
                              30
                            }
                        />
                      </label>

                      <label>
                        Full Name

                        <input
                            type="text"
                            placeholder="Technician name"
                            value={
                              form.name
                            }
                            onChange={(
                                event
                            ) =>
                                handleFormChange(
                                    "name",
                                    event
                                        .target
                                        .value
                                )
                            }
                            required
                            maxLength={
                              100
                            }
                        />
                      </label>

                      <label>
                        Phone

                        <input
                            type="tel"
                            placeholder="Phone number"
                            value={
                              form.phone
                            }
                            onChange={(
                                event
                            ) =>
                                handleFormChange(
                                    "phone",
                                    event
                                        .target
                                        .value
                                )
                            }
                            maxLength={
                              20
                            }
                        />
                      </label>

                      <label>
                        Email

                        <input
                            type="email"
                            placeholder="Email address"
                            value={
                              form.email
                            }
                            onChange={(
                                event
                            ) =>
                                handleFormChange(
                                    "email",
                                    event
                                        .target
                                        .value
                                )
                            }
                            maxLength={
                              100
                            }
                        />
                      </label>

                      <label>
                        Joining Date

                        <input
                            type="date"
                            value={
                              form.joiningDate
                            }
                            onChange={(
                                event
                            ) =>
                                handleFormChange(
                                    "joiningDate",
                                    event
                                        .target
                                        .value
                                )
                            }
                        />
                      </label>

                    </div>

                  </div>

                  {/* PROFESSIONAL */}

                  <div className="form-section">

                    <div className="form-section-title">
                      <Award size={18} />

                      <span>
                                        Professional
                                        Information
                                    </span>
                    </div>

                    <div className="form-grid">

                      <label>
                        Specialization

                        <select
                            value={
                              form.specialization
                            }
                            onChange={(
                                event
                            ) =>
                                handleFormChange(
                                    "specialization",
                                    event
                                        .target
                                        .value
                                )
                            }
                        >
                          <option>
                            General Service
                          </option>

                          <option>
                            Engine & General
                            Service
                          </option>

                          <option>
                            Electrical &
                            Diagnostics
                          </option>

                          <option>
                            AC & Cooling
                            System
                          </option>

                          <option>
                            Brakes &
                            Suspension
                          </option>

                          <option>
                            Body & General
                            Service
                          </option>

                          <option>
                            Transmission
                          </option>

                          <option>
                            Tyre & Wheel
                            Service
                          </option>
                        </select>
                      </label>

                      <label>
                        Experience
                        (Years)

                        <input
                            type="number"
                            min="0"
                            max="60"
                            placeholder="e.g. 5"
                            value={
                              form.experienceYears
                            }
                            onChange={(
                                event
                            ) =>
                                handleFormChange(
                                    "experienceYears",
                                    event
                                        .target
                                        .value
                                )
                            }
                        />
                      </label>

                      <label>
                        Skill Level

                        <select
                            value={
                              form.skillLevel
                            }
                            onChange={(
                                event
                            ) =>
                                handleFormChange(
                                    "skillLevel",
                                    event
                                        .target
                                        .value
                                )
                            }
                        >
                          <option value="BEGINNER">
                            Beginner
                          </option>

                          <option value="INTERMEDIATE">
                            Intermediate
                          </option>

                          <option value="ADVANCED">
                            Advanced
                          </option>

                          <option value="EXPERT">
                            Expert
                          </option>
                        </select>
                      </label>

                      <label>
                        Status

                        <select
                            value={
                              form.status
                            }
                            onChange={(
                                event
                            ) =>
                                handleFormChange(
                                    "status",
                                    event
                                        .target
                                        .value
                                )
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

                    </div>

                  </div>

                  {/* CONTACT / NOTES */}

                  <div className="form-section">

                    <div className="form-section-title">
                      <BriefcaseBusiness
                          size={18}
                      />

                      <span>
                                        Additional
                                        Information
                                    </span>
                    </div>

                    <div className="form-grid">

                      <label className="full-width">
                        Address

                        <textarea
                            rows="3"
                            placeholder="Technician address..."
                            value={
                              form.address
                            }
                            onChange={(
                                event
                            ) =>
                                handleFormChange(
                                    "address",
                                    event
                                        .target
                                        .value
                                )
                            }
                            maxLength={
                              500
                            }
                        />
                      </label>

                      <label className="full-width">
                        Notes

                        <textarea
                            rows="4"
                            placeholder="Additional technician notes..."
                            value={
                              form.notes
                            }
                            onChange={(
                                event
                            ) =>
                                handleFormChange(
                                    "notes",
                                    event
                                        .target
                                        .value
                                )
                            }
                            maxLength={
                              500
                            }
                        />
                      </label>

                    </div>

                  </div>

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
                      <Save size={17} />

                      {saving
                          ? "Saving..."
                          : modalMode ===
                          "create"
                              ? "Add Technician"
                              : "Save Changes"}
                    </button>

                  </div>

                </form>

              </div>

            </div>
        )}

        {/* VIEW MODAL */}

        {selectedTechnician && (
            <div
                className="modal-overlay"
                onMouseDown={(event) => {
                  if (
                      event.target ===
                      event.currentTarget
                  ) {
                    setSelectedTechnician(
                        null
                    );
                  }
                }}
            >

              <div className="view-technician-modal">

                <div className="modal-header">

                  <div className="technician-profile-heading">

                    <div className="large-technician-avatar">
                      <User size={25} />
                    </div>

                    <div>

                      <h2>
                        {
                          selectedTechnician.name
                        }
                      </h2>

                      <span>
                                        {
                                          selectedTechnician.technicianCode
                                        }
                                    </span>

                    </div>

                  </div>

                  <button
                      className="modal-close"
                      onClick={() =>
                          setSelectedTechnician(
                              null
                          )
                      }
                  >
                    <X size={20} />
                  </button>

                </div>

                <div className="view-technician-content">

                  {/* STATUS */}

                  <div className="profile-status-row">

                    {(() => {
                      const status =
                          getStatus(
                              selectedTechnician.status
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

                    <span className="specialization-tag">
                                    <Award size={14} />

                      {
                          selectedTechnician.specialization ||
                          "General Service"
                      }
                                </span>

                  </div>

                  {/* INFORMATION */}

                  <div className="profile-info-grid">

                    <div className="profile-info-card">
                      <Phone size={18} />

                      <div>
                                        <span>
                                            Phone
                                        </span>

                        <strong>
                          {
                              selectedTechnician.phone ||
                              "Not provided"
                          }
                        </strong>
                      </div>
                    </div>

                    <div className="profile-info-card">
                      <Mail size={18} />

                      <div>
                                        <span>
                                            Email
                                        </span>

                        <strong>
                          {
                              selectedTechnician.email ||
                              "Not provided"
                          }
                        </strong>
                      </div>
                    </div>

                    <div className="profile-info-card">
                      <BriefcaseBusiness
                          size={18}
                      />

                      <div>
                                        <span>
                                            Experience
                                        </span>

                        <strong>
                          {
                              selectedTechnician.experienceYears ??
                              0
                          }{" "}
                          Years
                        </strong>
                      </div>
                    </div>

                    <div className="profile-info-card">
                      <Award size={18} />

                      <div>
                                        <span>
                                            Skill Level
                                        </span>

                        <strong>
                          {
                              selectedTechnician.skillLevel ||
                              "Not specified"
                          }
                        </strong>
                      </div>
                    </div>

                    <div className="profile-info-card">
                      <CalendarDays
                          size={18}
                      />

                      <div>
                                        <span>
                                            Joining Date
                                        </span>

                        <strong>
                          {
                              selectedTechnician.joiningDate ||
                              "-"
                          }
                        </strong>
                      </div>
                    </div>

                  </div>

                  {/* ADDRESS */}

                  <div className="technician-notes">

                    <h3>
                      Address
                    </h3>

                    <p>
                      {
                          selectedTechnician.address ||
                          "No address available."
                      }
                    </p>

                  </div>

                  {/* NOTES */}

                  <div className="technician-notes">

                    <h3>
                      Notes
                    </h3>

                    <p>
                      {
                          selectedTechnician.notes ||
                          "No additional notes available."
                      }
                    </p>

                  </div>

                </div>

                {/* FOOTER */}

                <div className="view-footer">

                  {selectedTechnician.status ===
                      "ACTIVE" && (
                          <button
                              className="cancel-button"
                              onClick={() =>
                                  updateStatus(
                                      selectedTechnician.id,
                                      "INACTIVE"
                                  )
                              }
                          >
                            <XCircle
                                size={17}
                            />

                            Deactivate
                          </button>
                      )}

                  {selectedTechnician.status ===
                      "INACTIVE" && (
                          <button
                              className="complete-action-button"
                              onClick={() =>
                                  updateStatus(
                                      selectedTechnician.id,
                                      "ACTIVE"
                                  )
                              }
                          >
                            <CheckCircle
                                size={17}
                            />

                            Activate Technician
                          </button>
                      )}

                  <button
                      className="cancel-button"
                      onClick={() =>
                          setSelectedTechnician(
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

export default Technicians;