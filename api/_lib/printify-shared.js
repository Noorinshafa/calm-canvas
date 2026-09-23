const PRINTIFY_SHOP_ID = "23619549";
const PRINTIFY_API_BASE = "https://api.printify.com/v1";

export function printifyHeaders() {
  return { Authorization: `Bearer ${process.env.PRINTIFY_API_TOKEN}` };
}

// Only variants Printify will actually accept an order for. Used both when
// computing a listing price (so we don't quote a price for something
// unbuyable) and when building the product-detail response (so a customer
// can never select -- and pay for -- an option Printify will reject).
function availableVariants(product) {
  const available = (product.variants || []).filter(
    (variant) => variant.is_enabled !== false && variant.is_available !== false
  );

  // If literally every variant is flagged unavailable, fall back to the
  // raw list -- better to show something than an empty product page.
  return available.length ? available : product.variants || [];
}

function computePrice(product) {
  const prices = availableVariants(product)
    .map((variant) => variant.price)
    .filter((price) => typeof price === "number");

  const lowestPriceCents = prices.length ? Math.min(...prices) : 0;

  return Number((lowestPriceCents / 100).toFixed(2));
}

// ---------------------------------------------------------------------------
// Blueprint titles
//
// Printify's product list only gives us a numeric `blueprint_id` (the
// physical product template, e.g. "which exact hoodie template"). To match
// products into categories by NAME (see src/utils/matchesCategory.js) --
// rather than only by a hand-maintained list of known IDs, which silently
// misses every new blueprint until someone notices a product is missing --
// we need that blueprint's title too, e.g. "Unisex Heavy Cotton Tee".
//
// Printify's blueprint catalog is one endpoint covering every blueprint
// that exists (not shop-specific), so we fetch it once and cache it in
// memory for the life of this serverless instance. Blueprint titles
// essentially never change, so a 24h cache is generous, not risky, and it
// avoids an extra Printify round-trip on every single request.
// ---------------------------------------------------------------------------
let blueprintTitleCache = null;
let blueprintTitleCacheAt = 0;
const BLUEPRINT_CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24h

export async function getBlueprintTitleMap() {
  const isFresh =
    blueprintTitleCache &&
    Date.now() - blueprintTitleCacheAt < BLUEPRINT_CACHE_TTL_MS;

  if (isFresh) return blueprintTitleCache;

  try {
    const response = await fetch(`${PRINTIFY_API_BASE}/catalog/blueprints.json`, {
      headers: printifyHeaders(),
    });

    if (!response.ok) {
      // Don't fail the whole product list over this -- category matching
      // just falls back to the hardcoded ID lists, same as it does today.
      console.error("getBlueprintTitleMap: Printify returned", response.status);
      return blueprintTitleCache || new Map();
    }

    const blueprints = await response.json();
    const map = new Map();

    for (const blueprint of blueprints || []) {
      if (blueprint?.id != null && blueprint?.title) {
        map.set(Number(blueprint.id), blueprint.title);
      }
    }

    blueprintTitleCache = map;
    blueprintTitleCacheAt = Date.now();

    return map;
  } catch (error) {
    console.error("getBlueprintTitleMap: fetch failed:", error.message);
    return blueprintTitleCache || new Map();
  }
}

// Used for product LISTINGS (collections, homepage, search) -- these only
// ever show a title, price and thumbnail, never variant details, so we
// deliberately leave `variants` out. For 144 products, variants alone were
// making up 94% of the response (a real product measured at 5.47MB total,
// with over 41KB of that from one product's 181 variants) -- sending all of
// that on every single page load, on every visit, was the main reason pages
// were loading so slowly, especially on mobile.
export function mapProductSummary(product, blueprintTitle = "") {
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
    blueprintTitle,
  };
}

// Used for a single PRODUCT DETAIL page -- this is the only place that
// actually needs variants (to let a customer pick size/color and to know
// which variant ID to send to Printify at checkout). `cost` is stripped
// from each variant -- that's Printify's wholesale price to you, not
// something that should ever be visible in a customer's browser network tab.
//
// Only enabled/available variants are included, so a customer can never
// select -- and pay for -- a size/color Printify would reject once the
// order actually reaches them.
export function mapProductFull(product, blueprintTitle = "") {
  const summary = mapProductSummary(product, blueprintTitle);

  const variants = availableVariants(product).map((variant) => {
    const { cost, ...rest } = variant;
    return rest;
  });

  return { ...summary, variants };
}

