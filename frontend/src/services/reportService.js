import api from "./api";

const reportService = {
    async getSummary(from, to) {
        const response = await api.get("/api/reports/summary", {
            params: {
                from,
                to,
            },
        });

        return response.data;
    },

    async getRevenueReport(from, to) {
        const response = await api.get("/api/reports/revenue", {
            params: {
                from,
                to,
            },
        });

        return response.data;
    },

    async getPaymentReport(from, to) {
        const response = await api.get("/api/reports/payments", {
            params: {
                from,
                to,
            },
        });

        return response.data;
    },

    async getExpenseReport(from, to) {
        const response = await api.get("/api/reports/expenses", {
            params: {
                from,
                to,
            },
        });

        return response.data;
    },

    async getOutstandingReport() {
        const response = await api.get("/api/reports/outstanding");

        return response.data;
    },

    async getJobCardReport(from, to) {
        const response = await api.get("/api/reports/job-cards", {
            params: {
                from,
                to,
            },
        });

        return response.data;
    },

    async getInventoryReport() {
        const response = await api.get("/api/reports/inventory");

        return response.data;
    },

    async getPurchaseReport(from, to) {
        const response = await api.get("/api/reports/purchases", {
            params: {
                from,
                to,
            },
        });

        return response.data;
    },
};

export default reportService;