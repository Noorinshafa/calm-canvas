import { getAllProductSummaries } from "./_lib/printify-shared.js";
import { SITE_URL, SITE_NAME, DEFAULT_DESCRIPTION, CURRENCY } from "../src/config/site.js";
import {
  productPath,
  cleanProductName,
  findCollectionForProduct,
  buildProductSeo,
} from "../src/utils/seoShared.js";

// A product feed in the Google Merchant Center / Pinterest catalog format
// (RSS 2.0 with the "g:" fields), available at /feed/google-products.xml.
//
// It lists each product once at its lowest price. It deliberately contains
// no shipping, tax, size or colour values, because those depend on the
// variant and the buyer's country: set shipping in the Merchant Center or
// Pinterest settings instead, and use the variant-level data there if an
// apparel category requires it.

function xmlEscape(value) {
  return String(value ?? "").replace(/[<>&'"]/g, (char) => {
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

function plainText(html, max = 4500) {
  return String(html || "")
    .replace(/<\s*br\s*\/?>/gi, " ")
    .replace(/<\/(p|div|li|ul|ol)>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#0?39;|&apos;/gi, "'")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

export default async function handler(req, res) {
  try {
    const products = await getAllProductSummaries();

    const items = products
      .filter((product) => product.indexable !== false && product.slug && product.image)
      .map((product) => {
        const name = cleanProductName(product.title);
        const collection = findCollectionForProduct(product);
        const description =
          plainText(product.description) || buildProductSeo(product).description;

        const extraImages = (product.images || [])
          .slice(1, 10)
          .map(
            (image) =>
              `      <g:additional_image_link>${xmlEscape(image.src)}</g:additional_image_link>`
          );

        return [
          "    <item>",
          `      <g:id>${xmlEscape(product.id)}</g:id>`,
          `      <title>${xmlEscape(name.slice(0, 150))}</title>`,
          `      <description>${xmlEscape(description)}</description>`,
          `      <link>${xmlEscape(`${SITE_URL}${productPath(product)}`)}</link>`,
          `      <g:image_link>${xmlEscape(product.image)}</g:image_link>`,
          ...extraImages,
          "      <g:availability>in_stock</g:availability>",
          `      <g:price>${Number(product.priceValue).toFixed(2)} ${CURRENCY}</g:price>`,
          "      <g:condition>new</g:condition>",
          `      <g:brand>${xmlEscape(SITE_NAME)}</g:brand>`,
          "      <g:identifier_exists>no</g:identifier_exists>",
          ...(collection
            ? [`      <g:product_type>${xmlEscape(collection.nav)}</g:product_type>`]
            : []),
          "    </item>",
        ].join("\n");
      });

    const xml =
      `<?xml version="1.0" encoding="UTF-8"?>\n` +
      `<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">\n` +
      `  <channel>\n` +
      `    <title>${xmlEscape(SITE_NAME)}</title>\n` +
      `    <link>${SITE_URL}/</link>\n` +
      `    <description>${xmlEscape(DEFAULT_DESCRIPTION)}</description>\n` +
      `${items.join("\n")}\n` +
      `  </channel>\n` +
      `</rss>\n`;

    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    res.setHeader(
      "Cache-Control",
      "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400"
    );
    return res.status(200).send(xml);
  } catch (error) {
    console.error("feed: failed:", error.message);
    res.setHeader("Retry-After", "3600");
    res.setHeader("Cache-Control", "public, max-age=60, s-maxage=60");
    return res.status(503).send("Feed temporarily unavailable.");
  }
}
