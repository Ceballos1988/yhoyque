import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "../../styles/components/home/style.TestimonialCarousel.css";

/**
 * Componente TestimonialCarousel que muestra un carrusel de testimonios de los usuarios.
 * Utiliza react-slick para crear el carrusel con configuraciones de deslizamiento automático
 * y diferentes ajustes según el tamaño de la pantalla.
 * @component
 * @returns {JSX.Element} - El carrusel de testimonios.
 */
const TestimonialCarousel = () => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    centerMode: true, // Solo para pantallas grandes
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
          centerMode: false,
        },
      },
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          centerMode: false,
        },
      },
    ],
  };

  const testimonials = [
    {
      id: 1,
      quote: "Desde que la uso, encuentro recetas nuevas que no sabía que podía hacer. ¡La amo!",
      name: "Mariana G.",
      profession: "Aficionada a la cocina",
      image: "/img/testimonio-1.png",
    },
    {
      id: 2,
      quote: "La función de lista de compras es increíble, ¡y la app funciona sin conexión! ¡Me encanta!",
      name: "Lucas R.",
      profession: "Profesor",
      image: "/img/testimonio-3.png",
    },
    {
      id: 3,
      quote: "Es una gran ayuda poder ver recetas y elegir según el tiempo que tengo para cocinar.",
      name: "Laura M.",
      profession: "Estudiante",
      image: "/img/testimonio-2.png",
    },
  ];

  return (
    <section className="testimonial-section mb-10 mt-10" data-aos="fade-up" aria-labelledby="testimonial-title">
      <div className="container-testimonial mx-auto text-center">
        <h2 id="testimonial-title" className="section-title-testimonial">
          LO QUE OPINAN NUESTROS USUARIOS
        </h2>
        
        <Slider {...settings} aria-label="Carrusel de testimonios">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="testimonial-item" role="group" aria-roledescription="Testimonio">
              <p className="text-white mt-4 font-raleway">{testimonial.quote}</p>
              
              <div className="testimonial-footer flex items-center justify-center mt-4">
                <img
                  className="rounded-full"
                  src={testimonial.image}
                  alt={`${testimonial.name}`}
                  style={{ width: '50px', height: '50px' }}
                />
                
                <div className="pl-3 text-left">
                  <h5 className="text-lg font-bold text-white">{testimonial.name}</h5>
                  <small className="text-white">{testimonial.profession}</small>
                </div>
              </div>
            </div>
          ))}
        </Slider>
      </div>
    </section>
  );
};

export default TestimonialCarousel;
