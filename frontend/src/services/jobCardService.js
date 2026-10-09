import api from "./api";

const jobCardService = {
    // =========================================================
    // GET ALL JOB CARDS
    // =========================================================
    async getAllJobCards() {
        const response = await api.get("/api/job-cards");
        return response.data;
    },

    // =========================================================
    // GET JOB CARD BY ID
    // =========================================================
    async getJobCardById(id) {
        const response = await api.get(`/api/job-cards/${id}`);
        return response.data;
    },

    // =========================================================
    // CREATE JOB CARD
    // =========================================================
    async createJobCard(jobCardData) {
        const response = await api.post(
            "/api/job-cards",
            jobCardData
        );

        return response.data;
    },

    // =========================================================
    // UPDATE JOB CARD
    // =========================================================
    async updateJobCard(id, jobCardData) {
        const response = await api.put(
            `/api/job-cards/${id}`,
            jobCardData
        );

        return response.data;
    },

    // =========================================================
    // UPDATE JOB CARD STATUS
    // =========================================================
    async updateJobCardStatus(id, status) {
        const response = await api.patch(
            `/api/job-cards/${id}/status`,
            null,
            {
                params: {
                    status,
                },
            }
        );

        return response.data;
    },

    // =========================================================
    // GET JOB CARD BY BOOKING
    // =========================================================
    async getJobCardByBooking(bookingId) {
        const response = await api.get(
            `/api/job-cards/booking/${bookingId}`
        );

        return response.data;
    },

    // =========================================================
    // GET JOB CARDS BY CUSTOMER
    // =========================================================
    async getJobCardsByCustomer(customerId) {
        const response = await api.get(
            `/api/job-cards/customer/${customerId}`
        );

        return response.data;
    },

    // =========================================================
    // GET JOB CARDS BY VEHICLE
    // =========================================================
    async getJobCardsByVehicle(vehicleId) {
        const response = await api.get(
            `/api/job-cards/vehicle/${vehicleId}`
        );

        return response.data;
    },

    // =========================================================
    // GET JOB CARDS BY STATUS
    // =========================================================
    async getJobCardsByStatus(status) {
        const response = await api.get(
            `/api/job-cards/status/${status}`
        );

        return response.data;
    },
};

export default jobCardService;