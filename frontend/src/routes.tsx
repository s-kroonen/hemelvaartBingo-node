import { createBrowserRouter, Navigate } from "react-router";
import Root from "./components/Root";
import LeaderboardPage from "./pages/LeaderboardPage";
import AdminDashboard from "./pages/AdminDashboard";
import BingoMasterPage from "./pages/BingoMasterPage";
import { useAuthStore } from "./store/authStore";

// Protected Route Component
function ProtectedRoute({ children, requiredRole }: { children: React.ReactNode; requiredRole: string }) {
    const hasRole = useAuthStore((state) => state.hasRole);

    if (!hasRole(requiredRole)) {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
}

export const router = createBrowserRouter([
    {
        path: "/",
        Component: Root,
        children: [
            {
                index: true,
                Component: LeaderboardPage,
            },
            {
                path: "admin",
                element: (
                    <ProtectedRoute requiredRole="admin">
                        <AdminDashboard />
                    </ProtectedRoute>
                ),
            },
            {
                path: "master",
                element: (
                    <ProtectedRoute requiredRole="master">
                        <BingoMasterPage />
                    </ProtectedRoute>
                ),
            },
            {
                path: "*",
                element: (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                            <h1 className="text-4xl font-bold mb-2">404</h1>
                            <p className="text-gray-600">Page not found</p>
                        </div>
                    </div>
                ),
            },
        ],
    },
]);
