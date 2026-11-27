import "../../styles/productcard.css";
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  productPath,
  cleanProductName,
  findCollectionForProduct,
  formatPrice,
} from "../../utils/seoShared.js";
import OptimizedImage from "./OptimizedImage";
import { priceTag } from "../../content/sale.js";

// How wide a card is on screen in the shop grids (2 across on phones, 3 on
// tablets, about 290px wide next to the filter sidebar on computers).
const CARD_SIZES = "(max-width: 640px) 50vw, (max-width: 1100px) 33vw, 300px";
// The resized copies the browser may choose from (see src/utils/imageUrl.js).
const CARD_WIDTHS = [384, 768];

// Only devices with a real mouse show the model photo on hover. Phones never
// download it.
function canHover() {
  return typeof window !== "undefined" && window.matchMedia?.("(hover: hover)").matches;
}

// A grid that lays its cards out differently from the shop grids (for example
// "You may also like" on a product page) passes its own `sizes` and `widths`.
// If `sizes` says the photo is smaller than it really is, the browser
// downloads a copy that is too small and the photo looks blurry.
//
// The photo sits on a light grey field. When the product has Printify's plain
// "front" photo (cardImage, on white), that photo is used and its white
// background blends into the grey, so every product sits on the same studio
// background. Otherwise the product's main photo fills the field as before.
// On computers, pointing at the card fades in the back of the product
// (backImage, e.g. the back of a hoodie), or a photo of a real model wearing
// it (modelImage) when there is no back photo. It is only downloaded the
// first time.
//
// There are no type, "bestseller" or rating labels on the photo. A
// "% OFF" tag appears only for real price reductions, and low-priced
// sweatshirts say "Special Price" (src/content/sale.js).
// The whole card is one link to the product page, where the size and colour
// are chosen before adding to the cart.
function ProductCard({
  id,
  slug,
  image,
  cardImage,
  backImage,
  modelImage,
  title,
  price,
  priceValue,
  blueprintTitle,
  blueprint_id,
  priority = false,
  sizes = CARD_SIZES,
  widths = CARD_WIDTHS,
}) {
  const [wantModel, setWantModel] = useState(false);
  const [modelReady, setModelReady] = useState(false);

  const href = productPath({ id, slug });
  const name = cleanProductName(title);
  const collection = findCollectionForProduct({ blueprintTitle, blueprint_id, title });
  const tag = priceTag(slug, priceValue, collection?.key);
  const studio = Boolean(cardImage);
  const photo = cardImage || image;
  // The back photo is on white like the front one, so it is shown whole and
  // blended into the grey field; a model photo fills the field.
  const hoverImage = backImage || modelImage;
  const hoverIsBack = Boolean(backImage);

  function loadModel() {
    if (hoverImage && !wantModel && canHover()) setWantModel(true);
  }

  return (
    <article className="pcard">
      <Link
        to={href}
        className="pcard-link"
        onPointerEnter={loadModel}
        onFocus={loadModel}
      >
        <span
          className={[
            "pcard-media",
            studio ? "pcard-media--studio" : "",
            modelReady ? "has-model" : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {photo && (
            <OptimizedImage
              className="pcard-img"
              src={photo}
              alt={name}
              widths={widths}
              sizes={sizes}
              priority={priority}
              width="600"
              height="600"
            />
          )}
          {wantModel && (
            <OptimizedImage
              className={`pcard-img pcard-img--model${hoverIsBack ? " pcard-img--back" : ""}`}
              src={hoverImage}
              alt=""
              widths={widths}
              sizes={sizes}
              width="600"
              height="600"
              onLoad={() => setModelReady(true)}
            />
          )}
          {tag && <span className="sale-tag">{tag.label}</span>}
        </span>
        <span className="pcard-body">
          <h3 className="pcard-name">{name}</h3>
          <span className="pcard-price">
            {price}
            {tag?.wasPrice && (
              <s className="price-was">
                <span className="sr-only">Was </span>
                {formatPrice(tag.wasPrice)}
              </s>
            )}
          </span>
        </span>
      </Link>
    </article>
  );
}

export default ProductCard;
