// src/components/home/CommunitySection.jsx

import "../../styles/components/home/style.communitySection.css";

/**
 * Componente CommunitySection que muestra una sección promocional para unirse a la comunidad de usuarios.
 * Incluye información sobre beneficios de la comunidad, un botón para seguir en Instagram y una imagen representativa.
 * @component
 * @returns {JSX.Element} - La sección de comunidad.
 */
function CommunitySection() {
  return (
    <section
      className="community-section mt-10 py-10"
      data-aos="zoom-out-down"
      id="comunidad"
      aria-labelledby="community-title"
    >
      <div className="container-community mx-auto flex flex-col lg:flex-row justify-center items-center lg:gap-10">
        {/* Imagen representativa de la comunidad */}
        <div className="instagram-post-container lg:w-1/2 flex justify-center">
          <img
            src="/img/imagen5.png"
            alt="Comunidad de usuarios interactuando"
            className="instagram-post"
          />
        </div>
        {/* Columna de texto */}
        <div className="text-container lg:w-1/2 mb-8 lg:mb-0 text-left">
          <h2
            id="community-title"
            className="text-white text-3xl font-bold mb-10"
          >
            ¡UNITE A NUESTRA COMUNIDAD!
          </h2>

          <p className="text-white mb-4 mt-10">
            Formá parte de una comunidad apasionada por la cocina y descubrí
            ideas nuevas todos los días. Seguinos en redes sociales, compartí
            tus experiencias y accedé a contenido exclusivo.
          </p>

          <ul
            className="list-marked mb-4"
            aria-label="Beneficios de unirse a la comunidad"
          >
            <li>
              <strong>- Recetas exclusivas:</strong> Accedé a recetas especiales
              y tips directamente en nuestra comunidad.
            </li>
            <li>
              <strong>- Compartí tus creaciones:</strong> Subí fotos y
              comentarios sobre las recetas que prepares.
            </li>
            <li>
              <strong>- Desafíos y eventos:</strong> Participá en retos de
              cocina y eventos en redes sociales.
            </li>
            <li>
              <strong>- Conectate con otros:</strong> Interactuá con personas
              que comparten tus gustos culinarios.
            </li>
          </ul>

          <button
            className="button-ig mt-4 font-raleway font-bold"
            onClick={() =>
              window.open("https://instagram.com/yhoyque_recetas", "_blank")
            }
            aria-label="Síguenos en Instagram"
          >
            Síguenos en Instagram
          </button>
        </div>
      </div>
    </section>
  );
}

export default CommunitySection;
