import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import "../../styles/hero.css";
import OptimizedImage from "../ui/OptimizedImage";
import useHomePhoto from "../../hooks/useHomePhoto";
import { GIFT_CARDS } from "../../content/homeImages.js";

// Banner 1: real models (photos from the shop's Canva library) cut out of
// their backgrounds and layered in depth. Two sizes each: phones and tablets
// get the 480px-tall copy, computers the 900px one.
import modelBlack480 from "../../assets/home/hero/model-black-480.webp";
import modelBlack900 from "../../assets/home/hero/model-black-900.webp";
import modelCouple480 from "../../assets/home/hero/model-couple-480.webp";
import modelCouple900 from "../../assets/home/hero/model-couple-900.webp";
import modelWhite480 from "../../assets/home/hero/model-white-480.webp";
import modelWhite900 from "../../assets/home/hero/model-white-900.webp";
import modelGrey480 from "../../assets/home/hero/model-grey-480.webp";
import modelGrey900 from "../../assets/home/hero/model-grey-900.webp";
// Banner 2: Christmas wallpaper (1 November to 26 December), else a T-shirt
// photo. Banner 3: hoodies and sweatshirts on a concrete wall. Banner 4:
// gifts on kraft paper (at Christmas) or a plain plaster wall.
import xmasStacks900 from "../../assets/home/hero/xmas-stacks-900.webp";
import xmasStacks1600 from "../../assets/home/hero/xmas-stacks-1600.webp";
import xmasKraft900 from "../../assets/home/hero/xmas-kraft-900.webp";
import xmasKraft1600 from "../../assets/home/hero/xmas-kraft-1600.webp";
import concrete560 from "../../assets/home/hero/photo-concrete-560.webp";
import concrete1000 from "../../assets/home/hero/photo-concrete-1000.webp";
import tee560 from "../../assets/home/hero/photo-tee-560.webp";
import tee1000 from "../../assets/home/hero/photo-tee-1000.webp";
import wallStone from "../../assets/home/wall-stone-1600.webp";

// How long each banner stays before the next one fades in.
const SLIDE_MS = 5000;

const MODELS = [
  { key: "grey", small: modelGrey480, large: modelGrey900, depth: 0.7 },
  { key: "couple", small: modelCouple480, large: modelCouple900, depth: 0.35 },
  { key: "black", small: modelBlack480, large: modelBlack900, depth: 1 },
  { key: "white", small: modelWhite480, large: modelWhite900, depth: 0.75 },
];

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
  );
}

function canHover() {
  return typeof window !== "undefined" && window.matchMedia?.("(hover: hover)").matches;
}

// The text block of a banner. The first banner's heading is the page's main
// heading (h1); the others are h2.
function Copy({ level = 2, id, title, text, children, align = "left" }) {
  const Heading = level === 1 ? "h1" : "h2";
  return (
    <div className={`hb-copy hb-copy--${align}`}>
      <Heading id={id} className="hb-title">
        {title}
      </Heading>
      <p className="hb-text">{text}</p>
      <div className="hb-actions">{children}</div>
    </div>
  );
}

function ModelsBanner() {
  return (
    <>
      <div className="hb-models" aria-hidden="true">
        <span className="hb-word" style={{ "--depth": 0.2 }}>
          Calm
          <br />
          Canvas
        </span>
        {MODELS.map((model, index) => (
          <picture
            key={model.key}
            className={`hb-model hb-model--${model.key}`}
            style={{ "--depth": model.depth }}
          >
            <source media="(max-width: 1023px)" srcSet={model.small} />
            <img
              src={model.large}
              alt=""
              loading={model.key === "grey" ? "lazy" : "eager"}
              fetchPriority={model.key === "couple" ? "high" : undefined}
              decoding="async"
            />
          </picture>
        ))}
        <span className="hb-floor" />
      </div>

      <Copy
        level={1}
        id="hero-title"
        title="Aesthetic Hoodies & Gifts Made From Original Art"
        text="Original artwork on cozy hoodies, sweatshirts, tees, mugs, tote bags and phone cases. Every piece is printed to order, just for you."
      >
        <Link to="/collections" className="btn btn--primary">
          Shop the collection
        </Link>
        <a href="#collections" className="btn btn--outline">
          Shop by category
        </a>
      </Copy>
    </>
  );
}

