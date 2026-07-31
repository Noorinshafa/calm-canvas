import "../../styles/hero.css";
import { Link } from "react-router-dom";
import { useEffect, useRef } from "react";

import model1 from "../../assets/hero/model1.png";
import model2 from "../../assets/hero/model2.png";
import model3 from "../../assets/hero/model3.jpg";
import model4 from "../../assets/hero/model4.png";
import model5 from "../../assets/hero/model5.jpg";

function Hero() {

  const sceneRef = useRef(null);

  const stageRef = useRef(null);

  const animationRef = useRef(null);

  const rotationRef = useRef(0);

  const draggingRef = useRef(false);

  const startXRef = useRef(0);

  const velocityRef = useRef(0);

  const cards = [

    {
      title: "Graphic Tee",
      image: model1,
    },

    {
      title: "Premium Hoodie",
      image: model2,
    },

    {
      title: "Canvas Tote",
      image: model3,
    },

    {
      title: "Coffee Mug",
      image: model4,
    },

    {
      title: "Phone Case",
      image: model5,
    },

  ];
    useEffect(() => {

    const scene = sceneRef.current;
    const stage = stageRef.current;

    if (!scene || !stage) return;

    const cardElements = scene.querySelectorAll(".orbit-card");

    const total = cardElements.length;

    const radius = 340;

    function updateCards() {

      rotationRef.current += velocityRef.current;

      velocityRef.current *= 0.95;

      rotationRef.current += 0.12;

      cardElements.forEach((card, index) => {

        const angle =
          (360 / total) * index + rotationRef.current;

        card.style.transform = `
          rotateY(${angle}deg)
          translateZ(${radius}px)
        `;

      });

      animationRef.current =
        requestAnimationFrame(updateCards);

    }

    updateCards();

    function pointerDown(e) {

      draggingRef.current = true;

      startXRef.current = e.clientX;

      stage.classList.add("grabbing");

    }

    function pointerMove(e) {

      if (!draggingRef.current) return;

      const delta =
        e.clientX - startXRef.current;

      rotationRef.current += delta * 0.35;

      velocityRef.current = delta * 0.05;

      startXRef.current = e.clientX;

    }

    function pointerUp() {

      draggingRef.current = false;

      stage.classList.remove("grabbing");

    }

    stage.addEventListener("pointerdown", pointerDown);

    window.addEventListener("pointermove", pointerMove);

    window.addEventListener("pointerup", pointerUp);

    return () => {

      cancelAnimationFrame(animationRef.current);

      stage.removeEventListener(
        "pointerdown",
        pointerDown
      );

      window.removeEventListener(
        "pointermove",
        pointerMove
      );

      window.removeEventListener(
        "pointerup",
        pointerUp
      );

    };

  }, []);
    return (

    <section className="hero">

      <div className="hero-background"></div>

      <div className="hero-container">

        {/* LEFT */}

        <div className="hero-left">

          <span className="hero-tag">

            CALM CANVAS

          </span>

          <h1 className="hero-title">

            Wear Stories.

            <br />

            Live Beautifully.

          </h1>

          <p className="hero-description">

            Premium print-on-demand apparel and
            lifestyle products designed for people
            who appreciate creativity and timeless
            aesthetics.

          </p>

          <div className="hero-buttons">

            <Link
              to="/collections"
              className="hero-btn primary-btn"
            >

              Shop Collection

            </Link>

            <Link
              to="/about"
              className="hero-btn secondary-btn"
            >

              Discover More

            </Link>

          </div>

        </div>

        {/* RIGHT */}

        <div
          className="hero-right"
          ref={stageRef}
        >

          <div
            className="orbit-scene"
            ref={sceneRef}
          >

            {cards.map((card, index) => (

              <div
                className="orbit-card"
                key={index}
              >

                <div className="card-image">

                  <img
                    src={card.image}
                    alt={card.title}
                  />

                </div>

                <div className="card-info">

                  <h3>{card.title}</h3>

                </div>

              </div>

            ))}

          </div>

        </div>

      </div>

    </section>

  );

}

export default Hero;