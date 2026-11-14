import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import ProductCard from "../ui/ProductCard";
import OptimizedImage from "../ui/OptimizedImage";
import { ProductGridSkeleton } from "../ui/Skeletons";
import Breadcrumbs from "./Breadcrumbs";
import { COLLECTIONS } from "../../config/site.js";
import { cleanProductName, productInCollection } from "../../utils/seoShared.js";
import decorFlowers from "../../assets/home/decor-flowers.webp";
import decorLeaves from "../../assets/home/decor-leaves.webp";
import "../../styles/shoppage.css";

// Small banner photos (360px, about 8 KB each): four per collection, taken
// from the collection pictures already on the site. Only the three a page
// shows are downloaded.
const BANNER_FILES = import.meta.glob("../../assets/banners/*.webp", {
  eager: true,
  import: "default",
});

export function bannerPhotos(collectionKey, picks = [1, 2, 4]) {
  return picks
    .map((n) => BANNER_FILES[`../../assets/banners/${collectionKey}-${n}.webp`])
    .filter(Boolean);
}

// Price filters (the shop's prices are in US dollars).
const PRICE_RANGES = [
  { id: "u25", label: "Under $25", test: (v) => v < 25 },
  { id: "25-40", label: "$25 – $40", test: (v) => v >= 25 && v < 40 },
  { id: "40-60", label: "$40 – $60", test: (v) => v >= 40 && v < 60 },
  { id: "o60", label: "Over $60", test: (v) => v >= 60 },
];

const SORTS = [
  { id: "featured", label: "Featured" },
  { id: "price-asc", label: "Price: Low to High" },
  { id: "price-desc", label: "Price: High to Low" },
  { id: "name", label: "Name: A to Z" },
];

function priceOf(product) {
  const value = Number(product.priceValue);
  return Number.isFinite(value) ? value : Number(String(product.price).replace(/[^0-9.]/g, ""));
}

function Heart({ filled = false, size = 20 }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 20.5s-7.5-4.6-9.3-9.2C1.4 7.9 3.6 4.5 7 4.5c2.1 0 3.6 1.2 5 3 1.4-1.8 2.9-3 5-3 3.4 0 5.6 3.4 4.3 6.8-1.8 4.6-9.3 9.2-9.3 9.2z" />
    </svg>
  );
}

// Pink banner at the top of every shop page: breadcrumbs, the page heading,
// a short line, a heart divider and three photos on the right.
export function ShopBanner({ crumbs, title, subtitle, photos = [], productPhotos = [] }) {
  return (
    <header className="shop-banner">
      <img className="shop-banner-decor shop-banner-decor--flowers" src={decorFlowers} alt="" width="300" height="290" decoding="async" />
      <img className="shop-banner-decor shop-banner-decor--leaves" src={decorLeaves} alt="" width="342" height="580" decoding="async" />

      <div className="shop-banner-inner">
        <div className="shop-banner-text">
          {crumbs && <Breadcrumbs items={crumbs} />}
          <h1>{title}</h1>
          {subtitle && <p>{subtitle}</p>}
          <span className="shop-banner-divider" aria-hidden="true">
            <Heart filled size={18} />
          </span>
        </div>

        <div className="shop-banner-photos" aria-hidden="true">
          {photos.slice(0, 3).map((src, index) => (
            <span key={src} className={`shop-banner-photo shop-banner-photo--${index + 1}`}>
              <img src={src} alt="" width="360" height="360" decoding="async" />
            </span>
          ))}
          {photos.length === 0 &&
            productPhotos.slice(0, 3).map((product, index) => (
              <span key={product.id} className={`shop-banner-photo shop-banner-photo--${index + 1}`}>
                <OptimizedImage
                  src={product.image}
                  alt={cleanProductName(product.title)}
                  widths={[384]}
                  sizes="240px"
                  width="384"
                  height="384"
                />
              </span>
            ))}
        </div>
      </div>
    </header>
  );
}

// Round button that brings the visitor back to the top of a long page.
function BackToTop() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    function onScroll() {
      setShow(window.scrollY > 700);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!show) return null;
  return (
    <button
      type="button"
      className="shop-top-btn"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Back to top"
    >
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 19V5M6 11l6-6 6 6" />
      </svg>
    </button>
  );
}

