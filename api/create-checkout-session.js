import { Safepay } from "@sfpy/node-sdk";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!process.env.SAFEPAY_SECRET_KEY) {
    return res.status(503).json({
      error: "Card payments aren't connected yet. Please try again later.",
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
      apiKey: process.env.SAFEPAY_SECRET_KEY,
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
    const { token } = await safepay.payments.create({
      amount: Math.round(total * 100), // smallest currency unit (cents)
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
      webhooks: true,
    });

    return res.status(200).json({ url });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
