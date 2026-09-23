import { getAllProductSummaries } from "./_lib/printify-shared.js";

export default async function handler(req, res) {
  try {
    const products = await getAllProductSummaries();

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
    return res.status(error.status || 500).json({ error: error.message });
  }
}
