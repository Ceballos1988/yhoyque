import { useEffect, useState } from "react";
import "../styles/components/style.BrandCarousel.css";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://yhoyque.onrender.com";

const BrandCarousel = () => {
  const [brands, setBrands] = useState([]); // Estado dinámico para marcas
  const [isLoading, setIsLoading] = useState(true); // Estado para mostrar un spinner
  const [error, setError] = useState(null); // Estado para errores

  // Obtener marcas del backend
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const token = localStorage.getItem("token"); // Obtener el token del local storage
        const response = await axios.get(`${API_BASE_URL}/api/brands`, {
          headers: {
            Authorization: `Bearer ${token}`, // Incluir el token en el encabezado
          },
        });
        setBrands(response.data); // Actualiza las marcas con la respuesta
        setIsLoading(false);
      } catch (err) {
        console.error("Error al cargar las marcas:", err);
        setError("Hubo un problema al cargar las marcas.");
        setIsLoading(false);
      }
    };
  
    fetchBrands();
  }, []);
  

  if (isLoading) {
    return <p className="text-center text-white">Cargando marcas...</p>;
  }

  if (error) {
    return <p className="text-center text-red-500">{error}</p>;
  }

  return (
    <div className="brand-carousel-container py-10 overflow-hidden animate__animated animate__fadeIn">
      <h2 className="text-center text-naranja-bg font-poppins font-bold text-2xl mb-6">
        Aliados de ¿Y HOY QUÉ?
      </h2>
      <div className="brand-carousel-track flex animate-marquee">
        {brands.map((brand) => (
          <div
            key={brand._id}
            className="brand-carousel-item mx-4 flex-shrink-0"
          >
            <img
              src={brand.imageUrl}
              alt={brand.name}
              className="w-32 h-32 object-contain"
            />
          </div>
        ))}
        {/* Duplicar para efecto infinito */}
        {brands.map((brand) => (
          <div
            key={`duplicate-${brand._id}`}
            className="brand-carousel-item mx-4 flex-shrink-0"
          >
            <img
              src={brand.imageUrl}
              alt={brand.name}
              className="w-32 h-32 object-contain"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default BrandCarousel;
