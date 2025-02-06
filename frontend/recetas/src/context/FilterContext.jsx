import { createContext, useState, useEffect, memo } from "react";
import PropTypes from "prop-types"; // Importar PropTypes

const FilterContext = createContext();

/**
 * Proveedor de contexto para manejar los filtros aplicados en la aplicación.
 * Proporciona las funciones para actualizar y limpiar filtros, además de almacenar los valores de los filtros.
 *
 * @component
 * @param {Object} props - Propiedades del componente.
 * @param {React.ReactNode} props.children - Componentes hijos que serán envueltos por el proveedor de filtros.
 * @returns {JSX.Element} - Proveedor de contexto con los filtros y las funciones para manipularlos.
 */
const FilterProvider = memo(({ children }) => {
  // Estado para los filtros, inicializados desde el almacenamiento local si es posible
  const [filters, setFilters] = useState(() => {
    const savedFilters = localStorage.getItem("filters");
    return savedFilters
      ? JSON.parse(savedFilters)
      : {
          sortOption: "",
          category: "",
          difficulty: "",
          prepTime: "",
          dietType: "",
          rating: "",
          userRecipesOnly: false,
          savedRecipesOnly: false,
        };
  });

  // Guardar los filtros actualizados en el almacenamiento local cada vez que cambian
  useEffect(() => {
    localStorage.setItem("filters", JSON.stringify(filters));
  }, [filters]);

  /**
   * Actualiza los filtros aplicados con los valores proporcionados.
   *
   * @param {Object} newFilters - Objeto que contiene los nuevos valores de los filtros.
   */
  const updateFilters = (newFilters) => {
    setFilters((prevFilters) => ({ ...prevFilters, ...newFilters }));
  };

  /**
   * Limpia todos los filtros y los restablece a sus valores predeterminados.
   */
  const clearFilters = () =>
    setFilters({
      sortOption: "",
      category: "",
      difficulty: "",
      prepTime: "",
      dietType: "",
      rating: "",
      userRecipesOnly: false,
      savedRecipesOnly: false,
    });

  return (
    <FilterContext.Provider value={{ filters, updateFilters, clearFilters }}>
      {children}
    </FilterContext.Provider>
  );
});

// 🔹 Se agrega el display name para evitar la advertencia de ESLint
FilterProvider.displayName = "FilterProvider";

FilterProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

// 🔹 Exportar `FilterContext` al final del archivo
export { FilterProvider, FilterContext };
