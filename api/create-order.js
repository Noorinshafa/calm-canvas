const COUNTRY_CODE_MAP = {
  Pakistan: "PK",
  PK: "PK",
};

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

    const line_items = cart.map((item) => ({
      product_id: item.id,
      variant_id: item.selectedVariant?.id,
      quantity: item.quantity || 1,
    }));

    const missingVariant = line_items.find((li) => !li.variant_id);

    if (missingVariant) {
      return res.status(400).json({
        error:
          "One of the items in your cart is missing a selected size/color option. Please go back and reselect it.",
      });
    }

    const payload = {
      external_id: `calmcanvas-${req.headers["x-request-id"] || Math.random().toString(36).slice(2)}`,
      line_items,
      shipping_method: 1,
      send_shipping_notification: false,
      address_to: {
        first_name: shipping.firstName,
        last_name: shipping.lastName,
        email: shipping.email,
        phone: shipping.phone,
        country: COUNTRY_CODE_MAP[shipping.country] || shipping.country,
        region: shipping.city,
        city: shipping.city,
        address1: shipping.address,
        address2: shipping.notes || "",
        zip: shipping.postalCode || "00000",
      },
    };

    const response = await fetch(
      "https://api.printify.com/v1/shops/23619549/orders.json",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.PRINTIFY_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error:
          result?.message ||
          "Printify could not accept this order. Please double-check the shipping details.",
        details: result,
      });
    }

    return res.status(200).json({ success: true, order: result });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
