// Delivery options a customer can choose, shared by the website (checkout and
// product pages) and the server (api/_lib/shipping.js). Plain JavaScript with
// no imports on purpose.
//
// The PRICE of each option is never written here. It always comes from
// Printify's own shipping calculator for the exact items and country in the
// cart (POST /v1/shops/{shop}/orders/shipping.json), so it can't go out of
// date. Only the names, Printify's method numbers and the delivery estimates
// live here.
//
// `methodId` is the `shipping_method` number Printify expects when the order
// is created (1 = standard, 2 = priority).
//
// Printify also has Economy (US only) and Printify Express (a few T-shirts,
// US only). They are left out on purpose: Printify submits those through
// different order settings, and they save or cost very little. They can be
// added later.
export const SHIPPING_METHODS = [
  { key: "standard", methodId: 1, label: "Standard" },
  { key: "priority", methodId: 2, label: "Priority" },
];

export const PRINT_TIME_TEXT = "2–7 business days";

// Delivery estimates from Printify's Help Center ("What are Printify's
// shipping options?"). They count from when the order leaves production and
// depend on the supplier and carrier, so they are shown as estimates.
export function deliveryEstimate(key, countryCode) {
  const domestic = countryCode === "US";

  if (key === "priority") {
    return domestic
      ? "About 2–3 business days after printing"
      : "About 3–5 business days after printing";
  }

  return domestic
    ? "About 2–5 business days after printing"
    : "About 10–30 business days after printing";
}

// Limits so one request can't be used to hammer Printify's calculator.
export const MAX_CART_LINES = 30;
export const MAX_LINE_QUANTITY = 100;
