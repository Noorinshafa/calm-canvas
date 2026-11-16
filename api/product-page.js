import { readFile } from "node:fs/promises";
import path from "node:path";
import { getAllProductSummaries } from "./_lib/printify-shared.js";
import { SITE_URL, SITE_NAME, DEFAULT_OG_IMAGE } from "../src/config/site.js";
import {
  absoluteUrl,
  breadcrumbJsonLd,
  buildProductSeo,
  buildTitle,
  crossCollectionPicks,
  escapeHtml as esc,
  formatPrice,
  productJsonLd,
  productPath,
  relatedProducts,
} from "../src/utils/seoShared.js";
import { crawlableImageUrl, optimizedImageUrl, optimizedSrcSet } from "../src/utils/imageUrl.js";
import { buildProductFaq } from "../src/content/productFaq.js";

// ---------------------------------------------------------------------------
// Product page for a product that has no pre-built page yet.
//
// Every product page is normally written at deploy time by
// scripts/postbuild.mjs, and Vercel serves that file directly (files are
// checked before vercel.json rewrites). A product published in Printify AFTER
// the last deploy has no file, so the address used to return the plain 404
// page: Google refused to index it ("Not found") and links from Pinterest,
// Instagram or Google led shoppers to "We couldn't find that page".
//
// vercel.json now sends only those addresses here. This looks the address up
// in the live product list (the same list the sitemap uses, so the sitemap
// never points to a page that 404s):
//   - product found  -> 200 with a real page: its own title, description,
//                       canonical address, social tags, product structured
//                       data and main text, inside the normal app shell, so
//                       the app starts exactly as on a pre-built page;
//   - not found      -> the normal 404 page with status 404;
//   - Printify down  -> 503 "try again later" (never a false 404).
// The next deploy pre-builds the page and this function is no longer used for
// that address. Read-only: it never changes products, orders or payments.
// ---------------------------------------------------------------------------

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const HEAD_PATTERN = /<!--\s*seo:start[\s\S]*?<!--\s*seo:end\s*-->/;
const ROOT_PATTERN = /<div id="root"><\/div>/;

// The product list and the page templates are kept for a few minutes per
// server instance, so a burst of visits (or of crawler requests for made-up
// addresses) does not turn into a burst of Printify requests.
const LIST_TTL_MS = 5 * 60 * 1000;
let listCache = { at: 0, products: null };
const templateCache = new Map();

async function productList() {
  if (listCache.products && Date.now() - listCache.at < LIST_TTL_MS) {
    return listCache.products;
  }
  const products = await getAllProductSummaries();
  listCache = { at: Date.now(), products };
  return products;
}

// The app shell (dist/app.html) and the 404 page (dist/404.html) of this same
// deployment: read from the files bundled with the function (vercel.json
// "functions" -> includeFiles), or, if that is not possible, fetched from the
// site itself (/app and /404).
async function staticPage(origin, name) {
  if (templateCache.has(name)) return templateCache.get(name);

  let html = "";
  try {
    html = await readFile(path.join(process.cwd(), "dist", `${name}.html`), "utf8");
  } catch {
    const response = await fetch(`${origin}/${name}`, { redirect: "follow" });
    if (!response.ok) throw new Error(`/${name} returned ${response.status}`);
    html = await response.text();
  }

  templateCache.set(name, html);
  return html;
}

const jsonForHtml = (data) => JSON.stringify(data).replace(/</g, "\\u003c");
const link = (href, text) => `<a href="${esc(href)}">${esc(text)}</a>`;

function plainParagraphs(html, maxChars = 3000) {
  return String(html || "")
    .replace(/<\s*br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|li|h[1-6]|ul|ol)>/gi, "\n")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#0?39;|&apos;/gi, "'")
    .slice(0, maxChars)
    .split(/\n+/)
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean);
}

function productListHtml(list) {
  if (!list.length) return "";
  return (
    `<ul class="prerender-products">` +
    list
      .map(
        (item) =>
          `<li>${link(productPath(item), buildProductSeo(item).name)} <span>${esc(
            formatPrice(item.priceValue)
          )}</span></li>`
      )
      .join("") +
    `</ul>`
  );
}

function headHtml({ name, description, canonical, image, noindex, jsonLd, productId }) {
  const title = buildTitle(name);
  const img = absoluteUrl(crawlableImageUrl(image || DEFAULT_OG_IMAGE, SITE_URL));
  return [
    `<title>${esc(title)}</title>`,
    `<meta name="description" content="${esc(description)}" />`,
    `<meta name="robots" content="${noindex ? "noindex, follow" : "index, follow"}" />`,
    `<link rel="canonical" href="${esc(canonical)}" />`,
    `<meta property="og:type" content="product" />`,
    `<meta property="og:site_name" content="${esc(SITE_NAME)}" />`,
    `<meta property="og:title" content="${esc(title)}" />`,
    `<meta property="og:description" content="${esc(description)}" />`,
    `<meta property="og:image" content="${esc(img)}" />`,
    `<meta property="og:url" content="${esc(canonical)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${esc(title)}" />`,
    `<meta name="twitter:description" content="${esc(description)}" />`,
    `<meta name="twitter:image" content="${esc(img)}" />`,
    `<script type="application/ld+json" id="seo-jsonld">${jsonForHtml(jsonLd)}</script>`,
    // Start fetching the product's details straight away (the pre-built
    // pages do the same, see scripts/postbuild.mjs).
    `<link rel="preload" as="fetch" href="/api/product?id=${esc(
      encodeURIComponent(productId)
    )}" crossorigin />`,
  ].join("\n    ");
}

