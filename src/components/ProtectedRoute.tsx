import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { apiKey } = useAuth();

  if (!apiKey) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
