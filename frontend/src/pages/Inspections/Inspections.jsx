import { useEffect, useMemo, useState } from "react";

import {
    Search,
    Plus,
    Eye,
    Edit3,
    X,
    Car,
    Wrench,
    ClipboardCheck,
    CalendarDays,
    CheckCircle2,
    AlertTriangle,
    CircleDot,
    ShieldCheck,
    FileText,
} from "lucide-react";

import "./Inspections.css";

import inspectionService from "../../services/inspectionService";
import jobCardService from "../../services/jobCardService";
import technicianService from "../../services/technicianService";
import jobCardTechnicianService from "../../services/jobCardTechnicianService";


// =========================================================
// INSPECTION CHECKLIST
// =========================================================

const checkItems = [

    {
        key: "engine",
        label: "Engine & Mechanical",
        category: "Mechanical",
    },

    {
        key: "brakes",
        label: "Brakes",
        category: "Brakes",
    },

    {
        key: "tyres",
        label: "Tyres",
        category: "Tyres",
    },

    {
        key: "battery",
        label: "Battery",
        category: "Electrical",
    },

    {
        key: "lights",
        label: "Lights & Electrical",
        category: "Electrical",
    },

    {
        key: "ac",
        label: "AC / Cooling",
        category: "AC",
    },

    {
        key: "fluids",
        label: "Fluids",
        category: "Fluids",
    },

    {
        key: "suspension",
        label: "Suspension",
        category: "Suspension",
    },

    {
        key: "exterior",
        label: "Exterior",
        category: "Exterior",
    },

    {
        key: "interior",
        label: "Interior",
        category: "Interior",
    },
];


// =========================================================
// CHECK STATUS CONFIG
// =========================================================

const checkStatusConfig = {

    GOOD: {
        label: "Good",
        className: "good",
        icon: CheckCircle2,
    },

    ATTENTION: {
        label: "Attention",
        className: "attention",
        icon: AlertTriangle,
    },

    CRITICAL: {
        label: "Critical",
        className: "critical",
        icon: AlertTriangle,
    },

    NOT_CHECKED: {
        label: "Not Checked",
        className: "not-checked",
        icon: CircleDot,
    },
};


// =========================================================
// INSPECTION STATUS CONFIG
// =========================================================

const inspectionStatusConfig = {

    PENDING: {
        label: "Pending",
        className: "pending",
    },

    IN_PROGRESS: {
        label: "In Progress",
        className: "in-progress",
    },

    COMPLETED: {
        label: "Completed",
        className: "completed",
    },
};


// =========================================================
// EMPTY FORM
// =========================================================

const emptyForm = {

    jobCardId: "",
    jobCardNo: "",

    customer: "",
    vehicle: "",
    registration: "",

    technicianId: "",
    technician: "Not Assigned",

    date: "",

    complaint: "",
    notes: "",
    recommendation: "",

    checks: {

        engine: "NOT_CHECKED",
        brakes: "NOT_CHECKED",
        tyres: "NOT_CHECKED",
        battery: "NOT_CHECKED",
        lights: "NOT_CHECKED",
        ac: "NOT_CHECKED",
        fluids: "NOT_CHECKED",
        suspension: "NOT_CHECKED",
        exterior: "NOT_CHECKED",
        interior: "NOT_CHECKED",
    },
};


// =========================================================
// RESOLVE CHECK KEY
// IMPORTANT:
// Battery MUST be checked before Electrical -> Lights
// =========================================================

const resolveCheckKey = (record) => {

    const category = String(
        record?.inspectionCategory || ""
    )
        .trim()
        .toLowerCase();

    const item = String(
        record?.inspectionItem || ""
    )
        .trim()
        .toLowerCase();

    const combined = `${category} ${item}`;


    // ---------------------------------------------------------
    // BATTERY
    // MUST COME BEFORE ELECTRICAL
    // ---------------------------------------------------------

    if (
        item.includes("battery") ||
        combined.includes("battery")
    ) {
        return "battery";
    }


    // ---------------------------------------------------------
    // LIGHTS
    // ---------------------------------------------------------

    if (
        item.includes("light") ||
        item.includes("lighting") ||
        item.includes("headlamp") ||
        item.includes("headlight") ||
        item.includes("tail light") ||
        item.includes("taillight") ||
        item.includes("indicator")
    ) {
        return "lights";
    }


    // ---------------------------------------------------------
    // ENGINE / MECHANICAL
    // ---------------------------------------------------------

    if (
        category.includes("mechanical") ||
        item.includes("engine") ||
        item.includes("mechanical")
    ) {
        return "engine";
    }


    // ---------------------------------------------------------
    // BRAKES
    // ---------------------------------------------------------

    if (
        category.includes("brake") ||
        item.includes("brake")
    ) {
        return "brakes";
    }


    // ---------------------------------------------------------
    // TYRES
    // ---------------------------------------------------------

    if (
        category.includes("tyre") ||
        category.includes("tire") ||
        item.includes("tyre") ||
        item.includes("tire")
    ) {
        return "tyres";
    }


    // ---------------------------------------------------------
    // AC / COOLING
    // ---------------------------------------------------------

    if (
        category.includes("ac") ||
        category.includes("air conditioning") ||
        category.includes("cooling") ||
        item.includes("ac") ||
        item.includes("air conditioning") ||
        item.includes("cooling")
    ) {
        return "ac";
    }


    // ---------------------------------------------------------
    // FLUIDS
    // ---------------------------------------------------------

    if (
        category.includes("fluid") ||
        item.includes("fluid") ||
        item.includes("oil") ||
        item.includes("coolant") ||
        item.includes("brake fluid")
    ) {
        return "fluids";
    }


    // ---------------------------------------------------------
    // SUSPENSION
    // ---------------------------------------------------------

    if (
        category.includes("suspension") ||
        item.includes("suspension") ||
        item.includes("shock") ||
        item.includes("strut")
    ) {
        return "suspension";
    }


    // ---------------------------------------------------------
    // EXTERIOR
    // ---------------------------------------------------------

    if (
        category.includes("exterior") ||
        item.includes("exterior") ||
        item.includes("body") ||
        item.includes("paint")
    ) {
        return "exterior";
    }


    // ---------------------------------------------------------
    // INTERIOR
    // ---------------------------------------------------------

    if (
        category.includes("interior") ||
        item.includes("interior") ||
        item.includes("seat") ||
        item.includes("dashboard")
    ) {
        return "interior";
    }


    // ---------------------------------------------------------
    // FALLBACK USING EXACT CHECKLIST LABEL
    // ---------------------------------------------------------

    const matchingItem = checkItems.find(
        (checkItem) => {

            const label = checkItem.label
                .toLowerCase();

            return (
                item === label ||
                combined.includes(label)
            );
        }
    );


    return matchingItem?.key || null;
};