// The shop page layout used by All Products, every collection page and every
// gift page: banner, one row of drop-down menus above the products (category
// with counts, price, sort) and the product grid. Filtering happens in the browser on the products
// already loaded, so it is instant and creates no extra page addresses.
//
//   products        the products this page sells (already chosen by the page)
//   allProducts     every product (for the category counts on collection pages)
//   currentCollection  collection key on a collection page: choosing another
//                   category then opens that collection page instead of filtering
function ShopPage({
  crumbs,
  title,
  subtitle,
  photos,
  products,
  allProducts = products,
  loading,
  error,
  currentCollection = null,
  emptyNote,
  children,
}) {
  const [category, setCategory] = useState("all");
  const [price, setPrice] = useState("all");
  const [sort, setSort] = useState("featured");
  const navigate = useNavigate();

  // Category counts: on a collection page, across the whole shop (the list
  // links to the other collections); elsewhere, within this page's products.
  const countSource = currentCollection ? allProducts : products;
  const categoryCounts = useMemo(
    () =>
      COLLECTIONS.map((collection) => ({
        collection,
        count: countSource.filter((product) => productInCollection(product, collection)).length,
      })),
    [countSource]
  );

  const visible = useMemo(() => {
    let list = products;
    if (!currentCollection && category !== "all") {
      const collection = COLLECTIONS.find((item) => item.key === category);
      list = list.filter((product) => productInCollection(product, collection));
    }
    if (price !== "all") {
      const range = PRICE_RANGES.find((item) => item.id === price);
      if (range) list = list.filter((product) => range.test(priceOf(product)));
    }
    if (sort === "price-asc") list = [...list].sort((a, b) => priceOf(a) - priceOf(b));
    if (sort === "price-desc") list = [...list].sort((a, b) => priceOf(b) - priceOf(a));
    if (sort === "name") {
      list = [...list].sort((a, b) =>
        cleanProductName(a.title).localeCompare(cleanProductName(b.title))
      );
    }
    return list;
  }, [products, currentCollection, category, price, sort]);

  const filtersActive = category !== "all" || price !== "all";

  function clearFilters() {
    setCategory("all");
    setPrice("all");
  }

  // On a collection page, choosing another category opens that collection.
  function changeCategory(value) {
    if (currentCollection) {
      const collection = COLLECTIONS.find((item) => item.key === value);
      if (collection && collection.key !== currentCollection) navigate(collection.path);
      return;
    }
    setCategory(value);
  }

  // Product photos for banners that have no fixed photos (gift pages).
  const bannerProducts = useMemo(
    () => (photos && photos.length ? [] : products.filter((product) => product.image).slice(0, 3)),
    [photos, products]
  );

  return (
    <div className="shop-page">
      <ShopBanner
        crumbs={crumbs}
        title={title}
        subtitle={subtitle}
        photos={photos}
        productPhotos={bannerProducts}
      />

      <div className="shop-layout">
        <div className="shop-toolbar">
          <p className="shop-showing" aria-live="polite">
            {loading
              ? "Loading products…"
              : `Showing ${visible.length} ${visible.length === 1 ? "product" : "products"}`}
          </p>

          <div className="shop-controls">
            <label className="shop-select">
              <span>Category:</span>
              <select
                value={currentCollection || category}
                onChange={(event) => changeCategory(event.target.value)}
              >
                {!currentCollection && (
                  <option value="all">
                    All{!loading && ` (${products.length})`}
                  </option>
                )}
                {categoryCounts
                  .filter(({ count }) => currentCollection || loading || count > 0)
                  .map(({ collection, count }) => (
                    <option key={collection.key} value={collection.key}>
                      {collection.nav}
                      {!loading && ` (${count})`}
                    </option>
                  ))}
              </select>
            </label>

            <label className="shop-select">
              <span>Price:</span>
              <select value={price} onChange={(event) => setPrice(event.target.value)}>
                <option value="all">All prices</option>
                {PRICE_RANGES.map((range) => (
                  <option key={range.id} value={range.id}>
                    {range.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="shop-select">
              <span>Sort by:</span>
              <select value={sort} onChange={(event) => setSort(event.target.value)}>
                {SORTS.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            {filtersActive && (
              <button type="button" className="shop-clear" onClick={clearFilters}>
                Clear filters
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <ProductGridSkeleton count={8} className="shop-grid" />
        ) : error ? (
          <p className="shop-empty">
            We couldn&apos;t load the products just now. Please refresh the page in a moment.
          </p>
        ) : products.length === 0 ? (
          <p className="shop-empty">{emptyNote}</p>
        ) : visible.length === 0 ? (
          <p className="shop-empty">
            No products match these filters.{" "}
            <button type="button" className="shop-link-btn" onClick={clearFilters}>
              Clear filters
            </button>
          </p>
        ) : (
          <div className="shop-grid">
            {visible.map((product, index) => (
              <ProductCard key={product.id} {...product} priority={index < 4} />
            ))}
          </div>
        )}
      </div>

      {children && <div className="shop-info">{children}</div>}

      <BackToTop />
    </div>
  );
}

export default ShopPage;
