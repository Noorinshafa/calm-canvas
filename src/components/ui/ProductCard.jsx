import "../../styles/productcard.css";
import { Link } from "react-router-dom";
import {
  productPath,
  cleanProductName,
  findCollectionForProduct,
} from "../../utils/seoShared.js";
import OptimizedImage from "./OptimizedImage";

// How wide a card is on screen in the shop grids (2 across on phones, 3 on
// tablets, about 290px wide next to the filter sidebar on computers).
const CARD_SIZES = "(max-width: 640px) 50vw, (max-width: 1100px) 33vw, 300px";
// The resized copies the browser may choose from (see src/utils/imageUrl.js).
const CARD_WIDTHS = [384, 768];

// A grid that lays its cards out differently from the shop grids (for example
// "You may also like" on a product page) passes its own `sizes` and `widths`.
// If `sizes` says the photo is smaller than it really is, the browser
// downloads a copy that is too small and the photo looks blurry.
//
// The small label on the photo is the product type (Hoodie, Mug...). There are
// no "bestseller", rating or sale labels: the shop has no data behind them.
// The whole card is one link to the product page, where the size and colour
// are chosen before adding to the cart.
function ProductCard({
  id,
  slug,
  image,
  title,
  price,
  blueprintTitle,
  blueprint_id,
  priority = false,
  sizes = CARD_SIZES,
  widths = CARD_WIDTHS,
}) {
  const href = productPath({ id, slug });
  const name = cleanProductName(title);
  const noun = findCollectionForProduct({ blueprintTitle, blueprint_id, title })?.noun || "";
  const type = noun ? noun.charAt(0).toUpperCase() + noun.slice(1) : "";

  return (
    <article className="pcard">
      <Link to={href} className="pcard-link">
        <span className="pcard-media">
          {image && (
            <OptimizedImage
              src={image}
              alt={name}
              widths={widths}
              sizes={sizes}
              priority={priority}
              width="600"
              height="600"
            />
          )}
          {type && <span className="pcard-badge">{type}</span>}
        </span>
        <span className="pcard-body">
          <h3 className="pcard-name">{name}</h3>
          <span className="pcard-foot">
            <span className="pcard-price">{price}</span>
            <span className="pcard-cta" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 7h12l-1 13H7L6 7zM9 7V5.5a3 3 0 0 1 6 0V7" />
              </svg>
              Shop Now
            </span>
          </span>
        </span>
      </Link>
    </article>
  );
}

export default ProductCard;
