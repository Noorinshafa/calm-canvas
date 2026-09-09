// Printify requires a 2-letter ISO country code in address_to.country.
// This only had Pakistan mapped before -- fine for testing, but this
// store's real customers are in the US/UK, so a plain "United States" or
// "United Kingdom" typed into the checkout form would have been sent to
// Printify as-is, which is not a valid code and Printify would reject (or
// fail unpredictably on). Covering the countries this store actually
// ships to; falling back to the raw value below still handles a customer
// who types a 2-letter code directly (e.g. "US").
const COUNTRY_CODE_MAP = {
  Pakistan: "PK",
  PK: "PK",
  "United States": "US",
  "United States of America": "US",
  USA: "US",
  US: "US",
  "United Kingdom": "GB",
  UK: "GB",
  "Great Britain": "GB",
  GB: "GB",
  England: "GB",
  Scotland: "GB",
  Wales: "GB",
  Canada: "CA",
  CA: "CA",
  Australia: "AU",
  AU: "AU",
};

export async function createPrintifyOrder({ cart, shipping, externalId }) {
  const line_items = cart.map((item) => ({
    product_id: item.id,
    variant_id: item.selectedVariant?.id,
    quantity: item.quantity || 1,
  }));

  const missingVariant = line_items.find((li) => !li.variant_id);

  if (missingVariant) {
    const error = new Error(
      "One of the items in this order is missing a selected size/color option."
    );
    error.status = 400;
    throw error;
  }

  const payload = {
    external_id:
      externalId || `calmcanvas-${Math.random().toString(36).slice(2)}`,
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
    const message =
      (result && (result.message || result.error)) ||
      "Printify could not accept this order.";
    const error = new Error(message);
    error.details = result;
    error.status = response.status;
    throw error;
  }

  return result;
}
