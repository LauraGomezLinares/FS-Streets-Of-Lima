import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user } = useAuth();

  if (!user || user.email !== "admin@streetsoflima.com") {
    return <Navigate to="/" replace />;
  }

  return children;
}