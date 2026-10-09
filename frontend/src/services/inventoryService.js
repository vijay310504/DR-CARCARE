import api from "./api";

const inventoryService = {

    // ============================================================
    // INVENTORY ITEMS
    // ============================================================

    async getAllItems() {
        const response = await api.get("/api/inventory/items");
        return response.data;
    },

    async getItemById(id) {
        const response = await api.get(`/api/inventory/items/${id}`);
        return response.data;
    },

    async getActiveItems() {
        const response = await api.get("/api/inventory/items/active");
        return response.data;
    },

    async getLowStockItems() {
        const response = await api.get("/api/inventory/items/low-stock");
        return response.data;
    },

    async createItem(itemData) {
        const response = await api.post(
            "/api/inventory/items",
            itemData
        );

        return response.data;
    },

    async updateItem(id, itemData) {
        const response = await api.put(
            `/api/inventory/items/${id}`,
            itemData
        );

        return response.data;
    },

    // ============================================================
    // STOCK
    // ============================================================

    async adjustStock(id, adjustmentData) {
        const response = await api.patch(
            `/api/inventory/items/${id}/stock`,
            adjustmentData
        );

        return response.data;
    },

    async getTransactions(id) {
        const response = await api.get(
            `/api/inventory/items/${id}/transactions`
        );

        return response.data;
    },

    // ============================================================
    // JOB CARD PARTS
    // ============================================================

    async addPartToJobCard(partData) {
        const response = await api.post(
            "/api/inventory/job-card-parts",
            partData
        );

        return response.data;
    },

    async getPartsByJobCard(jobCardId) {
        const response = await api.get(
            `/api/inventory/job-card-parts/job-card/${jobCardId}`
        );

        return response.data;
    },

    async getPartsByInventoryItem(inventoryItemId) {
        const response = await api.get(
            `/api/inventory/job-card-parts/inventory-item/${inventoryItemId}`
        );

        return response.data;
    },
};

export default inventoryService;