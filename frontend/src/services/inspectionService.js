import api from "./api";

// =========================================================
// INSPECTION SERVICE
// =========================================================

const inspectionService = {

    // =========================================================
    // GET ALL INSPECTIONS
    // GET /api/inspections
    // =========================================================

    getAllInspections: async () => {

        const response = await api.get(
            "/api/inspections"
        );

        return response.data;
    },


    // =========================================================
    // GET INSPECTION BY ID
    // GET /api/inspections/{id}
    // =========================================================

    getInspectionById: async (id) => {

        const response = await api.get(
            `/api/inspections/${id}`
        );

        return response.data;
    },


    // =========================================================
    // CREATE INSPECTION
    // POST /api/inspections
    // =========================================================

    createInspection: async (inspectionData) => {

        const response = await api.post(
            "/api/inspections",
            inspectionData
        );

        return response.data;
    },


    // =========================================================
    // UPDATE INSPECTION
    // PUT /api/inspections/{id}
    // =========================================================

    updateInspection: async (
        id,
        inspectionData
    ) => {

        const response = await api.put(
            `/api/inspections/${id}`,
            inspectionData
        );

        return response.data;
    },


    // =========================================================
    // DELETE INSPECTION
    // DELETE /api/inspections/{id}
    // =========================================================

    deleteInspection: async (id) => {

        await api.delete(
            `/api/inspections/${id}`
        );
    },


    // =========================================================
    // GET INSPECTIONS BY JOB CARD
    // GET /api/inspections/job-card/{jobCardId}
    // =========================================================

    getInspectionsByJobCard: async (jobCardId) => {

        const response = await api.get(
            `/api/inspections/job-card/${jobCardId}`
        );

        return response.data;
    },


    // =========================================================
    // GET INSPECTIONS BY JOB CARD + CATEGORY
    // GET /api/inspections/job-card/{jobCardId}/category/{category}
    // =========================================================

    getInspectionsByJobCardAndCategory: async (
        jobCardId,
        category
    ) => {

        const response = await api.get(
            `/api/inspections/job-card/${jobCardId}/category/${encodeURIComponent(
                category
            )}`
        );

        return response.data;
    },


    // =========================================================
    // GET INSPECTIONS BY CONDITION
    // GET /api/inspections/condition/{condition}
    // =========================================================

    getInspectionsByCondition: async (
        condition
    ) => {

        const response = await api.get(
            `/api/inspections/condition/${encodeURIComponent(
                condition
            )}`
        );

        return response.data;
    },
};

export default inspectionService;