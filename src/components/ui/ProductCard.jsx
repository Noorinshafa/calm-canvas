import "../../styles/productcard.css";
import { Link } from "react-router-dom";

function ProductCard({ id, image, title, price }) {
  return (
    <div className="product-wrapper">

      <Link
        to={`/product/${id}`}
        className="product-card"
      >
        <div className="card-glow"></div>

        <div className="product-image">
          <img
            src={image}
            alt={title}
          />
        </div>

        <div className="product-content">

          <h3>{title}</h3>

          <span>{price}</span>

        </div>

      </Link>

      <Link
        to={`/product/${id}`}
        className="view-details-btn"
      >
        View Details
      </Link>

    </div>
  );
}

export default ProductCard;