import { getAllProductSummaries } from "./_lib/printify-shared.js";
import { SITE_URL, COLLECTIONS } from "../src/config/site.js";
import { POSTS } from "../src/content/posts.js";
import { productPath, productInCollection } from "../src/utils/seoShared.js";

// Sitemaps for Google and Bing, split into four files that a small index
// (/sitemap.xml) points to:
//
//   /sitemap-pages.xml        the main pages
//   /sitemap-collections.xml  the six category pages
//   /sitemap-products.xml     every product (with its photos), read live from
//                             Printify so new products appear automatically
//   /sitemap-blog.xml         the journal posts
//
// vercel.json maps each of those addresses to this one function using the
// ?type= value. Every address uses the www version of the site, which is the
// version Google should index.
//
// "lastmod" dates are only given where we really know them (product edit
// time from Printify, blog post dates). Search engines ignore sitemaps that
// claim everything changed today, so we never invent dates.

const NS = 'xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"';

const STATIC_PAGES = [
  "/",
  "/collections",
  "/about",
  "/contact",
  "/shipping-returns",
  "/terms",
  "/privacy-policy",
  "/blog",
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
      default:
        return "&quot;";
    }
  });
}

function dateOnly(value) {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
}

function urlEntry(path, { lastmod, images = [] } = {}) {
  const parts = [`    <loc>${xmlEscape(`${SITE_URL}${path}`)}</loc>`];

  const modified = dateOnly(lastmod);
  if (modified) parts.push(`    <lastmod>${modified}</lastmod>`);

  for (const image of images) {
    parts.push(
      `    <image:image>\n      <image:loc>${xmlEscape(image)}</image:loc>\n    </image:image>`
    );
  }

  return `  <url>\n${parts.join("\n")}\n  </url>`;
}

function urlset(entries, { withImages = false } = {}) {
  const namespaces = withImages
    ? `${NS} xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"`
    : NS;

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset ${namespaces}>\n${entries.join(
    "\n"
  )}\n</urlset>\n`;
}

function sitemapIndex() {
  const entries = ["pages", "collections", "products", "blog"].map(
    (name) =>
      `  <sitemap>\n    <loc>${SITE_URL}/sitemap-${name}.xml</loc>\n  </sitemap>`
  );

  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex ${NS}>\n${entries.join(
    "\n"
  )}\n</sitemapindex>\n`;
}

function latest(dates) {
  const valid = dates.map(dateOnly).filter(Boolean).sort();
  return valid.length ? valid[valid.length - 1] : "";
}

export default async function handler(req, res) {
  const type = String(req.query?.type || "index");

  const send = (xml, cache) => {
    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    res.setHeader("Cache-Control", cache);
    return res.status(200).send(xml);
  };

  // An hour is plenty for a sitemap; a day of stale-while-revalidate means a
  // slow Printify response never makes this endpoint slow for crawlers.
  const CACHE = "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400";

  try {
    if (type === "pages") {
      return send(urlset(STATIC_PAGES.map((path) => urlEntry(path))), CACHE);
    }

    if (type === "blog") {
      return send(
        urlset(
          POSTS.map((post) =>
            urlEntry(`/blog/${post.slug}`, { lastmod: post.updated || post.date })
          )
        ),
        CACHE
      );
    }

    if (type === "collections" || type === "products") {
      const products = await getAllProductSummaries();
      const indexable = products.filter((product) => product.indexable !== false);

      if (type === "collections") {
        return send(
          urlset(
            COLLECTIONS.map((collection) =>
              urlEntry(collection.path, {
                lastmod: latest(
                  indexable
                    .filter((product) => productInCollection(product, collection))
                    .map((product) => product.updatedAt)
                ),
              })
            )
          ),
          CACHE
        );
      }

      return send(
        urlset(
          indexable.map((product) =>
            urlEntry(productPath(product), {
              lastmod: product.updatedAt,
              images: (product.images || [])
                .map((image) => image.src)
                .filter(Boolean)
                .slice(0, 5),
            })
          ),
          { withImages: true }
        ),
        CACHE
      );
    }

    // Default (and the old /api/sitemap address): the index.
    return send(sitemapIndex(), CACHE);
  } catch (error) {
    console.error("sitemap: failed:", error.message);

    // Tell crawlers to come back later rather than giving them an empty file.
    res.setHeader("Retry-After", "3600");
    res.setHeader("Cache-Control", "public, max-age=60, s-maxage=60");
    return res.status(503).send("Sitemap temporarily unavailable.");
  }
}
