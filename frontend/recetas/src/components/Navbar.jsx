import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import "../styles/components/style.navbar.css";
import Modal from "react-modal";
import { useOffline } from "../context/useOffline";

/**
 * Componente Navbar que muestra la barra de navegación principal de la aplicación.
 * Incluye menús de navegación, menús desplegables y un modal de confirmación para cerrar sesión.
 * @component
 * @returns {JSX.Element} Barra de navegación.
 */
function Navbar() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState("");
  const [userRole, setUserRole] = useState(""); // Estado para el rol del usuario
  const [showCommunitySubMenu, setShowCommunitySubMenu] = useState(false);
  const [showUserSubMenu, setShowUserSubMenu] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false); // Estado para controlar el modal de cierre de sesión
  const navigate = useNavigate();
  const location = useLocation();
  const { isOffline } = useOffline(); // 🟢 Obtiene el estado de conexión

  useEffect(() => {
    const checkAuthentication = () => {
      const token = localStorage.getItem("token");
      if (token) {
        setIsAuthenticated(true);
        fetchUserInfo(token);
      } else {
        setIsAuthenticated(false);
        setUserName("");
      }
    };

    checkAuthentication();

    window.addEventListener("authChanged", checkAuthentication);
    window.addEventListener("storage", checkAuthentication);

    const handleResize = () => {
      if (window.innerWidth >= 769) setIsMobileMenuOpen(false);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("authChanged", checkAuthentication);
      window.removeEventListener("storage", checkAuthentication);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".navbar")) {
        setShowCommunitySubMenu(false);
        setShowUserSubMenu(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const fetchUserInfo = (token) => {
    fetch(`${import.meta.env.VITE_API_URL}/api/auth/user-info`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then((data) => {
        setUserName(data.username.toUpperCase());
        setUserRole(data.role); // Guardar el rol del usuario
      })
      .catch((error) =>
        console.error("Error al obtener la información del usuario:", error)
      );
  };

  const logout = () => {
    // Cierra el modal antes de realizar el cierre de sesión
    closeLogoutModal();

    // Eliminar el token y limpiar el estado de favoritos y usuario
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    setUserName("");
    window.dispatchEvent(new Event("authChanged"));

    // Redirigir a la página principal o login
    navigate("/");
  };

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  const isActive = (path) => (location.pathname === path ? "active-page" : "");

  // Función para abrir el modal de confirmación de cierre de sesión
  const openLogoutModal = () => setShowLogoutModal(true);

  // Función para cerrar el modal de confirmación de cierre de sesión
  const closeLogoutModal = () => setShowLogoutModal(false);

  return (
    <>
      {isOffline && (
        <div className="offline-banner bg-red-600 text-white text-center">
          🚫 Estás en modo offline. Algunas funciones pueden no estar
          disponibles.
        </div>
      )}
      <nav className="navbar text-white p-2">
        <div className="navbar-content flex justify-between items-center max-w-46xl mx-auto">
          <Link
            to="/"
            className="logo-container"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <img
              src="/img/Logo1.png"
              alt="Logo ¿Y Hoy Qué?"
              className="logo-img"
            />
          </Link>

          <button
            className="hamburger-menu lg:hidden"
            onClick={toggleMobileMenu}
            aria-label="Toggle Menu"
          >
            {isMobileMenuOpen ? "✕" : "☰"}
          </button>

          <div
            className={`navbar-links ${
              isMobileMenuOpen ? "active" : ""
            } lg:flex lg:items-center lg:justify-end`}
          >
            {isMobileMenuOpen && (
              <button
                className="hamburger-close"
                onClick={toggleMobileMenu}
                aria-label="Close Menu"
                style={{ zIndex: 101 }}
              >
                ✕
              </button>
            )}
            <ul className="font-poppins flex flex-col lg:flex-row lg:items-center lg:space-x-6">
              <li>
                <Link
                  to="/"
                  className={`navbar-link ${isActive("/")}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  HOME
                </Link>
              </li>

              {isAuthenticated ? (
                <>
                  <li
                    className="relative cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowCommunitySubMenu((prev) => !prev);
                      setShowUserSubMenu(false);
                    }}
                  >
                    <span
                      className={`hover:text-orange ${
                        isActive("/recipe-wall") ? "active-page" : ""
                      }`}
                    >
                      COMUNIDAD
                    </span>
                    {showCommunitySubMenu && (
                      <ul className="sub-menu text-white rounded shadow-lg z-50 mt-2">
                        <li>
                          <Link
                            to="/recipe-wall"
                            className={`sub-menu-link ${isActive(
                              "/recipe-wall"
                            )}`}
                            onClick={() => setShowCommunitySubMenu(false)}
                          >
                            MURO RECETAS
                          </Link>
                        </li>
                        <li>
                          <Link
                            to="/create-recipe"
                            className={`sub-menu-link ${isActive(
                              "/create-recipe"
                            )}`}
                            onClick={() => setShowCommunitySubMenu(false)}
                          >
                            CREAR RECETA
                          </Link>
                        </li>
                        <li>
                          <Link
                            to="/shopping-lists"
                            className={`sub-menu-link ${isActive(
                              "/shopping-lists"
                            )}`}
                            onClick={() => setShowCommunitySubMenu(false)}
                          >
                            LISTA DE COMPRAS
                          </Link>
                        </li>
                      </ul>
                    )}
                  </li>

                  <li
                    className="relative cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowUserSubMenu((prev) => !prev);
                      setShowCommunitySubMenu(false);
                    }}
                  >
                    <span
                      className={`hover:text-orange ${
                        isActive("/profile") ? "active-page" : ""
                      }`}
                    >
                      {userName || "USUARIO"}
                    </span>

                    {showUserSubMenu && (
                      <ul className="sub-menu text-white rounded shadow-lg z-50 mt-2">
                        <li>
                          <Link
                            to="/profile"
                            className={`sub-menu-link ${isActive("/profile")}`}
                            onClick={() => setShowUserSubMenu(false)}
                          >
                            MI PERFIL
                          </Link>
                        </li>
                        <li>
                          <button
                            onClick={openLogoutModal} // Abre el modal en lugar de cerrar sesión directamente
                            className="sub-menu-link"
                          >
                            CERRAR SESIÓN
                          </button>
                        </li>
                      </ul>
                    )}
                  </li>

                  <div className="flex items-center space-x-4 mb-4 justify-center">
                    {/* Mostrar botón de administración si el usuario es admin */}
                    {userRole === "admin" && (
                      <Link
                        to="/admin/dashboard"
                        title="Ingresar a vista administrador"
                        className="bg-orange-500 text-white px-3 py-1 rounded-md text-sm font-bold hover:bg-orange-600 transition-all duration-300"
                      >
                        Administración
                      </Link>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <li>
                    <Link
                      to="/login"
                      className={`navbar-link ${isActive("/login")}`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      INICIAR SESIÓN
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/register"
                      className={`navbar-link ${isActive("/register")}`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      REGISTRARSE
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>

        {/* Modal de Confirmación para Cerrar Sesión */}
        <Modal
          isOpen={showLogoutModal}
          onRequestClose={closeLogoutModal}
          contentLabel="Cerrar Sesión"
          className="user-modal-list glass-effect"
          overlayClassName="user-modal-overlay-list"
        >
          <h2 className="modal-session font-bold mb-4 text-naranja-bg">
            ¿Estás seguro?
          </h2>
          <p className="modal-session mb-6 text-white">
            ¿Realmente deseas cerrar sesión?
          </p>
          <div className="flex justify-center">
            <button
              onClick={closeLogoutModal}
              className="modal-button cancel text-base px-4 py-2 rounded-md font-raleway font-bold transition-all duration-300 bg-red-500 hover:bg-red-700 hover:text-naranja-bg"
            >
              Cancelar
            </button>
            <button
              onClick={logout}
              className="modal-button add text-base px-4 py-2 rounded-md font-raleway font-bold transition-all duration-300 bg-naranja-bg hover:bg-azul-bg hover:text-white"
            >
              Cerrar Sesión
            </button>
          </div>
        </Modal>
      </nav>
    </>
  );
}

export default Navbar;
