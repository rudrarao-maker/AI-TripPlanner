import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";

interface ProtectedRouteProps {
  adminOnly?: boolean;
}

export function ProtectedRoute({ adminOnly = false }: ProtectedRouteProps) {
  const { isLoaded, userId } = useAuth();

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!userId) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
