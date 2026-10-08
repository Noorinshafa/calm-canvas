// Shared, dependency-free SEO helpers.
//
// Used by BOTH the React app (via src/hooks/useSEO.js and the page
// components) and the build script (scripts/postbuild.mjs), so the
// titles, descriptions and structured data a search engine reads in the
// generated HTML are exactly the same as what the app sets after loading.
//
// IMPORTANT: relative imports here must keep the ".js" extension, because
// Node (not just Vite) loads this file during the build.

import {
  SITE_URL,
  SITE_NAME,
  DEFAULT_TITLE,
  DEFAULT_DESCRIPTION,
  DEFAULT_OG_IMAGE,
  SOCIAL_LINKS,
  SHIPPING_COUNTRIES,
  HANDLING_DAYS,
  CURRENCY,
  CONTACT_EMAIL,
  COLLECTIONS,
} from "../config/site.js";
import { isInCategory } from "./matchesCategory.js";

// "Name | extra keywords" -> "Name" (same rule as api/_lib/product-slug.js).
export function cleanProductName(title = "") {
  const first = String(title).split("|")[0];
  const name = first
    .replace(/[\s.]+$/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return name || String(title).trim();
}

export function absoluteUrl(pathOrUrl) {
  if (!pathOrUrl) return `${SITE_URL}${DEFAULT_OG_IMAGE}`;
  try {
    return new URL(pathOrUrl, SITE_URL).href;
  } catch {
    return `${SITE_URL}${DEFAULT_OG_IMAGE}`;
  }
}

// Cuts text to `max` characters at a word boundary (no trailing ellipsis in
// titles; descriptions get one).
export function truncateAtWord(text, max, ellipsis = false) {
  const clean = String(text || "").replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;

  const limit = ellipsis ? max - 1 : max;
  const slice = clean.slice(0, limit);
  const lastSpace = slice.lastIndexOf(" ");
  const cut = (lastSpace > 20 ? slice.slice(0, lastSpace) : slice).replace(
    /[\s,;:.\-–—|]+$/g,
    ""
  );

  return ellipsis ? `${cut}…` : cut;
}

// Page <title>: "<title> | Calm Canvas", kept to 60 characters or fewer.
export function buildTitle(title) {
  if (!title) return DEFAULT_TITLE;

  const full = `${title} | ${SITE_NAME}`;
  if (full.length <= 60) return full;

  return truncateAtWord(title, 60);
}

export function buildDescription(text) {
  return truncateAtWord(text || DEFAULT_DESCRIPTION, 155, true);
}

export function formatPrice(value) {
  return `$${Number(value || 0).toFixed(2)}`;
}

// Which collection a product belongs to -- the same rules the category pages
// have always used (see matchesCategory.js for why whole-word matching).
export function productInCollection(product, collection) {
  const { keywords, ids, exclude } = collection.match;
  return isInCategory(product, keywords, ids, exclude);
}

export function findCollectionForProduct(product) {
  return COLLECTIONS.find((collection) =>
    productInCollection(product, collection)
  );
}

export function productPath(product) {
  return product.slug ? `/products/${product.slug}` : `/product/${product.id}`;
}

// Title + meta description for a single product page.
export function buildProductSeo(product) {
  const name = cleanProductName(product.title);
  const collection = findCollectionForProduct(product);
  const noun = collection ? collection.noun : "product";
  const price = formatPrice(product.priceValue);

  // Kept short enough to end on a full sentence instead of being cut off.
  let text = `${name}: original artwork on a ${noun}, printed on demand. From ${price}.`;
  const extra = ` Sizes and options at ${SITE_NAME}.`;
  if (text.length + extra.length <= 155) text += extra;

  const description = buildDescription(text);

  return { title: buildTitle(name), description, name, collection };
}

// ---------------------------------------------------------------------------
// Structured data (JSON-LD)
// ---------------------------------------------------------------------------

export function organizationJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: `${SITE_URL}/`,
    logo: `${SITE_URL}/logo.png`,
    email: CONTACT_EMAIL,
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "customer support",
        email: CONTACT_EMAIL,
        availableLanguage: ["English"],
      },
    ],
  };

  if (SOCIAL_LINKS.length) {
    data.sameAs = SOCIAL_LINKS;
  }

  return data;
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: SITE_NAME,
    url: `${SITE_URL}/`,
    publisher: { "@id": `${SITE_URL}/#organization` },
    inLanguage: "en",
  };
}

