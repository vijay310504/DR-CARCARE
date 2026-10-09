import api from "./api";

const purchaseService = {
    async getAllPurchases() {
        const response = await api.get("/api/purchases");
        return response.data;
    },

    async getPurchaseById(id) {
        const response = await api.get(`/api/purchases/${id}`);
        return response.data;
    },

    async getPurchasesByVendor(vendorId) {
        const response = await api.get(
            `/api/purchases/vendor/${vendorId}`
        );
        return response.data;
    },

    async getPurchasesByStatus(status) {
        const response = await api.get(
            `/api/purchases/status/${status}`
        );
        return response.data;
    },

    async createPurchase(purchaseData) {
        const response = await api.post(
            "/api/purchases",
            purchaseData
        );

        return response.data;
    },

    async markOrdered(id) {
        const response = await api.patch(
            `/api/purchases/${id}/order`
        );

        return response.data;
    },

    async receivePurchase(id) {
        const response = await api.patch(
            `/api/purchases/${id}/receive`
        );

        return response.data;
    },

    async cancelPurchase(id) {
        const response = await api.patch(
            `/api/purchases/${id}/cancel`
        );

        return response.data;
    },

};

export default purchaseService;