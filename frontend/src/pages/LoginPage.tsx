import { useState } from "react";
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "../firebase/config";
// import { useAuthStore } from "../store/authStore";
// import api from "../api/client";
import { useNavigate } from "react-router";

export default function LoginPage() {
    // const setUser = useAuthStore((s) => s.setUser);
    const navigate = useNavigate();

    const [isRegister, setIsRegister] = useState(false);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Check if Firebase is available
    const isFirebaseAvailable = !!auth;

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

        if (!isFirebaseAvailable) {
            setError("Firebase is not configured. Please set up environment variables.");
            return;
        }

        try {
            setLoading(true);

            // 🔐 Firebase auth
            let userCredential;
            if (isRegister) {
                userCredential = await createUserWithEmailAndPassword(
                    auth!,
                    email,
                    password
                );
            } else {
                userCredential = await signInWithEmailAndPassword(
                    auth!,
                    email,
                    password
                );
            }

            // Get and store the token
            const token = await userCredential.user.getIdToken();
            localStorage.setItem("authToken", token);

            // 🔑 Sync with backend (token auto added via axios interceptor)
            // const res = await api.get("/users/me");

            // setUser(res.data);

            navigate("/");
        } catch (err: any) {
            console.error(err);

            // Friendly Firebase errors
            if (err.code === "auth/email-already-in-use") {
                setError("Email already in use");
            } else if (err.code === "auth/invalid-credential") {
                setError("Invalid email or password");
            } else if (err.code === "auth/wrong-password") {
                setError("Invalid email or password");
            } else if (err.code === "auth/user-not-found") {
                setError("User not found");
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

                {!isFirebaseAvailable && (
                    <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-3 rounded text-sm">
                        ⚠️ Firebase not configured. Add environment variables to enable authentication.
                    </div>
                )}

                {/* Email */}
                <input
                    type="email"
                    placeholder="Email"
                    className="w-full border p-2 rounded"
                    value={email}
                    onChange={(e) => setEmail(e.target.value.trim())}
                    disabled={!isFirebaseAvailable}
                />

                {/* Password */}
                <input
                    type="password"
                    placeholder="Password"
                    className="w-full border p-2 rounded"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={!isFirebaseAvailable}
                />

                {/* Error */}
                {error && <div className="text-red-500 text-sm">{error}</div>}

                {/* Action button */}
                <button
                    onClick={handleAuth}
                    disabled={loading || !isFirebaseAvailable}
                    className="w-full bg-blue-500 text-white p-2 rounded disabled:opacity-50 hover:bg-blue-600 transition"
                >
                    {loading
                        ? "Loading..."
                        : isRegister
                            ? "Register"
                            : "Login"}
                </button>

                {/* Toggle */}
                {isFirebaseAvailable && (
                    <div className="text-center text-sm">
                        {isRegister ? (
                            <>
                                Already have an account?{" "}
                                <button
                                    className="text-blue-500 hover:underline"
                                    onClick={() => setIsRegister(false)}
                                >
                                    Login
                                </button>
                            </>
                        ) : (
                            <>
                                No account?{" "}
                                <button
                                    className="text-blue-500 hover:underline"
                                    onClick={() => setIsRegister(true)}
                                >
                                    Register
                                </button>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}