function Inspections() {

    const [inspectionRecords, setInspectionRecords] =
        useState([]);

    const [jobCards, setJobCards] =
        useState([]);

    const [technicians, setTechnicians] =
        useState([]);

    const [technicianAssignments, setTechnicianAssignments] =
        useState([]);


    const [loading, setLoading] =
        useState(true);

    const [saving, setSaving] =
        useState(false);

    const [error, setError] =
        useState("");


    const [search, setSearch] =
        useState("");

    const [statusFilter, setStatusFilter] =
        useState("ALL");

    const [conditionFilter, setConditionFilter] =
        useState("ALL");


    const [showModal, setShowModal] =
        useState(false);

    const [showViewModal, setShowViewModal] =
        useState(false);


    const [editingInspection, setEditingInspection] =
        useState(null);

    const [selectedInspection, setSelectedInspection] =
        useState(null);


    const [formData, setFormData] =
        useState(emptyForm);


    // =========================================================
    // LOAD BACKEND DATA
    // =========================================================

    const loadData = async () => {

        try {

            setLoading(true);
            setError("");


            const [
                inspectionData,
                jobCardData,
                technicianData,
                assignmentData,
            ] = await Promise.all([

                inspectionService.getAllInspections(),

                jobCardService.getAllJobCards(),

                technicianService.getAllTechnicians(),

                jobCardTechnicianService.getAllAssignments(),

            ]);


            setInspectionRecords(
                Array.isArray(inspectionData)
                    ? inspectionData
                    : []
            );


            setJobCards(
                Array.isArray(jobCardData)
                    ? jobCardData
                    : []
            );


            setTechnicians(
                Array.isArray(technicianData)
                    ? technicianData
                    : []
            );


            setTechnicianAssignments(
                Array.isArray(assignmentData)
                    ? assignmentData
                    : []
            );


        } catch (err) {

            console.error(
                "Failed to load inspections:",
                err
            );


            setError(
                err.response?.data?.message ||
                err.response?.data?.error ||
                "Failed to load inspections."
            );

        } finally {

            setLoading(false);

        }
    };


    useEffect(() => {

        loadData();

    }, []);


    // =========================================================
    // FORMAT DATE
    // =========================================================

    const formatDate = (dateValue) => {

        if (!dateValue) {
            return "-";
        }


        const date = new Date(dateValue);


        if (Number.isNaN(date.getTime())) {
            return dateValue;
        }


        return date.toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
            }
        );
    };


    // =========================================================
    // GET TECHNICIAN ASSIGNMENT FOR JOB CARD
    // =========================================================

    const getJobCardTechnician = (jobCardId) => {

        const assignment =
            technicianAssignments.find(
                (item) =>
                    String(item.jobCardId) ===
                    String(jobCardId) &&
                    ![
                        "CANCELLED",
                    ].includes(
                        String(item.status).toUpperCase()
                    )
            );


        if (!assignment) {

            return {

                technicianId: "",

                technician:
                    "Not Assigned",

            };
        }


        return {

            technicianId:
                assignment.technicianId || "",

            technician:
                assignment.technicianName ||
                assignment.technicianCode ||
                "Not Assigned",

        };
    };


    // =========================================================
    // GROUP BACKEND INSPECTIONS
    // =========================================================

    const inspections = useMemo(() => {

        const grouped = new Map();


        inspectionRecords.forEach(
            (record) => {

                const jobCardId =
                    record.jobCardId;


                if (!grouped.has(jobCardId)) {

                    grouped.set(
                        jobCardId,
                        {

                            id: jobCardId,

                            jobCardId,

                            inspectionNo:
                                record.id
                                    ? `INSP-${String(
                                        record.id
                                    ).padStart(
                                        6,
                                        "0"
                                    )}`
                                    : `INSP-JC-${jobCardId}`,

                            jobCardNo:
                                record.jobCardNumber ||
                                `JC-${jobCardId}`,

                            customer:
                                record.customerName ||
                                "Customer",

                            vehicle:
                                record.vehicleModel ||
                                "Vehicle",

                            registration:
                                record.vehicleNumber ||
                                "",


                            ...getJobCardTechnician(
                                jobCardId
                            ),


                            date:
                                formatDate(
                                    record.createdAt
                                ),


                            status:
                                "PENDING",

                            overall:
                                "NOT_CHECKED",


                            complaint:
                                "",

                            notes:
                                "",

                            recommendation:
                                "",


                            checks: {

                                engine:
                                    "NOT_CHECKED",

                                brakes:
                                    "NOT_CHECKED",

                                tyres:
                                    "NOT_CHECKED",

                                battery:
                                    "NOT_CHECKED",

                                lights:
                                    "NOT_CHECKED",

                                ac:
                                    "NOT_CHECKED",

                                fluids:
                                    "NOT_CHECKED",

                                suspension:
                                    "NOT_CHECKED",

                                exterior:
                                    "NOT_CHECKED",

                                interior:
                                    "NOT_CHECKED",
                            },


                            recordMap: {},

                        }
                    );
                }


                const inspection =
                    grouped.get(
                        jobCardId
                    );


                // =================================================
                // FIXED CHECKLIST MAPPING
                // =================================================

                const checkKey =
                    resolveCheckKey(record);


                if (checkKey) {

                    inspection.checks[
                        checkKey
                        ] =
                        String(
                            record.conditionStatus ||
                            "NOT_CHECKED"
                        ).toUpperCase();


                    inspection.recordMap[
                        checkKey
                        ] =
                        record;
                }


                if (
                    !inspection.notes &&
                    record.remarks
                ) {

                    inspection.notes =
                        record.remarks;
                }

            }
        );


        return Array.from(
            grouped.values()
        ).map(
            (inspection) => {

                const values =
                    Object.values(
                        inspection.checks
                    ).map(
                        (value) =>
                            String(
                                value
                            ).toUpperCase()
                    );


                // =================================================
                // CALCULATE OVERALL CONDITION
                // =================================================

                let overall =
                    "NOT_CHECKED";


                if (
                    values.includes(
                        "CRITICAL"
                    )
                ) {

                    overall =
                        "CRITICAL";

                } else if (
                    values.includes(
                        "ATTENTION"
                    )
                ) {

                    overall =
                        "ATTENTION";

                } else if (
                    values.length > 0 &&
                    values.every(
                        (value) =>
                            value ===
                            "GOOD"
                    )
                ) {

                    overall =
                        "GOOD";
                }


                // =================================================
                // CALCULATE COMPLETION
                // =================================================

                const checkedCount =
                    values.filter(
                        (value) =>
                            value !==
                            "NOT_CHECKED"
                    ).length;


                let status =
                    "PENDING";


                if (
                    checkedCount > 0 &&
                    checkedCount <
                    values.length
                ) {

                    status =
                        "IN_PROGRESS";
                }


                if (
                    checkedCount ===
                    values.length &&
                    values.length > 0
                ) {

                    status =
                        "COMPLETED";
                }


                return {

                    ...inspection,

                    overall,

                    status,

                };
            }
        );

    }, [
        inspectionRecords,
        technicianAssignments,
    ]);


    // =========================================================
    // STATISTICS
    // =========================================================

    const stats = useMemo(() => {

        return {

            total:
            inspections.length,

            pending:
            inspections.filter(
                (item) =>
                    item.status ===
                    "PENDING"
            ).length,

            inProgress:
            inspections.filter(
                (item) =>
                    item.status ===
                    "IN_PROGRESS"
            ).length,

            completed:
            inspections.filter(
                (item) =>
                    item.status ===
                    "COMPLETED"
            ).length,

            attention:
            inspections.filter(
                (item) =>
                    item.overall ===
                    "ATTENTION"
            ).length,

            critical:
            inspections.filter(
                (item) =>
                    item.overall ===
                    "CRITICAL"
            ).length,

        };

    }, [inspections]);


    // =========================================================
    // FILTER
    // =========================================================

    const filteredInspections =
        useMemo(() => {

            const query =
                search
                    .trim()
                    .toLowerCase();


            return inspections.filter(
                (inspection) => {

                    const matchesSearch =
                        !query ||

                        inspection.inspectionNo
                            .toLowerCase()
                            .includes(query) ||

                        inspection.jobCardNo
                            .toLowerCase()
                            .includes(query) ||

                        inspection.customer
                            .toLowerCase()
                            .includes(query) ||

                        inspection.vehicle
                            .toLowerCase()
                            .includes(query) ||

                        inspection.registration
                            .toLowerCase()
                            .includes(query) ||

                        inspection.technician
                            .toLowerCase()
                            .includes(query);


                    const matchesStatus =
                        statusFilter ===
                        "ALL" ||
                        inspection.status ===
                        statusFilter;


                    const matchesCondition =
                        conditionFilter ===
                        "ALL" ||
                        inspection.overall ===
                        conditionFilter;


                    return (
                        matchesSearch &&
                        matchesStatus &&
                        matchesCondition
                    );
                }
            );

        }, [
            inspections,
            search,
            statusFilter,
            conditionFilter,
        ]);


    // =========================================================
    // FORM
    // =========================================================

    const resetForm = () => {

        setFormData({

            ...emptyForm,

            checks: {
                ...emptyForm.checks,
            },

        });
    };


    const openCreateModal = () => {

        setEditingInspection(
            null
        );

        resetForm();

        setError("");

        setShowModal(true);
    };


    const openEditModal = (
        inspection
    ) => {

        setEditingInspection(
            inspection
        );


        setFormData({

            jobCardId:
            inspection.jobCardId,

            jobCardNo:
            inspection.jobCardNo,

            customer:
            inspection.customer,

            vehicle:
            inspection.vehicle,

            registration:
            inspection.registration,

            technicianId:
                inspection.technicianId ||
                "",

            technician:
                inspection.technician ||
                "Not Assigned",

            date:
            inspection.date,

            complaint:
            inspection.complaint,

            notes:
            inspection.notes,

            recommendation:
            inspection.recommendation,

            checks: {
                ...inspection.checks,
            },

        });


        setError("");

        setShowModal(true);
    };


    const handleChange = (
        event
    ) => {

        const {
            name,
            value,
        } = event.target;


        setFormData(
            (previous) => ({

                ...previous,

                [name]:
                value,

            })
        );
    };


    // =========================================================
    // JOB CARD CHANGE
    // =========================================================

    const handleJobCardChange =
        (event) => {

            const jobCardId =
                event.target.value;


            const selectedJobCard =
                jobCards.find(
                    (jobCard) =>
                        String(
                            jobCard.id
                        ) ===
                        String(
                            jobCardId
                        )
                );


            if (
                !selectedJobCard
            ) {

                setFormData(
                    (previous) => ({

                        ...previous,

                        jobCardId: "",

                        jobCardNo: "",

                        customer: "",

                        vehicle: "",

                        registration: "",

                        technicianId: "",

                        technician:
                            "Not Assigned",

                    })
                );

                return;
            }


            const assignment =
                getJobCardTechnician(
                    selectedJobCard.id
                );


            setFormData(
                (previous) => ({

                    ...previous,

                    jobCardId:
                    selectedJobCard.id,

                    jobCardNo:
                        selectedJobCard.jobCardNumber ||
                        `JC-${selectedJobCard.id}`,

                    customer:
                        selectedJobCard.customerName ||
                        "Customer",

                    vehicle:
                        [
                            selectedJobCard.vehicleMake,
                            selectedJobCard.vehicleModel,
                        ]
                            .filter(Boolean)
                            .join(" ") ||
                        "Vehicle",

                    registration:
                        selectedJobCard.vehicleNumber ||
                        "",

                    technicianId:
                    assignment.technicianId,

                    technician:
                    assignment.technician,

                })
            );
        };


    // =========================================================
    // TECHNICIAN CHANGE
    // =========================================================

    const handleTechnicianChange =
        (event) => {

            const technicianId =
                event.target.value;


            const selectedTechnician =
                technicians.find(
                    (technician) =>
                        String(
                            technician.id
                        ) ===
                        String(
                            technicianId
                        )
                );


            setFormData(
                (previous) => ({

                    ...previous,

                    technicianId,

                    technician:
                        selectedTechnician
                            ?.name ||
                        selectedTechnician
                            ?.technicianCode ||
                        "Not Assigned",

                })
            );
        };


    // =========================================================
    // UPDATE CHECK
    // =========================================================

    const updateCheck = (
        key,
        value
    ) => {

        setFormData(
            (previous) => ({

                ...previous,

                checks: {

                    ...previous.checks,

                    [key]:
                    value,

                },

            })
        );
    };


    // =========================================================
    // SAVE TECHNICIAN ASSIGNMENT
    // =========================================================

    const saveTechnicianAssignment =
        async () => {

            if (
                !formData.jobCardId ||
                !formData.technicianId
            ) {

                return;
            }


            const existingAssignment =
                technicianAssignments.find(
                    (assignment) =>
                        String(
                            assignment.jobCardId
                        ) ===
                        String(
                            formData.jobCardId
                        ) &&
                        String(
                            assignment.status
                        ).toUpperCase() !==
                        "CANCELLED"
                );


            if (
                existingAssignment
            ) {

                if (
                    String(
                        existingAssignment.technicianId
                    ) ===
                    String(
                        formData.technicianId
                    )
                ) {

                    return;
                }


                await jobCardTechnicianService
                    .updateAssignment(
                        existingAssignment.id,
                        {

                            jobCardId:
                                Number(
                                    formData.jobCardId
                                ),

                            technicianId:
                                Number(
                                    formData.technicianId
                                ),

                            estimatedHours:
                                existingAssignment
                                    .estimatedHours ??
                                null,

                            actualHours:
                                existingAssignment
                                    .actualHours ??
                                null,

                            notes:
                                existingAssignment
                                    .notes ??
                                null,

                        }
                    );

                return;
            }


            await jobCardTechnicianService
                .assignTechnician({

                    jobCardId:
                        Number(
                            formData.jobCardId
                        ),

                    technicianId:
                        Number(
                            formData.technicianId
                        ),

                    estimatedHours:
                        null,

                    actualHours:
                        null,

                    notes:
                        null,

                });
        };


    // =========================================================
    // CREATE / UPDATE INSPECTION
    // =========================================================

    const handleSubmit =
        async (event) => {

            event.preventDefault();


            if (
                !formData.jobCardId
            ) {

                setError(
                    "Please select a Job Card."
                );

                return;
            }


            try {

                setSaving(true);

                setError("");


                // -------------------------------------------------
                // SAVE INSPECTION
                // -------------------------------------------------

                if (
                    editingInspection
                ) {

                    const updateRequests =
                        [];


                    for (
                        const item of
                        checkItems
                        ) {

                        const currentStatus =
                            formData
                                .checks[
                                item.key
                                ];


                        const existingRecord =
                            editingInspection
                                .recordMap[
                                item.key
                                ];


                        if (
                            existingRecord
                        ) {

                            updateRequests.push(

                                inspectionService
                                    .updateInspection(
                                        existingRecord.id,
                                        {

                                            jobCardId:
                                            formData.jobCardId,

                                            inspectionCategory:
                                            item.category,

                                            inspectionItem:
                                            item.label,

                                            conditionStatus:
                                            currentStatus,

                                            remarks:
                                                formData.notes ||
                                                null,

                                        }
                                    )

                            );

                        } else if (
                            currentStatus !==
                            "NOT_CHECKED"
                        ) {

                            updateRequests.push(

                                inspectionService
                                    .createInspection(
                                        {

                                            jobCardId:
                                            formData.jobCardId,

                                            inspectionCategory:
                                            item.category,

                                            inspectionItem:
                                            item.label,

                                            conditionStatus:
                                            currentStatus,

                                            remarks:
                                                formData.notes ||
                                                null,

                                        }
                                    )

                            );
                        }
                    }


                    await Promise.all(
                        updateRequests
                    );

                } else {

                    const createRequests =
                        checkItems

                            .filter(
                                (item) =>
                                    formData
                                        .checks[
                                        item.key
                                        ] !==
                                    "NOT_CHECKED"
                            )

                            .map(
                                (item) =>

                                    inspectionService
                                        .createInspection(
                                            {

                                                jobCardId:
                                                formData.jobCardId,

                                                inspectionCategory:
                                                item.category,

                                                inspectionItem:
                                                item.label,

                                                conditionStatus:
                                                    formData
                                                        .checks[
                                                        item.key
                                                        ],

                                                remarks:
                                                    formData.notes ||
                                                    null,

                                            }
                                        )
                            );


                    if (
                        createRequests.length ===
                        0
                    ) {

                        setError(
                            "Please complete at least one inspection check."
                        );

                        return;
                    }


                    await Promise.all(
                        createRequests
                    );
                }


                // -------------------------------------------------
                // SAVE TECHNICIAN ASSIGNMENT
                // -------------------------------------------------

                if (
                    formData.technicianId
                ) {

                    await saveTechnicianAssignment();

                }


                // -------------------------------------------------
                // CLOSE
                // -------------------------------------------------

                setShowModal(false);

                setEditingInspection(
                    null
                );

                resetForm();


                await loadData();


            } catch (err) {

                console.error(
                    "Failed to save inspection:",
                    err
                );


                setError(
                    err.response?.data?.message ||
                    err.response?.data?.error ||
                    "Failed to save inspection."
                );

            } finally {

                setSaving(false);

            }
        };


    // =========================================================
    // VIEW
    // =========================================================

    const openViewModal =
        (inspection) => {

            setSelectedInspection(
                inspection
            );

            setShowViewModal(true);
        };


    const closeViewModal =
        () => {

            setSelectedInspection(
                null
            );

            setShowViewModal(
                false
            );
        };


    // =========================================================
    // HELPERS
    // =========================================================

    const getCheckInfo =
        (status) =>
            checkStatusConfig[
                String(
                    status || "NOT_CHECKED"
                ).toUpperCase()
                ] ||
            checkStatusConfig
                .NOT_CHECKED;


    const getInspectionStatusInfo =
        (status) =>
            inspectionStatusConfig[
                status
                ] ||
            inspectionStatusConfig
                .PENDING;


    // =========================================================
    // RENDER
    // =========================================================

    return (

        <div className="inspections-page">

            {error && (

                <div
                    style={{
                        marginBottom:
                            "16px",

                        padding:
                            "12px 16px",

                        borderRadius:
                            "10px",

                        border:
                            "1px solid rgba(255,80,80,0.3)",

                        background:
                            "rgba(255,80,80,0.08)",

                        color:
                            "#ff8a8a",
                    }}
                >

                    {error}

                </div>

            )}


            <div className="inspections-header">

                <div>

                    <div className="page-breadcrumb">

                        Workshop{" "}

                        <span>
                            /
                        </span>{" "}

                        Inspections

                    </div>


                    <h1>
                        Vehicle Inspections
                    </h1>


                    <p>
                        Record vehicle condition,
                        identify issues and prepare
                        repair recommendations.
                    </p>

                </div>


                <button
                    className="primary-button"
                    onClick={
                        openCreateModal
                    }
                >

                    <Plus size={18} />

                    New Inspection

                </button>

            </div>


            <div className="inspection-stats-grid">

                <div className="inspection-stat-card">

                    <div className="inspection-stat-icon blue">

                        <ClipboardCheck
                            size={21}
                        />

                    </div>


                    <div>

                        <span>
                            Total Inspections
                        </span>

                        <strong>
                            {stats.total}
                        </strong>

                    </div>

                </div>


                <div className="inspection-stat-card">

                    <div className="inspection-stat-icon orange">

                        <CircleDot
                            size={21}
                        />

                    </div>


                    <div>

                        <span>
                            Pending
                        </span>

                        <strong>
                            {stats.pending}
                        </strong>

                    </div>

                </div>


                <div className="inspection-stat-card">

                    <div className="inspection-stat-icon purple">

                        <ClipboardCheck
                            size={21}
                        />

                    </div>


                    <div>

                        <span>
                            In Progress
                        </span>

                        <strong>
                            {stats.inProgress}
                        </strong>

                    </div>

                </div>


                <div className="inspection-stat-card">

                    <div className="inspection-stat-icon green">

                        <CheckCircle2
                            size={21}
                        />

                    </div>


                    <div>

                        <span>
                            Completed
                        </span>

                        <strong>
                            {stats.completed}
                        </strong>

                    </div>

                </div>


                <div className="inspection-stat-card">

                    <div className="inspection-stat-icon yellow">

                        <AlertTriangle
                            size={21}
                        />

                    </div>


                    <div>

                        <span>
                            Needs Attention
                        </span>

                        <strong>
                            {stats.attention}
                        </strong>

                    </div>

                </div>


                <div className="inspection-stat-card">

                    <div className="inspection-stat-icon red">

                        <ShieldCheck
                            size={21}
                        />

                    </div>


                    <div>

                        <span>
                            Critical
                        </span>

                        <strong>
                            {stats.critical}
                        </strong>

                    </div>

                </div>

            </div>


            <div className="inspections-panel">

                <div className="inspection-toolbar">

                    <div className="inspection-search">

                        <Search size={18} />

                        <input
                            value={search}
                            onChange={(event) =>
                                setSearch(
                                    event.target.value
                                )
                            }
                            placeholder="Search inspection, job card, customer, vehicle..."
                        />

                    </div>


                    <div className="inspection-filters">

                        <select
                            value={
                                statusFilter
                            }
                            onChange={(event) =>
                                setStatusFilter(
                                    event.target.value
                                )
                            }
                        >

                            <option value="ALL">
                                All Statuses
                            </option>

                            <option value="PENDING">
                                Pending
                            </option>

                            <option value="IN_PROGRESS">
                                In Progress
                            </option>

                            <option value="COMPLETED">
                                Completed
                            </option>

                        </select>


                        <select
                            value={
                                conditionFilter
                            }
                            onChange={(event) =>
                                setConditionFilter(
                                    event.target.value
                                )
                            }
                        >

                            <option value="ALL">
                                All Conditions
                            </option>

                            <option value="GOOD">
                                Good
                            </option>

                            <option value="ATTENTION">
                                Attention
                            </option>

                            <option value="CRITICAL">
                                Critical
                            </option>

                            <option value="NOT_CHECKED">
                                Not Checked
                            </option>

                        </select>

                    </div>

                </div>


                <div className="inspection-table-wrapper">

                    <table className="inspection-table">

                        <thead>

                        <tr>

                            <th>
                                Inspection
                            </th>

                            <th>
                                Job Card
                            </th>

                            <th>
                                Customer
                            </th>

                            <th>
                                Vehicle
                            </th>

                            <th>
                                Technician
                            </th>

                            <th>
                                Date
                            </th>

                            <th>
                                Condition
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
                                    colSpan="9"
                                >

                                    <div className="empty-state">

                                        <ClipboardCheck
                                            size={42}
                                        />

                                        <h3>
                                            Loading inspections...
                                        </h3>

                                        <p>
                                            Fetching inspection
                                            data from the
                                            workshop database.
                                        </p>

                                    </div>

                                </td>

                            </tr>

                        ) : filteredInspections.length === 0 ? (

                            <tr>

                                <td
                                    colSpan="9"
                                >

                                    <div className="empty-state">

                                        <ClipboardCheck
                                            size={42}
                                        />

                                        <h3>
                                            No inspections found
                                        </h3>

                                        <p>
                                            Try changing your
                                            search or filters.
                                        </p>

                                    </div>

                                </td>

                            </tr>

                        ) : (

                            filteredInspections.map(
                                (inspection) => {

                                    const condition =
                                        getCheckInfo(
                                            inspection.overall
                                        );


                                    const status =
                                        getInspectionStatusInfo(
                                            inspection.status
                                        );


                                    const ConditionIcon =
                                        condition.icon;


                                    return (

                                        <tr
                                            key={
                                                inspection.id
                                            }
                                        >

                                            <td>

                                                <div className="inspection-number">

                                                    {
                                                        inspection.inspectionNo
                                                    }

                                                </div>

                                            </td>


                                            <td>

                                                <span className="job-card-reference">

                                                    {
                                                        inspection.jobCardNo
                                                    }

                                                </span>

                                            </td>


                                            <td>

                                                <div className="customer-cell">

                                                    <div className="avatar">

                                                        {inspection.customer
                                                            .charAt(
                                                                0
                                                            )
                                                            .toUpperCase()}

                                                    </div>


                                                    <div>

                                                        <strong>
                                                            {
                                                                inspection.customer
                                                            }
                                                        </strong>

                                                    </div>

                                                </div>

                                            </td>


                                            <td>

                                                <div className="vehicle-cell">

                                                    <Car size={16} />

                                                    <div>

                                                        <strong>
                                                            {
                                                                inspection.vehicle
                                                            }
                                                        </strong>

                                                        <span>
                                                            {
                                                                inspection.registration
                                                            }
                                                        </span>

                                                    </div>

                                                </div>

                                            </td>


                                            <td>

                                                <div className="technician-cell">

                                                    <Wrench
                                                        size={15}
                                                    />

                                                    {
                                                        inspection.technician
                                                    }

                                                </div>

                                            </td>


                                            <td>

                                                <div className="date-cell">

                                                    <CalendarDays
                                                        size={15}
                                                    />

                                                    {
                                                        inspection.date
                                                    }

                                                </div>

                                            </td>


                                            <td>

                                                <div
                                                    className={`condition-badge ${condition.className}`}
                                                >

                                                    <ConditionIcon
                                                        size={14}
                                                    />

                                                    {
                                                        condition.label
                                                    }

                                                </div>

                                            </td>


                                            <td>

                                                <div
                                                    className={`inspection-status ${status.className}`}
                                                >

                                                    {
                                                        status.label
                                                    }

                                                </div>

                                            </td>


                                            <td>

                                                <div className="action-buttons">

                                                    <button
                                                        className="icon-button"
                                                        title="View Inspection"
                                                        onClick={() =>
                                                            openViewModal(
                                                                inspection
                                                            )
                                                        }
                                                    >

                                                        <Eye
                                                            size={17}
                                                        />

                                                    </button>


                                                    <button
                                                        className="icon-button"
                                                        title="Edit Inspection"
                                                        onClick={() =>
                                                            openEditModal(
                                                                inspection
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


            {/* =====================================================
                CREATE / EDIT MODAL
            ===================================================== */}

            {showModal && (

                <div
                    className="modal-overlay"
                    onMouseDown={(event) => {

                        if (
                            event.target ===
                            event.currentTarget
                        ) {

                            setShowModal(
                                false
                            );

                        }

                    }}
                >

                    <div className="inspection-modal">

                        <div className="modal-header">

                            <div>

                                <span className="modal-eyebrow">
                                    Workshop Inspection
                                </span>

                                <h2>

                                    {editingInspection
                                        ? "Edit Inspection"
                                        : "New Vehicle Inspection"}

                                </h2>

                            </div>


                            <button
                                className="modal-close"
                                onClick={() =>
                                    setShowModal(
                                        false
                                    )
                                }
                            >

                                <X size={20} />

                            </button>

                        </div>


                        <form
                            onSubmit={
                                handleSubmit
                            }
                        >

                            <div className="form-section">

                                <div className="form-section-title">

                                    <Car size={17} />

                                    Vehicle Information

                                </div>


                                <div className="form-grid">

                                    <div className="form-field">

                                        <label>
                                            Job Card Number *
                                        </label>


                                        <select
                                            value={
                                                formData.jobCardId
                                            }
                                            onChange={
                                                handleJobCardChange
                                            }
                                            required
                                            disabled={
                                                Boolean(
                                                    editingInspection
                                                )
                                            }
                                        >

                                            <option value="">
                                                Select Job Card
                                            </option>


                                            {jobCards.map(
                                                (jobCard) => (

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
                                                        }

                                                        {" - "}

                                                        {
                                                            jobCard.vehicleNumber
                                                        }

                                                    </option>

                                                )
                                            )}

                                        </select>

                                    </div>


                                    <div className="form-field">

                                        <label>
                                            Inspection Date
                                        </label>


                                        <input
                                            name="date"
                                            value={
                                                formData.date
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            placeholder="Generated from backend"
                                            disabled
                                        />

                                    </div>


                                    <div className="form-field">

                                        <label>
                                            Customer Name
                                        </label>


                                        <input
                                            name="customer"
                                            value={
                                                formData.customer
                                            }
                                            disabled
                                            readOnly
                                        />

                                    </div>


                                    <div className="form-field">

                                        <label>
                                            Vehicle
                                        </label>


                                        <input
                                            name="vehicle"
                                            value={
                                                formData.vehicle
                                            }
                                            disabled
                                            readOnly
                                        />

                                    </div>


                                    <div className="form-field">

                                        <label>
                                            Registration Number
                                        </label>


                                        <input
                                            name="registration"
                                            value={
                                                formData.registration
                                            }
                                            disabled
                                            readOnly
                                        />

                                    </div>


                                    <div className="form-field">

                                        <label>
                                            Technician
                                        </label>


                                        <select
                                            name="technicianId"
                                            value={
                                                formData.technicianId
                                            }
                                            onChange={
                                                handleTechnicianChange
                                            }
                                        >

                                            <option value="">
                                                Select Technician
                                            </option>


                                            {technicians
                                                .filter(
                                                    (technician) =>
                                                        String(
                                                            technician.status
                                                        ).toUpperCase() ===
                                                        "ACTIVE"
                                                )
                                                .map(
                                                    (technician) => (

                                                        <option
                                                            key={
                                                                technician.id
                                                            }
                                                            value={
                                                                technician.id
                                                            }
                                                        >

                                                            {
                                                                technician.technicianCode
                                                            }

                                                            {" - "}

                                                            {
                                                                technician.name
                                                            }

                                                        </option>

                                                    )
                                                )}

                                        </select>

                                    </div>


                                    <div className="form-field form-field-full">

                                        <label>
                                            Customer Complaint / Request
                                        </label>


                                        <textarea
                                            name="complaint"
                                            value={
                                                formData.complaint
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            rows="3"
                                            placeholder="Inspection complaint can be viewed from the Job Card."
                                        />

                                    </div>

                                </div>

                            </div>


                            {/* =================================================
                                VEHICLE INSPECTION CHECKLIST
                            ================================================= */}

                            <div className="form-section">

                                <div className="form-section-title">

                                    <ClipboardCheck
                                        size={17}
                                    />

                                    Vehicle Inspection Checklist

                                </div>


                                <div className="checklist-grid">

                                    {checkItems.map(
                                        (item) => {

                                            const currentStatus =
                                                formData
                                                    .checks[
                                                    item.key
                                                    ];


                                            return (

                                                <div
                                                    className="checklist-item"
                                                    key={
                                                        item.key
                                                    }
                                                >

                                                    <div className="checklist-label">

                                                        <span>
                                                            {
                                                                item.label
                                                            }
                                                        </span>


                                                        <small>

                                                            {
                                                                getCheckInfo(
                                                                    currentStatus
                                                                )
                                                                    .label
                                                            }

                                                        </small>

                                                    </div>


                                                    <div className="check-options">

                                                        {Object.entries(
                                                            checkStatusConfig
                                                        ).map(
                                                            ([
                                                                 value,
                                                                 config,
                                                             ]) => (

                                                                <button
                                                                    type="button"
                                                                    key={
                                                                        value
                                                                    }
                                                                    className={`check-option ${config.className} ${
                                                                        currentStatus ===
                                                                        value
                                                                            ? "selected"
                                                                            : ""
                                                                    }`}
                                                                    onClick={() =>
                                                                        updateCheck(
                                                                            item.key,
                                                                            value
                                                                        )
                                                                    }
                                                                >

                                                                    {
                                                                        config.label
                                                                    }

                                                                </button>

                                                            )
                                                        )}

                                                    </div>

                                                </div>

                                            );

                                        }
                                    )}

                                </div>

                            </div>


                            {/* =================================================
                                FINDINGS & RECOMMENDATIONS
                            ================================================= */}

                            <div className="form-section">

                                <div className="form-section-title">

                                    <FileText size={17} />

                                    Findings & Recommendations

                                </div>


                                <div className="form-grid">

                                    <div className="form-field form-field-full">

                                        <label>
                                            Technician Observations
                                        </label>


                                        <textarea
                                            name="notes"
                                            value={
                                                formData.notes
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            rows="4"
                                            placeholder="Record detailed inspection findings..."
                                        />

                                    </div>


                                    <div className="form-field form-field-full">

                                        <label>
                                            Recommended Services / Repairs
                                        </label>


                                        <textarea
                                            name="recommendation"
                                            value={
                                                formData.recommendation
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            rows="4"
                                            placeholder="Recommendations will be connected to Estimates in the next module."
                                        />

                                    </div>

                                </div>

                            </div>


                            <div className="modal-footer">

                                <button
                                    type="button"
                                    className="secondary-button"
                                    onClick={() =>
                                        setShowModal(
                                            false
                                        )
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
                                        : editingInspection
                                            ? "Update Inspection"
                                            : "Save Inspection"}

                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}


            {/* =====================================================
                VIEW MODAL
            ===================================================== */}

            {showViewModal &&
                selectedInspection && (

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

                        <div className="inspection-view-modal">

                            <div className="modal-header">

                                <div>

                                    <span className="modal-eyebrow">

                                        {
                                            selectedInspection.jobCardNo
                                        }

                                    </span>


                                    <h2>

                                        {
                                            selectedInspection.inspectionNo
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


                            <div className="inspection-view-content">

                                <div className="inspection-summary">

                                    <div className="summary-vehicle">

                                        <div className="vehicle-large-icon">

                                            <Car size={27} />

                                        </div>


                                        <div>

                                            <h3>

                                                {
                                                    selectedInspection.vehicle
                                                }

                                            </h3>


                                            <span>

                                                {
                                                    selectedInspection.registration
                                                }

                                            </span>

                                        </div>

                                    </div>


                                    <div className="summary-status">

                                        <span>
                                            Overall Condition
                                        </span>


                                        <div
                                            className={`condition-badge ${
                                                getCheckInfo(
                                                    selectedInspection.overall
                                                )
                                                    .className
                                            }`}
                                        >

                                            {(() => {

                                                const Icon =
                                                    getCheckInfo(
                                                        selectedInspection.overall
                                                    )
                                                        .icon;


                                                return (

                                                    <Icon
                                                        size={
                                                            15
                                                        }
                                                    />

                                                );

                                            })()}


                                            {
                                                getCheckInfo(
                                                    selectedInspection.overall
                                                )
                                                    .label
                                            }

                                        </div>

                                    </div>

                                </div>


                                <div className="inspection-info-grid">

                                    <div>

                                        <span>
                                            Customer
                                        </span>


                                        <strong>

                                            {
                                                selectedInspection.customer
                                            }

                                        </strong>

                                    </div>


                                    <div>

                                        <span>
                                            Technician
                                        </span>


                                        <strong>

                                            {
                                                selectedInspection.technician
                                            }

                                        </strong>

                                    </div>


                                    <div>

                                        <span>
                                            Inspection Date
                                        </span>


                                        <strong>

                                            {
                                                selectedInspection.date
                                            }

                                        </strong>

                                    </div>


                                    <div>

                                        <span>
                                            Status
                                        </span>


                                        <strong>

                                            {
                                                getInspectionStatusInfo(
                                                    selectedInspection.status
                                                )
                                                    .label
                                            }

                                        </strong>

                                    </div>

                                </div>


                                <div className="view-section">

                                    <div className="view-section-title">

                                        <ClipboardCheck
                                            size={17}
                                        />

                                        Inspection Results

                                    </div>


                                    <div className="results-grid">

                                        {checkItems.map(
                                            (item) => {

                                                const result =
                                                    selectedInspection
                                                        .checks[
                                                        item.key
                                                        ];


                                                const config =
                                                    getCheckInfo(
                                                        result
                                                    );


                                                const Icon =
                                                    config.icon;


                                                return (

                                                    <div
                                                        className="result-item"
                                                        key={
                                                            item.key
                                                        }
                                                    >

                                                        <span>

                                                            {
                                                                item.label
                                                            }

                                                        </span>


                                                        <div
                                                            className={`result-status ${config.className}`}
                                                        >

                                                            <Icon
                                                                size={
                                                                    14
                                                                }
                                                            />


                                                            {
                                                                config.label
                                                            }

                                                        </div>

                                                    </div>

                                                );

                                            }
                                        )}

                                    </div>

                                </div>


                                <div className="view-section">

                                    <div className="view-section-title">

                                        <AlertTriangle
                                            size={17}
                                        />

                                        Technician Observations

                                    </div>


                                    <div className="observation-box">

                                        {
                                            selectedInspection.notes ||
                                            "No observations recorded."
                                        }

                                    </div>

                                </div>


                                <div className="view-section">

                                    <div className="view-section-title">

                                        <Wrench
                                            size={17}
                                        />

                                        Recommended Services

                                    </div>


                                    <div className="recommendation-box">

                                        {
                                            selectedInspection.recommendation ||
                                            "Recommendations will be handled through the Estimates module."
                                        }

                                    </div>

                                </div>


                                <div className="view-actions">

                                    <button
                                        className="secondary-button"
                                        onClick={() => {

                                            closeViewModal();

                                            openEditModal(
                                                selectedInspection
                                            );

                                        }}
                                    >

                                        <Edit3
                                            size={17}
                                        />

                                        Edit Inspection

                                    </button>

                                </div>

                            </div>

                        </div>

                    </div>

                )}

        </div>

    );
}


export default Inspections;