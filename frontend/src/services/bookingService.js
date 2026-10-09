import api from "./api";

const bookingService = {
    async getAllBookings() {
        const response = await api.get("/api/bookings");
        return response.data;
    },

    async getBookingById(id) {
        const response = await api.get(`/api/bookings/${id}`);
        return response.data;
    },

    async createBooking(bookingData) {
        const response = await api.post(
            "/api/bookings",
            bookingData
        );
        return response.data;
    },

    async updateBooking(id, bookingData) {
        const response = await api.put(
            `/api/bookings/${id}`,
            bookingData
        );
        return response.data;
    },

    async updateBookingStatus(id, status) {
        const response = await api.patch(
            `/api/bookings/${id}/status`,
            null,
            {
                params: {
                    status,
                },
            }
        );

        return response.data;
    },

    async cancelBooking(id) {
        await api.delete(`/api/bookings/${id}`);
    },

    async getBookingsByCustomer(customerId) {
        const response = await api.get(
            `/api/bookings/customer/${customerId}`
        );
        return response.data;
    },

    async getBookingsByVehicle(vehicleId) {
        const response = await api.get(
            `/api/bookings/vehicle/${vehicleId}`
        );
        return response.data;
    },

    async getBookingsByDate(date) {
        const response = await api.get(
            `/api/bookings/date/${date}`
        );
        return response.data;
    },

    async getBookingsByStatus(status) {
        const response = await api.get(
            `/api/bookings/status/${status}`
        );
        return response.data;
    },
};

export default bookingService;