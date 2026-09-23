import { createPrintifyOrder } from "./_lib/create-printify-order.js";
import { priceAndValidateCart } from "./_lib/printify-shared.js";

// NOTE: not currently called from the frontend (Checkout.jsx only uses
// /api/create-checkout-session, the Safepay card flow). Kept -- and
// hardened the same way -- in case a cash-on-delivery flow is wired up to
// it later; left as dead code it would otherwise silently regress out of
// sync with the rest of the checkout security fixes.
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
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

    // Even without a card payment to protect, this still confirms every
    // item is real and still purchasable before we ask Printify to produce
    // it -- catches a stale/cached cart before it becomes a failed order.
    let pricedCart;
    try {
      ({ pricedCart } = await priceAndValidateCart(cart));
    } catch (validationError) {
      return res
        .status(validationError.status || 400)
        .json({ error: validationError.message });
    }

    const orderCart = pricedCart.map((item) => ({
      id: item.id,
      selectedVariant: { id: item.variantId },
      quantity: item.qty,
    }));

    const order = await createPrintifyOrder({
      cart: orderCart,
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
