import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import useProducts from "../../hooks/useProducts";
import toast from "react-hot-toast";

import "../../styles/productdetails.css";
import ProductCard from "../ui/ProductCard";

function ProductDetails() {
  const { id } = useParams();

  const navigate = useNavigate();

  const { addToCart } = useCart();

  const { products, loading, error } = useProducts();

  const product = products.find((item) => item.id === id);

  const [selectedImage, setSelectedImage] = useState("");
  const [quantity, setQuantity] = useState(1);

  // These will be connected to the real Printify variants later
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");

  useEffect(() => {
    if (product) {
      setSelectedImage(product.image);
      setQuantity(1);

      if (product.variants?.length) {
        const firstVariant = product.variants[0];

        const parts = firstVariant.title.split("/");

        setSelectedSize(parts[0]?.trim() || "");
        setSelectedColor(parts[1]?.trim() || "");
      }
    }
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

  const relatedProducts = products
    .filter(
      (item) =>
        item.blueprint_id === product.blueprint_id &&
        item.id !== product.id
    )
    .slice(0, 4);

  const sizeOptions = [
    ...new Set(
      product.variants.map((variant) => variant.title.split("/")[0].trim())
    ),
  ];

  const colorOptions = [
    ...new Set(
      product.variants.map((variant) => variant.title.split("/")[1]?.trim())
    ),
  ];

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
      __html: product.description,
    }}
  />

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
    onClick={() => {

      const selectedVariant =
        product.variants.find((variant) => {

          const parts = variant.title.split("/");

          const size = parts[0]?.trim();

          const color = parts[1]?.trim();

          return (
            size === selectedSize &&
            color === selectedColor
          );

        }) || product.variants[0];

      addToCart({

        ...product,

        quantity,

        selectedVariant,

        selectedSize,

        selectedColor,

      });

      toast.success(`${product.title} added to cart!`);

    }}
  >
    Add to Cart
  </button>

  <button
    className="buy-now-btn"
    onClick={() => {

      const selectedVariant =
        product.variants.find((variant) => {

          const parts = variant.title.split("/");

          const size = parts[0]?.trim();

          const color = parts[1]?.trim();

          return (
            size === selectedSize &&
            color === selectedColor
          );

        }) || product.variants[0];

      addToCart({

        ...product,

        quantity,

        selectedVariant,

        selectedSize,

        selectedColor,

      });

      navigate("/checkout");

    }}
  >
    Buy Now
  </button>

</div>

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