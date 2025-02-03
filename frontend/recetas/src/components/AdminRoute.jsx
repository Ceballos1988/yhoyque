import { Navigate, Outlet } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const AdminRoute = () => {
  const { user, isLoading } = useAuth();

  // Muestra un spinner mientras se verifica la autenticación
  if (isLoading) {
    return <div>Cargando...</div>;
  }

  // Redirige al login si no es administrador
  if (!user || user.role !== "admin") {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default AdminRoute;
