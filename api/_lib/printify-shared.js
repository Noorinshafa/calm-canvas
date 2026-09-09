const PRINTIFY_SHOP_ID = "23619549";

export function printifyHeaders() {
  return { Authorization: `Bearer ${process.env.PRINTIFY_API_TOKEN}` };
}

function computePrice(product) {
  const availableVariants = (product.variants || []).filter(
    (variant) => variant.is_enabled !== false && variant.is_available !== false
  );

  const pricedVariants = availableVariants.length
    ? availableVariants
    : product.variants || [];

  const prices = pricedVariants
    .map((variant) => variant.price)
    .filter((price) => typeof price === "number");

  const lowestPriceCents = prices.length ? Math.min(...prices) : 0;

  return Number((lowestPriceCents / 100).toFixed(2));
}

// Used for product LISTINGS (collections, homepage, search) -- these only
// ever show a title, price and thumbnail, never variant details, so we
// deliberately leave `variants` out. For 144 products, variants alone were
// making up 94% of the response (a real product measured at 5.47MB total,
// with over 41KB of that from one product's 181 variants) -- sending all of
// that on every single page load, on every visit, was the main reason pages
// were loading so slowly, especially on mobile.
export function mapProductSummary(product) {
  const priceValue = computePrice(product);

  return {
    id: product.id,
    title: product.title,
    description: product.description,
    image: product.images?.[0]?.src || null,
    images: (product.images || [])
      .filter((img) => img.src)
      .map((img) => ({ src: img.src })),
    price: `$${priceValue.toFixed(2)}`,
    priceValue,
    blueprint_id: product.blueprint_id,
  };
}

// Used for a single PRODUCT DETAIL page -- this is the only place that
// actually needs variants (to let a customer pick size/color and to know
// which variant ID to send to Printify at checkout). `cost` is stripped
// from each variant -- that's Printify's wholesale price to you, not
// something that should ever be visible in a customer's browser network tab.
export function mapProductFull(product) {
  const summary = mapProductSummary(product);

  const variants = (product.variants || []).map((variant) => {
    const { cost, ...rest } = variant;
    return rest;
  });

  return { ...summary, variants };
}

export { PRINTIFY_SHOP_ID };
