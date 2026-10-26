import crypto from "crypto";

// The "order cookie" (cc_order) carries the customer's cart and delivery
// details from the moment they go to pay until they land back on our site
// (see create-checkout-session.js and confirm-order.js).
//
// SECURITY: the browser holds this cookie, so on its own a customer could
// edit it (HttpOnly only hides it from page scripts, not from the person who
// owns the browser). Without a signature, someone could pay for a small order
// and then change the cart inside the cookie, and we would create the bigger
// order. So the cookie is signed here with a secret that only our server
// knows, and confirm-order.js refuses anything that was changed.
//
// The signing key is derived from the Safepay merchant secret that this
// project already requires (SAFEPAY_V1_SECRET), so nothing new has to be set
// up in Vercel. ORDER_COOKIE_SECRET can optionally override it later.
// The key is never sent to the browser, and deriving it with a fixed label
// means the Safepay secret itself is never used directly for this purpose.

const KEY_LABEL = "shopcalmcanvas:cc_order:v1";

function signingKey() {
  const base = process.env.ORDER_COOKIE_SECRET || process.env.SAFEPAY_V1_SECRET;
  if (!base) return null;
  return crypto.createHmac("sha256", base).update(KEY_LABEL).digest();
}

function signature(payload, key) {
  return crypto.createHmac("sha256", key).update(payload).digest("base64url");
}

// Turns the order details into the cookie value: "<payload>.<signature>".
// Both parts only use characters that are valid inside a cookie value.
// Throws if no signing secret is configured, so a cookie is never issued
// without a signature (this runs before the customer is sent to pay).
export function sealOrderState(state) {
  const key = signingKey();
  if (!key) {
    throw new Error("Order cookie signing secret is not configured.");
  }
  const payload = Buffer.from(JSON.stringify(state)).toString("base64url");
  return `${payload}.${signature(payload, key)}`;
}

// Reads a cookie value made by sealOrderState. Returns the order details, or
// null if the value is missing, malformed, unsigned (an old cookie from
// before signing existed), or was changed in any way.
export function openOrderState(value) {
  const key = signingKey();
  if (!key || typeof value !== "string") return null;

  const dot = value.lastIndexOf(".");
  if (dot <= 0 || dot === value.length - 1) return null;

  const payload = value.slice(0, dot);
  const given = Buffer.from(value.slice(dot + 1), "utf8");
  const expected = Buffer.from(signature(payload, key), "utf8");

  if (given.length !== expected.length) return null;
  if (!crypto.timingSafeEqual(given, expected)) return null;

  try {
    const state = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    return state && typeof state === "object" ? state : null;
  } catch {
    return null;
  }
}
