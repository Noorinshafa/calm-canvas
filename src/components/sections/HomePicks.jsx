import { useMemo } from "react";
import { Link } from "react-router-dom";
import useProducts from "../../hooks/useProducts";
import ProductCard from "../ui/ProductCard";
import { ProductGridSkeleton } from "../ui/Skeletons";
import { COLLECTIONS } from "../../config/site.js";
import { productInCollection } from "../../utils/seoShared.js";
import { CHRISTMAS_PICKS } from "../../content/christmas.js";

const COUNT = 8;
const CHRISTMAS_HOME_SLUGS = new Set(
  CHRISTMAS_PICKS.filter((pick) => pick.home).map((pick) => pick.slug)
);

// How wide a card is in the home page grids: 2 across on phones, 3 on
// tablets, 4 across the 1380px page on computers.
const HOME_CARD_SIZES = "(max-width: 640px) 46vw, (max-width: 1100px) 30vw, 330px";

// A mix of real products from every collection: the first hoodie, the first
// tee, the first sweatshirt and so on, then the second of each, until there
// are eight. No "bestseller", rating or sale labels: the shop has no sales or
// review data to back them.
export function pickMix(products, { skipSlugs = new Set(), count = COUNT } = {}) {
  const pools = COLLECTIONS.map((collection) =>
    products.filter(
      (product) =>
        product.image &&
        product.indexable !== false &&
        !skipSlugs.has(product.slug) &&
        productInCollection(product, collection)
    )
  );
  const chosen = [];
  const seen = new Set();
  for (let round = 0; chosen.length < count; round += 1) {
    let added = false;
    for (const pool of pools) {
      const product = pool[round];
      if (!product || seen.has(product.id)) continue;
      seen.add(product.id);
      chosen.push(product);
      added = true;
      if (chosen.length === count) break;
    }
    if (!added) break;
  }
  return chosen;
}

// One product card on the home page: the same card as the shop pages
// (src/components/ui/ProductCard.jsx), sized for the home page grid.
export function HomeProductCard({ product }) {
  return <ProductCard {...product} sizes={HOME_CARD_SIZES} />;
}

function HomePicks({ festive = false }) {
  const { products, loading, error } = useProducts();
  const picks = useMemo(
    () => pickMix(products, { skipSlugs: festive ? CHRISTMAS_HOME_SLUGS : new Set() }),
    [products, festive]
  );

  if (!loading && (error || picks.length < 4)) return null;

  return (
    <section className="home-section home-picks" aria-labelledby="picks-title">
      <div className="home-head">
        <div>
          <h2 id="picks-title" className="home-title">Studio picks</h2>
          <p className="home-sub">Our favourite designs right now</p>
        </div>
        <Link to="/collections" className="home-head-link">
          Shop all
        </Link>
      </div>

      {loading ? (
        <ProductGridSkeleton count={COUNT} className="home-picks-grid" />
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

export default HomePicks;

// "You may also like": eight more real products, one from each collection in
// turn, skipping everything already shown higher up the home page (Studio
// picks and, while the Christmas look is on, the Christmas picks).
export function HomeAlsoLike({ festive = false }) {
  const { products, loading, error } = useProducts();
  const picks = useMemo(() => {
    const shown = new Set(festive ? CHRISTMAS_HOME_SLUGS : []);
    pickMix(products, { skipSlugs: new Set(shown) }).forEach((product) => shown.add(product.slug));
    return pickMix(products, { skipSlugs: shown });
  }, [products, festive]);

  if (!loading && (error || picks.length < 4)) return null;

  return (
    <section className="home-section home-picks home-also" aria-labelledby="also-title">
      <div className="home-head">
        <div>
          <h2 id="also-title" className="home-title">You may also like</h2>
          <p className="home-sub">More original designs from the shop</p>
        </div>
      </div>

      {loading ? (
        <ProductGridSkeleton count={COUNT} className="home-picks-grid" />
      ) : (
        <ul className="home-picks-grid">
          {picks.map((product) => (
            <li key={product.id}>
              <HomeProductCard product={product} />
            </li>
          ))}
        </ul>
      )}

      <div className="home-more">
        <Link to="/collections" className="btn btn--outline">
          Browse all products
        </Link>
      </div>
    </section>
  );
}
