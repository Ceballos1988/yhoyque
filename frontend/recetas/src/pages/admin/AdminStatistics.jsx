import { useEffect, useState } from "react";
import {
  getAdminStatistics,
  getTopRecipesByLikes,
  getReportMotives,
} from "../../services/api";
import "../../styles/admin/adminStatistics.css";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, LineElement } from "chart.js";
import TopRecipes from "./TopRecipes";
import GeneralStatistics from "./GeneralStatistics";
import ReportCharts from "./ReportCharts";
import UserRecipeCharts from "./UserRecipeCharts";
import LoadingSpinner from "../../components/LoadingSpinner"; // Importa el componente del spinner
import "../../chartConfig"; // Asegúrate de que la ruta sea correcta
import RecipeCategoryChart from "./RecipeCategoryChart";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, LineElement);

const AdminStatistics = () => {
  const [statistics, setStatistics] = useState(null);
  const [topLikes, setTopLikes] = useState([]);
  const [reportDistribution, setReportDistribution] = useState(null);
  const [recipeMotivesChart, setRecipeMotivesChart] = useState(null);
  const [commentMotivesChart, setCommentMotivesChart] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const copyToClipboard = (id) => {
    navigator.clipboard.writeText(id);
    alert("¡ID copiado al portapapeles!");
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");

        // Obtener estadísticas generales
        const stats = await getAdminStatistics(token);
        setStatistics(stats);

        // Obtener recetas más populares
        const likesData = await getTopRecipesByLikes(token);

        // Valida que el campo `likes` exista en los datos y sea válido
        const validLikesData = likesData.map((recipe) => ({
          ...recipe,
          likes: recipe.likes || 0,
        }));

        setTopLikes(validLikesData.slice(0, 3)); // Solo toma las 3 primeras recetas más populares

        // Obtener motivos de reportes
        const motivesData = await getReportMotives(token);

        // Configurar gráficos de distribución de reportes
        setReportDistribution({
          labels: ["Recetas", "Comentarios"],
          datasets: [
            {
              data: [
                motivesData.recipeMotives.reduce((acc, curr) => acc + curr.count, 0),
                motivesData.commentMotives.reduce((acc, curr) => acc + curr.count, 0),
              ],
              backgroundColor: ["#EE8532", "#D7AA59"],
              borderColor: ["#ffffff", "#ffffff"],
              borderWidth: 2,
            },
          ],
        });

        // Configurar gráfico de motivos de recetas
        setRecipeMotivesChart({
          labels: motivesData.recipeMotives.map((motive) => motive.motive),
          datasets: [
            {
              data: motivesData.recipeMotives.map((motive) => motive.count),
              backgroundColor: motivesData.recipeMotives.map((_, index) => {
                const colors = ["#EE8532", "#D7AA59", "#828362", "#010a13"];
                return colors[index % colors.length];
              }),
              borderColor: ["#ffffff"],
              borderWidth: 2,
            },
          ],
        });

        // Configurar gráfico de motivos de comentarios
        setCommentMotivesChart({
          labels: motivesData.commentMotives.map((motive) => motive.motive),
          datasets: [
            {
              data: motivesData.commentMotives.map((motive) => motive.count),
              backgroundColor: motivesData.commentMotives.map((_, index) => {
                const colors = ["#EE8532", "#D7AA59", "#828362", "#010a13"];
                return colors[index % colors.length];
              }),
              borderColor: ["#ffffff"],
              borderWidth: 2,
            },
          ],
        });
      } catch (err) {
        console.error("Error al obtener estadísticas:", err);
        setError("No se pudieron cargar las estadísticas.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="spinner-container mt-10">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return <p className="error-message">{error}</p>;
  }

  return (
    <div className="admin-statistics">
      <h2 className="statistics-title">Estadísticas Generales</h2>
      <div className="admin-statistics-container">
        <GeneralStatistics statistics={statistics} />
        <TopRecipes
          topLikes={topLikes}
          copyToClipboard={copyToClipboard} // Pasa la función para copiar al portapapeles
        />
        <ReportCharts
          reportDistribution={reportDistribution}
          recipeMotivesChart={recipeMotivesChart}
          commentMotivesChart={commentMotivesChart}
        />
        <UserRecipeCharts /> {/* Nuevo componente */}
        <RecipeCategoryChart />
      </div>
    </div>
  );
};

export default AdminStatistics;