// ---------------------------------------------------------------------------
// Server-side cart pricing & validation
//
// Never trust a price the browser sends us. This re-fetches every product
// in the cart directly from Printify and prices the order from Printify's
// own numbers -- so editing `priceValue` in devtools, or POSTing a
// hand-crafted request straight to the checkout endpoint, can't change what
// a customer is actually charged. It also re-checks that each selected
// variant still exists and is still purchasable, so a stale/cached cart
// can't be used to buy something no longer available.
// ---------------------------------------------------------------------------
export async function priceAndValidateCart(cart) {
  const uniqueProductIds = [...new Set(cart.map((item) => item.id))];

  const entries = await Promise.all(
    uniqueProductIds.map(async (id) => {
      try {
        const response = await fetch(
          `${PRINTIFY_API_BASE}/shops/${PRINTIFY_SHOP_ID}/products/${id}.json`,
          { headers: printifyHeaders() }
        );
        if (!response.ok) return [id, null];
        return [id, await response.json()];
      } catch {
        return [id, null];
      }
    })
  );

  const productsById = new Map(entries);

  let totalCents = 0;
  const pricedCart = [];

  for (const item of cart) {
    const product = productsById.get(item.id);

    if (!product) {
      const error = new Error(
        "One of the items in your cart is no longer available."
      );
      error.status = 409;
      throw error;
    }

    const variantId = item.selectedVariant?.id;
    const variant = (product.variants || []).find((v) => v.id === variantId);

    if (!variant) {
      const error = new Error(
        "One of the selected options is no longer available. Please reselect it."
      );
      error.status = 409;
      throw error;
    }

    if (variant.is_enabled === false || variant.is_available === false) {
      const error = new Error(
        `"${product.title}" (${variant.title}) just sold out. Please remove it from your cart.`
      );
      error.status = 409;
      throw error;
    }

    const quantity = Math.max(1, Math.floor(Number(item.quantity) || 1));
    const priceCents = typeof variant.price === "number" ? variant.price : 0;

    totalCents += priceCents * quantity;

    pricedCart.push({
      id: item.id,
      variantId,
      qty: quantity,
      priceCents,
    });
  }

  if (!(totalCents > 0)) {
    const error = new Error("Your cart total looks invalid.");
    error.status = 400;
    throw error;
  }

  return { totalCents, pricedCart };
}

// ---------------------------------------------------------------------------
// Fetches every product in the shop, priced/summarized for listings, with
// blueprint titles attached. Shared by api/printify.js (the catalog
// endpoint the site itself uses) and api/sitemap.js (which needs every
// product's id/URL, not its own separate copy of this pagination logic).
// ---------------------------------------------------------------------------
export async function getAllProductSummaries() {
  const headers = printifyHeaders();

  // Get page 1 first to find out how many pages there are, then fetch the
  // rest in parallel instead of one-by-one -- on a cold serverless
  // invocation, fetching (say) 3 pages sequentially meant waiting on 3 full
  // round-trips to Printify back to back before anything could be sent back
  // to the browser. The blueprint title lookup (needed to match products
  // into categories by name -- see matchesCategory.js) runs in parallel
  // with these too, not after, since it doesn't depend on them.
  const firstPagePromise = fetch(
    `${PRINTIFY_API_BASE}/shops/${PRINTIFY_SHOP_ID}/products.json?limit=50&page=1`,
    { headers }
  );
  const blueprintTitlesPromise = getBlueprintTitleMap();

  const firstResponse = await firstPagePromise;

  if (!firstResponse.ok) {
    const errorText = await firstResponse.text();
    const error = new Error(errorText || "Failed to fetch products from Printify.");
    error.status = firstResponse.status;
    throw error;
  }

  const firstResult = await firstResponse.json();
  const lastPage = firstResult.last_page || 1;

  const remainingPages = [];
  for (let page = 2; page <= lastPage; page++) {
    remainingPages.push(
      fetch(
        `${PRINTIFY_API_BASE}/shops/${PRINTIFY_SHOP_ID}/products.json?limit=50&page=${page}`,
        { headers }
      ).then((r) => r.json())
    );
  }

  const [remainingResults, blueprintTitles] = await Promise.all([
    Promise.all(remainingPages),
    blueprintTitlesPromise,
  ]);

  const allProducts = [
    ...(firstResult.data || []),
    ...remainingResults.flatMap((result) => result.data || []),
  ];

  // Deliberately lightweight -- see mapProductSummary's comment. Product
  // detail pages fetch their own full data from /api/product instead of
  // this endpoint.
  return allProducts.map((product) =>
    mapProductSummary(
      product,
      blueprintTitles.get(Number(product.blueprint_id)) || ""
    )
  );
}

export { PRINTIFY_SHOP_ID };
