import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import useProducts from "../../hooks/useProducts";
import { getProduct } from "../../services/printifyApi";
import { sanitizeHtml } from "../../utils/sanitizeHtml";
import useSEO, { toPlainText } from "../../hooks/useSEO";
import {
  breadcrumbJsonLd,
  buildProductSeo,
  cleanProductName,
  formatPrice,
  productJsonLd,
  productPath,
} from "../../utils/seoShared.js";
import { PRODUCT_COPY } from "../../content/productCopy.js";
import { trackAddToCart, trackViewItem } from "../../utils/analytics";
import toast from "react-hot-toast";

import "../../styles/productdetails.css";
import "../../styles/seo-extras.css";
import ProductCard from "../ui/ProductCard";
import Breadcrumbs from "../common/Breadcrumbs";

// Printify variant titles aren't all "Size / Color" -- a mug or phone case
// is often single-dimension ("11oz", "iPhone 15 Pro"), not two. Splitting
// blindly on "/" and always treating part [1] as "the color" left those
// products with a blank, unusable "Choose Color" dropdown. This parses
// however many dimensions a variant title actually has.
function parseVariantTitle(title) {
  const parts = (title || "")
    .split("/")
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length >= 2) {
    return { size: parts[0], color: parts.slice(1).join(" / ") };
  }

  if (parts.length === 1) {
    return { size: parts[0], color: null };
  }

  return { size: null, color: null };
}

// The pre-built HTML for a product page (see scripts/postbuild.mjs) records
// which product it is on the #root element. Reading it lets a page opened
// directly at /products/<name> load its product immediately, without first
// waiting for the whole catalog just to look the name up. It's only trusted
// when it matches the address being shown.
function readPrerenderHint(slug) {
  if (!slug || typeof document === "undefined") return "";

  const root = document.getElementById("root");

  return root?.dataset?.productSlug === slug
    ? root.dataset.productId || ""
    : "";
}

