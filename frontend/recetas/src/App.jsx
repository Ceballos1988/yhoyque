import { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom"; // Agrega Navigate
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import CreateRecipe from "./pages/CreateRecipe";
import Profile from "./pages/Profile";
import RecipeWall from "./pages/RecipeWall";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminRoute from "./components/AdminRoute";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { AuthProvider } from "./context/AuthContext";
import { FilterProvider } from "./context/FilterContext";
import ShoppingListsPage from "./pages/ShoppingListsPage";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";
import { OfflineProvider } from "./context/OfflineContext"; // ✅ Importar el Provider
import "../styles/main.css";
/**
 * Componente principal de la aplicación.
 */
function App() {
  const [showScrollTopButton, setShowScrollTopButton] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine); // Estado de conexión

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTopButton(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    // Escucha cambios en la conexión
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <AuthProvider>
      <FilterProvider>
        <OfflineProvider>
          {" "}
          {/* ✅ Aquí envuelve la App */}
          <Router>
            <div className="App">
              <Navbar />

              <Routes>
                {/* Si está offline y no en la página offline, redirigir */}
                {!isOnline && (
                  <Route path="*" element={<Navigate to="/offline" />} />
                )}

                {/* Rutas públicas */}
                <Route path="/" element={<Home />} />
                <Route path="/create-recipe" element={<CreateRecipe />} />
                <Route
                  path="/create-recipe/:recipeId"
                  element={<CreateRecipe />}
                />
                <Route path="/login" element={<Login />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route
                  path="/reset-password/:token"
                  element={<ResetPassword />}
                />
                <Route path="/register" element={<Register />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/recipe-wall" element={<RecipeWall />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/shopping-lists" element={<ShoppingListsPage />} />

                {/* Ruta para la página Offline */}
                <Route
                  path="/offline"
                  element={<div>Estás sin conexión. Intenta más tarde.</div>}
                />

                {/* Rutas protegidas para administrador */}
                <Route path="/admin/*" element={<AdminRoute />}>
                  <Route path="dashboard" element={<AdminDashboard />} />
                </Route>
              </Routes>

              <Footer />

              {showScrollTopButton && (
                <button
                  onClick={() =>
                    window.scrollTo({ top: 0, behavior: "smooth" })
                  }
                  aria-label="Volver al inicio de la página"
                  style={{
                    position: "fixed",
                    bottom: "20px",
                    right: "20px",
                    backgroundColor: "#EE8532",
                    color: "#fff",
                    border: "none",
                    width: window.innerWidth < 550 ? "40px" : "50px",
                    height: window.innerWidth < 550 ? "40px" : "50px",
                    fontSize: window.innerWidth < 550 ? "20px" : "24px",
                    cursor: "pointer",
                    zIndex: 1000,
                    transition: "background-color 0.3s ease",
                  }}
                  onMouseEnter={(e) =>
                    (e.target.style.backgroundColor = "#0f172b")
                  }
                  onMouseLeave={(e) =>
                    (e.target.style.backgroundColor = "#EE8532")
                  }
                >
                  ↑
                </button>
              )}
            </div>
          </Router>
        </OfflineProvider>
      </FilterProvider>
    </AuthProvider>
  );
}

export default App;
