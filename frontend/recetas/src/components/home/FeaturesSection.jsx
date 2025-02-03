import { useEffect, useState } from "react";
import VanillaTilt from "vanilla-tilt";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "../../styles/components/home/style.featuresSection.css";

/**
 * Componente FeaturesSection que muestra las características principales de la aplicación.
 * Utiliza VanillaTilt para aplicar un efecto de inclinación en las tarjetas de características.
 * @component
 * @returns {JSX.Element} - La sección de características.
 */
function FeaturesSection() {
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 1024);

  useEffect(() => {
    // Configurar VanillaTilt
    const tiltElements = document.querySelectorAll(".tilt");
    if (tiltElements.length > 0) {
      VanillaTilt.init(tiltElements, {
        reverse: true,
        max: 15,
        speed: 400,
        scale: 1.1,
        glare: true,
        "max-glare": 0.5,
      });
    }

    // Actualizar el estado según el tamaño de la pantalla
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 1024);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      tiltElements.forEach((element) => {
        element.vanillaTilt.destroy();
      });
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const features = [
    {
      icon: "/img/ico-1.png",
      title: "Búsqueda",
      description:
        "Encontrá recetas personalizadas con los ingredientes que tenés en casa, evitando desperdicios y ahorrando tiempo.",
    },
    {
      icon: "/img/ico-2.png",
      title: "Preparación",
      description:
        "Seguí las recetas paso a paso con un modo de preparación fácil de usar y bien detallado.",
    },
    {
      icon: "/img/ico-3.png",
      title: "Filtros",
      description:
        "Filtrá las recetas según el tiempo de preparación y nivel de dificultad para adaptarlas a tus necesidades.",
    },
    {
      icon: "/img/ico-4.png",
      title: "Favoritos",
      description:
        "Guardá tus recetas favoritas para acceder rápidamente a ellas cuando las necesites.",
    },
    {
      icon: "/img/ico-5.png",
      title: "Comunidad",
      description:
        "Unite a una comunidad de cocineros, compartí tus propias recetas y encontrá inspiración en las creaciones de otros usuarios.",
    },
    {
      icon: "/img/ico-6.png",
      title: "Opinión",
      description:
        "Compartí tu opinión y revisá las experiencias de otros usuarios para descubrir las recetas más populares.",
    },
  ];

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    centerPadding: "20px", // Reduce el espacio lateral entre tarjetas
    responsive: [
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          centerPadding: "10px", // Reduce aún más el espacio lateral para dispositivos pequeños
        },
      },
    ],
  };
  

  return (
    <section
      className="features-section mb-10 mt-5"
      data-aos="zoom-in"
      aria-labelledby="features-title"
    >
      <h2 id="features-title" className="section-title-features text-center mb-10">
        CARACTERÍSTICAS PRINCIPALES
      </h2>

      {isMobileView ? (
        // Carrusel para pantallas menores a 1024px
        <Slider {...sliderSettings}>
          {features.map((feature, index) => (
            <div key={index} className="feature-card tilt mb-10">
              <div className="feature-icon-container">
                <img
                  src={feature.icon}
                  alt={`Icono de ${feature.title.toLowerCase()}`}
                  className="feature-icon"
                />
              </div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </Slider>
      ) : (
        // Grid para pantallas mayores o iguales a 1024px
        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card tilt">
              <div className="feature-icon-container">
                <img
                  src={feature.icon}
                  alt={`Icono de ${feature.title.toLowerCase()}`}
                  className="feature-icon"
                />
              </div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default FeaturesSection;
