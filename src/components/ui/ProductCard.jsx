import "../../styles/productcard.css";
import { Link } from "react-router-dom";
import { productPath, cleanProductName } from "../../utils/seoShared.js";

function ProductCard({ id, slug, image, title, price }) {
  const href = productPath({ id, slug });

  return (
    <div className="product-wrapper">

      <div className="product-card">

        <Link
          to={href}
          className="product-image"
        >
          {image && (
            <img
              src={image}
              alt={cleanProductName(title)}
              loading="lazy"
              decoding="async"
            />
          )}
        </Link>

        <div className="product-content">

          <h3>{cleanProductName(title)}</h3>

          <span>{price}</span>

          <Link
            to={href}
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
