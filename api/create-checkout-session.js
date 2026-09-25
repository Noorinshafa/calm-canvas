import {
  createSafepayClient,
  extractValue,
  getSafepayEnvironment,
} from "./_lib/safepay-node-core.js";
import { priceAndValidateCart } from "./_lib/printify-shared.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const merchantApiKey = process.env.SAFEPAY_SECRET_KEY;
  const safepay = createSafepayClient();

  if (!safepay || !merchantApiKey) {
    return res.status(503).json({
      error: "Card payments aren't connected yet. Please try again later.",
    });
  }

  // The /order/v1/init `client` field the OLD sdk used wanted the PUBLIC
  // sec_... key. This new flow's `merchant_api_key` field wants the exact
  // same public key -- if this isn't a sec_... key, something is misconfigured.
  if (!merchantApiKey.startsWith("sec_")) {
    console.error(
      "SAFEPAY_SECRET_KEY is not a `sec_...` public key. merchant_api_key needs " +
        "the sec_ key; the 64-char hex secret goes in SAFEPAY_V1_SECRET."
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

    // Server-side validation, deliberately duplicating Checkout.jsx's
    // client-side checks. The client-side form can only ever be a
    // convenience -- anyone can call this endpoint directly with a
    // hand-crafted request, skipping the browser entirely, so the same
    // required fields and email format are enforced here as the
    // authoritative check before an order is ever created.
    const requiredShippingFields = [
      ["firstName", "First name"],
      ["lastName", "Last name"],
      ["phone", "Phone number"],
      ["email", "Email address"],
      ["city", "City"],
      ["address", "Complete address"],
    ];

    for (const [field, label] of requiredShippingFields) {
      if (!shipping[field] || !String(shipping[field]).trim()) {
        return res.status(400).json({ error: `${label} is required.` });
      }
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(shipping.email).trim())) {
      return res.status(400).json({ error: "Enter a valid email address." });
    }

    // SECURITY: the amount charged is never taken from the browser. Every
    // item is re-priced here from Printify's own live data -- a customer
    // editing `priceValue` in devtools (or POSTing a hand-crafted request
    // straight to this endpoint) cannot change what they're charged. This
    // also re-checks that every selected variant still exists and is still
    // purchasable, catching stale carts before any money moves.
    let totalCents, pricedCart;
    try {
      ({ totalCents, pricedCart } = await priceAndValidateCart(cart));
    } catch (validationError) {
      return res
        .status(validationError.status || 400)
        .json({ error: validationError.message });
    }

    const environment = getSafepayEnvironment();

    // Carried in the session's `metadata` field (Safepay's docs confirm
    // this is an accepted field) so the webhook (api/safepay-webhook.js)
    // can create the Printify order on its own if the customer never makes
    // it back to /order-success -- e.g. they close the tab right after
    // paying. Kept intentionally small (ids/qty, not full product data).
    const metadataOrderState = JSON.stringify({
      cart: pricedCart.map((item) => ({
        id: item.id,
        variantId: item.variantId,
        qty: item.qty,
      })),
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
    });

    // Step 1: start a payment session with Safepay to get a tracker token.
    // Unlike the old SDK (which wanted plain currency units, e.g. 6.99),
    // this endpoint's docs say `amount` is in the LOWEST denomination, i.e.
    // cents -- so $6.99 must be sent as 699, not 6.99. Getting this backwards
    // is exactly the kind of mistake that overcharged a customer once before
    // with the old integration, so double-check this carefully during
    // sandbox testing.
    const basePayload = {
      merchant_api_key: merchantApiKey,
      intent: "CYBERSOURCE",
      mode: "payment",
      currency: "USD",
      amount: totalCents,
    };

    let sessionResponse;
    try {
      // Try WITH metadata first (needed for the webhook fallback above).
      // If Safepay rejects this specific call for any reason -- an
      // unexpected field, a size limit, anything -- this isn't verified
      // against a live account from here, so fall back to the known-working
      // payload without metadata rather than breaking checkout entirely.
      sessionResponse = await safepay.payments.session.setup({
        ...basePayload,
        metadata: { orderState: metadataOrderState },
      });
    } catch (metadataError) {
      console.error(
        "create-checkout-session: session.setup with metadata failed, " +
          "retrying without it:",
        metadataError.message
      );

      try {
        sessionResponse = await safepay.payments.session.setup(basePayload);
      } catch (error) {
        console.error(
          "create-checkout-session: session.setup failed:",
          error.message,
          error.status ? `(status ${error.status})` : ""
        );
        throw error;
      }
    }

    const tracker = extractValue(sessionResponse, [
      "data.tracker.token",
      "data.tracker",
      "tracker.token",
      "tracker",
      "data.token",
    ]);

    if (!tracker) {
      console.error(
        "create-checkout-session: no tracker in session response:",
        JSON.stringify(sessionResponse)
      );
      return res.status(502).json({
        error: "Could not start the payment. Please try again.",
      });
    }

    // Step 2: exchange the tracker for a short-lived authentication token
    // (Safepay calls this the "passport"/"tbt" token) needed to open the
    // checkout page.
    let passportResponse;
    try {
      passportResponse = await safepay.client.passport.create({ tracker });
    } catch (error) {
      console.error(
        "create-checkout-session: passport.create failed:",
        error.message,
        error.status ? `(status ${error.status})` : ""
      );
      throw error;
    }

    // Confirmed by a real sandbox test: this response's `data` field IS the
    // token itself (a plain string), not an object containing a `.token`
    // field -- unlike the payment session response above.
    const tbt = extractValue(passportResponse, [
      "data",
      "data.token",
      "data.tbt",
      "token",
      "tbt",
      "data.passport",
    ]);

    if (!tbt) {
      console.error(
        "create-checkout-session: no auth token in passport response:",
        JSON.stringify(passportResponse)
      );
      return res.status(502).json({
        error: "Could not start the payment. Please try again.",
      });
    }

    // What we need to actually create the Printify order once payment is
    // confirmed. Carried in an HTTP-only cookie (not the web address), so a
    // shopper can't tamper with the price or items by editing the URL, and
    // the redirect address stays short. `pricedCart` is the server-verified
    // cart from priceAndValidateCart above -- not the raw client cart -- so
    // the order that gets created always matches what was actually charged.
    const orderState = {
      tracker,
      cart: pricedCart,
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

    const origin = req.headers.origin || `https://${req.headers.host}`;

    const cookiePayload = Buffer.from(JSON.stringify(orderState)).toString(
      "base64url"
    );

    res.setHeader(
      "Set-Cookie",
      `cc_order=${cookiePayload}; Max-Age=3600; Path=/; HttpOnly; Secure; SameSite=Lax`
    );

    // Step 3: build the hosted checkout page link. This is a plain, full-page
    // redirect to Safepay's own site (not an iframe embedded in ours) --
    // that's the important difference from the old, broken flow, since it's
    // the embedded iframe approach that ran into the browser blocking a
    // deprecated event during the 3D-Secure step.
    // IMPORTANT: redirect_url must NOT already contain a "?query" -- a real
    // sandbox test showed Safepay appends its own "?order_id=..." onto
    // whatever we give it, and if ours already has a "?", that produces a
    // broken address with two "?" in it, scrambling the ID on the other end.
    // Safepay echoes back whatever we set as `order_id` here, so
    // OrderSuccess.jsx reads that instead.
    const url = safepay.checkout.createCheckoutUrl({
      env: environment,
      tracker,
      tbt,
      source: "hosted",
      order_id: tracker,
      cancel_url: `${origin}/checkout`,
      redirect_url: `${origin}/order-success`,
    });

    return res.status(200).json({ url });
  } catch (error) {
    const safepayDetails = error.response?.data || error.details;
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
