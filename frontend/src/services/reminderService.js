import api from "./api";

const reminderService = {
    // =========================================================
    // GET ALL
    // =========================================================

    async getAllReminders() {
        const response = await api.get("/api/reminders");
        return response.data;
    },

    // =========================================================
    // GET BY ID
    // =========================================================

    async getReminderById(id) {
        const response = await api.get(`/api/reminders/${id}`);
        return response.data;
    },

    // =========================================================
    // CREATE
    // =========================================================

    async createReminder(reminderData) {
        const response = await api.post("/api/reminders", {
            customerId: Number(reminderData.customerId),
            vehicleId: reminderData.vehicleId
                ? Number(reminderData.vehicleId)
                : null,
            reminderType: reminderData.reminderType,
            title: reminderData.title?.trim(),
            description: reminderData.description?.trim() || null,
            dueDate: reminderData.dueDate,
            status: reminderData.status || "PENDING",
            priority: reminderData.priority || "MEDIUM",
            notes: reminderData.notes?.trim() || null,
        });

        return response.data;
    },

    // =========================================================
    // UPDATE
    // =========================================================

    async updateReminder(id, reminderData) {
        const response = await api.put(`/api/reminders/${id}`, {
            customerId: Number(reminderData.customerId),
            vehicleId: reminderData.vehicleId
                ? Number(reminderData.vehicleId)
                : null,
            reminderType: reminderData.reminderType,
            title: reminderData.title?.trim(),
            description: reminderData.description?.trim() || null,
            dueDate: reminderData.dueDate,
            status: reminderData.status || "PENDING",
            priority: reminderData.priority || "MEDIUM",
            notes: reminderData.notes?.trim() || null,
        });

        return response.data;
    },

    // =========================================================
    // COMPLETE
    // =========================================================

    async completeReminder(id) {
        const response = await api.patch(
            `/api/reminders/${id}/complete`
        );

        return response.data;
    },

    // =========================================================
    // CANCEL
    // =========================================================

    async cancelReminder(id) {
        const response = await api.patch(
            `/api/reminders/${id}/cancel`
        );

        return response.data;
    },

    // =========================================================
    // DELETE
    // =========================================================

    async deleteReminder(id) {
        await api.delete(`/api/reminders/${id}`);
    },

    // =========================================================
    // PENDING
    // =========================================================

    async getPendingReminders() {
        const response = await api.get("/api/reminders/pending");
        return response.data;
    },

    // =========================================================
    // TODAY
    // =========================================================

    async getTodayReminders() {
        const response = await api.get("/api/reminders/today");
        return response.data;
    },

    // =========================================================
    // OVERDUE
    // =========================================================

    async getOverdueReminders() {
        const response = await api.get("/api/reminders/overdue");
        return response.data;
    },

    // =========================================================
    // BY CUSTOMER
    // =========================================================

    async getRemindersByCustomer(customerId) {
        const response = await api.get(
            `/api/reminders/customer/${customerId}`
        );

        return response.data;
    },

    // =========================================================
    // BY VEHICLE
    // =========================================================

    async getRemindersByVehicle(vehicleId) {
        const response = await api.get(
            `/api/reminders/vehicle/${vehicleId}`
        );

        return response.data;
    },
};

export default reminderService;