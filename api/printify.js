import {
  printifyHeaders,
  mapProductSummary,
  PRINTIFY_SHOP_ID,
} from "./_lib/printify-shared.js";

export default async function handler(req, res) {
  try {
    const headers = printifyHeaders();

    // Get page 1 first to find out how many pages there are, then fetch the
    // rest in parallel instead of one-by-one -- on a cold serverless
    // invocation, fetching (say) 3 pages sequentially meant waiting on 3
    // full round-trips to Printify back to back before anything could be
    // sent back to the browser.
    const firstResponse = await fetch(
      `https://api.printify.com/v1/shops/${PRINTIFY_SHOP_ID}/products.json?limit=50&page=1`,
      { headers }
    );

    if (!firstResponse.ok) {
      const error = await firstResponse.text();
      return res.status(firstResponse.status).json({ error });
    }

    const firstResult = await firstResponse.json();
    const lastPage = firstResult.last_page || 1;

    const remainingPages = [];
    for (let page = 2; page <= lastPage; page++) {
      remainingPages.push(
        fetch(
          `https://api.printify.com/v1/shops/${PRINTIFY_SHOP_ID}/products.json?limit=50&page=${page}`,
          { headers }
        ).then((r) => r.json())
      );
    }

    const remainingResults = await Promise.all(remainingPages);

    const allProducts = [
      ...(firstResult.data || []),
      ...remainingResults.flatMap((result) => result.data || []),
    ];

    // Deliberately lightweight -- see mapProductSummary's comment. Product
    // detail pages fetch their own full data from /api/product instead of
    // this endpoint.
    const products = allProducts.map((product) => mapProductSummary(product));

    // `max-age` lets the customer's own browser reuse this for 5 minutes
    // without any network request at all (previously missing, so every
    // single page navigation re-fetched from scratch no matter what).
    // `s-maxage` + `stale-while-revalidate` do the same for Vercel's CDN.
    res.setHeader(
      "Cache-Control",
      "public, max-age=300, s-maxage=300, stale-while-revalidate=86400"
    );

    return res.status(200).json(products);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
