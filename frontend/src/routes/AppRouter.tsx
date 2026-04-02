import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import LoginPage from "../components/pages/LoginPage";
import LeaderboardPage from "../components/pages/LeaderboardPage";
import AdminDashboard from "../components/admin/AdminDashboard";
import MainLayout from "../components/layout/MainLayout";
import ProtectedRoute from "./ProtectedRoute";

/**
 * Layout wrapper with auth protection
 */
function ProtectedLayout() {
    return (
        <ProtectedRoute>
            <MainLayout>
                <Outlet />
            </MainLayout>
        </ProtectedRoute>
    );
}

export default function AppRouter() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Public */}

                <Route path="/login" element={<LoginPage />} />
                {/* Protected app */}
                <Route element={<ProtectedLayout />}>
                    <Route index element={<LeaderboardPage />} />

                    <Route
                        path="admin"
                        element={
                            <ProtectedRoute roles={["admin"]}>
                                <AdminDashboard />
                            </ProtectedRoute>
                        }
                    />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}