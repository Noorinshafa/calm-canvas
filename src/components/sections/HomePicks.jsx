import { useMemo } from "react";
import { Link } from "react-router-dom";
import useProducts from "../../hooks/useProducts";
import OptimizedImage from "../ui/OptimizedImage";
import { ProductGridSkeleton } from "../ui/Skeletons";
import { COLLECTIONS } from "../../config/site.js";
import {
  cleanProductName,
  findCollectionForProduct,
  formatPrice,
  productInCollection,
  productPath,
} from "../../utils/seoShared.js";
import { CHRISTMAS_PICKS } from "../../content/christmas.js";
import { priceTag } from "../../content/sale.js";

const COUNT = 8;
const CHRISTMAS_HOME_SLUGS = new Set(
  CHRISTMAS_PICKS.filter((pick) => pick.home).map((pick) => pick.slug)
);

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

// One product card (home page style): photo, name, real price and a
// "Shop Now" pill. The whole card is one link to the product.
export function HomeProductCard({ product }) {
  const name = cleanProductName(product.title);
  // "% OFF" only for real price reductions; "Special Price" for low-priced
  // sweatshirts (see src/content/sale.js).
  const tag = priceTag(
    product.slug,
    product.priceValue,
    findCollectionForProduct(product)?.key
  );
  return (
    <Link to={productPath(product)} className="home-card">
      <span className="home-card-media">
        <OptimizedImage
          src={product.image}
          alt={name}
          widths={[384, 768]}
          sizes="(max-width: 640px) 46vw, (max-width: 1100px) 30vw, 290px"
          width="600"
          height="600"
        />
        {tag && <span className="sale-tag">{tag.label}</span>}
      </span>
      <span className="home-card-body">
        <h3 className="home-card-name">{name}</h3>
        <span className="home-card-foot">
          <span className="home-card-price">
            {product.price}
            {tag?.wasPrice && (
              <s className="price-was">
                <span className="sr-only">Was </span>
                {formatPrice(tag.wasPrice)}
              </s>
            )}
          </span>
          <span className="home-card-cta" aria-hidden="true">
            Shop Now
          </span>
        </span>
      </span>
    </Link>
  );
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
        <h2 id="picks-title" className="home-title">Studio Picks</h2>
        <p className="home-sub">
          Our favourite designs right now
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 20.5s-7.5-4.6-9.3-9.2C1.4 7.9 3.6 4.5 7 4.5c2.1 0 3.6 1.2 5 3 1.4-1.8 2.9-3 5-3 3.4 0 5.6 3.4 4.3 6.8-1.8 4.6-9.3 9.2-9.3 9.2z" />
          </svg>
        </p>
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

// "You May Also Like": eight more real products, one from each collection in
// turn, skipping everything already shown higher up the home page (Studio
// Picks and, while the Christmas look is on, the Christmas picks).
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
        <h2 id="also-title" className="home-title">You May Also Like</h2>
        <p className="home-sub">More original designs from the shop</p>
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
        <Link to="/collections" className="home-btn">
          Browse All Products
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </Link>
      </div>
    </section>
  );
}
