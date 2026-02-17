import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export function ProtectedRoute({
    children,
    allow,
}: {
    children: JSX.Element;
    allow: Array<"gestor" | "cidadao">;
}) {
    const { session, loadingSession } = useAuth();

    if (loadingSession) {
        return <div className="p-6 text-muted-foreground">A carregar...</div>;
    }


    if (!session) {
        return <Navigate to="/login" replace />;
    }

    if (!allow.includes(session.role)) {
        return <Navigate to="/login" replace />;
    }

    return children;
}

