import crypto from "crypto";

// This receives a notification straight from Safepay's own servers whenever
// a payment succeeds (or fails, refunds, etc.) -- independent of the
// customer's browser. The order is actually created when the customer's
// browser lands back on our site (see confirm-order.js), which double-checks
// payment status with Safepay before doing anything. This endpoint is a
// second, independent record from Safepay itself: useful so nothing is lost
// even if a customer closes their browser right after paying and never makes
// it back to the site. Nothing here is required for a normal order to work.
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

  console.log(
    `safepay-webhook: verified event "${payload.type}" for tracker ${
      payload.data?.tracker || "unknown"
    }`
  );

  return res.status(200).json({ received: true });
}
