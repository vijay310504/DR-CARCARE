import api from "./api";

const vehicleService = {
    async getAllVehicles() {
        const response = await api.get("/api/vehicles");
        return response.data;
    },

    async getVehicleById(id) {
        const response = await api.get(`/api/vehicles/${id}`);
        return response.data;
    },

    async createVehicle(vehicleData) {
        const response = await api.post(
            "/api/vehicles",
            vehicleData
        );

        return response.data;
    },

    async updateVehicle(id, vehicleData) {
        const response = await api.put(
            `/api/vehicles/${id}`,
            vehicleData
        );

        return response.data;
    },

    async deactivateVehicle(id) {
        await api.delete(`/api/vehicles/${id}`);
    },

    async searchVehicles(keyword) {
        const response = await api.get(
            "/api/vehicles/search",
            {
                params: {
                    keyword,
                },
            }
        );

        return response.data;
    },

    async getVehiclesByCustomer(customerId) {
        const response = await api.get(
            `/api/vehicles/customer/${customerId}`
        );

        return response.data;
    },
};

export default vehicleService;