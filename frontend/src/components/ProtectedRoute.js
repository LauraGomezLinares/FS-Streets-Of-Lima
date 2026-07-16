import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  // 1. Si el AuthContext está cargando (leyendo el localStorage), esperamos 
  // para evitar que un retraso de milisegundos te rebote por error.
  if (loading) {
    return (
      <div className="min-h-screen bg-black text-yellow-300 font-dogica flex items-center justify-center text-xs tracking-widest animate-pulse">
        [SYS_AUTH]: VERIFYING_SECURITY_CONTEXT...
      </div>
    );
  }

  // 2. 🚀 SOLUCIÓN: Validamos dinámicamente que exista el usuario Y que su rol sea ADMIN
  if (!user || user.role !== "ADMIN") {
    return <Navigate to="/" replace />;
  }

  // 3. Si pasa las pruebas de seguridad, renderiza el AdminDashboard
  return children;
}