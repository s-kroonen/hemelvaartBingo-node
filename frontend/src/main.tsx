import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
const queryClient = new QueryClient();
import AuthProvider from "./firebase/AuthProvider";
import AppRouter from "./routes/AppRouter.tsx";

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
                <AppRouter />
            </AuthProvider>
        </QueryClientProvider>
    </StrictMode>
);