import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import "../../styles/hero.css";
import OptimizedImage from "../ui/OptimizedImage";
import useHomePhoto from "../../hooks/useHomePhoto";
import { heroSlidesFor, HERO_SIZES, HERO_WIDTHS } from "../../content/homeImages.js";

// How long each banner stays before the next one fades in.
const SLIDE_MS = 7000;

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
  );
}

// One banner: a large real lifestyle photo of a shop product and a coloured
// panel with the heading, a line of text and a button. Only the first banner
// has the page's main heading (h1); its photo loads first and at top
// priority. The other photos are only put on the page once the first screen
// has finished loading (`showPhoto`), so they never slow it down.
function Slide({ slide, index, total, active, showPhoto }) {
  const photo = useHomePhoto(slide);
  const Heading = index === 0 ? "h1" : "h2";

  return (
    <div
      className={`hero-slide hero-slide--${slide.tone} hero-slide--photo-${slide.side}${
        active ? " is-active" : ""
      }`}
      role="group"
      aria-roledescription="slide"
      aria-label={`${index + 1} of ${total}`}
      aria-hidden={active ? undefined : true}
      inert={!active}
    >
      <Link to={`/products/${photo.slug}`} className="hero-slide-media" tabIndex={-1}>
        {showPhoto && (
          <OptimizedImage
            className="hero-slide-img"
            src={photo.src}
            alt={photo.alt}
            widths={HERO_WIDTHS}
            sizes={HERO_SIZES}
            priority={index === 0}
            loading={index === 0 ? "eager" : "lazy"}
            width="1200"
            height="1200"
            style={{ objectPosition: slide.position }}
          />
        )}
      </Link>

      <div className="hero-slide-panel">
        <div className="hero-slide-copy">
          <Heading id={index === 0 ? "hero-title" : undefined} className="hero-slide-title">
            {slide.heading}
          </Heading>
          <p className="hero-slide-text">{slide.text}</p>
          <Link
            to={slide.cta.path}
            className={`btn ${slide.tone === "forest" ? "btn--light" : "btn--primary"}`}
          >
            {slide.cta.label}
          </Link>
        </div>
      </div>
    </div>
  );
}

// Top of the home page: three banners that take turns every 7 seconds.
// Visitors can move between them with the arrows, the dots or a swipe, and
// stop them with the pause button. They also stop while pointed at or while
// a link inside has keyboard focus, never move for visitors who have asked
// their device for less motion, and stop for good once a visitor uses the
// controls. Hidden banners cannot be reached with the keyboard (inert).
// The first banner's heading is the page's main search heading: keep it in
// step with the home page in scripts/postbuild.mjs.
function Hero({ festive = false }) {
  const slides = heroSlidesFor(festive);
  const total = slides.length;

  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(() => !prefersReducedMotion());
  const [hovered, setHovered] = useState(false);
  const [restReady, setRestReady] = useState(false);
  const touchStart = useRef(null);

  // The other banners' photos are added once the page has loaded and the
  // browser has a quiet moment.
  useEffect(() => {
    let idleId;
    let timerId;
    const start = () => {
      if ("requestIdleCallback" in window) {
        idleId = window.requestIdleCallback(() => setRestReady(true), { timeout: 3000 });
      } else {
        timerId = window.setTimeout(() => setRestReady(true), 1500);
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
    if (!playing || hovered || total < 2) return undefined;
    const id = window.setTimeout(() => {
      setRestReady(true);
      setCurrent((index) => (index + 1) % total);
    }, SLIDE_MS);
    return () => window.clearTimeout(id);
  }, [playing, hovered, current, total]);

  const goTo = useCallback(
    (index) => {
      setRestReady(true);
      setPlaying(false);
      setCurrent((index + total) % total);
    },
    [total]
  );

  // A sideways swipe (not an up/down scroll) moves to the next or previous
  // banner.
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
      // Pressing play should start the banners at once, even though the
      // pointer and keyboard focus are still on the hero.
      setHovered(false);
      setPlaying(true);
    }
  }

  return (
    <section
      className="hero"
      aria-roledescription="carousel"
      aria-label="Featured collections"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setHovered(false);
      }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div className="hero-slides">
        {slides.map((slide, index) => (
          <Slide
            key={slide.key}
            slide={slide}
            index={index}
            total={total}
            active={index === current}
            showPhoto={index === 0 || restReady}
          />
        ))}
      </div>

      {total > 1 && (
        <div className="hero-controls">
          <button
            type="button"
            className="hero-ctrl"
            onClick={() => goTo(current - 1)}
            aria-label="Previous banner"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M15 5l-7 7 7 7" />
            </svg>
          </button>

          <div className="hero-dots">
            {slides.map((slide, index) => (
              <button
                key={slide.key}
                type="button"
                className="hero-dot"
                onClick={() => goTo(index)}
                aria-label={`Show banner ${index + 1} of ${total}`}
                aria-current={index === current ? "true" : undefined}
              />
            ))}
          </div>

          <button
            type="button"
            className="hero-ctrl"
            onClick={() => goTo(current + 1)}
            aria-label="Next banner"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <button
            type="button"
            className="hero-ctrl"
            onClick={togglePlaying}
            aria-label={playing ? "Pause banners" : "Play banners"}
          >
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
      )}
    </section>
  );
}

export default Hero;
