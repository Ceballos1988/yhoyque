import { useForm } from "react-hook-form";
import { useEffect, useContext } from "react";
import "../styles/components/style.filterPanel.css";
import PropTypes from "prop-types";
import { FilterContext } from "../context/FilterContext";

/**
 * Componente FilterPanel que muestra opciones de filtrado y ordenamiento para las recetas.
 * Utiliza react-hook-form para gestionar el formulario de filtros.
 *
 * @component
 * @param {Object} props - Las propiedades del componente.
 * @param {function} [props.onFilterChange] - Función que se ejecuta cuando los filtros cambian.
 * @returns {JSX.Element} - Componente del panel de filtros.
 */
const FilterPanel = ({ onFilterChange = () => {} }) => {
  const { filters, updateFilters, clearFilters } = useContext(FilterContext);

  // Transformación de valores para la búsqueda
  const transformPrepTime = (value) => {
    if (value === "menos-30") return { $lt: 30 };
    if (value === "30-60") return { $gte: 30, $lte: 60 };
    if (value === "mas-60") return { $gt: 60 };
    return null;
  };

  const reverseTransformPrepTime = (filterValue) => {
    if (filterValue && filterValue.$lt === 30) return "menos-30";
    if (filterValue && filterValue.$gte === 30 && filterValue.$lte === 60)
      return "30-60";
    if (filterValue && filterValue.$gt === 60) return "mas-60";
    return "";
  };

  const transformRating = (value) => (value ? parseInt(value, 10) : "");

  const { register, handleSubmit, reset, setValue } = useForm({
    defaultValues: {
      category: filters.category || "",
      difficulty: filters.difficulty || "",
      prepTime: reverseTransformPrepTime(filters.prepTime) || "",
      dietType: filters.dietType || "",
      rating: filters.rating || "",
      sortOption: filters.sortOption || "",
      userRecipesOnly: filters.userRecipesOnly || false,
      savedRecipesOnly: filters.savedRecipesOnly || false,
    },
  });

  // Aplicación de filtros
  const onSubmitFilters = (data, e) => {
    e.preventDefault();
    const adjustedData = {
      category: data.category || null,
      difficulty: data.difficulty || null,
      prepTime: data.prepTime ? transformPrepTime(data.prepTime) : null,
      dietType: data.dietType || null,
      rating: data.rating ? transformRating(data.rating) : null,
      sortOption: data.sortOption || filters.sortOption || null,
      userRecipesOnly: data.userRecipesOnly || false,
      savedRecipesOnly: data.savedRecipesOnly || false,
    };
    updateFilters(adjustedData);
    onFilterChange(adjustedData);
  };

  // Aplicación de ordenamiento
  const onSubmitSort = (data, e) => {
    e.preventDefault();
    const sortData = {
      ...filters,
      sortOption: data.sortOption || null,
    };
    updateFilters(sortData);
    onFilterChange(sortData);
  };

  // Limpiar todos los filtros y cerrar los paneles
  const handleClearFilters = () => {
    reset();
    clearFilters();
    onFilterChange({
      category: "",
      difficulty: "",
      prepTime: "",
      dietType: "",
      rating: "",
      sortOption: "",
      userRecipesOnly: false,
      savedRecipesOnly: false,
    });
  };

  // Mantener los valores de los filtros aplicados visibles
  useEffect(() => {
    setValue("category", filters.category || "");
    setValue("difficulty", filters.difficulty || "");
    setValue("prepTime", reverseTransformPrepTime(filters.prepTime) || "");
    setValue("dietType", filters.dietType || "");
    setValue("rating", filters.rating || "");
    setValue("sortOption", filters.sortOption || "");
    setValue("userRecipesOnly", filters.userRecipesOnly || false);
    setValue("savedRecipesOnly", filters.savedRecipesOnly || false);
  }, [filters, setValue]);

  return (
    <div className="filter-panel-container text-white">
      {/* Icono de filtro solo decorativo */}
      <div className="filter-icon flex">
        <div>
          <img src="/img/filtro.png" alt="Icono de filtros" />
        </div>
        <div>
          <span className="text-naranja-bg">Filtros:</span>
        </div>
      </div>

      {/* Panel de filtros */}
      <form onSubmit={handleSubmit(onSubmitFilters)} className="filter-form">
        <div className="filters-container">
          <div className="filter-group checkbox-group">
            <label htmlFor="userRecipesOnly">
              <input
                type="checkbox"
                id="userRecipesOnly"
                className="mt-3"
                {...register("userRecipesOnly")}
              />
              <p className="mt-4 filter-p">Ver solo mis recetas creadas</p>
            </label>
          </div>

          <div className="filter-group checkbox-group">
            <label htmlFor="savedRecipesOnly">
              <input
                type="checkbox"
                id="savedRecipesOnly"
                className="mt-3"
                {...register("savedRecipesOnly")}
              />
              <p>Ver solo recetas guardadas</p>
            </label>
          </div>

          <div className="filter-group">
            <label htmlFor="category">Categoría:</label>
            <select id="category" {...register("category")}>
              <option value="">Todas</option>
              <option value="Appetizer">Entrada</option>
              <option value="Main Course">Plato Principal</option>
              <option value="Dessert">Postre</option>
              <option value="Side Dish">Guarnición</option>
              <option value="Pastry">Pastelería</option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="difficulty">Dificultad:</label>
            <select id="difficulty" {...register("difficulty")}>
              <option value="">Todas</option>
              <option value="Easy">Fácil</option>
              <option value="Medium">Intermedio</option>
              <option value="Hard">Difícil</option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="prepTime">Tiempo:</label>
            <select id="prepTime" {...register("prepTime")}>
              <option value="">Todos</option>
              <option value="menos-30">Menos de 30 minutos</option>
              <option value="30-60">30-60 minutos</option>
              <option value="mas-60">Más de 60 minutos</option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="dietType">Dieta:</label>
            <select id="dietType" {...register("dietType")}>
              <option value="">Todas</option>
              <option value="Vegetarian">Vegetariano</option>
              <option value="Vegan">Vegano</option>
              <option value="Gluten-Free">Sin Gluten</option>
              <option value="Keto">Keto</option>
              <option value="Paleo">Paleo</option>
            </select>
          </div>
        </div>

        <div className="filter-actions">
          <button
            type="submit"
            className="apply-filters-button font-poppins text-base"
          >
            Aplicar
          </button>
          <button
            type="button"
            className="clear-filters-button font-poppins text-base"
            onClick={handleClearFilters}
          >
            Limpiar
          </button>
        </div>
      </form>

      {/* Icono de filtro solo decorativo */}
      <div className="filter-icon flex mt-8">
        <div>
          <img src="/img/orden.png" alt="Icono de filtros" />
        </div>
        <div>
          <span className="text-naranja-bg">Ordenar:</span>
        </div>
      </div>
      {/* Panel de ordenamiento */}
      <form onSubmit={handleSubmit(onSubmitSort)} className="sort-form mt-5">
        <div className="sort-container">
          <div className="filter-group">
            <label htmlFor="sort">Ordenar:</label>
            <select id="sort" {...register("sortOption")}>
              <option value="">Selecciona una opción</option>
              <option value="prepTimeAsc">Menor tiempo</option>
              <option value="prepTimeDesc">Mayor tiempo</option>
              <option value="ratingAsc">Menor calificación</option>
              <option value="ratingDesc">Mayor calificación</option>
              <option value="createdAtDesc">Más reciente</option>
              <option value="createdAtAsc">Más antiguo</option>
            </select>
          </div>
        </div>

        <div className="sort-actions pb-54">
          <button
            type="submit"
            className="apply-sort-button font-poppins text-base"
          >
            Aplicar
          </button>
          <button
            type="button"
            className="clear-sort-button font-poppins text-base"
            onClick={handleClearFilters}
          >
            Limpiar
          </button>
        </div>
      </form>
    </div>
  );
};

FilterPanel.propTypes = {
  onFilterChange: PropTypes.func,
};

export default FilterPanel;
