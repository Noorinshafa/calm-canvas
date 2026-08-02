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

  const product = products.find(
    item => item.id === id
  );

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
    .filter(item =>
      item.blueprint_id === product.blueprint_id &&
      item.id !== product.id
    )
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

            <p
              dangerouslySetInnerHTML={{
                __html: product.description,
              }}
            />

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

          {relatedProducts.map(item => (

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