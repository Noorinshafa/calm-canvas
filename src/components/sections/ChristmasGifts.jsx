import { useMemo } from "react";
import { Link } from "react-router-dom";
import useProducts from "../../hooks/useProducts";
import ChristmasGrid from "./ChristmasGrid";
import { ProductGridSkeleton } from "../ui/Skeletons";
import {
  CHRISTMAS_HOME,
  CHRISTMAS_PAGE,
  christmasSeason,
  daysLabel,
  resolvePicks,
} from "../../content/christmas.js";
import "../../styles/christmas.css";

// Falling snow: fixed positions (not random on every render) so the flakes do
// not jump when the page updates. Pure CSS animation; it stops for visitors
// who have asked their device to reduce motion.
const FLAKES = Array.from({ length: 22 }, (_, i) => {
  const seed = (n) => ((i * 9301 + n * 49297) % 233280) / 233280;
  const size = 3 + seed(1) * 5;

  return {
    left: `${(seed(2) * 100).toFixed(1)}%`,
    size: `${size.toFixed(1)}px`,
    duration: `${(10 + seed(3) * 11).toFixed(1)}s`,
    delay: `-${(seed(4) * 18).toFixed(1)}s`,
    drift: `${Math.round(seed(5) * 40 - 20)}px`,
    opacity: (0.55 + seed(6) * 0.45).toFixed(2),
  };
});

// A Christmas gift section for the home page, placed right under the hero.
// It only appears from September to Christmas. While products load it shows
// grey placeholders (so the page does not jump); if there are not enough real
// products to fill it, it stays hidden rather than show a broken block.
function ChristmasGifts() {
  const { products, loading, error } = useProducts();

  const picks = useMemo(() => resolvePicks(products, { homeOnly: true }), [products]);

  const { visible, daysLeft } = christmasSeason();

  if (!visible || error || (!loading && picks.length < 4)) return null;

  const ready = !loading;

  const count = daysLabel(daysLeft);

  return (
    <section className="xmas-section" aria-labelledby="xmas-title">
      <div className="xmas-snow" aria-hidden="true">
        {FLAKES.map((flake, index) => (
          <i
            key={index}
            style={{
              left: flake.left,
              width: flake.size,
              height: flake.size,
              opacity: flake.opacity,
              animationDuration: flake.duration,
              animationDelay: flake.delay,
              "--dx": flake.drift,
            }}
          />
        ))}
      </div>

      <div className="xmas-head">
        {count && (
          <span className="xmas-count">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M12 2v20M4.2 7l15.6 10M19.8 7 4.2 17M9 3.5l3 2.5 3-2.5M9 20.5l3-2.5 3 2.5" />
            </svg>
            {count}
          </span>
        )}

        <h2 id="xmas-title">
          {CHRISTMAS_HOME.heading} <em>{CHRISTMAS_HOME.headingEm}</em>
        </h2>

        <p className="xmas-lede">{CHRISTMAS_HOME.lede}</p>
      </div>

      {ready ? (
        <ChristmasGrid picks={picks} />
      ) : (
        <ProductGridSkeleton count={8} className="xmas-grid" />
      )}

      <div className="xmas-foot">
        <Link to={CHRISTMAS_PAGE.path} className="xmas-cta">
          {CHRISTMAS_HOME.button}
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </Link>

        <ul className="xmas-trust">
          {CHRISTMAS_HOME.trust.map((text) => (
            <li key={text}>
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="m12 2 2.4 6.9L21 10l-5.4 4.2L17.3 22 12 17.8 6.7 22l1.7-7.8L3 10l6.6-1.1z" />
              </svg>
              {text}
            </li>
          ))}
        </ul>

        <p className="xmas-note">{CHRISTMAS_HOME.note}</p>
      </div>
    </section>
  );
}

export default ChristmasGifts;
