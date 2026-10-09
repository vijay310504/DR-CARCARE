import api from "./api";

const accountingService = {
    // =========================================================
    // DAY BOOK
    // =========================================================

    async getDayBookEntries() {
        const response = await api.get("/api/day-book");
        return response.data;
    },

    async getDayBookEntriesByDateRange(fromDate, toDate) {
        const response = await api.get("/api/day-book/date-range", {
            params: {
                fromDate,
                toDate,
            },
        });

        return response.data;
    },

    async getDayBookEntriesByType(entryType) {
        const response = await api.get(
            `/api/day-book/type/${encodeURIComponent(entryType)}`
        );

        return response.data;
    },

    async getDayBookSummary(fromDate, toDate) {
        const response = await api.get("/api/day-book/summary", {
            params: {
                fromDate,
                toDate,
            },
        });

        return response.data;
    },

    // =========================================================
    // JOURNAL ENTRIES
    // =========================================================

    async getJournalEntries() {
        const response = await api.get(
            "/api/accounting/journal-entries"
        );

        return response.data;
    },

    async getJournalEntriesByDateRange(fromDate, toDate) {
        const response = await api.get(
            "/api/accounting/journal-entries/date-range",
            {
                params: {
                    fromDate,
                    toDate,
                },
            }
        );

        return response.data;
    },
};

export default accountingService;