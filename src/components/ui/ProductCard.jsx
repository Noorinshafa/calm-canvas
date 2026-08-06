import "../../styles/productcard.css";
import { Link } from "react-router-dom";

function ProductCard({ id, image, title, price }) {
  return (
    <div className="product-wrapper">

      <div className="product-card">

        <Link
          to={`/product/${id}`}
          className="product-image"
        >
          {image && (
            <img
              src={image}
              alt={title}
              loading="lazy"
              decoding="async"
            />
          )}
        </Link>

        <div className="product-content">

          <h3>{title}</h3>

          <span>{price}</span>

          <Link
            to={`/product/${id}`}
            className="view-details-btn"
          >
            View Details
          </Link>

        </div>

      </div>

    </div>
  );
}

export default ProductCard;