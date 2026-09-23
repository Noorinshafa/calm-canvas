import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import useProducts from "../../hooks/useProducts";
import { getProduct } from "../../services/printifyApi";
import { sanitizeHtml } from "../../utils/sanitizeHtml";
import useSEO, { absoluteUrl, toPlainText } from "../../hooks/useSEO";
import toast from "react-hot-toast";

import "../../styles/productdetails.css";
import ProductCard from "../ui/ProductCard";

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

function ProductDetails() {
  const { id } = useParams();

  const navigate = useNavigate();

  const { addToCart } = useCart();

  // Fetches just this one product (with its full variant details) instead
  // of the whole catalog -- see api/product.js for why. Related products
  // below still use the lightweight full-catalog list, which is fine since
  // that list was never the slow part once variants were removed from it.
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const { products: allProducts } = useProducts();

  useEffect(() => {
    let cancelled = false;

    async function fetchProduct() {
      try {
        setLoading(true);
        setError("");
        setProduct(null);

        const data = await getProduct(id);

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
  }, [id]);

  const [selectedImage, setSelectedImage] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");

  // The API now only ever sends enabled/purchasable variants (see
  // api/_lib/printify-shared.js), so anything listed here is safe to sell --
  // but a product can still legitimately have zero of them (fully sold out).
  const variants = product?.variants || [];
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

  const safeDescription = useMemo(
    () => sanitizeHtml(product?.description || ""),
    [product?.description]
  );

  const plainDescription = useMemo(
    () => toPlainText(product?.description || ""),
    [product?.description]
  );

  const productJsonLd = useMemo(() => {
    if (!product) return undefined;

    return {
      "@context": "https://schema.org",
      "@type": "Product",
      name: product.title,
      image: product.image ? [absoluteUrl(product.image)] : undefined,
      description: plainDescription,
      sku: String(product.id),
      offers: {
        "@type": "Offer",
        url: absoluteUrl(`/product/${product.id}`),
        priceCurrency: "USD",
        price: product.priceValue,
        availability: hasVariants
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      },
    };
  }, [product, plainDescription, hasVariants]);

  // Per-product title/description/canonical/OG + Product structured data --
  // see src/hooks/useSEO.js for why this matters. Runs unconditionally
  // (before the loading/error early-returns below) since hooks can't be
  // called conditionally; useSEO itself is safe to call with an
  // undefined/loading product.
  useSEO({
    title: product?.title,
    description: plainDescription,
    path: `/product/${id}`,
    image: product?.image,
    type: "product",
    jsonLd: productJsonLd,
  });

  useEffect(() => {
    if (product) {
      setSelectedImage(product.image);
      setQuantity(1);

      if (variants.length) {
        const first = parseVariantTitle(variants[0].title);
        setSelectedSize(first.size || "");
        setSelectedColor(first.color || "");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product]);

  if (loading) {
    return <h2>Loading...</h2>;
  }

  if (error) {
    return <h2>{error}</h2>;
  }

  if (!product) {
    return <h2>Product not found.</h2>;
  }

  const relatedProducts = allProducts
    .filter(
      (item) =>
        item.blueprint_id === product.blueprint_id &&
        item.id !== product.id
    )
    .slice(0, 4);

  function findSelectedVariant() {
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
  }

  function handleAddToCart({ redirectToCheckout }) {
    const selectedVariant = findSelectedVariant();

    if (!selectedVariant) {
      toast.error("This product is currently out of stock.");
      return;
    }

    addToCart({
      ...product,
      quantity,
      selectedVariant,
      selectedSize,
      selectedColor,
    });

    if (redirectToCheckout) {
      navigate("/checkout");
    } else {
      toast.success(`${product.title} added to cart!`);
    }
  }

  return (
    <>
      <section className="product-details">
        <div className="product-container">
          <div className="details-image">

  <div className="main-image">

    {selectedImage && (

  <img
    className="details-image-img"
    src={selectedImage}
    alt={product.title}
    loading="eager"
    decoding="async"
  />

)}

  </div>

  <div className="thumbnail-row">

    {product.images.map((img, index) => (

      <img
        key={index}
        src={img.src}
        alt={`${product.title} ${index + 1}`}
        className={`thumbnail ${
          selectedImage === img.src ? "active" : ""
        }`}
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

  <h1>{product.title}</h1>

  <h2>{product.price}</h2>

  <p
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
    >
      −
    </button>

    <span>{quantity}</span>

    <button
      onClick={() =>
        setQuantity((q) => q + 1)
      }
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
