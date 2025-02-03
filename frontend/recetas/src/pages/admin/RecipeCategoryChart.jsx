import { useState, useEffect } from "react";
import { Pie } from "react-chartjs-2";
import LoadingSpinner from "../../components/LoadingSpinner";
import {
  getRecipeCategoryDistribution,
  getRecipeDietTypeDistribution,
} from "../../services/api";

const RecipeCategoryDietChart = () => {
  const [categoryChartData, setCategoryChartData] = useState(null);
  const [dietChartData, setDietChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Traducción de categorías y tipos de dieta
  const translate = (key, type) => {
    const translations = {
      category: {
        Appetizer: "Entrada",
        "Main Course": "Plato Principal",
        Dessert: "Postre",
        "Side Dish": "Acompañamiento",
        Pastry: "Repostería",
      },
      diet: {
        Vegetarian: "Vegetariano",
        Vegan: "Vegano",
        "Gluten-Free": "Sin Gluten",
        "Dairy-Free": "Sin Lácteos",
        Keto: "Keto",
        Paleo: "Paleo",
        None: "Ninguno",
      },
    };
    return translations[type][key] || key;
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");

        // Cargar datos de categorías
        const categoryData = await getRecipeCategoryDistribution(token);
        const categories = categoryData.map((item) =>
          translate(item.courseType, "category")
        );
        const categoryTotals = categoryData.map((item) => item.total);

        setCategoryChartData({
          labels: categories,
          datasets: [
            {
              data: categoryTotals,
              backgroundColor: [
                "#EE8532",
                "#0f172b",
                "#D7AA59",
                "#828362",
                "#010a13",
                "#ff4500",
               
              ],
              borderColor: "#ffffff",
              borderWidth: 2,
            },
          ],
        });

        // Cargar datos de tipo de dieta
        const dietData = await getRecipeDietTypeDistribution(token);
        const diets = dietData.map((item) => translate(item.dietType, "diet"));
        const dietTotals = dietData.map((item) => item.total);

        setDietChartData({
          labels: diets,
          datasets: [
            {
              data: dietTotals,
              backgroundColor: [
                "#EE8532",
                "#0f172b",
                "#D7AA59",
                "#828362",
                "#010a13",
                "#ff4500",
                "#D7AA59",

              ],
              borderColor: "#ffffff",
              borderWidth: 2,
            },
          ],
        });
      } catch (err) {
        console.error("Error al cargar los datos:", err);
        setError("No se pudieron cargar los datos de las gráficas.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="chart-spinner-container">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return <p className="chart-error-message">{error}</p>;
  }

  return (
    <div className="charts-container-category flex"> 
      <div className="chart-wrapper">
        <h3 className="section-title text-center">Distribución por: <br /> Categoría</h3>
        <div className="chart-wrapper-category">
        <Pie
          data={categoryChartData}
          options={{
            responsive: true,
            plugins: {
              legend: {
                position: "top",
                labels: {
                  color: "#ffffff",
                  font: {
                    size: 14,
                    family: "Poppins",
                  },
                  
                },
                
              },
            },
          }}
          style={{ height: "300px", width: "300px" }} // Tamaño fijo
        />
      </div>
      </div>
      <div className="chart-wrapper">
        <h3 className="section-title text-center">Distribución por: <br /> Tipo de Dieta</h3>
        <div className="chart-wrapper-category">
        <Pie
          data={dietChartData}
          options={{
            responsive: true,
            plugins: {
              legend: {
                position: "top",
                labels: {
                  color: "#ffffff",
                  font: {
                    size: 14,
                    family: "Poppins",
                  },
                },
              },
            },
          }}
          style={{ height: "300px", width: "300px" }} // Tamaño fijo

        />
      </div>
      </div>
    </div>
  );
};

export default RecipeCategoryDietChart;
