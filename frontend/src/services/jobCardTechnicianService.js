import api from "./api";

const jobCardTechnicianService = {

    // =========================================================
    // ASSIGN TECHNICIAN
    // POST /api/job-card-technicians
    // =========================================================

    assignTechnician: async (assignmentData) => {
        const response = await api.post(
            "/api/job-card-technicians",
            assignmentData
        );

        return response.data;
    },


    // =========================================================
    // GET ALL ASSIGNMENTS
    // GET /api/job-card-technicians
    // =========================================================

    getAllAssignments: async () => {
        const response = await api.get(
            "/api/job-card-technicians"
        );

        return response.data;
    },


    // =========================================================
    // GET ASSIGNMENT BY ID
    // GET /api/job-card-technicians/{id}
    // =========================================================

    getAssignmentById: async (id) => {
        const response = await api.get(
            `/api/job-card-technicians/${id}`
        );

        return response.data;
    },


    // =========================================================
    // GET ASSIGNMENTS BY JOB CARD
    // GET /api/job-card-technicians/job-card/{jobCardId}
    // =========================================================

    getAssignmentsByJobCard: async (jobCardId) => {
        const response = await api.get(
            `/api/job-card-technicians/job-card/${jobCardId}`
        );

        return response.data;
    },


    // =========================================================
    // GET ASSIGNMENTS BY TECHNICIAN
    // GET /api/job-card-technicians/technician/{technicianId}
    // =========================================================

    getAssignmentsByTechnician: async (technicianId) => {
        const response = await api.get(
            `/api/job-card-technicians/technician/${technicianId}`
        );

        return response.data;
    },


    // =========================================================
    // GET ASSIGNMENTS BY STATUS
    // GET /api/job-card-technicians/status/{status}
    // =========================================================

    getAssignmentsByStatus: async (status) => {
        const response = await api.get(
            `/api/job-card-technicians/status/${encodeURIComponent(
                status
            )}`
        );

        return response.data;
    },


    // =========================================================
    // UPDATE ASSIGNMENT
    // PUT /api/job-card-technicians/{id}
    // =========================================================

    updateAssignment: async (
        id,
        assignmentData
    ) => {
        const response = await api.put(
            `/api/job-card-technicians/${id}`,
            assignmentData
        );

        return response.data;
    },


    // =========================================================
    // UPDATE ASSIGNMENT STATUS
    // PATCH /api/job-card-technicians/{id}/status?status=...
    // =========================================================

    updateStatus: async (
        id,
        status
    ) => {
        const response = await api.patch(
            `/api/job-card-technicians/${id}/status`,
            null,
            {
                params: {
                    status: status,
                },
            }
        );

        return response.data;
    },


    // =========================================================
    // DELETE ASSIGNMENT
    // DELETE /api/job-card-technicians/{id}
    // =========================================================

    deleteAssignment: async (id) => {
        await api.delete(
            `/api/job-card-technicians/${id}`
        );
    },
};

export default jobCardTechnicianService;