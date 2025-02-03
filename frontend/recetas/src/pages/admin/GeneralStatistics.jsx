import PropTypes from "prop-types";
import "../../styles/admin/adminStatistics.css";

const GeneralStatistics = ({ statistics }) => {
  return (
    <div className="statistics-cards">
      <div className="statistics-card">
        <h3 className="statistics-value">{statistics?.totalUsers}</h3>
        <p className="statistics-label">Usuarios</p>
      </div>
      <div className="statistics-card">
        <h3 className="statistics-value">{statistics?.totalRecipes}</h3>
        <p className="statistics-label">Recetas</p>
      </div>
      <div className="statistics-card">
        <h3 className="statistics-value">{statistics?.totalReports}</h3>
        <p className="statistics-label">Reportes</p>
      </div>
      <div className="statistics-card">
        <h3 className="statistics-value">{statistics?.totalLikes}</h3>
        <p className="statistics-label">Likes</p>
      </div>
    </div>
  );
};

GeneralStatistics.propTypes = {
  statistics: PropTypes.shape({
    totalUsers: PropTypes.number.isRequired,
    totalRecipes: PropTypes.number.isRequired,
    totalReports: PropTypes.number.isRequired,
    totalLikes: PropTypes.number.isRequired,
  }).isRequired,
};

export default GeneralStatistics;
