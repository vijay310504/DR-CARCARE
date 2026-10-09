import api from "./api";

const technicianService = {

    // =========================================================
    // CREATE TECHNICIAN
    // POST /api/technicians
    // =========================================================

    createTechnician: async (technicianData) => {
        const response = await api.post(
            "/api/technicians",
            technicianData
        );

        return response.data;
    },


    // =========================================================
    // GET ALL TECHNICIANS
    // GET /api/technicians
    // =========================================================

    getAllTechnicians: async () => {
        const response = await api.get(
            "/api/technicians"
        );

        return response.data;
    },


    // =========================================================
    // GET TECHNICIAN BY ID
    // GET /api/technicians/{id}
    // =========================================================

    getTechnicianById: async (id) => {
        const response = await api.get(
            `/api/technicians/${id}`
        );

        return response.data;
    },


    // =========================================================
    // GET TECHNICIAN BY CODE
    // GET /api/technicians/code/{technicianCode}
    // =========================================================

    getTechnicianByCode: async (technicianCode) => {
        const response = await api.get(
            `/api/technicians/code/${encodeURIComponent(
                technicianCode
            )}`
        );

        return response.data;
    },


    // =========================================================
    // GET TECHNICIANS BY STATUS
    // GET /api/technicians/status/{status}
    // =========================================================

    getTechniciansByStatus: async (status) => {
        const response = await api.get(
            `/api/technicians/status/${encodeURIComponent(
                status
            )}`
        );

        return response.data;
    },


    // =========================================================
    // GET TECHNICIANS BY SPECIALIZATION
    // GET /api/technicians/specialization/{specialization}
    // =========================================================

    getTechniciansBySpecialization: async (
        specialization
    ) => {
        const response = await api.get(
            `/api/technicians/specialization/${encodeURIComponent(
                specialization
            )}`
        );

        return response.data;
    },


    // =========================================================
    // GET TECHNICIANS BY SKILL LEVEL
    // GET /api/technicians/skill-level/{skillLevel}
    // =========================================================

    getTechniciansBySkillLevel: async (
        skillLevel
    ) => {
        const response = await api.get(
            `/api/technicians/skill-level/${encodeURIComponent(
                skillLevel
            )}`
        );

        return response.data;
    },


    // =========================================================
    // UPDATE TECHNICIAN
    // PUT /api/technicians/{id}
    // =========================================================

    updateTechnician: async (
        id,
        technicianData
    ) => {
        const response = await api.put(
            `/api/technicians/${id}`,
            technicianData
        );

        return response.data;
    },


    // =========================================================
    // UPDATE STATUS
    // PATCH /api/technicians/{id}/status?status=ACTIVE
    // =========================================================

    updateStatus: async (
        id,
        status
    ) => {
        const response = await api.patch(
            `/api/technicians/${id}/status`,
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
    // ACTIVATE TECHNICIAN
    // PATCH /api/technicians/{id}/activate
    // =========================================================

    activateTechnician: async (id) => {
        const response = await api.patch(
            `/api/technicians/${id}/activate`
        );

        return response.data;
    },


    // =========================================================
    // DEACTIVATE TECHNICIAN
    // PATCH /api/technicians/{id}/deactivate
    // =========================================================

    deactivateTechnician: async (id) => {
        const response = await api.patch(
            `/api/technicians/${id}/deactivate`
        );

        return response.data;
    },


    // =========================================================
    // DELETE TECHNICIAN
    // DELETE /api/technicians/{id}
    // =========================================================

    deleteTechnician: async (id) => {
        await api.delete(
            `/api/technicians/${id}`
        );
    },
};

export default technicianService;