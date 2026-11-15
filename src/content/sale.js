// Christmas sale: "% OFF" tags with the previous price crossed out.
//
// Honesty rules (US FTC "former price" guide, UK DMCC/CMA pricing rules, EU
// Price Indication Directive art. 6a):
// - Only products that really were on sale at WAS_PRICE on this site before
//   their price was lowered are listed here. The owner confirmed this on
//   15 Nov 2026 for the sweatshirts below (regular price $60, lowered to
//   $29.78 / $30.78 for Christmas).
// - The tag shows the previous price as well as the percentage, and the
//   percentage is always rounded DOWN, so it never claims more than the real
//   saving.
// - The sale ends by itself after SALE_ENDS: a "sale" that never ends would
//   turn the old price into a fake reference price.
//
// Nothing here changes a real price: the cart, checkout and Safepay always use
// the product's actual price from Printify.
//
// To add a product: put its slug (the last part of its /products/... address)
// in SALE_SLUGS, but only if it really was sold at WAS_PRICE before.
//
// "Special Price": other sweatshirts priced at SPECIAL_MAX or less get a
// "Special Price" tag instead (the owner lowered their profit on them). It
// makes no claim about an earlier price, so it shows no crossed-out price and
// no percentage.

export const WAS_PRICE = 60;

// Last day of the sale (inclusive, the visitor's own time zone).
const SALE_ENDS = new Date(2026, 11, 26, 23, 59, 59); // 26 December 2026

export const SALE_SLUGS = new Set([
  "ugly-christmas-sweater-sweatshirt-unisex-christmas-crewneck-with-retro-reindeer",
  "botanical-bloom-floral-crewneck-sweatshirt-for-woman",
  "vintage-radio-cassette-collage-sweatshirt",
  "cozy-christmas-cat-sweatshirt-burgundy-holiday-graphic-pullover",
  "vintage-cat-with-glasses-sweatshirt",
  "you-are-so-bootiful-skeleton-illustration-sweatshirt",
  "do-you-believe-in-humans-ghost-duo-sweatshirt",
  "fall-leaves-and-mushrooms-crewneck-sweatshirt",
]);

// Smallest saving worth a tag.
const MIN_PERCENT = 5;

// Sweatshirts at or below this price show "Special Price".
const SPECIAL_COLLECTION = "sweatshirts";
const SPECIAL_MAX = 50;

// { wasPrice, percent } for a product on sale at `price` (a number, in
// dollars), or null when it is not on sale, the sale is over, or the price is
// not below the previous price (e.g. a larger size that costs more).
export function saleInfo(slug, price, now = new Date()) {
  if (!slug || !SALE_SLUGS.has(slug) || now > SALE_ENDS) return null;

  const value = Number(price);
  if (!Number.isFinite(value) || value <= 0 || value >= WAS_PRICE) return null;

  const percent = Math.floor(((WAS_PRICE - value) / WAS_PRICE) * 100);
  if (percent < MIN_PERCENT) return null;

  return { wasPrice: WAS_PRICE, percent };
}

// The tag to show on a product, worked out from its current price:
//   { type: "sale", label: "50% OFF", wasPrice: 60 }  real reduction
//   { type: "special", label: "Special Price" }       low-priced sweatshirt
//   null                                              no tag
// `collectionKey` is the product's collection ("sweatshirts", "mugs", ...).
export function priceTag(slug, price, collectionKey, now = new Date()) {
  const sale = saleInfo(slug, price, now);
  if (sale) return { type: "sale", label: `${sale.percent}% OFF`, wasPrice: sale.wasPrice };

  const value = Number(price);
  if (
    collectionKey === SPECIAL_COLLECTION &&
    Number.isFinite(value) &&
    value > 0 &&
    value <= SPECIAL_MAX
  ) {
    return { type: "special", label: "Special Price" };
  }

  return null;
}
