import { useState, useEffect } from "react";
import "../../styles/admin/adminDashboard.css";
import UserManagement from "./UserManagement";
import AdminReports from "./AdminReports";
import AdminBrands from "./AdminBrands";
import AdminStatistics from "./AdminStatistics";

const AdminDashboard = () => {
  const [activePage, setActivePage] = useState("users");
  const [isOnline, setIsOnline] = useState(navigator.onLine); // Estado para detectar conexión

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const renderContent = () => {
    if (!isOnline) {
      return (
        <div className="offline-message-admin">
          <h2>Sin conexión a Internet</h2>
          <p>
            Parece que estás desconectado. La información del panel de
            administración está sincronizada con la base de datos en línea.
          </p>
          <p>Por favor, vuelve cuando tengas conexión.</p>
          <div className="offline-icon">📶❌</div>
        </div>
      );
    }

    switch (activePage) {
      case "users":
        return <UserManagement />;
      case "reports":
        return <AdminReports />;
      case "brands":
        return <AdminBrands />;
      case "statistics":
        return <AdminStatistics />;
      default:
        return <p>Selecciona una opción del menú.</p>;
    }
  };

  return (
    <div className="admin-dashboard">
      <h1 className="page-title mt-10 text-white">Panel de Administración</h1>
      {/* Submenú */}
      <div className="submenu-container">
        <ul className="submenu mt-4">
          <li
            className={activePage === "users" ? "active" : ""}
            onClick={() => setActivePage("users")}
          >
            Usuarios
          </li>
          <li
            className={activePage === "reports" ? "active" : ""}
            onClick={() => setActivePage("reports")}
          >
            Reportes
          </li>
          <li
            className={activePage === "brands" ? "active" : ""}
            onClick={() => setActivePage("brands")}
          >
            Marcas
          </li>
          <li
            className={activePage === "statistics" ? "active" : ""}
            onClick={() => setActivePage("statistics")}
          >
            Estadísticas
          </li>
        </ul>
      </div>
      {/* Contenido principal */}
      <div className="main-content-user flex justify-center">
        {renderContent()}
      </div>
    </div>
  );
};

export default AdminDashboard;
