import { useState } from "react";
import "../../styles/admin/adminDashboard.css";
import UserManagement from "./UserManagement";
import AdminReports from "./AdminReports"; // Importar el componente de reportes
import AdminBrands from "./AdminBrands"; // Importar el nuevo componente de marcas
import AdminStatistics from "./AdminStatistics"; // Importa el nuevo componente

const AdminDashboard = () => {
  const [activePage, setActivePage] = useState("users"); // Página activa

  const renderContent = () => {
    switch (activePage) {
      case "users":
        return <UserManagement />;
      case "reports":
        return <AdminReports />;
      case "brands":
        return <AdminBrands />; // Nuevo caso para el componente de marcas
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
            Marcas {/* Nuevo elemento del menú */}
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