function ChristmasBanner() {
  return (
    <>
      <picture className="hb-bg" aria-hidden="true">
        <source media="(max-width: 1023px)" srcSet={xmasStacks900} />
        <img src={xmasStacks1600} alt="" loading="lazy" decoding="async" />
      </picture>
      <Copy
        align="center"
        title="Christmas gifts"
        text="Hoodies, sweatshirts, mugs and phone cases with original art, printed just for the person you're giving it to."
      >
        <Link to="/christmas-gifts" className="btn btn--primary">
          Shop Christmas gifts
        </Link>
      </Copy>
    </>
  );
}

function TeesBanner() {
  return (
    <>
      <picture className="hb-photo hb-photo--tee" aria-hidden="true">
        <source media="(max-width: 1023px)" srcSet={tee560} />
        <img src={tee1000} alt="" loading="lazy" decoding="async" />
      </picture>
      <Copy
        title="Graphic tees"
        text="Soft everyday T-shirts with original artwork, printed when you order."
      >
        <Link to="/tshirts" className="btn btn--primary">
          Shop T-shirts
        </Link>
      </Copy>
    </>
  );
}

function HoodiesBanner() {
  return (
    <>
      <picture className="hb-photo hb-photo--concrete" aria-hidden="true">
        <source media="(max-width: 1023px)" srcSet={concrete560} />
        <img src={concrete1000} alt="" loading="lazy" decoding="async" />
      </picture>
      <Copy
        title="Hoodies & sweatshirts"
        text="Original art on soft, warm fleece. Pick your colour and size; we print it just for you."
      >
        <Link to="/hoodies" className="btn btn--primary">
          Shop hoodies
        </Link>
        <Link to="/sweatshirts" className="btn btn--outline">
          Shop sweatshirts
        </Link>
      </Copy>
    </>
  );
}

// One photo card in the gifts banner: a real shop product, linked to its page.
function GiftCard({ card, index }) {
  const photo = useHomePhoto(card, card.collection);
  return (
    <Link to={`/products/${photo.slug}`} className={`hb-card hb-card--${index + 1}`}>
      <OptimizedImage
        src={photo.src}
        alt={photo.alt || photo.name}
        widths={[384]}
        sizes="(max-width: 1023px) 34vw, 260px"
        width="384"
        height="384"
      />
      <span className="hb-card-name">{photo.name}</span>
    </Link>
  );
}

function GiftsBanner({ festive }) {
  return (
    <>
      {festive ? (
        <picture className="hb-bg hb-bg--kraft" aria-hidden="true">
          <source media="(max-width: 1023px)" srcSet={xmasKraft900} />
          <img src={xmasKraft1600} alt="" loading="lazy" decoding="async" />
        </picture>
      ) : (
        <span className="hb-bg" aria-hidden="true" style={{ backgroundImage: `url(${wallStone})` }} />
      )}
      <div className="hb-cards">
        {GIFT_CARDS.map((card, index) => (
          <GiftCard key={card.slug} card={card} index={index} />
        ))}
      </div>
      <Copy
        title="Mugs, cases & totes"
        text="Little gifts with original art for the people you love: mugs, phone cases and tote bags."
      >
        <Link to="/mugs" className="btn btn--primary">
          Shop mugs
        </Link>
        <Link to="/phonecases" className="btn btn--outline">
          Shop phone cases
        </Link>
      </Copy>
    </>
  );
}

