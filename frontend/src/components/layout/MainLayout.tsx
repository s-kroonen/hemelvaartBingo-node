import {useAuthStore} from "../../store/authStore";
import MatchSelector from "./MatchSelector.tsx";
import {useNavigate} from "react-router-dom";

export default function MainLayout({children}: any) {
    const user = useAuthStore((s) => s.user);
    let navigate = useNavigate();
    return (
        <div className="flex h-screen">
            {/* Sidebar */}
            <div className="w-64 bg-gray-900 text-white p-4">
                <nav>
                    <p>Leaderboard</p>
                    {user?.roles.includes("master") && <p>Events</p>}
                    {user?.roles.includes("admin") && (
                        <p onClick={() => navigate("/admin")}>Admin</p>
                    )}
                </nav>
            </div>

            {/* Main */}
            <div className="flex-1 flex flex-col">
                {/* Topbar */}
                <div className="h-14 bg-gray-100 flex justify-between px-4 items-center">
                    <MatchSelector/>
                    <div>{user?.email}</div>
                </div>

                {/* Content */}
                <div className="p-4">{children}</div>
            </div>
        </div>
    );
}