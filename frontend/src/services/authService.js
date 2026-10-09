import api from "./api";

const authService = {
    async login(email, password) {
        const response = await api.post("/api/auth/login", {
            email,
            password,
        });

        return response.data;
    },

    async register(userData) {
        const response = await api.post("/api/auth/register", userData);

        return response.data;
    },
};

export default authService;