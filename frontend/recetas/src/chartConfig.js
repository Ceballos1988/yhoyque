import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Tooltip, Legend, Filler } from "chart.js";

// Registrar todos los módulos necesarios
ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Tooltip, Legend, Filler);

function logDev(message) {
  if (import.meta.env.MODE === "development") {
    console.debug(message); // Usa console.debug en lugar de console.log, que es menos intrusivo
  }
}

logDev("chartConfig.js se está cargando correctamente");