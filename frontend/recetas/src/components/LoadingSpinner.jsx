import '../styles/components/style.spinner.css'; // Ruta correcta al archivo de estilos

/**
 * Componente LoadingSpinner que muestra un spinner de carga.
 * Este componente se utiliza para indicar que se está procesando algo, como la carga de datos.
 * @component
 * @returns {JSX.Element} El spinner de carga.
 */
const LoadingSpinner = () => {
  return (
    <div className="spinner-container" role="alert" aria-busy="true" aria-live="polite">
      {/* Spinner de carga visual */}
      <div className="loading-spinner" aria-hidden="true"></div>
    </div>
  );
};

export default LoadingSpinner;
