import { useState } from "react";
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "../firebase/config.ts";
import { useAuthStore } from "../store/authStore.ts";
import api from "../api/client.ts";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
    const setUser = useAuthStore((s) => s.setUser);
    const navigate = useNavigate();

    const [isRegister, setIsRegister] = useState(false);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // 🧼 Basic validation
    const validate = () => {
        if (!email.includes("@")) return "Invalid email";
        if (password.length < 6)
            return "Password must be at least 6 characters";
        return null;
    };

    const handleAuth = async () => {
        setError("");

        const validationError = validate();
        if (validationError) {
            setError(validationError);
            return;
        }

        try {
            setLoading(true);

            // 🔐 Firebase auth
            if (isRegister) {
                await createUserWithEmailAndPassword(auth, email, password);
            } else {
                await signInWithEmailAndPassword(auth, email, password);
            }

            // 🔑 Sync with backend (token auto added via axios interceptor)
            const res = await api.get("/users/me");

            setUser(res.data);

            navigate("/");
        } catch (err: any) {
            console.error(err);

            // Friendly Firebase errors
            if (err.code === "auth/email-already-in-use") {
                setError("Email already in use");
            } else if (err.code === "auth/invalid-credential") {
                setError("Invalid email or password");
            } else {
                setError("Something went wrong");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-screen items-center justify-center bg-gray-100">
            <div className="w-96 bg-white p-6 rounded-xl shadow-md space-y-4">
                <h1 className="text-2xl font-bold text-center">
                    {isRegister ? "Register" : "Login"}
                </h1>

                {/* Email */}
                <input
                    type="email"
                    placeholder="Email"
                    className="w-full border p-2 rounded"
                    value={email}
                    onChange={(e) => setEmail(e.target.value.trim())}
                />

                {/* Password */}
                <input
                    type="password"
                    placeholder="Password"
                    className="w-full border p-2 rounded"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                {/* Error */}
                {error && (
                    <div className="text-red-500 text-sm">{error}</div>
                )}

                {/* Action button */}
                <button
                    onClick={handleAuth}
                    disabled={loading}
                    className="w-full bg-blue-500 text-white p-2 rounded disabled:opacity-50"
                >
                    {loading
                        ? "Loading..."
                        : isRegister
                            ? "Register"
                            : "Login"}
                </button>

                {/* Toggle */}
                <div className="text-center text-sm">
                    {isRegister ? (
                        <>
                            Already have an account?{" "}
                            <button
                                className="text-blue-500"
                                onClick={() => setIsRegister(false)}
                            >
                                Login
                            </button>
                        </>
                    ) : (
                        <>
                            No account?{" "}
                            <button
                                className="text-blue-500"
                                onClick={() => setIsRegister(true)}
                            >
                                Register
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}