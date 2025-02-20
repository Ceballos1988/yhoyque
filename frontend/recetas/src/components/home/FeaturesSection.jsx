import { useEffect, useState } from "react";
import VanillaTilt from "vanilla-tilt";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "../../styles/components/home/style.featuresSection.css";

function FeaturesSection() {
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 1024);

  useEffect(() => {
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
    { icon: "/img/ico-1.png", title: "Búsqueda", description: "Encontrá recetas personalizadas con los ingredientes que tenés en casa, evitando desperdicios y ahorrando tiempo." },
    { icon: "/img/ico-2.png", title: "Preparación", description: "Seguí las recetas paso a paso con un modo de preparación fácil de usar y bien detallado." },
    { icon: "/img/ico-3.png", title: "Filtros", description: "Filtrá las recetas según el tiempo de preparación y nivel de dificultad para adaptarlas a tus necesidades." },
    { icon: "/img/ico-4.png", title: "Favoritos", description: "Guardá tus recetas favoritas para acceder rápidamente a ellas cuando las necesites." },
    { icon: "/img/ico-5.png", title: "Comunidad", description: "Unite a una comunidad de cocineros, compartí tus propias recetas y encontrá inspiración en las creaciones de otros usuarios." },
    { icon: "/img/ico-6.png", title: "Opinión", description: "Compartí tu opinión y revisá las experiencias de otros usuarios para descubrir las recetas más populares." },
  ];

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    centerMode: true,
    centerPadding: "0px",
    adaptiveHeight: true,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          centerMode: true,
          centerPadding: "0px",
        },
      },
    ],
  };

  return (
    <section className="features-section mb-10 mt-5" data-aos="zoom-in" aria-labelledby="features-title">
      <h2 id="features-title" className="features-section-title text-center mb-10">
        CARACTERÍSTICAS PRINCIPALES
      </h2>

      {isMobileView ? (
        <Slider {...sliderSettings} key={isMobileView} className="features-slider">
          {features.map((feature, index) => (
            <div key={index} className="features-carousel-item tilt">
              <div className="features-icon-container">
                <img src={feature.icon} alt={`Icono de ${feature.title.toLowerCase()}`} className="features-icon" />
              </div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </Slider>
      ) : (
        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card tilt">
              <div className="features-icon-container">
                <img src={feature.icon} alt={`Icono de ${feature.title.toLowerCase()}`} className="features-icon" />
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
