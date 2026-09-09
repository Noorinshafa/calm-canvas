import {
  createSafepayClient,
  extractValue,
  getSafepayEnvironment,
} from "./_lib/safepay-node-core.js";

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

    const total = cart.reduce(
      (sum, item) => sum + (item.priceValue || 0) * (item.quantity || 1),
      0
    );

    if (!(total > 0)) {
      return res.status(400).json({ error: "Your cart total looks invalid." });
    }

    const environment = getSafepayEnvironment();

    // Step 1: start a payment session with Safepay to get a tracker token.
    // Unlike the old SDK (which wanted plain currency units, e.g. 6.99),
    // this endpoint's docs say `amount` is in the LOWEST denomination, i.e.
    // cents -- so $6.99 must be sent as 699, not 6.99. Getting this backwards
    // is exactly the kind of mistake that overcharged a customer once before
    // with the old integration, so double-check this carefully during
    // sandbox testing.
    let sessionResponse;
    try {
      sessionResponse = await safepay.payments.session.setup({
        merchant_api_key: merchantApiKey,
        intent: "CYBERSOURCE",
        mode: "payment",
        currency: "USD",
        amount: Math.round(total * 100),
      });
    } catch (error) {
      console.error(
        "create-checkout-session: session.setup failed:",
        error.message,
        error.status ? `(status ${error.status})` : ""
      );
      throw error;
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
    // the redirect address stays short.
    const cartForOrder = cart.map((item) => ({
      id: item.id,
      variantId: item.selectedVariant?.id,
      qty: item.quantity || 1,
    }));

    const orderState = {
      tracker,
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
    const url = safepay.checkout.createCheckoutUrl({
      env: environment,
      tracker,
      tbt,
      source: "hosted",
      order_id: tracker,
      cancel_url: `${origin}/checkout`,
      redirect_url: `${origin}/order-success?tracker=${tracker}`,
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
