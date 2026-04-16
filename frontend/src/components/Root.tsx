import { Outlet, Link, useLocation } from "react-router";
import { useAuthStore } from "../store/authStore";
import { Button } from "./ui/button.tsx";
import { Trophy, Shield, Crown, LogOut } from "lucide-react";

export default function Root() {
  const { user, hasRole, logout } = useAuthStore();
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <h1 className="text-2xl font-bold text-blue-600">Bingo App</h1>
              <div className="flex gap-2">
                <Link to="/">
                  <Button
                    variant={location.pathname === "/" ? "default" : "ghost"}
                    size="sm"
                  >
                    <Trophy className="w-4 h-4 mr-2" />
                    Leaderboard
                  </Button>
                </Link>
                {hasRole("master") && (
                  <Link to="/master">
                    <Button
                      variant={location.pathname === "/master" ? "default" : "ghost"}
                      size="sm"
                    >
                      <Crown className="w-4 h-4 mr-2" />
                      Master
                    </Button>
                  </Link>
                )}
                {hasRole("admin") && (
                  <Link to="/admin">
                    <Button
                      variant={location.pathname === "/admin" ? "default" : "ghost"}
                      size="sm"
                    >
                      <Shield className="w-4 h-4 mr-2" />
                      Admin
                    </Button>
                  </Link>
                )}
              </div>
            </div>
            {user && (
              <div className="flex items-center gap-4">
                <div className="text-sm text-gray-600">
                  {user.email}
                </div>
                <Button variant="outline" size="sm" onClick={logout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 bg-gray-50">
        <Outlet />
      </main>
    </div>
  );
}
