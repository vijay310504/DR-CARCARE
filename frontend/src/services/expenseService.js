import api from "./api";

const expenseService = {
    // =========================================================
    // GET ALL EXPENSES
    // =========================================================
    async getAllExpenses() {
        const response = await api.get("/api/expenses");
        return response.data;
    },

    // =========================================================
    // GET EXPENSE BY ID
    // =========================================================
    async getExpenseById(id) {
        const response = await api.get(`/api/expenses/${id}`);
        return response.data;
    },

    // =========================================================
    // CREATE EXPENSE
    // =========================================================
    async createExpense(expenseData) {
        const response = await api.post("/api/expenses", {
            expenseDate: expenseData.expenseDate || null,
            category: expenseData.category?.trim(),
            description: expenseData.description?.trim(),
            amount: Number(expenseData.amount),
            paymentMethod: expenseData.paymentMethod,
            referenceNumber:
                expenseData.referenceNumber?.trim() || null,
            notes:
                expenseData.notes?.trim() || null,
        });

        return response.data;
    },

    // =========================================================
    // GET EXPENSES BY CATEGORY
    // =========================================================
    async getExpensesByCategory(category) {
        const response = await api.get(
            `/api/expenses/category/${encodeURIComponent(category)}`
        );

        return response.data;
    },

    // =========================================================
    // GET EXPENSES BY DATE RANGE
    // =========================================================
    async getExpensesByDateRange(fromDate, toDate) {
        const response = await api.get("/api/expenses/date-range", {
            params: {
                fromDate,
                toDate,
            },
        });

        return response.data;
    },
};

export default expenseService;