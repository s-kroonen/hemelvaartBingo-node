import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./config";
import api from "../api/client";
import { useAuthStore } from "../store/authStore";

export default function AuthProvider({ children }: any) {
    const setUser = useAuthStore((s) => s.setUser);
    const clearUser = useAuthStore((s) => s.clearUser);

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // If Firebase is not configured, skip auth and continue
        if (!auth) {
            console.warn("Firebase not available - skipping authentication");
            setLoading(false);
            return;
        }

        let timeout = setTimeout(() => {
            console.warn("Auth timeout → continuing without Firebase");
            setLoading(false);
        }, 3000); // fallback

        try {
            const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
                try {
                    if (firebaseUser) {
                        // Get ID token and store it
                        const token = await firebaseUser.getIdToken();
                        localStorage.setItem("authToken", token);

                        // Sync with backend to get user data (including currentMatchId)
                        const res = await api.get("/users/me");
                        setUser(res.data);
                    } else {
                        // User logged out
                        clearUser();
                    }
                } catch (err) {
                    console.error("Backend auth failed:", err);
                    clearUser();
                } finally {
                    clearTimeout(timeout);
                    setLoading(false);
                }
            });

            return () => {
                clearTimeout(timeout);
                unsub();
            };
        } catch (err) {
            console.error("Firebase init failed:", err);
            clearTimeout(timeout);
            setLoading(false);
        }
    }, [setUser, clearUser]);

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center">
                <div className="text-lg">Starting app...</div>
            </div>
        );
    }

    return children;
}