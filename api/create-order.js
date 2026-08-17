import { createPrintifyOrder } from "./_lib/create-printify-order.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { cart, shipping } = req.body || {};

    if (!Array.isArray(cart) || cart.length === 0) {
      return res.status(400).json({ error: "Your cart is empty." });
    }

    if (!shipping) {
      return res.status(400).json({ error: "Missing shipping information." });
    }

    const order = await createPrintifyOrder({
      cart,
      shipping,
      externalId: `calmcanvas-cod-${Date.now()}`,
    });

    return res.status(200).json({ success: true, order });
  } catch (error) {
    return res.status(error.status || 500).json({
      error: error.message,
      details: error.details,
    });
  }
}
