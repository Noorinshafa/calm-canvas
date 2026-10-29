import { useMemo } from "react";
import { Link } from "react-router-dom";
import useProducts from "../../hooks/useProducts";
import OptimizedImage from "../ui/OptimizedImage";
import { ProductGridSkeleton } from "../ui/Skeletons";
import { productPath, cleanProductName } from "../../utils/seoShared.js";
import {
  THANKSGIVING_HOME,
  THANKSGIVING_PATH,
  thanksgivingCountLabel,
  thanksgivingHomeProducts,
  thanksgivingSeason,
} from "../../content/thanksgiving.js";
import "../../styles/thanksgiving.css";

// A Thanksgiving gift section for the home page. It only appears from 1
// October until Thanksgiving Day. While products load it shows grey
// placeholders (so the page does not jump); if there are not enough real
// products to fill it, it stays hidden rather than show a broken block. It
// reuses the product list the rest of the page already loaded and the same
// photo sizes as the collection pages, so it adds no extra requests.
function ThanksgivingGifts() {
  const { products, loading, error } = useProducts();

  const picks = useMemo(() => thanksgivingHomeProducts(products), [products]);

  const { visible, daysLeft, canArrive } = thanksgivingSeason();

  if (!visible || error || (!loading && picks.length < 4)) return null;

  return (
    <section className="tg-section" aria-labelledby="tg-title">
      <div className="tg-head">
        {canArrive && (
          <span className="tg-count">{thanksgivingCountLabel(daysLeft)}</span>
        )}

        <h2 id="tg-title">
          {THANKSGIVING_HOME.heading} <em>{THANKSGIVING_HOME.headingEm}</em>
        </h2>

        <p className="tg-lede">{THANKSGIVING_HOME.lede}</p>
      </div>

      {loading ? (
        <ProductGridSkeleton count={8} className="tg-grid" />
      ) : (
        <ul className="tg-grid">
          {picks.map((product) => {
            const name = cleanProductName(product.title);

            return (
              <li className="tg-card" key={product.id}>
                <Link to={productPath(product)} className="tg-card-link">
                  <span className="tg-ph">
                    <OptimizedImage
                      src={product.image}
                      alt={name}
                      widths={[384, 768]}
                      sizes="(max-width: 640px) 50vw, (max-width: 1100px) 33vw, 25vw"
                      width="560"
                      height="560"
                    />
                  </span>

                  <span className="tg-tx">
                    <h3>{name}</h3>
                    <span className="tg-price">from {product.price}</span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      <div className="tg-foot">
        <Link to={THANKSGIVING_PATH} className="tg-cta">
          {THANKSGIVING_HOME.button}
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

        <ul className="tg-trust">
          {THANKSGIVING_HOME.trust.map((text) => (
            <li key={text}>{text}</li>
          ))}
        </ul>

        <p className="tg-note">
          {canArrive ? THANKSGIVING_HOME.note : THANKSGIVING_HOME.lateNote}
        </p>
      </div>
    </section>
  );
}

export default ThanksgivingGifts;