// Top of the home page: four banners that take turns every 5 seconds.
//   1. real models cut out and layered in depth (moves gently with the mouse)
//   2. Christmas (1 November to 26 December), else graphic tees
//   3. hoodies and sweatshirts
//   4. gifts: mugs, phone cases and tote bags
// Visitors can move between them with the arrows, the dots or a sideways
// swipe, and stop them with the pause button. They also stop while pointed
// at or while something inside has keyboard focus, never move for visitors
// who have asked their device for less motion, and stop for good once a
// visitor uses the controls. Hidden banners cannot be reached with the
// keyboard (inert). Only the first banner's pictures load straight away.
// Keep the first banner's heading in step with the home page in
// scripts/postbuild.mjs.
function Hero({ festive = false }) {
  const banners = [
    { key: "models", label: "Models", render: () => <ModelsBanner /> },
    festive
      ? { key: "christmas", label: "Christmas gifts", render: () => <ChristmasBanner /> }
      : { key: "tees", label: "Graphic tees", render: () => <TeesBanner /> },
    { key: "hoodies", label: "Hoodies and sweatshirts", render: () => <HoodiesBanner /> },
    { key: "gifts", label: "Mugs, phone cases and tote bags", render: () => <GiftsBanner festive={festive} /> },
  ];
  const total = banners.length;

  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(() => !prefersReducedMotion());
  const [hovered, setHovered] = useState(false);
  const [restReady, setRestReady] = useState(false);
  const touchStart = useRef(null);
  const sectionRef = useRef(null);
  const frame = useRef(0);

  // The other banners are put on the page once it has loaded and the browser
  // has a quiet moment, so they never compete with the first screen.
  useEffect(() => {
    let idleId;
    let timerId;
    const start = () => {
      if ("requestIdleCallback" in window) {
        idleId = window.requestIdleCallback(() => setRestReady(true), { timeout: 2500 });
      } else {
        timerId = window.setTimeout(() => setRestReady(true), 1200);
      }
    };
    if (document.readyState === "complete") start();
    else window.addEventListener("load", start, { once: true });
    return () => {
      window.removeEventListener("load", start);
      if (idleId && "cancelIdleCallback" in window) window.cancelIdleCallback(idleId);
      if (timerId) window.clearTimeout(timerId);
    };
  }, []);

  useEffect(() => {
    if (!playing || hovered || !restReady || total < 2) return undefined;
    const id = window.setTimeout(() => setCurrent((index) => (index + 1) % total), SLIDE_MS);
    return () => window.clearTimeout(id);
  }, [playing, hovered, restReady, current, total]);

  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  const goTo = useCallback(
    (index) => {
      setRestReady(true);
      setPlaying(false);
      setCurrent((index + total) % total);
    },
    [total]
  );

  // The 3D effect: the cut-out models and the big word behind them move a
  // little with the mouse, the nearer ones more than the farther ones. Only
  // on computers with a mouse, and never for visitors who prefer less motion.
  function onMouseMove(event) {
    if (!canHover() || prefersReducedMotion()) return;
    const box = sectionRef.current?.getBoundingClientRect();
    if (!box) return;
    const x = ((event.clientX - box.left) / box.width - 0.5) * 2;
    const y = ((event.clientY - box.top) / box.height - 0.5) * 2;
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      sectionRef.current?.style.setProperty("--mx", x.toFixed(3));
      sectionRef.current?.style.setProperty("--my", y.toFixed(3));
    });
  }

  function onTouchStart(event) {
    const touch = event.touches[0];
    touchStart.current = touch ? { x: touch.clientX, y: touch.clientY } : null;
  }

  function onTouchEnd(event) {
    const start = touchStart.current;
    const touch = event.changedTouches[0];
    touchStart.current = null;
    if (!start || !touch) return;
    const dx = touch.clientX - start.x;
    const dy = touch.clientY - start.y;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      goTo(current + (dx < 0 ? 1 : -1));
    }
  }

  function togglePlaying() {
    if (playing) {
      setPlaying(false);
    } else {
      setHovered(false);
      setPlaying(true);
    }
  }

  return (
    <section
      ref={sectionRef}
      className="hero"
      aria-roledescription="carousel"
      aria-label="Featured collections"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false);
        sectionRef.current?.style.setProperty("--mx", "0");
        sectionRef.current?.style.setProperty("--my", "0");
      }}
      onMouseMove={onMouseMove}
      onFocus={() => setHovered(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setHovered(false);
      }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div className="hero-slides">
        {banners.map((banner, index) => {
          const active = index === current;
          return (
            <div
              key={banner.key}
              className={`hb hb--${banner.key}${active ? " is-active" : ""}`}
              role="group"
              aria-roledescription="slide"
              aria-label={`${index + 1} of ${total}: ${banner.label}`}
              aria-hidden={active ? undefined : true}
              inert={!active}
            >
              {(index === 0 || restReady) && banner.render()}
            </div>
          );
        })}
      </div>

      <div className="hero-controls">
        <button type="button" className="hero-ctrl" onClick={() => goTo(current - 1)} aria-label="Previous banner">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M15 5l-7 7 7 7" />
          </svg>
        </button>
        <div className="hero-dots">
          {banners.map((banner, index) => (
            <button
              key={banner.key}
              type="button"
              className="hero-dot"
              onClick={() => goTo(index)}
              aria-label={`Show banner ${index + 1} of ${total}: ${banner.label}`}
              aria-current={index === current ? "true" : undefined}
            />
          ))}
        </div>
        <button type="button" className="hero-ctrl" onClick={() => goTo(current + 1)} aria-label="Next banner">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M9 5l7 7-7 7" />
          </svg>
        </button>
        <button type="button" className="hero-ctrl" onClick={togglePlaying} aria-label={playing ? "Pause banners" : "Play banners"}>
          {playing ? (
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
              <rect x="6" y="5" width="4" height="14" rx="1" />
              <rect x="14" y="5" width="4" height="14" rx="1" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
              <path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z" />
            </svg>
          )}
        </button>
      </div>
    </section>
  );
}

export default Hero;
