import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
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
import AuthProvider from "./context/AuthContext";
import { FilterProvider } from "./context/FilterContext";
import ShoppingListsPage from "./pages/ShoppingListsPage";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";
import { OfflineProvider } from "./context/OfflineContext";
import "./styles/main.css";
import DownloadSection from "./components/home/DownloadSection";

function App() {
  const [showScrollTopButton, setShowScrollTopButton] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTopButton(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Manejar el evento de instalación de PWA
  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    window.addEventListener("appinstalled", () => {
      console.log("✅ La aplicación ha sido instalada.");
      setIsInstallable(false);
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallApp = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(({ outcome }) => {
        if (outcome === "accepted") {
          console.log("👍 Instalación aceptada.");
        } else {
          console.log("👎 Instalación rechazada.");
        }
        setDeferredPrompt(null);
        setIsInstallable(false);
      });
    }
  };

  return (
    <AuthProvider>
      <FilterProvider>
        <OfflineProvider>
          <Router>
            <div className="App">
              <Navbar />

              {/* Sección de descarga solo visible en Home */}
              {location.pathname === "/" && (
                <DownloadSection />
              )}

              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/create-recipe" element={<CreateRecipe />} />
                <Route path="/create-recipe/:recipeId" element={<CreateRecipe />} />
                <Route path="/login" element={<Login />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password/:token" element={<ResetPassword />} />
                <Route path="/register" element={<Register />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/recipe-wall" element={<RecipeWall />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/shopping-lists" element={<ShoppingListsPage />} />
                <Route path="/admin/*" element={<AdminRoute />}>
                  <Route path="dashboard" element={<AdminDashboard />} />
                </Route>
              </Routes>

              <Footer />

              {/* Botón de volver arriba */}
              {showScrollTopButton && (
                <button
                  onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
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
                  onMouseEnter={(e) => (e.target.style.backgroundColor = "#0f172b")}
                  onMouseLeave={(e) => (e.target.style.backgroundColor = "#EE8532")}
                >
                  ↑
                </button>
              )}

              {/* Botón de instalación en el lado izquierdo */}
              {isInstallable && (
                <button
                  onClick={handleInstallApp}
                  aria-label="Instalar la aplicación"
                  style={{
                    position: "fixed",
                    bottom: "20px",
                    left: "20px",
                    backgroundColor: "#0f172b",
                    color: "#fff",
                    border: "none",
                    width: window.innerWidth < 550 ? "40px" : "50px",
                    height: window.innerWidth < 550 ? "40px" : "50px",
                    fontSize: window.innerWidth < 550 ? "16px" : "18px",
                    cursor: "pointer",
                    zIndex: 1000,
                    transition: "background-color 0.3s ease",
                  }}
                  onMouseEnter={(e) => (e.target.style.backgroundColor = "#EE8532")}
                  onMouseLeave={(e) => (e.target.style.backgroundColor = "#0f172b")}
                >
                  ⬇
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
