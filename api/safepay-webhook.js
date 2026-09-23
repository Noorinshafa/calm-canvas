import crypto from "crypto";
import { createSafepayClient, extractValue } from "./_lib/safepay-node-core.js";
import { createPrintifyOrder } from "./_lib/create-printify-order.js";

// This receives a notification straight from Safepay's own servers whenever
// a payment succeeds (or fails, refunds, etc.) -- independent of the
// customer's browser. The order is normally created when the customer's
// browser lands back on our site (see confirm-order.js), which independently
// re-verifies payment status with Safepay before doing anything.
//
// This is the fallback path for when that never happens -- the customer
// closes the tab, loses the redirect, or the browser-held order cookie
// expires first. If Safepay's webhook payload carries the cart/shipping we
// attached as `metadata` at checkout (see create-checkout-session.js), this
// creates the Printify order right here, using the exact same
// `calmcanvas-card-${tracker}` external_id as confirm-order.js -- so
// whichever path runs first creates the order, and the other safely no-ops
// against Printify's duplicate-external_id rejection (see the same handling
// in confirm-order.js). If the metadata isn't present -- e.g. Safepay
// doesn't echo it back, or this event predates that field being added --
// this still verifies and logs, same as before, so it degrades to exactly
// today's behavior rather than failing.
//
// IMPORTANT: this independently re-verifies payment state with Safepay's
// own API (never trusting the webhook payload's own "it succeeded" claim),
// the same "never trust the redirect alone" rule confirm-order.js already
// follows for the browser path.
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const webhookSecret = process.env.SAFEPAY_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("safepay-webhook: SAFEPAY_WEBHOOK_SECRET not configured.");
    // Acknowledge anyway so Safepay doesn't keep retrying forever -- this
    // just means we won't have this extra safety record until it's set.
    return res.status(200).json({ received: true });
  }

  const signature = req.headers["x-sfpy-signature"];
  const payload = req.body || {};

  // Safepay's own docs describe signing JSON.stringify(payload) with
  // HMAC-SHA512 and comparing it (hex-encoded) against the X-SFPY-SIGNATURE
  // header. There's no SDK helper for this in the current published
  // package, so this does exactly that by hand.
  const expectedSignature = crypto
    .createHmac("sha512", webhookSecret)
    .update(Buffer.from(JSON.stringify(payload)))
    .digest("hex");

  const isValid =
    typeof signature === "string" &&
    signature.length === expectedSignature.length &&
    crypto.timingSafeEqual(
      Buffer.from(expectedSignature, "utf8"),
      Buffer.from(signature, "utf8")
    );

  if (!isValid) {
    console.error(
      "safepay-webhook: signature did not match -- ignoring this request."
    );
    return res.status(400).json({ error: "Invalid signature." });
  }

  const tracker = extractValue(payload, [
    "data.tracker",
    "data.tracker.token",
    "tracker",
    "tracker.token",
  ]);

  console.log(
    `safepay-webhook: verified event "${payload.type}" for tracker ${
      tracker || "unknown"
    }`
  );

  // Always acknowledge the webhook itself once the signature checks out --
  // everything below is best-effort. A failure here shouldn't make Safepay
  // retry-storm this endpoint; confirm-order.js's cookie-retry path remains
  // the primary recovery mechanism regardless.
  if (!tracker) {
    return res.status(200).json({ received: true });
  }

  const metadataOrderState = extractValue(payload, [
    "data.metadata.orderState",
    "metadata.orderState",
  ]);

  if (!metadataOrderState) {
    // No order data to act on yet -- see the file comment above. Nothing
    // more to do than log, same as before.
    return res.status(200).json({ received: true });
  }

  try {
    const safepay = createSafepayClient();
    if (!safepay) {
      return res.status(200).json({ received: true });
    }

    // Never trust the webhook payload's own "it succeeded" claim -- ask
    // Safepay directly, exactly like confirm-order.js does for the browser
    // redirect path.
    const statusResponse = await safepay.reporter.payments.fetch(tracker);
    const state = extractValue(statusResponse, [
      "data.state",
      "state",
      "data.tracker.state",
    ]);

    if (state !== "TRACKER_ENDED") {
      return res.status(200).json({ received: true });
    }

    const orderState = JSON.parse(metadataOrderState);
    const orderCart = (orderState.cart || []).map((item) => ({
      id: item.id,
      selectedVariant: { id: item.variantId },
      quantity: item.qty,
    }));

    await createPrintifyOrder({
      cart: orderCart,
      shipping: orderState.shipping,
      externalId: `calmcanvas-card-${tracker}`,
    });

    console.log(`safepay-webhook: created fallback order for tracker ${tracker}`);
  } catch (error) {
    // A duplicate external_id here just means confirm-order.js already
    // created this order via the browser redirect -- expected, not an
    // error.
    const message = (error.message || "").toLowerCase();
    const isDuplicate =
      message.includes("external_id") &&
      (message.includes("already") ||
        message.includes("exist") ||
        message.includes("duplicate"));

    if (!isDuplicate) {
      console.error(
        `safepay-webhook: fallback order creation failed for tracker ${tracker}:`,
        error.message
      );
    }
  }

  return res.status(200).json({ received: true });
}
