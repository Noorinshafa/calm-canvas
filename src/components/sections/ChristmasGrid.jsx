import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { productPath, cleanProductName } from "../../utils/seoShared.js";
import OptimizedImage from "../ui/OptimizedImage";
import { CHRISTMAS_FILTERS, matchesFilter } from "../../content/christmas.js";

// The filter buttons and the green/red gift cards, shared by the home page
// section and the /christmas-gifts page. `picks` comes from resolvePicks().
function ChristmasGrid({ picks, label = "Christmas gifts" }) {
  const [filter, setFilter] = useState("all");

  // Only offer a filter button when it would show at least one gift.
  const filters = useMemo(
    () =>
      CHRISTMAS_FILTERS.filter(
        (item) => item.key === "all" || picks.some((entry) => matchesFilter(entry, item.key))
      ),
    [picks]
  );

  const visible = useMemo(
    () => picks.filter((entry) => matchesFilter(entry, filter)),
    [picks, filter]
  );

  return (
    <>
      <div className="xmas-chips" role="group" aria-label={`Filter ${label.toLowerCase()}`}>
        {filters.map((item) => (
          <button
            key={item.key}
            type="button"
            className="xmas-chip"
            aria-pressed={filter === item.key}
            onClick={() => setFilter(item.key)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <ul className="xmas-grid">
        {visible.map(({ pick, product }) => {
          const name = cleanProductName(product.title);

          return (
            <li className="xmas-card" key={product.id}>
              <Link to={productPath(product)} className="xmas-card-link">
                <span className="xmas-ph">
                  <OptimizedImage
                    src={product.image}
                    alt={pick.alt || name}
                    widths={[384, 768]}
                    sizes="(max-width: 640px) 50vw, (max-width: 1100px) 33vw, 25vw"
                    width="560"
                    height="560"
                  />
                  <span className="xmas-badge">{pick.badge}</span>
                </span>

                <span className="xmas-tx">
                  <h3>{name}</h3>
                  <span className="xmas-for">{pick.line}</span>
                  <span className="xmas-price">
                    <b>from {product.price}</b>
                    <span>View gift</span>
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </>
  );
}

export default ChristmasGrid;
