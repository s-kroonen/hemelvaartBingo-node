import { useAuthStore } from "../../store/authStore";
import { useNavigate, useLocation } from "react-router-dom";
import MatchSelector from "./MatchSelector";

export default function MainLayout({ children }: any) {
    const user = useAuthStore((s) => s.user);
    const navigate = useNavigate();
    const location = useLocation();

    const navItem = (label: string, path: string) => {
        const active = location.pathname === path;

        return (
            <button
                onClick={() => navigate(path)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition
                    ${active
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-gray-600 hover:bg-blue-100 hover:text-blue-700"
                }`}
            >
                {label}
            </button>
        );
    };

    return (
        <div className="flex flex-col min-h-screen">
            {/* NAVBAR */}
            <header className="bg-white/80 backdrop-blur border-b border-blue-100 sticky top-0 z-10 shadow-sm">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">

                    {/* LEFT SIDE */}
                    <div className="flex items-center gap-6">
                        {/* Logo */}
                        <div
                            onClick={() => navigate("/")}
                            className="text-2xl font-bold text-blue-600 cursor-pointer"
                        >
                            Bingo
                        </div>
                        {/* Match selector */}
                        <div className="hidden lg:block">
                            <MatchSelector />
                        </div>

                        {/* Main navigation */}
                        <div className="hidden md:flex gap-2">
                            {navItem("Leaderboard", "/")}
                        </div>
                    </div>

                    {/* RIGHT SIDE */}
                    <div className="flex items-center gap-3">
                        {/* Role-based links */}
                        {user?.roles.includes("master") &&
                            navItem("Events", "/events")}

                        {user?.roles.includes("admin") &&
                            navItem("Admin", "/admin")}

                        {/* User */}
                        <div className="ml-2 px-3 py-2 rounded-xl bg-blue-50 text-blue-700 text-sm font-medium">
                            {user?.email}
                        </div>
                    </div>
                </div>
            </header>

            {/* CONTENT */}
            <main className="flex-1 w-full">
                <div className="max-w-7xl mx-auto p-6">
                    {children}
                </div>
            </main>
        </div>
    );
}