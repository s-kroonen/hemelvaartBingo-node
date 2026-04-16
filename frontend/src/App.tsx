import { RouterProvider } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { router } from "./routes";
import { Toaster } from "./components/ui/sonner";
// import { useEffect } from "react";
// import { useAuthStore } from "../store/authStore";
// import { useMatchStore } from "../store/matchStore";

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            retry: 1,
        },
    },
});

export default function App() {
    // const setUser = useAuthStore((state) => state.setUser);
    // const setCurrentMatchId = useMatchStore((state) => state.setCurrentMatchId);

    // useEffect(() => {
    //     // Mock user setup - in production, this would fetch from your auth endpoint
    //     // For demo purposes, set a mock user with roles
    //     const mockUser = {
    //         id: "1",
    //         email: "user@example.com",
    //         roles: ["user", "master", "admin"], // Change this based on what you want to test
    //     };
    //     setUser(mockUser);
    //
    //     // Set a default match ID for testing the leaderboard
    //     // In production, this would come from user selection or URL parameter
    //     setCurrentMatchId("match-1");
    // }, [setUser, setCurrentMatchId]);

    return (
        <QueryClientProvider client={queryClient}>
            <RouterProvider router={router} />
            <Toaster />
        </QueryClientProvider>
    );
}