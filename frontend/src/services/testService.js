import api from "./api";

const testService = {
    async testBackendConnection() {
        const response = await api.get("/api/test/public");

        return response.data;
    },
};

export default testService;