// items: [{ name, path }] from the home page down to the current page.
export function breadcrumbJsonLd(items) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function faqJsonLd(faq) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((entry) => ({
      "@type": "Question",
      name: entry.q,
      acceptedAnswer: { "@type": "Answer", text: entry.a },
    })),
  };
}

export function collectionJsonLd(collection, products) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: collection.h1,
    description: collection.description,
    url: absoluteUrl(collection.path),
    isPartOf: { "@id": `${SITE_URL}/#website` },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: products.length,
      itemListElement: products.slice(0, 50).map((product, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: absoluteUrl(productPath(product)),
        name: cleanProductName(product.title),
      })),
    },
  };
}

function shippingDetailsJsonLd() {
  return {
    "@type": "OfferShippingDetails",
    shippingRate: {
      "@type": "MonetaryAmount",
      value: 0,
      currency: CURRENCY,
    },
    shippingDestination: SHIPPING_COUNTRIES.map((country) => ({
      "@type": "DefinedRegion",
      addressCountry: country,
    })),
    deliveryTime: {
      "@type": "ShippingDeliveryTime",
      handlingTime: {
        "@type": "QuantitativeValue",
        minValue: HANDLING_DAYS.min,
        maxValue: HANDLING_DAYS.max,
        unitCode: "DAY",
      },
    },
  };
}

function returnPolicyJsonLd() {
  return {
    "@type": "MerchantReturnPolicy",
    applicableCountry: SHIPPING_COUNTRIES,
    returnPolicyCategory: "https://schema.org/MerchantReturnNotPermitted",
    merchantReturnLink: absoluteUrl("/shipping-returns"),
  };
}

function priceValidUntil(now = new Date()) {
  const date = new Date(now.getTime());
  date.setUTCFullYear(date.getUTCFullYear() + 1);
  return date.toISOString().slice(0, 10);
}

// product: a catalog entry (id, title, description, images, priceValue,
// slug, ...). `inStock` is false only when a product has no purchasable
// variants.
export function productJsonLd(product, { inStock = true, plainDescription } = {}) {
  const name = cleanProductName(product.title);
  const url = absoluteUrl(productPath(product));
  const collection = findCollectionForProduct(product);

  const images = (product.images?.length ? product.images : [])
    .map((img) => img.src)
    .filter(Boolean)
    .slice(0, 6);

  if (!images.length && product.image) images.push(product.image);

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${url}#product`,
    name,
    image: images,
    description:
      plainDescription ||
      `${name}, printed on demand by ${SITE_NAME} with original artwork.`,
    sku: String(product.id),
    brand: { "@type": "Brand", name: SITE_NAME },
    ...(collection ? { category: collection.nav } : {}),
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: CURRENCY,
      price: Number(product.priceValue || 0).toFixed(2),
      priceValidUntil: priceValidUntil(),
      itemCondition: "https://schema.org/NewCondition",
      availability: inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      seller: { "@id": `${SITE_URL}/#organization` },
      shippingDetails: shippingDetailsJsonLd(),
      hasMerchantReturnPolicy: returnPolicyJsonLd(),
    },
  };
}

// post: { title, description, slug, date, updated?, image?, author? }
export function articleJsonLd(post) {
  const url = absoluteUrl(`/blog/${post.slug}`);

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${url}#article`,
    headline: post.title,
    description: post.description,
    url,
    mainEntityOfPage: url,
    datePublished: post.date,
    dateModified: post.updated || post.date,
    image: absoluteUrl(post.image || DEFAULT_OG_IMAGE),
    author: { "@type": "Organization", name: SITE_NAME },
    publisher: { "@id": `${SITE_URL}/#organization` },
  };
}

// Minimal HTML-escaping for the build script's generated markup.
export function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export { SITE_URL, SITE_NAME, DEFAULT_TITLE, DEFAULT_DESCRIPTION, DEFAULT_OG_IMAGE };
