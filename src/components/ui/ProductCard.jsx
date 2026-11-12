import "../../styles/productcard.css";
import { Link } from "react-router-dom";
import { productPath, cleanProductName } from "../../utils/seoShared.js";
import OptimizedImage from "./OptimizedImage";

// How wide a card is on screen: 2 across on phones, 3 on tablets, 4 on laptops and desktops, 5 on very wide screens.
const CARD_SIZES =
  "(max-width: 640px) 50vw, (max-width: 1100px) 33vw, (max-width: 1600px) 25vw, 20vw";

// The resized copies the browser may choose from (see src/utils/imageUrl.js).
const CARD_WIDTHS = [384, 768];

// A grid that lays its cards out differently from the shop grids (for example
// "You may also like" on a product page) passes its own `sizes` and `widths`.
// If `sizes` says the photo is smaller than it really is, the browser
// downloads a copy that is too small and the photo looks blurry.
function ProductCard({
  id,
  slug,
  image,
  title,
  price,
  priority = false,
  sizes = CARD_SIZES,
  widths = CARD_WIDTHS,
}) {
  const href = productPath({ id, slug });

  return (
    <div className="product-wrapper">

      <div className="product-card">

        <Link
          to={href}
          className="product-image"
        >
          {image && (
            <OptimizedImage
              src={image}
              alt={cleanProductName(title)}
              widths={widths}
              sizes={sizes}
              priority={priority}
              width="600"
              height="600"
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
