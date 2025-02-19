import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
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
import "./styles/main.css";
import { OfflineProvider } from "./context/OfflineContext";

function App() {
  return (
    <AuthProvider>
      <FilterProvider>
        <OfflineProvider>
          <AppContent />
        </OfflineProvider>
      </FilterProvider>
    </AuthProvider>
  );
}

function AppContent() {
  const [showScrollTopButton, setShowScrollTopButton] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false); // 🔹 Detecta actualizaciones

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTopButton(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
        if (import.meta.env.MODE === "development") {
            console.log("📌 Instalación manual controlada en desarrollo.");
        }

        setDeferredPrompt(e); // 🔹 Guardamos el evento sin bloquear el banner
        setIsInstallable(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
        window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
}, []);



  const handleInstallApp = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(() => {
        setDeferredPrompt(null);
        setIsInstallable(false);
      });
    }
  };

  // 🔹 Escuchar cambios en el Service Worker para mostrar notificación de actualización
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.addEventListener("message", (event) => {
        if (event.data && event.data.type === "NEW_VERSION_AVAILABLE") {
          setUpdateAvailable(true);
        }
      });
    }
  }, []);

  return (
    <div className="App">
      <Navbar />

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
        <Route path="*" element={<Home />} />
      </Routes>

      <Footer />

      {/* 🔹 Mostrar notificación de actualización cuando haya una nueva versión */}
      {updateAvailable && (
        <div
          style={{
            position: "fixed",
            bottom: "20px",
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor: "#ff8c00",
            color: "white",
            padding: "10px 20px",
            borderRadius: "10px",
            zIndex: 9999,
            fontSize: "16px",
            textAlign: "center",
          }}
        >
          🔄 Nueva versión disponible.{" "}
          <button
            onClick={() => window.location.reload()}
            style={{
              marginLeft: "10px",
              padding: "5px 10px",
              backgroundColor: "white",
              color: "#ff8c00",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Actualizar
          </button>
        </div>
      )}

      {/* 🔹 Botón para volver arriba */}
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
            borderRadius: "8px",
            width: window.innerWidth < 550 ? "40px" : "50px",
            height: window.innerWidth < 550 ? "40px" : "50px",
            fontSize: window.innerWidth < 550 ? "20px" : "24px",
            cursor: "pointer",
            zIndex: 1000,
            transition: "background-color 0.3s ease",
            boxShadow: "0px 4px 10px rgba(255, 255, 255, 0.6)", // 🔹 Sombra blanca
          }}
          onMouseEnter={(e) => (e.target.style.backgroundColor = "#0f172b")}
          onMouseLeave={(e) => (e.target.style.backgroundColor = "#EE8532")}
        >
          ↑
        </button>
      )}

      {/* 🔹 Botón de instalación (más pequeño en móviles) */}
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
            borderRadius: "8px",
            width: window.innerWidth < 550 ? "60px" : "90px",  // 🔹 Más pequeño en móviles
            height: window.innerWidth < 550 ? "60px" : "90px",
            fontSize: window.innerWidth < 550 ? "12px" : "16px",
            cursor: "pointer",
            zIndex: 800,
            transition: "background-color 0.3s ease",
            boxShadow: "0px 4px 10px rgba(255, 255, 255, 0.6)",
          }}
          onMouseEnter={(e) => (e.target.style.backgroundColor = "#EE8532")}
          onMouseLeave={(e) => (e.target.style.backgroundColor = "#0f172b")}
        >
          Instalar
        </button>
      )}
    </div>
  );
}

export default App;
