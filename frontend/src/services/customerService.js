import api from "./api";

const customerService = {
    async getAllCustomers() {
        const response = await api.get("/api/customers");
        return response.data;
    },

    async getCustomerById(id) {
        const response = await api.get(`/api/customers/${id}`);
        return response.data;
    },

    async createCustomer(customerData) {
        const response = await api.post(
            "/api/customers",
            customerData
        );
        return response.data;
    },

    async updateCustomer(id, customerData) {
        const response = await api.put(
            `/api/customers/${id}`,
            customerData
        );
        return response.data;
    },

    async deactivateCustomer(id) {
        await api.delete(`/api/customers/${id}`);
    },

    async searchCustomers(keyword) {
        const response = await api.get(
            "/api/customers/search",
            {
                params: {
                    keyword,
                },
            }
        );

        return response.data;
    },
};

export default customerService;