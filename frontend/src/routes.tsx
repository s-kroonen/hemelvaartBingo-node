import {createBrowserRouter, Navigate} from "react-router";
import Root from "./components/Root";
import LeaderboardPage from "./pages/LeaderboardPage";
import AdminDashboard from "./pages/AdminDashboard";
import BingoMasterPage from "./pages/BingoMasterPage";
import {useAuthStore} from "./store/authStore";
import LoginPage from "@/pages/LoginPage.tsx";
import AdminUserEdit from "@/pages/AdminUserEdit.tsx";
import AdminMatchEdit from "@/pages/AdminMatchEdit.tsx";
import AdminInviteEdit from "@/pages/AdminInviteEdit.tsx";
import InviteJoin from "@/pages/InviteJoin.tsx";
import ProfilePage from "@/pages/ProfilePage.tsx";

// Protected Route Component
function ProtectedRoute({
                            children,
                            requiredRole
                        }: {
    children: React.ReactNode;
    requiredRole?: string;
}) {
    const {isAuthenticated, hasRole} = useAuthStore();

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
        return <Navigate to="/login" replace/>;
    }

    // Check role if required
    if (requiredRole && !hasRole(requiredRole)) {
        return <Navigate to="/" replace/>;
    }

    return <>{children}</>;
}

export const router = createBrowserRouter([
    {
        path: "/login",
        Component: LoginPage,
    },
    {
        path: "/invites/join/:token",
        Component: InviteJoin,
    },
    {
        path: "/",
        Component: Root,
        children: [
            {
                index: true,
                element: (
                    <ProtectedRoute>
                        <LeaderboardPage/>
                    </ProtectedRoute>
                ),
            },
            {
                path: "admin",
                element: (
                    <ProtectedRoute requiredRole="admin">
                        <AdminDashboard/>
                    </ProtectedRoute>
                ),
            },
            {
                path: "admin/users/:id",
                element: (
                    <ProtectedRoute requiredRole="admin">
                        <AdminUserEdit/>
                    </ProtectedRoute>
                ),
            },
            {
                path: "admin/matches/:id",
                element: (
                    <ProtectedRoute requiredRole="admin">
                        <AdminMatchEdit/>
                    </ProtectedRoute>
                ),
            },
            {
                path: "admin/invites/:id",
                element: (
                    <ProtectedRoute requiredRole="admin">
                        <AdminInviteEdit/>
                    </ProtectedRoute>
                ),
            },
            {
                path: "master",
                element: (
                    <ProtectedRoute requiredRole="master">
                        <BingoMasterPage/>
                    </ProtectedRoute>
                ),
            },
            {
                path: "profile",
                element: (
                    <ProtectedRoute>
                        <ProfilePage/>
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
