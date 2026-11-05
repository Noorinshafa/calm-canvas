import {
  printifyHeaders,
  mapProductFull,
  getBlueprintTitleMap,
  PRINTIFY_SHOP_ID,
} from "./_lib/printify-shared.js";

// A product page only ever needs ONE product's full details (including
// variants, for size/color selection) -- it used to reuse the same endpoint
// as the whole-catalog listing, meaning opening a single product meant
// downloading and parsing every product's full variant list (measured at
// 5.47MB for 144 products) just to find the one being viewed. This fetches
// that one product directly from Printify instead.
// Printify occasionally answers 429 (too many requests) or 5xx for a moment,
// especially when several pages are being opened at once (for example when
// Googlebot crawls many product pages together). Retrying once or twice,
// shortly after, turns most of those into a normal answer instead of an error
// page. A 404 (product really doesn't exist) or any other answer is returned
// straight away.
async function fetchPrintifyProduct(url, headers) {
  let response;

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      response = await fetch(url, { headers });
    } catch (error) {
      if (attempt === 2) throw error;
      response = null;
    }

    if (response && response.status !== 429 && response.status < 500) {
      return response;
    }

    if (attempt < 2) {
      await new Promise((resolve) => setTimeout(resolve, 400 * (attempt + 1)));
    }
  }

  return response;
}

// Printify product ids are always 24 hexadecimal characters. The id is placed
// inside the Printify address below, so anything that is not exactly that
// shape is turned away here instead of being passed on to Printify.
const PRODUCT_ID_PATTERN = /^[a-f0-9]{24}$/i;

export default async function handler(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: "Missing product id." });
  }

  if (typeof id !== "string" || !PRODUCT_ID_PATTERN.test(id)) {
    return res.status(400).json({ error: "Invalid product id." });
  }

  try {
    const headers = printifyHeaders();

    const [response, blueprintTitles] = await Promise.all([
      fetchPrintifyProduct(
        `https://api.printify.com/v1/shops/${PRINTIFY_SHOP_ID}/products/${id}.json`,
        headers
      ),
      getBlueprintTitleMap(),
    ]);

    if (!response.ok) {
      // What Printify said stays in the server log. Visitors only get a short,
      // generic message, never Printify's own error text.
      console.error(`Printify product lookup failed with status ${response.status}`);

      if (response.status === 404) {
        return res.status(404).json({ error: "Product not found." });
      }

      return res
        .status(502)
        .json({ error: "We couldn't load this product right now." });
    }

    const product = await response.json();

    res.setHeader(
      "Cache-Control",
      "public, max-age=300, s-maxage=300, stale-while-revalidate=86400"
    );

    return res
      .status(200)
      .json(
        mapProductFull(
          product,
          blueprintTitles.get(Number(product.blueprint_id)) || ""
        )
      );
  } catch (error) {
    console.error("Product lookup failed:", error);

    return res
      .status(500)
      .json({ error: "We couldn't load this product right now." });
  }
}
