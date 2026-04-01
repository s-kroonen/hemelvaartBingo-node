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
        let timeout = setTimeout(() => {
            console.warn("Auth timeout → continuing without Firebase");
            setLoading(false);
        }, 3000); // fallback
        // if (!auth) {
        //     console.warn("Skipping auth (no Firebase)");
        //     setLoading(false);
        //     return;
        // }
        try {
            const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
                try {
                    if (firebaseUser) {
                        const res = await api.get("/users/me");
                        setUser(res.data);
                    } else {
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
    }, []);

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center">
                Starting app...
            </div>
        );
    }

    return children;
}