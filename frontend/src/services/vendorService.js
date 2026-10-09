import api from "./api";

const vendorService = {
    async getAllVendors() {
        const response = await api.get("/api/vendors");
        return response.data;
    },

    async getVendorById(id) {
        const response = await api.get(`/api/vendors/${id}`);
        return response.data;
    },

    async getActiveVendors() {
        const response = await api.get("/api/vendors/active");
        return response.data;
    },

    async searchVendors(name) {
        const response = await api.get("/api/vendors/search", {
            params: {
                name,
            },
        });

        return response.data;
    },

    async createVendor(vendorData) {
        const response = await api.post(
            "/api/vendors",
            vendorData
        );

        return response.data;
    },

    async updateVendor(id, vendorData) {
        const response = await api.put(
            `/api/vendors/${id}`,
            vendorData
        );

        return response.data;
    },

    async deactivateVendor(id) {
        const response = await api.patch(
            `/api/vendors/${id}/deactivate`
        );

        return response.data;
    },
};

export default vendorService;