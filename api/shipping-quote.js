import { quoteShipping } from "./_lib/shipping.js";
import {
  deliveryEstimate,
  MAX_CART_LINES,
  MAX_LINE_QUANTITY,
} from "../src/config/shipping.js";

// Tells the website what shipping costs for a cart and a country. It only
// READS prices from Printify; it never creates anything and never needs
// payment details. The price actually charged is worked out again on the
// server in create-checkout-session.js.
//
// POST { country: "Canada", cart: [{ id, variantId, quantity }] }
export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { cart, country } = req.body || {};

  if (!Array.isArray(cart) || cart.length === 0 || cart.length > MAX_CART_LINES) {
    return res.status(400).json({ error: "Your cart is empty." });
  }

  const lines = [];

  for (const item of cart) {
    const id = String(item?.id || "");
    const variantId = Number(item?.variantId);
    const quantity = Math.floor(Number(item?.quantity) || 0);

    if (
      !/^[a-f0-9]{24}$/i.test(id) ||
      !Number.isInteger(variantId) ||
      quantity < 1 ||
      quantity > MAX_LINE_QUANTITY
    ) {
      return res.status(400).json({
        error: "One of the items in your cart isn't valid. Please re-add it.",
      });
    }

    lines.push({ id, variantId, quantity });
  }

  try {
    const { countryCode, options } = await quoteShipping({ lines, country });

    return res.status(200).json({
      country: countryCode,
      options: options.map((option) => ({
        key: option.key,
        label: option.label,
        cents: option.cents,
        price: `$${(option.cents / 100).toFixed(2)}`,
        estimate: deliveryEstimate(option.key, countryCode),
      })),
    });
  } catch (error) {
    return res
      .status(error.status || 500)
      .json({ error: error.message || "Could not work out shipping." });
  }
}
