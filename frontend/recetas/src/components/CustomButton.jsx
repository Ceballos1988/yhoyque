import PropTypes from 'prop-types';

/**
 * CustomButton - Componente de botón personalizado.
 *
 * @param {Object} props - Las propiedades del componente.
 * @param {string|node} props.text - El texto que se mostrará en el botón.
 * @param {string} [props.bgColor] - Clase para el color de fondo del botón.
 * @param {string} [props.textColor] - Clase para el color del texto del botón.
 * @param {Function} [props.onClick] - Función que se ejecutará cuando se haga clic en el botón.
 * @param {boolean} [props.disabled] - Indica si el botón está deshabilitado.
 * @returns {JSX.Element} - Componente de botón personalizado.
 */
function CustomButton({ text, bgColor = '', textColor = '', onClick = () => {}, disabled = false }) {
  return (
    <button
      className={`text-base px-4 py-2 rounded-md font-raleway font-bold transition-all duration-300 ${bgColor} ${textColor} hover:bg-[#0f172b] ${disabled ? 'bg-gray-400 cursor-not-allowed' : ''}`}
      onClick={onClick}
      disabled={disabled} // Asegúrate de pasarle el atributo disabled
      aria-disabled={disabled} // Atributo de accesibilidad para indicar que el botón está deshabilitado
      aria-label={typeof text === 'string' ? text : 'Cargando...'} // Atributo de accesibilidad para describir la acción del botón
    >
      {text}
    </button>
  );
}

CustomButton.propTypes = {
  text: PropTypes.node.isRequired, // El texto del botón es obligatorio, puede ser un nodo o una cadena
  bgColor: PropTypes.string, // Clase CSS para el fondo del botón
  textColor: PropTypes.string, // Clase CSS para el color del texto del botón
  onClick: PropTypes.func, // Función que se ejecuta al hacer clic en el botón
  disabled: PropTypes.bool, // Propiedad para manejar si el botón está deshabilitado
};

export default CustomButton;
