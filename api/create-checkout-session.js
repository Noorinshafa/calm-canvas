import { Safepay } from "@sfpy/node-sdk";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const secretKey = process.env.SAFEPAY_SECRET_KEY;

  if (!secretKey) {
    return res.status(503).json({
      error: "Card payments aren't connected yet. Please try again later.",
    });
  }

  // Safepay's POST /order/v1/init `client` field must be the PUBLIC API key
  // (starts with `sec_`), NOT the 64-char hex merchant secret. Passing the
  // hex secret here is exactly what triggers the 404
  // "Client with this identifier not found". The hex secret belongs in
  // SAFEPAY_V1_SECRET (used for redirect-signature verification), not here.
  if (!secretKey.startsWith("sec_")) {
    console.error(
      "SAFEPAY_SECRET_KEY is not a `sec_...` public key. The /order/v1/init " +
        "`client` field needs the sec_ key; the hex secret goes in SAFEPAY_V1_SECRET."
    );
    return res.status(503).json({
      error: "Card payments are misconfigured. Please contact the store.",
    });
  }

  try {
    const { cart, shipping } = req.body || {};

    if (!Array.isArray(cart) || cart.length === 0) {
      return res.status(400).json({ error: "Your cart is empty." });
    }

    const missingVariant = cart.find((item) => !item.selectedVariant?.id);

    if (missingVariant) {
      return res.status(400).json({
        error:
          "One of the items in your cart is missing a selected size/color option.",
      });
    }

    if (!shipping) {
      return res.status(400).json({ error: "Missing shipping information." });
    }

    const total = cart.reduce(
      (sum, item) => sum + (item.priceValue || 0) * (item.quantity || 1),
      0
    );

    if (!(total > 0)) {
      return res.status(400).json({ error: "Your cart total looks invalid." });
    }

    const environment = process.env.SAFEPAY_ENV === "production" ? "production" : "sandbox";

    const safepay = new Safepay({
      environment,
      apiKey: secretKey,
      v1Secret: process.env.SAFEPAY_V1_SECRET || "",
      webhookSecret: process.env.SAFEPAY_WEBHOOK_SECRET || "",
    });

    // What we need to actually create the Printify order once payment is
    // confirmed. We don't rely on Safepay to remember this for us -- we
    // carry it ourselves in the redirect URL (see `state` below) and
    // double-check the real payment status with Safepay before ever
    // creating an order.
    const cartForOrder = cart.map((item) => ({
      id: item.id,
      variantId: item.selectedVariant?.id,
      qty: item.quantity || 1,
    }));

    const orderState = {
      cart: cartForOrder,
      shipping: {
        firstName: shipping.firstName || "",
        lastName: shipping.lastName || "",
        phone: shipping.phone || "",
        email: shipping.email || "",
        country: shipping.country || "Pakistan",
        city: shipping.city || "",
        postalCode: shipping.postalCode || "",
        address: shipping.address || "",
        notes: shipping.notes || "",
      },
    };

    const encodedState = Buffer.from(JSON.stringify(orderState)).toString(
      "base64url"
    );

    // Step 1: start a payment with Safepay to get a tracker token.
    // Your product prices are stored in USD (priceValue), so we charge in
    // USD too rather than guessing a PKR conversion rate.
    // IMPORTANT: Safepay's /order/v1/init `amount` field wants the amount
    // in plain currency units (e.g. 6.99 for $6.99), NOT cents. Sending
    // Math.round(total * 100) here is what caused a $6.99 mug to be
    // charged as $699.00 -- confirmed by an actual sandbox test charge.
    const { token } = await safepay.payments.create({
      amount: Math.round(total * 100) / 100, // e.g. 6.99, not 699
      currency: "USD",
    });

    if (!token) {
      return res.status(502).json({
        error: "Could not start the payment. Please try again.",
      });
    }

    const origin = req.headers.origin || `https://${req.headers.host}`;

    // Step 2: build the hosted checkout URL the customer is redirected to.
    const url = safepay.checkout.create({
      token,
      orderId: token,
      cancelUrl: `${origin}/checkout`,
      redirectUrl: `${origin}/order-success?tracker=${token}&state=${encodedState}`,
      source: "custom",
      webhooks: false,
    });

    return res.status(200).json({ url });
  } catch (error) {
    const safepayDetails = error.response?.data;
    console.error(
      "Safepay create-checkout-session error:",
      error.message,
      safepayDetails ? JSON.stringify(safepayDetails) : "(no response body)"
    );
    return res.status(500).json({
      error: safepayDetails
        ? `${error.message} — ${JSON.stringify(safepayDetails)}`
        : error.message,
    });
  }
}
