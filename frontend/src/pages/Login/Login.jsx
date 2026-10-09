import { useState } from "react";
import { Eye, EyeOff, LockKeyhole, Mail, Wrench } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Login.css";

function Login() {
    const navigate = useNavigate();
    const { login, loading } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");

        if (!email.trim() || !password) {
            setError("Please enter your email and password.");
            return;
        }

        const result = await login(
            email.trim(),
            password
        );

        if (result.success) {
            navigate("/dashboard", {
                replace: true,
            });
        } else {
            setError(result.error);
        }
    };

    return (
        <div className="login-page">
            <div className="login-background">
                <div className="login-glow login-glow-one"></div>
                <div className="login-glow login-glow-two"></div>
            </div>

            <div className="login-container">

                {/* Brand */}
                <div className="login-brand">
                    <div className="login-brand-icon">
                        <Wrench size={28} />
                    </div>

                    <div>
                        <h1>DR.CARCARE</h1>
                        <span>Smart Car Garage Management</span>
                    </div>
                </div>

                {/* Login Card */}
                <div className="login-card">

                    <div className="login-heading">
                        <h2>Welcome Back</h2>

                        <p>
                            Sign in to manage your garage
                            operations.
                        </p>
                    </div>

                    {error && (
                        <div className="login-error">
                            {error}
                        </div>
                    )}

                    <form
                        className="login-form"
                        onSubmit={handleSubmit}
                    >

                        {/* Email */}
                        <div className="login-field">
                            <label htmlFor="email">
                                Email Address
                            </label>

                            <div className="login-input-wrapper">
                                <Mail size={18} />

                                <input
                                    id="email"
                                    type="email"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(event) =>
                                        setEmail(event.target.value)
                                    }
                                    autoComplete="email"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="login-field">
                            <label htmlFor="password">
                                Password
                            </label>

                            <div className="login-input-wrapper">
                                <LockKeyhole size={18} />

                                <input
                                    id="password"
                                    type={
                                        showPassword
                                            ? "text"
                                            : "password"
                                    }
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(event) =>
                                        setPassword(event.target.value)
                                    }
                                    autoComplete="current-password"
                                />

                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() =>
                                        setShowPassword(
                                            !showPassword
                                        )
                                    }
                                    aria-label={
                                        showPassword
                                            ? "Hide password"
                                            : "Show password"
                                    }
                                >
                                    {showPassword ? (
                                        <EyeOff size={18} />
                                    ) : (
                                        <Eye size={18} />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            className="login-submit"
                            disabled={loading}
                        >
                            {loading
                                ? "Signing in..."
                                : "Sign In"}
                        </button>

                    </form>

                    <div className="login-footer">
                        <span>
                            DR.CARCARE Workshop Management System
                        </span>
                    </div>

                </div>

            </div>
        </div>
    );
}

export default Login;