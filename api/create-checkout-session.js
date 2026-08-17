import Stripe from "stripe";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(503).json({
      error:
        "Card payments aren't connected yet. Please choose Cash on Delivery for now.",
    });
  }

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

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

    const line_items = cart.map((item) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.title,
          images: item.image ? [item.image] : undefined,
        },
        unit_amount: Math.round((item.priceValue || 0) * 100),
      },
      quantity: item.quantity || 1,
    }));

    const cartForMetadata = cart.map((item) => ({
      id: item.id,
      variantId: item.selectedVariant?.id,
      qty: item.quantity || 1,
    }));

    const origin = req.headers.origin || `https://${req.headers.host}`;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items,
      customer_email: shipping?.email,
      success_url: `${origin}/order-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout`,
      metadata: {
        cart: JSON.stringify(cartForMetadata),
        firstName: shipping?.firstName || "",
        lastName: shipping?.lastName || "",
        phone: shipping?.phone || "",
        email: shipping?.email || "",
        country: shipping?.country || "Pakistan",
        city: shipping?.city || "",
        postalCode: shipping?.postalCode || "",
        address: shipping?.address || "",
        notes: shipping?.notes || "",
      },
    });

    return res.status(200).json({ url: session.url });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
