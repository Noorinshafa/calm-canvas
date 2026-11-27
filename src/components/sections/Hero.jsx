import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import "../../styles/hero.css";
import OptimizedImage from "../ui/OptimizedImage";
import useHomePhoto from "../../hooks/useHomePhoto";
import {
  heroSetsFor,
  HERO_MAIN_SIZES,
  HERO_MAIN_WIDTHS,
  HERO_SMALL_SIZES,
  HERO_SMALL_WIDTHS,
} from "../../content/homeImages.js";
// Painted plaster walls in white and greys (made by code, 5 KB each): one
// per studio set.
import wallWhite from "../../assets/home/wall-white-1600.webp";
import wallGrey from "../../assets/home/wall-grey-1600.webp";
import wallStone from "../../assets/home/wall-stone-1600.webp";

const WALLS = { white: wallWhite, grey: wallGrey, stone: wallStone };

// How long each studio set stays before the next one fades in.
const SET_MS = 3000;

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
  );
}

// One product in a set: Printify's plain "front" photo of a real shop
// product, linked to its page. Its white background blends into the wall
// (mix-blend-mode in hero.css), so only the product and its shadow show. If
// the product is ever removed from the shop, another product from the same
// collection takes its place (src/hooks/useHomePhoto.js).
function SetProduct({ item, place, eager }) {
  const photo = useHomePhoto({ ...item, kind: "front" }, item.collection);
  const main = place === "main";

  return (
    <Link to={`/products/${photo.slug}`} className={`hero-prod hero-prod--${place}`}>
      <OptimizedImage
        className="hero-prod-img"
        src={photo.src}
        alt={photo.alt || photo.name}
        widths={main ? HERO_MAIN_WIDTHS : HERO_SMALL_WIDTHS}
        sizes={main ? HERO_MAIN_SIZES : HERO_SMALL_SIZES}
        priority={eager && main}
        loading={eager ? "eager" : "lazy"}
        width="1200"
        height="1200"
      />
    </Link>
  );
}

// One studio set: a painted wall with an arch and a round plinth (drawn with
// CSS) and three products. Only the first set's photos load straight away;
// the others are added once the page has finished loading (`ready`).
function HeroSet({ set, index, total, active, ready }) {
  return (
    <div
      className={`hero-set hero-set--${set.wall}${active ? " is-active" : ""}`}
      style={ready ? { backgroundImage: `url(${WALLS[set.wall]})` } : undefined}
      role="group"
      aria-roledescription="slide"
      aria-label={`${index + 1} of ${total}`}
      aria-hidden={active ? undefined : true}
      inert={!active}
    >
      <div className="hero-stage">
        <span className="hero-arch" aria-hidden="true" />
        <span className="hero-plinth" aria-hidden="true" />
        {ready && (
          <>
            <SetProduct item={set.main} place="main" eager={index === 0} />
            <SetProduct item={set.side} place="side" eager={index === 0} />
            <SetProduct item={set.plinth} place="plinth" eager={index === 0} />
          </>
        )}
        <Link to={set.tag.path} className="hero-set-tag">
          {set.tag.label}
        </Link>
      </div>
    </div>
  );
}

// Top of the home page. The heading, text and buttons stay still (so they can
// always be read, and search engines always see the same main heading),
// while behind them three studio sets of real products take turns every 3
// seconds. Visitors can move between the sets with the arrows, the dots or a
// sideways swipe, and stop them with the pause button. They also stop while
// pointed at or while something inside has keyboard focus, never move for
// visitors who have asked their device for less motion, and stop for good
// once a visitor uses the controls. Hidden sets cannot be reached with the
// keyboard (inert). Keep the heading in step with the home page in
// scripts/postbuild.mjs.
function Hero({ festive = false }) {
  const sets = heroSetsFor(festive);
  const total = sets.length;

  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(() => !prefersReducedMotion());
  const [hovered, setHovered] = useState(false);
  const [restReady, setRestReady] = useState(false);
  const touchStart = useRef(null);

  // The other sets' walls and photos are added once the page has loaded and
  // the browser has a quiet moment, so they never compete with the first
  // screen.
  useEffect(() => {
    let idleId;
    let timerId;
    const start = () => {
      if ("requestIdleCallback" in window) {
        idleId = window.requestIdleCallback(() => setRestReady(true), { timeout: 2000 });
      } else {
        timerId = window.setTimeout(() => setRestReady(true), 1000);
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

  // Moves on only once the other sets are ready, so a set never fades in
  // before its photos have started loading.
  useEffect(() => {
    if (!playing || hovered || !restReady || total < 2) return undefined;
    const id = window.setTimeout(() => {
      setCurrent((index) => (index + 1) % total);
    }, SET_MS);
    return () => window.clearTimeout(id);
  }, [playing, hovered, restReady, current, total]);

  const goTo = useCallback(
    (index) => {
      setRestReady(true);
      setPlaying(false);
      setCurrent((index + total) % total);
    },
    [total]
  );

  // A sideways swipe (not an up/down scroll) moves to the next or previous
  // set.
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
      // Pressing play starts the sets at once, even though the pointer and
      // keyboard focus are still on the banner.
      setHovered(false);
      setPlaying(true);
    }
  }

  return (
    <section
      className="hero"
      aria-labelledby="hero-title"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setHovered(false);
      }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div className="hero-copy">
        <h1 id="hero-title" className="hero-title">
          Aesthetic Hoodies &amp; Gifts Made From Original Art
        </h1>
        <p className="hero-subtitle">
          Original artwork on cozy hoodies, sweatshirts, tees, mugs, tote bags
          and phone cases. Every piece is printed to order, just for you.
        </p>
        <div className="hero-actions">
          <Link to="/collections" className="btn btn--primary">
            Shop the collection
          </Link>
          {festive ? (
            <Link to="/christmas-gifts" className="btn btn--outline">
              Christmas gifts
            </Link>
          ) : (
            <a href="#collections" className="btn btn--outline">
              Shop by category
            </a>
          )}
        </div>
      </div>

      <div
        className="hero-sets"
        role="group"
        aria-roledescription="carousel"
        aria-label="Products from the shop"
      >
        {sets.map((set, index) => (
          <HeroSet
            key={set.key}
            set={set}
            index={index}
            total={total}
            active={index === current}
            ready={index === 0 || restReady}
          />
        ))}
      </div>

      {total > 1 && (
        <div className="hero-controls">
          <button
            type="button"
            className="hero-ctrl"
            onClick={() => goTo(current - 1)}
            aria-label="Previous products"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M15 5l-7 7 7 7" />
            </svg>
          </button>

          <div className="hero-dots">
            {sets.map((set, index) => (
              <button
                key={set.key}
                type="button"
                className="hero-dot"
                onClick={() => goTo(index)}
                aria-label={`Show products ${index + 1} of ${total}`}
                aria-current={index === current ? "true" : undefined}
              />
            ))}
          </div>

          <button
            type="button"
            className="hero-ctrl"
            onClick={() => goTo(current + 1)}
            aria-label="Next products"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <button
            type="button"
            className="hero-ctrl"
            onClick={togglePlaying}
            aria-label={playing ? "Pause" : "Play"}
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
