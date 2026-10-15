// Asks Printify what shipping costs for a given cart and destination country.
//
// This is the single source of truth for shipping prices. It is used twice:
//   1. api/shipping-quote.js  -> shows the options to the customer, and
//   2. api/create-checkout-session.js -> works the price out AGAIN on the
//      server before taking payment, so the amount charged can never be
//      changed from the browser.
//
// Printify's calculator: POST /v1/shops/{shop_id}/orders/shipping.json
// Request:  { line_items: [{ product_id, variant_id, quantity }], address_to }
// Response: whole numbers in cents, for example
//           { standard: 475, priority: 900, ... } -- a method is missing or
//           not a number when Printify can't offer it for this cart.
import { countryCodeFor } from "../../src/config/countries.js";
import { SHIPPING_METHODS } from "../../src/config/shipping.js";
import { printifyHeaders, PRINTIFY_SHOP_ID } from "./printify-shared.js";

const PRINTIFY_API_BASE = "https://api.printify.com/v1";

function httpError(status, message, details) {
  const error = new Error(message);
  error.status = status;
  if (details !== undefined) error.details = details;
  return error;
}

// Short-lived memory cache (per server instance) so a customer changing
// quantity or flicking between countries doesn't call Printify every time.
const CACHE_TTL_MS = 5 * 60 * 1000;
const CACHE_MAX = 300;
const cache = new Map();

function cacheGet(key) {
  const hit = cache.get(key);
  if (!hit) return null;
  if (Date.now() - hit.at > CACHE_TTL_MS) {
    cache.delete(key);
    return null;
  }
  return hit.options;
}

function cacheSet(key, options) {
  if (cache.size >= CACHE_MAX) cache.delete(cache.keys().next().value);
  cache.set(key, { at: Date.now(), options });
}

// lines: [{ id, variantId, quantity }]
// Returns { countryCode, options: [{ key, methodId, label, cents }] }.
export async function quoteShipping({ lines, country }) {
  const countryCode = countryCodeFor(country);

  if (!countryCode) {
    throw httpError(
      400,
      "Please choose a country from the list so we can work out shipping."
    );
  }

  const lineItems = (lines || []).map((line) => ({
    product_id: String(line.id),
    variant_id: Number(line.variantId),
    quantity: Math.max(1, Math.floor(Number(line.quantity) || 1)),
  }));

  if (
    lineItems.length === 0 ||
    lineItems.some((item) => !item.product_id || !Number.isInteger(item.variant_id))
  ) {
    throw httpError(400, "Your cart is missing an item option. Please re-add it.");
  }

  const cacheKey = JSON.stringify([countryCode, lineItems]);
  const cached = cacheGet(cacheKey);
  if (cached) return { countryCode, options: cached };

  let response;
  let result = null;

  try {
    response = await fetch(
      `${PRINTIFY_API_BASE}/shops/${PRINTIFY_SHOP_ID}/orders/shipping.json`,
      {
        method: "POST",
        headers: { ...printifyHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({
          line_items: lineItems,
          // Only the country decides the price. The rest is filler that
          // matches what order creation already sends (see
          // create-printify-order.js); no customer data is sent for a quote.
          address_to: {
            first_name: "Calm",
            last_name: "Canvas",
            email: "orders@shopcalmcanvas.com",
            phone: "0000000000",
            country: countryCode,
            region: "Quote",
            city: "Quote",
            address1: "Quote",
            zip: "00000",
          },
        }),
      }
    );
    result = await response.json().catch(() => null);
  } catch (error) {
    console.error("quoteShipping: could not reach Printify:", error.message);
    throw httpError(
      502,
      "We couldn't work out shipping just now. Please try again in a moment."
    );
  }

  if (!response.ok) {
    console.error(
      "quoteShipping: Printify said",
      response.status,
      JSON.stringify(result)
    );

    if (response.status >= 500 || response.status === 429 || response.status === 401 || response.status === 403) {
      throw httpError(
        502,
        "We couldn't work out shipping just now. Please try again in a moment."
      );
    }

    throw httpError(
      422,
      "Sorry, we can't ship these items to that country right now. Please choose another country or contact us."
    );
  }

  const options = SHIPPING_METHODS.map((method) => ({
    key: method.key,
    methodId: method.methodId,
    label: method.label,
    cents: result?.[method.key],
  })).filter((option) => Number.isInteger(option.cents) && option.cents >= 0);

  if (options.length === 0) {
    console.error("quoteShipping: no usable rates in", JSON.stringify(result));
    throw httpError(
      422,
      "Sorry, we can't ship these items to that country right now. Please choose another country or contact us."
    );
  }

  cacheSet(cacheKey, options);
  return { countryCode, options };
}
