import "../../styles/hero.css";
import { Link } from "react-router-dom";
import { useEffect, useRef } from "react";

import model1 from "../../assets/hero/model1.webp";
import model2 from "../../assets/hero/model2.webp";
import model3 from "../../assets/hero/model3.webp";
import model4 from "../../assets/hero/model4.webp";
import model5 from "../../assets/hero/model5.webp";

function Hero() {

  const stageRef = useRef(null);

  const copyRef = useRef(null);

  const animationRef = useRef(null);

  // eased pointer position: x/y = current, tx/ty = target
  const pointerRef = useRef({ x: 0, y: 0, tx: 0, ty: 0 });

  // Scattered film stills — position/size/rotation/depth are all data,
  // not decoration: depth controls how far each still travels under
  // the parallax dolly, and z controls whether it sits in front of
  // or behind the headline type.
  const stills = [

    {
      image: model1,
      title: "Graphic Tee",
      top: "10%",
      left: "60%",
      size: 220,
      rotate: -6,
      depth: 1.3,
      z: 30,
      blur: 0,
      brightness: 1,
    },

    {
      image: model2,
      title: "Premium Hoodie",
      top: "15%",
      left: "6%",
      size: 170,
      rotate: 5,
      depth: 0.4,
      z: 5,
      blur: 2,
      brightness: 0.72,
    },

    {
      image: model3,
      title: "Canvas Tote",
      top: "64%",
      left: "70%",
      size: 200,
      rotate: 8,
      depth: 1.15,
      z: 30,
      blur: 0,
      brightness: 1,
    },

    {
      image: model4,
      title: "Coffee Mug",
      top: "5%",
      left: "85%",
      size: 140,
      rotate: -10,
      depth: 0.3,
      z: 4,
      blur: 3,
      brightness: 0.65,
    },

    {
      image: model5,
      title: "Phone Case",
      top: "70%",
      left: "16%",
      size: 180,
      rotate: -4,
      depth: 0.8,
      z: 15,
      blur: 0.5,
      brightness: 0.88,
    },

  ];

  useEffect(() => {

    const stage = stageRef.current;
    const copyEl = copyRef.current;

    if (!stage) return;

    const stillEls = stage.querySelectorAll(".film-still");

    const reduceMotion =
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function loop() {

      const pointer = pointerRef.current;

      pointer.x += (pointer.tx - pointer.x) * 0.06;
      pointer.y += (pointer.ty - pointer.y) * 0.06;

      const t = performance.now() * 0.001;

      stillEls.forEach((el, i) => {

        const depth = parseFloat(el.dataset.depth) || 1;
        const rotate = parseFloat(el.dataset.rotate) || 0;

        const bobAmp = reduceMotion ? 0 : 5;
        const bob = Math.sin(t * 0.6 + i * 1.4) * bobAmp * depth;

        const mx = pointer.x * depth * 55;
        const my = pointer.y * depth * 38 + bob;

        el.style.transform = `
          translate(-50%, -50%)
          translate(${mx}px, ${my}px)
          rotate(${rotate}deg)
        `;

      });

      if (copyEl) {
        copyEl.style.transform = `translate(${pointer.x * -14}px, ${pointer.y * -8}px)`;
      }

      animationRef.current = requestAnimationFrame(loop);

    }

    loop();

    function mouseMove(e) {

      if (reduceMotion) return;

      const rect = stage.getBoundingClientRect();

      pointerRef.current.tx = (e.clientX - rect.left) / rect.width - 0.5;
      pointerRef.current.ty = (e.clientY - rect.top) / rect.height - 0.5;

    }

    function mouseLeave() {

      pointerRef.current.tx = 0;
      pointerRef.current.ty = 0;

    }

    stage.addEventListener("mousemove", mouseMove);

    stage.addEventListener("mouseleave", mouseLeave);

    return () => {

      cancelAnimationFrame(animationRef.current);

      stage.removeEventListener("mousemove", mouseMove);

      stage.removeEventListener("mouseleave", mouseLeave);

    };

  }, []);

  return (

    <section className="hero">

      <div className="hero-backdrop" aria-hidden="true"></div>

      <div className="hero-sweep" aria-hidden="true"></div>

      <div className="hero-grain" aria-hidden="true"></div>

      <div className="hero-vignette" aria-hidden="true"></div>

      <span className="hero-spine" aria-hidden="true">Calm Canvas</span>

      <div className="hero-stage" ref={stageRef}>

        <div className="hero-gallery">

          {stills.map((s, i) => (

            <div
              className="film-still"
              key={i}
              data-depth={s.depth}
              data-rotate={s.rotate}
              style={{
                "--top": s.top,
                "--left": s.left,
                "--size": `${s.size}px`,
                "--rotate": `${s.rotate}deg`,
                zIndex: s.z,
                filter: `blur(${s.blur}px) brightness(${s.brightness})`,
              }}
            >

              <div className="still-frame">

                <img src={s.image} alt={s.title} />

                <div className="still-caption">
                  {String(i + 1).padStart(2, "0")} — {s.title}
                </div>

              </div>

            </div>

          ))}

        </div>

        <div className="hero-copy" ref={copyRef}>

          <h1 className="hero-title">

            Wear Stories.

            <br />

            <span className="title-accent">Live Beautifully.</span>

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

      </div>

      

    </section>

  );

}

export default Hero;
