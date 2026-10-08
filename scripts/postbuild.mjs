// Runs automatically after `vite build` (see the "build" script in
// package.json). Plain Node, no packages.
//
// WHAT IT DOES
//   The site is a React single-page app, so the file Vite builds
//   (dist/index.html) is an empty shell: until JavaScript runs, there is no
//   page title, no text, no links. Search engines, link-preview bots and AI
//   crawlers that do not run JavaScript see nothing. This script fixes that
//   by writing a real HTML file for every public page, containing that page's
//   title, description, canonical address, social-sharing tags, structured
//   data and its main text. When the page loads in a browser, React starts as
//   usual and replaces that content, so visitors still get the normal
//   interactive site.
//
//   Step 1 (must succeed): keep an untouched copy of the app shell as
//           dist/app.html. vercel.json sends any address that has no ready-
//           made file (for example a product added after the last deploy) to
//           this file, so the site keeps working for every address.
//   Step 2 (best effort):  write the per-page HTML files. If anything goes
//           wrong here the build still succeeds and the site simply behaves
//           like before (client-rendered), and a warning is printed.
//   Step 3 (best effort):  refresh sitemap.xml and tell IndexNow-supporting
//           search engines about the pages (production deploys only).
//
// Product pages need the product list from Printify, which needs the
// PRINTIFY_API_TOKEN environment variable at build time (Vercel provides it
// during builds). Without it, only the non-product pages are generated.

import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DIST = path.join(ROOT, "dist");

const log = (message) => console.log(`[postbuild] ${message}`);

// --------------------------------------------------------------------------
// Step 1: the app shell
// --------------------------------------------------------------------------
let template;

try {
  template = await readFile(path.join(DIST, "index.html"), "utf8");
  await writeFile(path.join(DIST, "app.html"), template);
  log("saved the app shell as dist/app.html");
} catch (error) {
  // Fail the build: deploying without this file would leave unknown-address
  // routes broken, and a failed build keeps the previous deploy live.
  console.error("[postbuild] could not create dist/app.html:", error);
  process.exit(1);
}

// --------------------------------------------------------------------------
// Steps 2 and 3
// --------------------------------------------------------------------------
try {
  await prerender();
} catch (error) {
  console.warn(
    "[postbuild] WARNING: page pre-generation failed; the site will fall back to client-side rendering.",
    error
  );
}

async function load(relativePath) {
  return import(pathToFileURL(path.join(ROOT, relativePath)).href);
}

