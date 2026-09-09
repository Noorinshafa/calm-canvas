import {
  printifyHeaders,
  getBlueprintTitles,
  mapProductFull,
  PRINTIFY_SHOP_ID,
} from "./_lib/printify-shared.js";

// A product page only ever needs ONE product's full details (including
// variants, for size/color selection) -- it used to reuse the same endpoint
// as the whole-catalog listing, meaning opening a single product meant
// downloading and parsing every product's full variant list (measured at
// 5.47MB for 144 products) just to find the one being viewed. This fetches
// that one product directly from Printify instead.
export default async function handler(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: "Missing product id." });
  }

  try {
    const headers = printifyHeaders();

    const response = await fetch(
      `https://api.printify.com/v1/shops/${PRINTIFY_SHOP_ID}/products/${id}.json`,
      { headers }
    );

    if (!response.ok) {
      const error = await response.text();
      return res.status(response.status).json({ error });
    }

    const product = await response.json();
    const blueprintTitles = await getBlueprintTitles(headers);

    res.setHeader(
      "Cache-Control",
      "public, max-age=300, s-maxage=300, stale-while-revalidate=86400"
    );

    return res.status(200).json(mapProductFull(product, blueprintTitles));
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
