import { getAllProductSummaries } from "./_lib/printify-shared.js";

const SITE_URL = "https://shopcalmcanvas.com";

// Static marketing/category routes. Cart and Checkout are deliberately
// excluded -- robots.txt already disallows crawling them, and there's
// nothing there for a search engine to index.
const STATIC_ROUTES = [
  { path: "/", priority: "1.0" },
  { path: "/collections", priority: "0.9" },
  { path: "/hoodies", priority: "0.8" },
  { path: "/tshirts", priority: "0.8" },
  { path: "/sweatshirts", priority: "0.8" },
  { path: "/totebags", priority: "0.8" },
  { path: "/phonecases", priority: "0.8" },
  { path: "/mugs", priority: "0.8" },
  { path: "/about", priority: "0.5" },
  { path: "/contact", priority: "0.5" },
];

function xmlEscape(value) {
  return String(value).replace(/[<>&'"]/g, (char) => {
    switch (char) {
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case "&":
        return "&amp;";
      case "'":
        return "&apos;";
      case '"':
        return "&quot;";
      default:
        return char;
    }
  });
}

function urlEntry(loc, priority) {
  return `  <url>\n    <loc>${xmlEscape(loc)}</loc>\n    <priority>${priority}</priority>\n  </url>`;
}

// public/sitemap.xml previously listed only the 10 static routes above,
// hand-maintained, with zero product URLs -- meaning none of the actual
// product pages (the pages that should rank in Google/Google Shopping) were
// ever listed for crawling. This generates a complete sitemap from the live
// Printify catalog on every request instead, so it's always in sync with
// what's actually for sale. Wired up via robots.txt's Sitemap: line
// (https://shopcalmcanvas.com/api/sitemap) rather than replacing the static
// /sitemap.xml file directly, since Vercel serves an existing static file
// in preference to a rewrite at the same path.
export default async function handler(req, res) {
  try {
    const products = await getAllProductSummaries();

    const staticEntries = STATIC_ROUTES.map((route) =>
      urlEntry(`${SITE_URL}${route.path}`, route.priority)
    );

    const productEntries = products.map((product) =>
      urlEntry(`${SITE_URL}/product/${product.id}`, "0.7")
    );

    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${[
      ...staticEntries,
      ...productEntries,
    ].join("\n")}\n</urlset>\n`;

    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    // Sitemaps don't need to be second-fresh -- an hour of caching is fine,
    // with a day of stale-while-revalidate so a slow Printify response never
    // makes this endpoint itself slow to crawlers.
    res.setHeader(
      "Cache-Control",
      "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400"
    );

    return res.status(200).send(xml);
  } catch (error) {
    // Fail back to just the static routes rather than a hard error -- a
    // temporarily-down Printify shouldn't make the whole sitemap
    // disappear from crawlers.
    console.error("sitemap: failed to fetch products:", error.message);

    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${STATIC_ROUTES.map(
      (route) => urlEntry(`${SITE_URL}${route.path}`, route.priority)
    ).join("\n")}\n</urlset>\n`;

    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=60, s-maxage=60");
    return res.status(200).send(xml);
  }
}
