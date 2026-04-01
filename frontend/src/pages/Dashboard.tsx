import MainLayout from "../components/layout/MainLayout.tsx";
import { Routes, Route } from "react-router-dom";
import LeaderboardPage from "../features/leaderboard/LeaderboardPage.tsx";
import AdminDashboard from "../features/admin/AdminDashboard.tsx";
import ProtectedRoute from "../routes/ProtectedRoute.tsx";

export default function Dashboard() {
    return (
        <MainLayout>
            <Routes>
                <Route path="/" element={<LeaderboardPage />} />

                <Route
                    path="/admin"
                    element={
                        <ProtectedRoute roles={["admin"]}>
                            <AdminDashboard />
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </MainLayout>
    );
}