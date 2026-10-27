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
  relatedProducts,
} from "../../utils/seoShared.js";
import { PRODUCT_COPY } from "../../content/productCopy.js";
import {
  buildOptionModel,
  findVariant,
  imagesForVariant,
  nextSelection,
} from "../../utils/variantOptions.js";
import { trackAddToCart, trackViewItem } from "../../utils/analytics";
import toast from "react-hot-toast";

import "../../styles/productdetails.css";
import "../../styles/seo-extras.css";
import ProductCard from "../ui/ProductCard";
import OptimizedImage from "../ui/OptimizedImage";
import ShippingEstimate from "../ui/ShippingEstimate";
import { ProductPageSkeleton } from "../ui/Skeletons";
import Breadcrumbs from "../common/Breadcrumbs";

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
  // One entry per dropdown (colour, size, phone model, finish...), holding the
  // shopper's current choice for that dropdown.
  const [selection, setSelection] = useState([]);

  // The API now only ever sends enabled/purchasable variants (see
  // api/_lib/printify-shared.js), so anything listed here is safe to sell --
  // but a product can still legitimately have zero of them (fully sold out).
  const variants = useMemo(() => product?.variants || [], [product]);
  const hasVariants = variants.length > 0;

  // Which dropdowns this product has and what each one is called, taken from
  // Printify's own option list rather than guessed from the variant title --
  // see src/utils/variantOptions.js.
  const optionModel = useMemo(() => buildOptionModel(product), [product]);

  // The variant the shopper has picked right now. Variants of the same
  // product can cost different amounts (e.g. larger hoodie sizes), and the
  // server charges the price of the exact variant ordered -- so the price
  // shown on the page, in the cart and at checkout must come from this, not
  // from the product's lowest price.
  const activeVariant = useMemo(() => {
    if (!hasVariants) return undefined;

    return findVariant(optionModel, variants, selection) || variants[0];
  }, [hasVariants, optionModel, variants, selection]);

  // The thumbnails show only the photos made for the colour/variant that is
  // picked right now (when Printify has any -- see imagesForVariant), instead
  // of every colour's photos at once.
  const galleryImages = useMemo(
    () => imagesForVariant(product?.images || [], activeVariant?.id),
    [product, activeVariant]
  );

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

        // Among equally cheap options, prefer the one whose colour the first
        // photo shows, so that photo (the one the pre-built page loads) doesn't
        // change as the page finishes loading.
        const firstPhoto = (product.images || []).find(
          (image) => image.src === product.image
        );

        const cheapestOnes = variants.filter(
          (variant) => variant.price === cheapest?.price
        );

        const withFirstPhoto = firstPhoto?.variantIds?.length
          ? cheapestOnes.filter((variant) =>
              firstPhoto.variantIds.includes(variant.id)
            )
          : [];

        const pool = withFirstPhoto.length
          ? withFirstPhoto
          : cheapestOnes.length
          ? cheapestOnes
          : variants;

        // When several options cost the same (often every size), start on the
        // one that reads first in the dropdowns -- size S, not 5XL.
        const position = (variant) =>
          (optionModel.picksByVariantId.get(variant.id) || []).reduce(
            (sum, pick, index) =>
              sum +
              Math.max(0, optionModel.groups[index]?.values.indexOf(pick)),
            0
          );

        const start = pool.reduce(
          (best, variant) => (position(variant) < position(best) ? variant : best),
          pool[0]
        );

        setSelection(optionModel.picksByVariantId.get(start.id) || []);

        // Show a photo of the colour the page starts on.
        const startGallery = imagesForVariant(product.images, start.id);

        if (
          startGallery.length &&
          !startGallery.some((image) => image.src === product.image)
        ) {
          setSelectedImage(startGallery[0].src);
        }
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
      return <ProductPageSkeleton />;
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
    return <ProductPageSkeleton />;
  }

  if (error) {
    return (
      <div style={{ textAlign: "center", padding: "180px 8% 120px" }}>
        <h1>We couldn't load this product</h1>
        <p style={{ margin: "16px 0" }}>
          Something went wrong while loading this product. Please try again in a moment.
        </p>
        <Link to="/collections">Browse all products</Link>
      </div>
    );
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

  // Same products the pre-built page lists (see relatedProducts in
  // src/utils/seoShared.js). Empty until the catalog has loaded.
  const related = relatedProducts(product, allProducts, 4);

  function handleOptionChange(groupIndex, value) {
    const next = nextSelection(
      optionModel,
      variants,
      selection,
      groupIndex,
      value
    );

    const nextVariant = findVariant(optionModel, variants, next);
    const gallery = imagesForVariant(product.images, nextVariant?.id);

    setSelection(next);

    // Show the new colour's photo. If the photo on screen already belongs to
    // the new choice (e.g. only the size changed), leave it where it is.
    if (gallery.length && !gallery.some((image) => image.src === selectedImage)) {
      setSelectedImage(gallery[0].src);
    }
  }

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

    // What the cart shows under the product name, e.g. "Color: White",
    // "Size: M". The variant itself (selectedVariant) is what is actually
    // priced and ordered; these are labels for the shopper only.
    const picks = optionModel.picksByVariantId.get(selectedVariant.id) || [];
    const selectedOptions = optionModel.groups.map((group, index) => ({
      label: group.label,
      value: picks[index],
    }));

    addToCart({
      ...product,
      price: formatPrice(variantPrice),
      priceValue: variantPrice,
      quantity,
      selectedVariant,
      selectedOptions,
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

  <OptimizedImage
    className="details-image-img"
    src={selectedImage}
    alt={productName}
    widths={[768, 1024]}
    sizes="(max-width: 900px) 100vw, 50vw"
    width="760"
    height="760"
    priority
  />

)}

  </div>

  <div className="thumbnail-row">

    {galleryImages.map((img, index) => (

      <OptimizedImage
        key={index}
        src={img.src}
        alt={`${productName} — view ${index + 1}`}
        className={`thumbnail ${
          selectedImage === img.src ? "active" : ""
        }`}
        widths={[256]}
        width="95"
        height="95"
        onClick={() => setSelectedImage(img.src)}
      />

    ))}

  </div>

</div>

<div className="product-info">

  <span className="product-category">
    SHOPCALMCANVAS
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

  {optionModel.groups.map((group, groupIndex) => (

  <div className="option-group" key={`${group.label}-${groupIndex}`}>

  <h4>Choose {group.label}</h4>

  <select
    className="product-select"
    value={selection[groupIndex] ?? ""}
    onChange={(e) => handleOptionChange(groupIndex, e.target.value)}
    aria-label={`Choose ${group.label.toLowerCase()}`}
  >
    {group.values.map((value) => (

      <option
        key={value}
        value={value}
      >
        {value}
      </option>

    ))}

  </select>

</div>

  ))}

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

<ShippingEstimate
  productId={product.id}
  variantId={activeVariant?.id}
  quantity={quantity}
/>

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

{related.length > 0 && (

<section className="related-products">

  <div className="related-heading">

    <span>✦ MORE TO LOVE</span>

    <h2>You May Also Like</h2>

    <p>
      Discover more beautiful products curated just for you.
    </p>

  </div>

  <div className="related-grid">

    {related.map((item) => (

      <ProductCard
        key={item.id}
        {...item}
      />

    ))}

  </div>

</section>

)}

</>

);

}

export default ProductDetails;
