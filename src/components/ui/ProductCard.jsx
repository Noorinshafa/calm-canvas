import "../../styles/productcard.css";
import { Link } from "react-router-dom";

function ProductCard({ id, image, title, price }) {
  return (
    <div className="product-card">

      <Link to={`/product/${id}`}>
        <div className="product-image">
          <img src={image} alt={title} />
        </div>
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
  );
}

export default ProductCard;