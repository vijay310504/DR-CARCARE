import api from "./api";

const estimateService = {
    async getAllEstimates() {
        const response = await api.get("/api/estimates");
        return response.data;
    },

    async getEstimateById(id) {
        const response = await api.get(`/api/estimates/${id}`);
        return response.data;
    },

    async createEstimate(data) {
        const response = await api.post("/api/estimates", data);
        return response.data;
    },

    async updateEstimate(id, data) {
        const response = await api.put(
            `/api/estimates/${id}`,
            data
        );
        return response.data;
    },

    async deleteEstimate(id) {
        await api.delete(`/api/estimates/${id}`);
    },

    async addItem(estimateId, data) {
        const response = await api.post(
            `/api/estimates/${estimateId}/items`,
            {
                ...data,
                estimateId,
            }
        );

        return response.data;
    },

    async updateItem(estimateId, itemId, data) {
        const response = await api.put(
            `/api/estimates/${estimateId}/items/${itemId}`,
            {
                ...data,
                estimateId,
            }
        );

        return response.data;
    },

    async deleteItem(estimateId, itemId) {
        await api.delete(
            `/api/estimates/${estimateId}/items/${itemId}`
        );
    },

    async submitEstimate(id) {
        const response = await api.patch(
            `/api/estimates/${id}/submit`
        );

        return response.data;
    },

    async approveEstimate(id) {
        const response = await api.patch(
            `/api/estimates/${id}/approve`
        );

        return response.data;
    },

    async rejectEstimate(id, reason) {
        const response = await api.patch(
            `/api/estimates/${id}/reject`,
            null,
            {
                params: {
                    reason,
                },
            }
        );

        return response.data;
    },

    async getByJobCard(jobCardId) {
        const response = await api.get(
            `/api/estimates/job-card/${jobCardId}`
        );

        return response.data;
    },

    async getByStatus(status) {
        const response = await api.get(
            `/api/estimates/status/${status}`
        );

        return response.data;
    },
};

export default estimateService;