export default async function handler(req, res) {
  const slug = String(req.query?.slug || "").toLowerCase();
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  const origin = `https://${host}`;

  const sendNotFound = async () => {
    let html = "<!doctype html><title>Page Not Found</title><h1>Page not found</h1>";
    try {
      html = await staticPage(origin, "404");
    } catch {
      // Fall back to the minimal page above.
    }
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("X-Robots-Tag", "noindex, follow");
    res.setHeader("Cache-Control", "public, max-age=0, s-maxage=300");
    return res.status(404).send(html);
  };

  if (!SLUG_PATTERN.test(slug) || slug.length > 120) return sendNotFound();

  let products;
  try {
    products = await productList();
  } catch (error) {
    console.error("product-page: product list failed:", error.message);
    // Temporary: tell crawlers to come back, never claim the page is gone.
    res.setHeader("Retry-After", "120");
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    return res.status(503).send("This page is temporarily unavailable. Please try again in a minute.");
  }

  const product = products.find((item) => item.slug === slug);
  if (!product) return sendNotFound();

  let template;
  try {
    template = await staticPage(origin, "app");
  } catch (error) {
    console.error("product-page: app shell failed:", error.message);
    res.setHeader("Retry-After", "60");
    res.setHeader("Cache-Control", "no-store");
    return res.status(503).send("This page is temporarily unavailable. Please try again in a minute.");
  }

  if (!HEAD_PATTERN.test(template) || !ROOT_PATTERN.test(template)) {
    console.error("product-page: app shell has no seo markers / empty root");
    res.setHeader("Retry-After", "60");
    res.setHeader("Cache-Control", "no-store");
    return res.status(503).send("This page is temporarily unavailable. Please try again in a minute.");
  }

  const indexable = products.filter((item) => item.indexable !== false);
  const seo = buildProductSeo(product);
  const name = seo.name;
  const canonicalPath = productPath(product);
  const canonical = absoluteUrl(canonicalPath);
  const paragraphs = plainParagraphs(product.description);
  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Collections", path: "/collections" },
    ...(seo.collection ? [{ name: seo.collection.nav, path: seo.collection.path }] : []),
    { name, path: canonicalPath },
  ];
  const related = relatedProducts(product, indexable, 4);
  const others = crossCollectionPicks(product, indexable, related);
  const firstPhoto = product.images?.[0]?.src || product.image;
  const faq = buildProductFaq(product, seo.collection?.key);

  const body =
    `<nav aria-label="Breadcrumb"><ol>${crumbs
      .map((crumb, index) =>
        index === crumbs.length - 1
          ? `<li aria-current="page">${esc(crumb.name)}</li>`
          : `<li>${link(crumb.path, crumb.name)}</li>`
      )
      .join("")}</ol></nav>` +
    `<h1>${esc(name)}</h1>` +
    `<p>${esc(formatPrice(product.priceValue))}</p>` +
    (firstPhoto
      ? `<img src="${esc(optimizedImageUrl(firstPhoto, 768))}" srcset="${esc(
          optimizedSrcSet(firstPhoto, [768, 1024]) || ""
        )}" sizes="(max-width: 900px) 100vw, 50vw" alt="${esc(name)}" width="760" height="760" fetchpriority="high">`
      : "") +
    paragraphs.map((text) => `<p>${esc(text)}</p>`).join("") +
    (faq.length
      ? `<section><h2>Frequently asked questions</h2>${faq
          .map((entry) => `<h3>${esc(entry.q)}</h3><p>${esc(entry.a)}</p>`)
          .join("")}</section>`
      : "") +
    (related.length ? `<section><h2>You may also like</h2>${productListHtml(related)}</section>` : "") +
    (others.length
      ? `<section><h2>Explore other collections</h2>${productListHtml(others)}</section>`
      : "");

  const rootAttrs = {
    "data-product-id": product.id,
    "data-product-slug": product.slug,
    ...(product.image
      ? {
          "data-product-seed": JSON.stringify({
            name,
            image: product.image,
            crumbs: crumbs.map((crumb) => ({ name: crumb.name, path: crumb.path })),
          }),
        }
      : {}),
  };
  const attrs = Object.entries(rootAttrs)
    .map(([key, value]) => ` ${key}="${esc(value)}"`)
    .join("");

  const html = template
    .replace(HEAD_PATTERN, () =>
      `<!-- seo:start -->\n    ${headHtml({
        name,
        description: seo.description,
        canonical,
        image: product.image,
        noindex: product.indexable === false,
        productId: product.id,
        jsonLd: [
          breadcrumbJsonLd(crumbs),
          productJsonLd(product, {
            plainDescription: paragraphs.join(" ").slice(0, 500) || undefined,
          }),
        ],
      })}\n    <!-- seo:end -->`
    )
    .replace(
      ROOT_PATTERN,
      () => `<div id="root"${attrs}><main class="prerendered" id="main-content">${body}</main></div>`
    );

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  // Cached at the edge for 5 minutes (and served stale while it refreshes),
  // so this runs rarely even if the page is visited a lot.
  res.setHeader("Cache-Control", "public, max-age=0, s-maxage=300, stale-while-revalidate=86400");
  res.setHeader("X-Page-Source", "live-fallback");
  return res.status(200).send(html);
}