async function prerender() {
  const config = await load("src/config/site.js");
  const seo = await load("src/utils/seoShared.js");
  const blocks = await load("src/utils/blocks.js");
  const { POSTS } = await load("src/content/posts.js");
  const { PRODUCT_COPY } = await load("src/content/productCopy.js");

  const {
    SITE_URL,
    SITE_NAME,
    CONTACT_EMAIL,
    DEFAULT_TITLE,
    DEFAULT_DESCRIPTION,
    DEFAULT_OG_IMAGE,
    COLLECTIONS,
    PAGES,
    ABOUT_SECTIONS,
    SHIPPING_SECTIONS,
    SHIPPING_FAQ,
    INDEXNOW_KEY,
  } = config;

  const {
    buildTitle,
    buildDescription,
    absoluteUrl,
    escapeHtml: esc,
    formatPrice,
    cleanProductName,
    productPath,
    productInCollection,
    findCollectionForProduct,
    buildProductSeo,
    breadcrumbJsonLd,
    faqJsonLd,
    collectionJsonLd,
    productJsonLd,
    articleJsonLd,
  } = seo;

  const { parseInline, formatPostDate } = blocks;

  // ------------------------------------------------------------------
  // The product list (needs the Printify token)
  // ------------------------------------------------------------------
  let products = [];

  if (process.env.PRINTIFY_API_TOKEN) {
    try {
      const { getAllProductSummaries } = await load("api/_lib/printify-shared.js");
      products = await getAllProductSummaries();
      log(`loaded ${products.length} products from Printify`);
    } catch (error) {
      console.warn(
        "[postbuild] could not load products; product and collection listings will be left to the app:",
        error.message
      );
    }
  } else {
    log("PRINTIFY_API_TOKEN is not set: skipping product pages");
  }

  const haveProducts = products.length > 0;
  const indexableProducts = products.filter((product) => product.indexable !== false);

  // ------------------------------------------------------------------
  // Small HTML helpers
  // ------------------------------------------------------------------
  const jsonForHtml = (data) => JSON.stringify(data).replace(/</g, "\\u003c");

  const link = (href, text) => `<a href="${esc(href)}">${esc(text)}</a>`;

  function inline(text) {
    return parseInline(text)
      .map((part) => (part.href ? link(part.href, part.text) : esc(part.text)))
      .join("");
  }

  function crumbsHtml(items) {
    return (
      `<nav class="breadcrumbs" aria-label="Breadcrumb"><ol>` +
      items
        .map((item, index) =>
          index === items.length - 1
            ? `<li><span aria-current="page">${esc(item.name)}</span></li>`
            : `<li>${link(item.path, item.name)}</li>`
        )
        .join("") +
      `</ol></nav>`
    );
  }

  function productListHtml(list) {
    if (!list.length) return "";

    return (
      `<ul class="prerender-products">` +
      list
        .map((product) => {
          const name = cleanProductName(product.title);
          const image = product.image
            ? `<img src="${esc(product.image)}" alt="${esc(name)}" width="300" height="300" loading="lazy" decoding="async">`
            : "";

          return `<li>${image}${link(productPath(product), name)} <span>${esc(
            formatPrice(product.priceValue)
          )}</span></li>`;
        })
        .join("") +
      `</ul>`
    );
  }

  function plainParagraphs(html, maxChars = 3000) {
    const text = String(html || "")
      .replace(/<\s*br\s*\/?>/gi, "\n")
      .replace(/<\/(p|div|li|h[1-6]|ul|ol)>/gi, "\n")
      .replace(/<li[^>]*>/gi, "• ")
      .replace(/<[^>]*>/g, " ")
      .replace(/&nbsp;/gi, " ")
      .replace(/&amp;/gi, "&")
      .replace(/&lt;/gi, "<")
      .replace(/&gt;/gi, ">")
      .replace(/&quot;/gi, '"')
      .replace(/&#0?39;|&apos;/gi, "'")
      .slice(0, maxChars);

    return text
      .split(/\n+/)
      .map((line) => line.replace(/[ \t]+/g, " ").trim())
      .filter(Boolean);
  }

  // ------------------------------------------------------------------
  // The <head> block, replacing everything between the seo:start and
  // seo:end comments in index.html
  // ------------------------------------------------------------------
  const HEAD_PATTERN = /<!--\s*seo:start[\s\S]*?<!--\s*seo:end\s*-->/;

  if (!HEAD_PATTERN.test(template)) {
    throw new Error("index.html has no seo:start / seo:end markers");
  }

  function headBlock({
    title,
    description,
    path: pagePath,
    canonicalPath,
    image,
    type = "website",
    noindex = false,
    jsonLd,
  }) {
    const fullTitle = title ? buildTitle(title) : DEFAULT_TITLE;
    const desc = description ? buildDescription(description) : DEFAULT_DESCRIPTION;
    const url = absoluteUrl(canonicalPath || pagePath);
    const img = absoluteUrl(image || DEFAULT_OG_IMAGE);
    const isDefaultImage = img === absoluteUrl(DEFAULT_OG_IMAGE) || img.startsWith(`${SITE_URL}/og/`);

    return [
      `<title>${esc(fullTitle)}</title>`,
      `<meta name="description" content="${esc(desc)}" />`,
      `<meta name="robots" content="${noindex ? "noindex, follow" : "index, follow"}" />`,
      `<link rel="canonical" href="${esc(url)}" />`,
      `<meta property="og:type" content="${esc(type)}" />`,
      `<meta property="og:site_name" content="${esc(SITE_NAME)}" />`,
      `<meta property="og:title" content="${esc(fullTitle)}" />`,
      `<meta property="og:description" content="${esc(desc)}" />`,
      `<meta property="og:image" content="${esc(img)}" />`,
      ...(isDefaultImage
        ? [
            `<meta property="og:image:width" content="1200" />`,
            `<meta property="og:image:height" content="630" />`,
          ]
        : []),
      `<meta property="og:url" content="${esc(url)}" />`,
      `<meta name="twitter:card" content="summary_large_image" />`,
      `<meta name="twitter:title" content="${esc(fullTitle)}" />`,
      `<meta name="twitter:description" content="${esc(desc)}" />`,
      `<meta name="twitter:image" content="${esc(img)}" />`,
      // id="seo-jsonld" is the script the app's useSEO hook updates when a
      // visitor navigates, so it must be the only one with this id.
      `<script type="application/ld+json" id="seo-jsonld">${
        jsonLd ? jsonForHtml(jsonLd) : ""
      }</script>`,
    ].join("\n    ");
  }

  // ------------------------------------------------------------------
  // The pages
  // ------------------------------------------------------------------
  const pages = []; // { path, head, body, rootData?, indexable }

  const collectionsCrumb = { name: "Collections", path: "/collections" };

  // ---- Home ----
  pages.push({
    path: "/",
    head: {
      title: PAGES.home.title,
      description: PAGES.home.description,
      path: "/",
      image: PAGES.home.ogImage,
    },
    body: () =>
      `<h1>Wear Stories. Live Beautifully.</h1>` +
      `<p>${esc(DEFAULT_DESCRIPTION)}</p>` +
      `<nav aria-label="Shop by collection"><h2>Shop by collection</h2><ul>` +
      COLLECTIONS.map(
        (c) => `<li>${link(c.path, c.nav)}: ${esc(c.description)}</li>`
      ).join("") +
      `</ul></nav>` +
      (indexableProducts.length
        ? `<section><h2>Popular designs</h2>${productListHtml(
            indexableProducts.slice(0, 12)
          )}</section>`
        : "") +
      `<p>${link("/about", "About Calm Canvas")} · ${link(
        "/blog",
        "Gift & style ideas"
      )} · ${link("/shipping-returns", "Shipping & returns")}</p>`,
  });

  // ---- Collections index ----
  {
    const crumbs = [{ name: "Home", path: "/" }, collectionsCrumb];

    pages.push({
      path: "/collections",
      head: {
        title: PAGES.collections.title,
        description: PAGES.collections.description,
        path: "/collections",
        image: PAGES.collections.ogImage,
        jsonLd: breadcrumbJsonLd(crumbs),
      },
      body: () =>
        crumbsHtml(crumbs) +
        `<h1>Explore Our Collections</h1>` +
        `<p>Discover beautifully designed products made to bring creativity into your everyday life.</p>` +
        `<ul>` +
        COLLECTIONS.map(
          (c) => `<li>${link(c.path, c.nav)}: ${esc(c.description)}</li>`
        ).join("") +
        `</ul>`,
    });
  }

  // ---- Each collection ----
  for (const collection of COLLECTIONS) {
    const crumbs = [
      { name: "Home", path: "/" },
      collectionsCrumb,
      { name: collection.nav, path: collection.path },
    ];

    const items = products.filter((product) =>
      productInCollection(product, collection)
    );

    // Only pre-generate a collection page when the catalog loaded;
    // otherwise leave the page to the app rather than publish an empty list.
    if (haveProducts && items.length === 0) continue;

    pages.push({
      path: collection.path,
      head: {
        title: collection.title,
        description: collection.description,
        path: collection.path,
        image: collection.ogImage,
        jsonLd: [
          breadcrumbJsonLd(crumbs),
          collectionJsonLd(
            collection,
            items.filter((product) => product.indexable !== false)
          ),
        ],
      },
      body: () =>
        crumbsHtml(crumbs) +
        `<h1>${esc(collection.h1)}</h1>` +
        `<p>${esc(collection.tagline)}</p>` +
        productListHtml(items) +
        `<div class="collection-intro"><h2>About our ${esc(
          collection.nav.toLowerCase()
        )}</h2>${collection.intro.map((p) => `<p>${esc(p)}</p>`).join("")}</div>` +
        `<nav class="collection-links" aria-label="More collections"><h2>Keep browsing</h2><ul>` +
        COLLECTIONS.filter((c) => c.key !== collection.key)
          .map((c) => `<li>${link(c.path, c.nav)}</li>`)
          .join("") +
        `<li>${link("/blog", "Gift & style ideas")}</li></ul></nav>`,
    });
  }

  // ---- About ----
  {
    const crumbs = [
      { name: "Home", path: "/" },
      { name: "About", path: "/about" },
    ];

    pages.push({
      path: "/about",
      head: {
        title: PAGES.about.title,
        description: PAGES.about.description,
        path: "/about",
        image: PAGES.about.ogImage,
        jsonLd: breadcrumbJsonLd(crumbs),
      },
      body: () =>
        `<h1>More Than Accessories. Little Moments of Joy.</h1>` +
        `<p>Calm Canvas is a place where elegance, creativity, and thoughtful design come together to make everyday moments feel special.</p>` +
        ABOUT_SECTIONS.map(
          (s) =>
            `<h2>${esc(s.heading)}</h2>` +
            s.paragraphs.map((p) => `<p>${esc(p)}</p>`).join("")
        ).join("") +
        `<p>${link("/collections", "Browse all collections")} · ${link(
          "/shipping-returns",
          "Shipping & returns"
        )} · ${link("/contact", "Contact us")}</p>`,
    });
  }

  // ---- Contact ----
  pages.push({
    path: "/contact",
    head: {
      title: PAGES.contact.title,
      description: PAGES.contact.description,
      path: "/contact",
      image: PAGES.contact.ogImage,
    },
    body: () =>
      `<h1>We'd Love To Hear From You</h1>` +
      `<p>Whether you have a question, a collaboration idea, or simply want to say hello, feel free to reach out anytime.</p>` +
      `<h2>Complaints &amp; Support</h2>` +
      `<p>Have an issue with an order or our service? Email us at <a href="mailto:${esc(
        CONTACT_EMAIL
      )}">${esc(CONTACT_EMAIL)}</a> with your order number and a short description of the problem. We aim to respond within 2 business days and to resolve most complaints within 7 days.</p>`,
  });

  // ---- Shipping & returns ----
  {
    const crumbs = [
      { name: "Home", path: "/" },
      { name: "Shipping & Returns", path: "/shipping-returns" },
    ];

    pages.push({
      path: "/shipping-returns",
      head: {
        title: PAGES.shipping.title,
        description: PAGES.shipping.description,
        path: "/shipping-returns",
        image: PAGES.shipping.ogImage,
        jsonLd: [breadcrumbJsonLd(crumbs), faqJsonLd(SHIPPING_FAQ)],
      },
      body: () =>
        `<h1>Shipping, Returns &amp; Refunds</h1>` +
        `<p>Everything you need to know about order processing, shipping, cancellations, and returns.</p>` +
        SHIPPING_SECTIONS.map(
          (s) =>
            `<h2>${esc(s.heading)}</h2>` +
            s.paragraphs.map((p) => `<p>${esc(p)}</p>`).join("")
        ).join("") +
        `<h2>Frequently Asked Questions</h2>` +
        SHIPPING_FAQ.map(
          (f) => `<h3>${esc(f.q)}</h3><p>${esc(f.a)}</p>`
        ).join(""),
    });
  }

  // ---- Terms and privacy (full text is shown by the app) ----
  pages.push({
    path: "/terms",
    head: {
      title: PAGES.terms.title,
      description: PAGES.terms.description,
      path: "/terms",
      image: PAGES.terms.ogImage,
    },
    body: () =>
      `<h1>Terms &amp; Conditions</h1><p>${esc(PAGES.terms.description)}</p>`,
  });

  pages.push({
    path: "/privacy-policy",
    head: {
      title: PAGES.privacy.title,
      description: PAGES.privacy.description,
      path: "/privacy-policy",
      image: PAGES.privacy.ogImage,
    },
    body: () =>
      `<h1>Privacy Policy</h1><p>${esc(PAGES.privacy.description)}</p>`,
  });

  // ---- Pages that must never be indexed (shell only) ----
  for (const [pagePath, name] of [
    ["/cart", "Cart"],
    ["/checkout", "Checkout"],
    ["/order-success", "Order Confirmed"],
  ]) {
    pages.push({
      path: pagePath,
      noindexPage: true,
      head: { title: name, path: pagePath, noindex: true },
      body: () => "",
    });
  }

  // ---- Blog ----
  const sortedPosts = [...POSTS].sort((a, b) => (a.date < b.date ? 1 : -1));

  {
    const crumbs = [
      { name: "Home", path: "/" },
      { name: "Journal", path: "/blog" },
    ];

    pages.push({
      path: "/blog",
      head: {
        title: PAGES.blog.title,
        description: PAGES.blog.description,
        path: "/blog",
        image: PAGES.blog.ogImage,
        jsonLd: breadcrumbJsonLd(crumbs),
      },
      body: () =>
        crumbsHtml(crumbs) +
        `<h1>Gift &amp; Style Ideas</h1>` +
        `<p>Gift guides, styling ideas and cozy-aesthetic inspiration to help you choose the right piece for someone you love, or for yourself.</p>` +
        `<ul>` +
        sortedPosts
          .map(
            (post) =>
              `<li><time datetime="${esc(post.date)}">${esc(
                formatPostDate(post.date)
              )}</time><h2>${link(`/blog/${post.slug}`, post.title)}</h2><p>${esc(
                post.excerpt
              )}</p></li>`
          )
          .join("") +
        `</ul>`,
    });
  }

  function blocksHtml(list) {
    return list
      .map((block) => {
        if (block.type === "h2") return `<h2>${inline(block.text)}</h2>`;
        if (block.type === "h3") return `<h3>${inline(block.text)}</h3>`;
        if (block.type === "ul")
          return `<ul>${block.items.map((i) => `<li>${inline(i)}</li>`).join("")}</ul>`;
        return `<p>${inline(block.text)}</p>`;
      })
      .join("");
  }

  for (const post of POSTS) {
    const postPath = `/blog/${post.slug}`;
    const crumbs = [
      { name: "Home", path: "/" },
      { name: "Journal", path: "/blog" },
      { name: post.title, path: postPath },
    ];

    const picks = (post.productPicks || [])
      .map((id) => products.find((product) => product.id === id))
      .filter(Boolean);

    pages.push({
      path: postPath,
      head: {
        title: post.seoTitle,
        description: post.description,
        path: postPath,
        image: picks[0]?.image,
        type: "article",
        jsonLd: [
          breadcrumbJsonLd(crumbs),
          articleJsonLd({ ...post, image: picks[0]?.image }),
        ],
      },
      body: () =>
        crumbsHtml(crumbs) +
        `<h1>${esc(post.title)}</h1>` +
        `<p class="blog-meta"><time datetime="${esc(post.date)}">${esc(
          formatPostDate(post.date)
        )}</time> · ${esc(post.category)} · ${esc(
          String(post.readingMinutes)
        )} min read</p>` +
        `<div class="blog-body">${blocksHtml(post.blocks)}</div>` +
        (picks.length
          ? `<h2>Designs mentioned in this guide</h2>${productListHtml(picks)}`
          : "") +
        `<h2>Keep reading</h2><ul>${POSTS.filter((p) => p.slug !== post.slug)
          .map((p) => `<li>${link(`/blog/${p.slug}`, p.title)}</li>`)
          .join("")}</ul>`,
    });
  }

  // ---- Products ----
  const SHIPPING_GLANCE =
    `<h2>Shipping &amp; returns at a glance</h2><ul>` +
    `<li>Made to order: each item is printed after you order it, so please allow around 2–7 business days to print and prepare, plus delivery.</li>` +
    `<li>Damaged, defective or incorrect items are replaced with a free reprint or fully refunded when you contact us within 14 days of delivery.</li>` +
    `<li>Because every item is custom printed, we can't accept returns for the wrong size or a change of mind, so check the size options above.</li>` +
    `<li>Secure checkout through Safepay. Read the full ${link(
      "/shipping-returns",
      "Shipping, Returns & Refunds"
    )} policy.</li></ul>`;

  for (const product of products) {
    if (!product.slug) continue;

    const seoInfo = buildProductSeo(product);
    const name = seoInfo.name;
    const collection = seoInfo.collection;
    const canonicalPath = productPath(product);
    const noindex = product.indexable === false;
    const paragraphs = plainParagraphs(product.description);
    const designCopy = PRODUCT_COPY[product.id];

    const crumbs = [
      { name: "Home", path: "/" },
      collectionsCrumb,
      ...(collection ? [{ name: collection.nav, path: collection.path }] : []),
      { name, path: canonicalPath },
    ];

    const images = (product.images || []).slice(0, 4);

    const bodyHtml =
      crumbsHtml(crumbs) +
      `<h1>${esc(name)}</h1>` +
      `<p class="product-price">From ${esc(formatPrice(product.priceValue))}</p>` +
      images
        .map(
          (img, index) =>
            `<img src="${esc(img.src)}" alt="${esc(name)}${
              index ? ` - view ${index + 1}` : ""
            }" width="800" height="800"${
              index === 0 ? ' fetchpriority="high"' : ' loading="lazy"'
            } decoding="async">`
        )
        .join("") +
      (paragraphs.length
        ? `<div class="product-description">${paragraphs
            .map((p) => `<p>${esc(p)}</p>`)
            .join("")}</div>`
        : "") +
      (designCopy
        ? `<section class="product-extra"><h2>About this design</h2>${designCopy
            .map((p) => `<p>${esc(p)}</p>`)
            .join("")}</section>`
        : "") +
      `<section class="product-extra">${SHIPPING_GLANCE}</section>`;

    const head = {
      title: name,
      description: seoInfo.description,
      path: canonicalPath,
      image: product.image,
      type: "product",
      noindex,
      jsonLd: [
        breadcrumbJsonLd(crumbs),
        productJsonLd(product, {
          plainDescription: paragraphs.join(" ").slice(0, 500) || undefined,
        }),
      ],
    };

    const rootData = {
      "data-product-id": product.id,
      "data-product-slug": product.slug,
    };

    pages.push({ path: canonicalPath, head, body: () => bodyHtml, rootData, noindex });

    // The old address (/product/<id>) keeps working; its canonical points to
    // the readable address so Google consolidates the two.
    pages.push({
      path: `/product/${product.id}`,
      head: { ...head, path: canonicalPath, canonicalPath },
      body: () => bodyHtml,
      rootData,
      noindex,
      legacy: true,
    });
  }

  // ------------------------------------------------------------------
  // Write the files
  // ------------------------------------------------------------------
  let written = 0;

  for (const page of pages) {
    const rootAttrs = Object.entries(page.rootData || {})
      .map(([key, value]) => ` ${key}="${esc(value)}"`)
      .join("");

    let html = template.replace(HEAD_PATTERN, () => headBlock(page.head));

    const rootPattern = /<div id="root"><\/div>/;

    if (!rootPattern.test(html)) {
      throw new Error('index.html has no empty <div id="root"></div>');
    }

    html = html.replace(
      rootPattern,
      () =>
        `<div id="root"${rootAttrs}>${
          page.body() ? `<div class="prerendered">${page.body()}</div>` : ""
        }</div>`
    );

    // "/" -> dist/index.html, "/hoodies" -> dist/hoodies.html,
    // "/products/x" -> dist/products/x.html (vercel.json "cleanUrls" serves
    // these without the .html).
    const relative = page.path === "/" ? "index.html" : `${page.path.slice(1)}.html`;
    const target = path.join(DIST, relative);

    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, html);
    written += 1;
  }

  log(`wrote ${written} pre-generated pages`);

  // ------------------------------------------------------------------
  // Step 3: sitemap index with today's date, and IndexNow
  // ------------------------------------------------------------------
  const today = new Date().toISOString().slice(0, 10);
  const sitemapIndex =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    ["pages", "collections", "products", "blog"]
      .map(
        (name) =>
          `  <sitemap>\n    <loc>${SITE_URL}/sitemap-${name}.xml</loc>\n    <lastmod>${today}</lastmod>\n  </sitemap>`
      )
      .join("\n") +
    `\n</sitemapindex>\n`;

  await writeFile(path.join(DIST, "sitemap.xml"), sitemapIndex);
  log("refreshed sitemap.xml");

  if (process.env.VERCEL_ENV === "production" && INDEXNOW_KEY) {
    const urls = pages
      .filter((page) => !page.noindexPage && !page.noindex && !page.legacy)
      .map((page) => absoluteUrl(page.path));

    try {
      const response = await fetch("https://api.indexnow.org/indexnow", {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify({
          host: new URL(SITE_URL).host,
          key: INDEXNOW_KEY,
          keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
          urlList: urls.slice(0, 10000),
        }),
        signal: AbortSignal.timeout(10000),
      });

      log(`IndexNow: submitted ${urls.length} addresses (HTTP ${response.status})`);
    } catch (error) {
      console.warn("[postbuild] IndexNow ping failed (harmless):", error.message);
    }
  }
}
