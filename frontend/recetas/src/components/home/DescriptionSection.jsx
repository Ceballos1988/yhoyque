// src/components/home/DescriptionSection.jsx

import "../../styles/components/home/style.descriptionSection.css";

/**
 * Componente DescriptionSection que muestra una descripción introductoria de la aplicación.
 * Contiene una imagen y un texto explicativo sobre las funcionalidades y beneficios de la app.
 * @component
 * @returns {JSX.Element} - La sección de descripción de la aplicación.
 */
function DescriptionSection() {
  return (
    <section
      className="description-section bg-naranja-bg"
      data-aos="zoom-in-left"
      aria-labelledby="description-title"
    >
      <div className="description-content" data-aos="zoom-in">
        {/* Imagen representativa de la cocina */}
        <img
          src="/img/imagen1.png"
          alt="Utensilios e ingredientes"
          className="description-image"
        />

        {/* Texto explicativo sobre la aplicación */}
        <div className="description-text ml-10">
          <h2
            id="description-title"
            className="section-title-description text-left text-white"
          >
            <strong>¿Y HOY QUÉ?</strong><br /> TU ALIADO EN LA COCINA
          </h2>

          <p className="text-white text-left pr-10">
            No más dudas sobre qué cocinar con lo que tenés en casa. Nuestra app
            te permite descubrir
            <strong> recetas adaptadas</strong> a tus ingredientes disponibles.
            Explorá, compartí y guardá tus recetas favoritas. Unite a una
            comunidad culinaria apasionada, compartí tu creatividad y encontrá
            inspiración en la cocina, ¡todos los días!
          </p>

        </div>
      </div>
    </section>
  );
}

export default DescriptionSection;
