import {Navigate} from "react-router";
import {useAuthStore} from "../store/authStore";

// Protected Route Component
export default function ProtectedRoute({
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
