import { useParams, useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import toast from "react-hot-toast";

import "../../styles/productdetails.css";

import ProductCard from "../components/ui/ProductCard";

import jewellery from "../../data/jewellery";
import accessories from "../../data/accessories";
import gifts from "../../data/gifts";

function ProductDetails() {

  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const allProducts = [
    ...jewellery,
    ...accessories,
    ...gifts,
  ];

  const product = allProducts.find(
    (item) => item.id === id
  );

  if (!product) {
    return (
      <section className="product-details">
        <div className="product-container">
          <h1>Product not found.</h1>
        </div>
      </section>
    );
  }

  let currentCategory = [];

if (jewellery.find(item => item.id === product.id)) {

  currentCategory = jewellery;

} else if (accessories.find(item => item.id === product.id)) {

  currentCategory = accessories;

} else if (gifts.find(item => item.id === product.id)) {

  currentCategory = gifts;

}

const relatedProducts = currentCategory
  .filter(item => item.id !== product.id)
  .slice(0, 4);

  return (

    <>

      <section className="product-details">

        <div className="product-container">

          <div className="details-image">

            <img
              className="details-image-img"
              src={product.image}
              alt={product.title}
            />

          </div>

          <div className="product-info">

            <span className="product-category">

              CALM CANVAS

            </span>

            <h1>{product.title}</h1>

            <h2>{product.price}</h2>

            <p>{product.description}</p>

            <div className="product-buttons">

              <button
                className="add-cart-btn"
                onClick={() => {

                  addToCart(product);

                  toast.success(`${product.title} added to cart!`);

                }}
              >

                Add to Cart

              </button>

              <button
                className="buy-now-btn"
                onClick={() => {

                  addToCart(product);

                  navigate("/checkout");

                }}
              >

                Buy Now

              </button>

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