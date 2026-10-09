import {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";

import authService from "../services/authService";
import auth from "../utils/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => auth.getUser());
    const [loading, setLoading] = useState(false);

    const isAuthenticated = Boolean(
        user && auth.getToken()
    );

    const login = async (email, password) => {
        setLoading(true);

        try {
            const response = await authService.login(
                email,
                password
            );

            auth.setToken(response.token);

            const userData = {
                userId: response.userId,
                name: response.name,
                email: response.email,
                roles: response.roles || [],
            };

            auth.setUser(userData);
            setUser(userData);

            return {
                success: true,
                data: response,
            };
        } catch (error) {
            console.error("Login failed:", error);

            return {
                success: false,
                error:
                    error.response?.data?.message ||
                    error.response?.data?.error ||
                    "Invalid email or password.",
            };
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        auth.logout();
        setUser(null);
    };

    useEffect(() => {
        const storedUser = auth.getUser();
        const token = auth.getToken();

        if (storedUser && token) {
            setUser(storedUser);
        } else {
            setUser(null);
        }
    }, []);

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                isAuthenticated,
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error(
            "useAuth must be used inside an AuthProvider"
        );
    }

    return context;
}