function ProductDetails() {
  const { id: idParam, slug } = useParams();

  const navigate = useNavigate();

  const { addToCart } = useCart();

  const { products: allProducts, loading: catalogLoading } = useProducts();

  // Product pages now live at /products/<readable-name>. Old links of the
  // form /product/<id> still work. Either way we need the product's id to
  // ask Printify for the full details.
  const hintedId = useMemo(() => readPrerenderHint(slug), [slug]);

  const productId = useMemo(() => {
    if (idParam) return idParam;
    if (hintedId) return hintedId;

    return allProducts.find((item) => item.slug === slug)?.id || "";
  }, [idParam, hintedId, allProducts, slug]);

  // Fetches just this one product (with its full variant details) instead
  // of the whole catalog -- see api/product.js for why. Related products
  // below still use the lightweight full-catalog list, which is fine since
  // that list was never the slow part once variants were removed from it.
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!productId) return undefined;

    let cancelled = false;

    async function fetchProduct() {
      try {
        setLoading(true);
        setError("");
        setProduct(null);

        const data = await getProduct(productId);

        if (!cancelled) {
          setProduct(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err?.message || "Unable to load this product.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchProduct();

    return () => {
      cancelled = true;
    };
  }, [productId]);

  const [selectedImage, setSelectedImage] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");

  // The API now only ever sends enabled/purchasable variants (see
  // api/_lib/printify-shared.js), so anything listed here is safe to sell --
  // but a product can still legitimately have zero of them (fully sold out).
  const variants = useMemo(() => product?.variants || [], [product]);
  const hasVariants = variants.length > 0;

  const parsedVariants = useMemo(
    () => variants.map((variant) => ({ variant, parsed: parseVariantTitle(variant.title) })),
    [variants]
  );

  const hasColorOptions = parsedVariants.some((v) => v.parsed.color);

  const sizeOptions = useMemo(
    () => [...new Set(parsedVariants.map((v) => v.parsed.size).filter(Boolean))],
    [parsedVariants]
  );

  const colorOptions = useMemo(
    () =>
      hasColorOptions
        ? [...new Set(parsedVariants.map((v) => v.parsed.color).filter(Boolean))]
        : [],
    [parsedVariants, hasColorOptions]
  );

  // The variant the shopper has picked right now. Variants of the same
  // product can cost different amounts (e.g. larger hoodie sizes), and the
  // server charges the price of the exact variant ordered -- so the price
  // shown on the page, in the cart and at checkout must come from this, not
  // from the product's lowest price.
  const activeVariant = useMemo(() => {
    if (!hasVariants) return undefined;

    return (
      parsedVariants.find(({ parsed }) => {
        const sizeMatches = parsed.size === selectedSize;
        const colorMatches = hasColorOptions
          ? parsed.color === selectedColor
          : true;
        return sizeMatches && colorMatches;
      })?.variant || variants[0]
    );
  }, [
    hasVariants,
    parsedVariants,
    selectedSize,
    selectedColor,
    hasColorOptions,
    variants,
  ]);

  const activePriceValue =
    typeof activeVariant?.price === "number"
      ? activeVariant.price / 100
      : product?.priceValue;

  const safeDescription = useMemo(
    () => sanitizeHtml(product?.description || ""),
    [product?.description]
  );

  const plainDescription = useMemo(
    () => toPlainText(product?.description || ""),
    [product?.description]
  );

  // The catalog entry carries the readable address (slug); the single-product
  // response doesn't, so take it from the catalog when it has loaded.
  const catalogEntry = useMemo(
    () => allProducts.find((item) => item.id === product?.id),
    [allProducts, product?.id]
  );

  const productSlug = slug || catalogEntry?.slug || "";

  const canonicalPath = product
    ? productPath({ id: product.id, slug: productSlug })
    : slug
    ? `/products/${slug}`
    : `/product/${idParam || ""}`;

  const seo = useMemo(
    () => (product ? buildProductSeo(product) : null),
    [product]
  );

  const crumbs = useMemo(() => {
    if (!product || !seo) return [];

    const list = [{ name: "Home", path: "/" }];

    if (seo.collection) {
      list.push({ name: "Collections", path: "/collections" });
      list.push({ name: seo.collection.nav, path: seo.collection.path });
    } else {
      list.push({ name: "Collections", path: "/collections" });
    }

    list.push({ name: seo.name, path: canonicalPath });

    return list;
  }, [product, seo, canonicalPath]);

  const jsonLd = useMemo(() => {
    if (!product) return undefined;

    return [
      breadcrumbJsonLd(crumbs),
      productJsonLd(
        { ...product, slug: productSlug },
        { inStock: hasVariants, plainDescription }
      ),
    ];
  }, [product, crumbs, productSlug, hasVariants, plainDescription]);

  // Per-product title/description/canonical/OG + Product structured data --
  // see src/hooks/useSEO.js for why this matters. Runs unconditionally
  // (before the loading/error early-returns below) since hooks can't be
  // called conditionally; useSEO itself is safe to call with an
  // undefined/loading product.
  const lookupFailed = !productId && !catalogLoading;

  useSEO({
    title: seo?.name || (lookupFailed || error ? "Product not found" : undefined),
    description: seo?.description,
    path: canonicalPath,
    image: product?.image,
    type: "product",
    jsonLd,
    noindex: lookupFailed || Boolean(error) || product?.indexable === false,
  });

  useEffect(() => {
    if (product) {
      setSelectedImage(product.image);
      setQuantity(1);

      if (variants.length) {
        // Start on the cheapest option so the price shown on arrival is the
        // "from" price the listing and search results advertise.
        const cheapest = variants.reduce(
          (best, variant) =>
            typeof variant.price === "number" &&
            (!best || variant.price < best.price)
              ? variant
              : best,
          null
        );

        const first = parseVariantTitle((cheapest || variants[0]).title);
        setSelectedSize(first.size || "");
        setSelectedColor(first.color || "");
      }

      trackViewItem({
        id: product.id,
        name: cleanProductName(product.title),
        price: product.priceValue,
        category: seo?.collection?.nav,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product]);

  if (!productId) {
    if (catalogLoading) {
      return <h2>Loading...</h2>;
    }

    return (
      <div style={{ textAlign: "center", padding: "180px 8% 120px" }}>
        <h1>Product not found</h1>
        <p style={{ margin: "16px 0" }}>
          This product may have been removed or the link may be incorrect.
        </p>
        <Link to="/collections">Browse all products</Link>
      </div>
    );
  }

  if (loading) {
    return <h2>Loading...</h2>;
  }

  if (error) {
    return <h2>{error}</h2>;
  }

  if (!product) {
    return (
      <div style={{ textAlign: "center", padding: "180px 8% 120px" }}>
        <h1>Product not found</h1>
        <p style={{ margin: "16px 0" }}>
          This product may have been removed or the link may be incorrect.
        </p>
        <Link to="/collections">Browse all products</Link>
      </div>
    );
  }

  const productName = cleanProductName(product.title);
  const extraCopy = PRODUCT_COPY[product.id];

  const relatedProducts = allProducts
    .filter(
      (item) =>
        item.blueprint_id === product.blueprint_id &&
        item.id !== product.id
    )
    .slice(0, 4);

  function handleAddToCart({ redirectToCheckout }) {
    const selectedVariant = activeVariant;

    if (!selectedVariant) {
      toast.error("This product is currently out of stock.");
      return;
    }

    // Price the cart line at the price of the variant actually chosen, so the
    // cart and checkout totals match what Safepay will charge (the server
    // always re-prices from Printify; see api/_lib/printify-shared.js).
    const variantPrice =
      typeof selectedVariant.price === "number"
        ? selectedVariant.price / 100
        : product.priceValue;

    addToCart({
      ...product,
      price: formatPrice(variantPrice),
      priceValue: variantPrice,
      quantity,
      selectedVariant,
      selectedSize,
      selectedColor,
    });

    trackAddToCart({
      id: product.id,
      name: productName,
      price: variantPrice,
      quantity,
      category: seo?.collection?.nav,
      variant: selectedVariant.title,
    });

    if (redirectToCheckout) {
      navigate("/checkout");
    } else {
      toast.success(`${productName} added to cart!`);
    }
  }

  return (
    <>
      <section className="product-details">
        <Breadcrumbs items={crumbs} />

        <div className="product-container">
          <div className="details-image">

  <div className="main-image">

    {selectedImage && (

  <img
    className="details-image-img"
    src={selectedImage}
    alt={productName}
    width="760"
    height="760"
    loading="eager"
    fetchPriority="high"
    decoding="async"
  />

)}

  </div>

  <div className="thumbnail-row">

    {product.images.map((img, index) => (

      <img
        key={index}
        src={img.src}
        alt={`${productName} — view ${index + 1}`}
        className={`thumbnail ${
          selectedImage === img.src ? "active" : ""
        }`}
        width="95"
        height="95"
        loading="lazy"
        decoding="async"
        onClick={() => setSelectedImage(img.src)}
      />

    ))}

  </div>

</div>

<div className="product-info">

  <span className="product-category">
    CALM CANVAS
  </span>

  <h1>{productName}</h1>

  <p className="product-price">{formatPrice(activePriceValue)}</p>

  <div
    className="product-description"
    dangerouslySetInnerHTML={{
      __html: safeDescription,
    }}
  />

  {!hasVariants ? (

    <p className="out-of-stock-notice">
      This product is currently out of stock. Check back soon.
    </p>

  ) : (

    <>

  {sizeOptions.length > 0 && (

  <div className="option-group">

  <h4>Choose Size</h4>

  <select
    className="product-select"
    value={selectedSize}
    onChange={(e) => setSelectedSize(e.target.value)}
    aria-label="Choose size"
  >
    {sizeOptions.map((size) => (

      <option
        key={size}
        value={size}
      >
        {size}
      </option>

    ))}

  </select>

</div>

  )}

  {hasColorOptions && (

 <div className="option-group">

  <h4>Choose Color</h4>

  <select
    className="product-select"
    value={selectedColor}
    onChange={(e) => setSelectedColor(e.target.value)}
    aria-label="Choose color"
  >
    {colorOptions.map((color) => (

      <option
        key={color}
        value={color}
      >
        {color}
      </option>

    ))}

  </select>

</div>

  )}
  <div className="quantity-section">

  <h4>Quantity</h4>

  <div className="quantity-box">

    <button
      onClick={() =>
        setQuantity((q) => Math.max(1, q - 1))
      }
      aria-label="Decrease quantity"
    >
      −
    </button>

    <span aria-live="polite">{quantity}</span>

    <button
      onClick={() =>
        setQuantity((q) => q + 1)
      }
      aria-label="Increase quantity"
    >
      +
    </button>

  </div>

</div>

<div className="product-buttons">

  <button
    className="add-cart-btn"
    onClick={() => handleAddToCart({ redirectToCheckout: false })}
  >
    Add to Cart
  </button>

  <button
    className="buy-now-btn"
    onClick={() => handleAddToCart({ redirectToCheckout: true })}
  >
    Buy Now
  </button>

</div>

    </>

  )}

<div className="product-features">

  <div className="feature-item">
    ✓ Premium Print Quality
  </div>

  <div className="feature-item">
    ✓ Secure Checkout
  </div>

  <div className="feature-item">
    ✓ Printed On Demand
  </div>

  <div className="feature-item">
    ✓ Customize Your Design
  </div>

</div>

</div>

</div>

</section>

{extraCopy && (

<section className="product-extra">

  <h2>About this design</h2>

  {extraCopy.map((paragraph) => (
    <p key={paragraph.slice(0, 48)}>{paragraph}</p>
  ))}

</section>

)}

<section className="product-extra">

  <h2>Shipping &amp; returns at a glance</h2>

  <ul>
    <li>
      Made to order: each item is printed after you order it, so please
      allow around 2–7 business days to print and prepare, plus delivery.
    </li>
    <li>
      Damaged, defective or incorrect items are replaced with a free
      reprint or fully refunded when you contact us within 14 days of
      delivery.
    </li>
    <li>
      Because every item is custom printed, we can't accept returns for the
      wrong size or a change of mind, so check the size options above.
    </li>
    <li>
      Secure checkout through Safepay. Read the full{" "}
      <Link to="/shipping-returns">Shipping, Returns &amp; Refunds</Link>{" "}
      policy.
    </li>
  </ul>

</section>

<section className="related-products">

  <div className="related-heading">

    <span>✦ MORE TO LOVE</span>

    <h2>You May Also Like</h2>

    <p>
      Discover more beautiful products curated just for you.
    </p>

  </div>

  <div className="related-grid">

    {relatedProducts.map((item) => (

      <ProductCard
        key={item.id}
        {...item}
      />

    ))}

  </div>

</section>

</>

);

}

export default ProductDetails;
