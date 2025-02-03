import PropTypes from "prop-types";
import { Doughnut } from "react-chartjs-2";

const ReportCharts = ({
  reportDistribution,
  recipeMotivesChart,
  commentMotivesChart,
}) => {
  return (
    <div className="charts-section">
      <h3 className="section-title text-center">Gráficos de Reportes</h3>
      <div className="charts-container-triple">
        <div className="chart">
          <h4 className="chart-title">
            RECETAS <br /> Motivos de Reportes
          </h4>
          {recipeMotivesChart && (
            <Doughnut
              data={recipeMotivesChart}
              options={{
                plugins: {
                  legend: {
                    labels: {
                      color: "#ffffff",
                      font: { size: 14 },
                    },
                  },
                },
                layout: {
                  padding: { top: 20 },
                },
                cutout: "50%",
              }}
            />
          )}
        </div>

        <div className="chart">
          <h4 className="chart-title">Distribución de Reportes</h4>
          {reportDistribution && (
            <Doughnut
              data={reportDistribution}
              options={{
                plugins: {
                  legend: {
                    labels: {
                      color: "#ffffff",
                      font: { size: 14 },
                    },
                  },
                },
                cutout: "50%",
              }}
            />
          )}
        </div>

        <div className="chart">
          <h4 className="chart-title">
            COMENTARIOS <br /> Motivos de Reportes
          </h4>
          {commentMotivesChart && (
            <Doughnut
              data={commentMotivesChart}
              options={{
                plugins: {
                  legend: {
                    labels: {
                      color: "#ffffff",
                      font: { size: 14 },
                    },
                  },
                },
                layout: {
                  padding: { top: 20 },
                },
                cutout: "50%",
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

ReportCharts.propTypes = {
  reportDistribution: PropTypes.object.isRequired,
  recipeMotivesChart: PropTypes.object.isRequired,
  commentMotivesChart: PropTypes.object.isRequired,
};

export default ReportCharts;
