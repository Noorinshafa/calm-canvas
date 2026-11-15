import { useMemo } from "react";
import { Link } from "react-router-dom";
import useProducts from "../../hooks/useProducts";
import OptimizedImage from "../ui/OptimizedImage";
import { ProductGridSkeleton } from "../ui/Skeletons";
import { cleanProductName } from "../../utils/seoShared.js";
import { CHRISTMAS_PAGE, resolvePicks } from "../../content/christmas.js";
import { HomeProductCard } from "./HomePicks";

// Products shown in the banner's gift scene (real shop items). A slug that
// no longer exists is skipped and the next Christmas pick takes its place.
const SCENE_SLUGS = [
  "merry-christmas-script-mug",
  "pink-ribbon-bow-hoodie",
  "red-glitter-drip-phone-case",
];

function Bow() {
  return (
    <svg className="home-xmas-bow" viewBox="0 0 120 90" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M60 38c-8-14-30-26-40-18s4 26 40 18zM60 38c8-14 30-26 40-18s-4 26-40 18z" />
      <circle cx="60" cy="39" r="4.5" />
      <path d="M57 43c-6 12-14 26-22 40M63 43c6 12 12 24 22 38" />
    </svg>
  );
}

// Christmas banner (replaces the "It's a lifestyle" banner while the home
// page has its Christmas look) followed by the Christmas picks.
function HomeChristmas() {
  const { products, loading, error } = useProducts();
  const picks = useMemo(
    () => resolvePicks(products, { homeOnly: true }).map(({ product }) => product),
    [products]
  );
  const scene = useMemo(() => {
    const bySlug = new Map(products.map((product) => [product.slug, product]));
    const chosen = SCENE_SLUGS.map((slug) => bySlug.get(slug)).filter((p) => p && p.image);
    for (const product of picks) {
      if (chosen.length >= 3) break;
      if (!chosen.includes(product)) chosen.push(product);
    }
    return chosen.slice(0, 3);
  }, [products, picks]);

  if (!loading && (error || picks.length < 4)) return null;

  return (
    <section className="home-section home-xmas" aria-labelledby="xmas-banner-title">
      <div className="home-xmas-banner">
        <div className="home-xmas-text">
          <p className="home-script">
            The Christmas Gift Shop
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 20.5s-7.5-4.6-9.3-9.2C1.4 7.9 3.6 4.5 7 4.5c2.1 0 3.6 1.2 5 3 1.4-1.8 2.9-3 5-3 3.4 0 5.6 3.4 4.3 6.8-1.8 4.6-9.3 9.2-9.3 9.2z" />
            </svg>
          </p>
          <h2 id="xmas-banner-title">Gifts They&apos;ll Love This Christmas.</h2>
          <p>
            Cozy hoodies, festive mugs and little extras, each one printed
            just for the person you&apos;re giving it to.
          </p>
          <Link to={CHRISTMAS_PAGE.path} className="home-btn home-btn--pink">
            Shop Christmas Gifts
            <span aria-hidden="true">→</span>
          </Link>
          <Bow />
          <span className="home-xmas-spark" aria-hidden="true">✦</span>
        </div>

        <div className="home-xmas-scene" aria-hidden="true">
          <span className="home-xmas-sparkles" />
          {scene.map((product, index) => (
            <span key={product.id} className={`home-xmas-gift home-xmas-gift--${index + 1}`}>
              <OptimizedImage
                src={product.image}
                alt={cleanProductName(product.title)}
                widths={[384]}
                sizes="220px"
                width="384"
                height="384"
              />
            </span>
          ))}
        </div>
      </div>

      <div className="home-xmas-head">
        <h3>Christmas Picks</h3>
        <Link to={CHRISTMAS_PAGE.path}>
          Shop all Christmas gifts <span aria-hidden="true">→</span>
        </Link>
      </div>

      {loading ? (
        <ProductGridSkeleton count={8} className="home-picks-grid" />
      ) : (
        <ul className="home-picks-grid">
          {picks.map((product) => (
            <li key={product.id}>
              <HomeProductCard product={product} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default HomeChristmas;
