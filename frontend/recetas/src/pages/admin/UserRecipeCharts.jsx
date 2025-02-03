import { Bar } from "react-chartjs-2";
import { useState, useEffect } from "react";
import { getUsersAndRecipesByMonth } from "../../services/api";
import LoadingSpinner from "../../components/LoadingSpinner"; // Ruta para LoadingSpinner

const UserRecipeCharts = () => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [year, setYear] = useState(2024); // Año predeterminado
  const [noData, setNoData] = useState(false); // Estado para manejar cuando no hay datos

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setNoData(false); // Reiniciar el estado de "sin datos"
      try {
        const token = localStorage.getItem("token");
        const { usersByMonth, recipesByMonth } =
          await getUsersAndRecipesByMonth(year, token);

        // Lista de meses
        const months = [
          "Enero",
          "Febrero",
          "Marzo",
          "Abril",
          "Mayo",
          "Junio",
          "Julio",
          "Agosto",
          "Septiembre",
          "Octubre",
          "Noviembre",
          "Diciembre",
        ];

        // Validar y procesar datos para usuarios
        const usersData = months.map((month) => {
          const found = usersByMonth.find((item) => item.month === month);
          const value = found ? found.total : 0;
          return typeof value === "number" && value >= 0 ? value : 0;
        });

        // Validar y procesar datos para recetas
        const recipesData = months.map((month) => {
          const found = recipesByMonth.find((item) => item.month === month);
          const value = found ? found.total : 0;
          return typeof value === "number" && value >= 0 ? value : 0;
        });

        // Verificar si hay datos para el año seleccionado
        if (
          usersData.every((val) => val === 0) &&
          recipesData.every((val) => val === 0)
        ) {
          setNoData(true);
        } else {
          // Configurar los datos del gráfico
          setChartData({
            labels: months,
            datasets: [
              {
                label: "Usuarios",
                data: usersData,
                backgroundColor: "rgba(238, 133, 50, 0.6)",
              },
              {
                label: "Recetas",
                data: recipesData,
                backgroundColor: "rgba(130, 131, 98, 0.6)",
              },
            ],
          });
        }
      } catch (err) {
        console.error("Error al cargar datos:", err);
        setError("No se pudieron cargar las estadísticas.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [year]);

  const handleYearChange = (e) => {
    const selectedYear = parseInt(e.target.value, 10);
    setYear(selectedYear);
  };

  if (loading) return <LoadingSpinner />;

  if (error) return <p>{error}</p>;

  return (
    <div className="user-recipe-charts-container">
      <h3 className="section-title text-center mt-10 mb-10">
        Usuarios y Recetas por Mes
      </h3>

      <div className="year-selector-container">
        <label htmlFor="year-select" className="year-selector-label">
          Seleccionar Año:
        </label>
        <select
          id="year-select"
          className="year-selector-dropdown"
          value={year}
          onChange={handleYearChange}
        >
          {Array.from(
            { length: new Date().getFullYear() - 2023 + 1 },
            (_, i) => 2024 + i
          ).map((yearOption) => (
            <option key={yearOption} value={yearOption}>
              {yearOption}
            </option>
          ))}
        </select>
      </div>
      {noData ? (
        <p className="no-data-message">
          No hay datos disponibles para el año seleccionado.
        </p>
      ) : (
        <div className="chart-wrapper-user">
          <Bar
            data={chartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                x: {
                  ticks: {
                    color: "#ffffff", // Cambia el color de los meses a blanco
                    font: {
                      size: 14, // Ajusta el tamaño de la tipografía
                      family: "Poppins", // Fuente personalizada
                    },
                  },
                  grid: {
                    display: false, // Oculta las líneas de la cuadrícula en el eje X
                  },
                },
                y: {
                  beginAtZero: true,
                  ticks: {
                    stepSize: 1,
                    color: "#ffffff", // Cambia el color de los valores a blanco
                    font: {
                      size: 14, // Ajusta el tamaño de la tipografía
                      family: "Poppins", // Fuente personalizada
                    },
                  },
                  grid: {
                    color: "rgba(255, 255, 255, 0.1)", // Líneas de cuadrícula sutiles
                  },
                },
              },
              plugins: {
                legend: {
                  position: "top",
                  labels: {
                    color: "#ffffff", // Cambia el color de la leyenda a blanco
                    font: {
                      size: 16, // Ajusta el tamaño de la tipografía de la leyenda
                      family: "Poppins", // Fuente personalizada
                    },
                  },
                },
              },
            }}
          />
        </div>
      )}
    </div>
  );
};

export default UserRecipeCharts;
