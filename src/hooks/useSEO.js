import { useEffect } from "react";

// ---------------------------------------------------------------------------
// Lightweight, dependency-free per-page SEO metadata.
//
// WHY THIS EXISTS: this is a client-rendered SPA with no server-side
// rendering. Previously every route reused the exact same static
// <title>/<meta description>/Open Graph/Twitter tags from index.html, so a
// crawler or a link-preview bot that doesn't execute JS saw the identical
// generic "Calm Canvas | Premium Print-On-Demand..." info for the
// homepage, every category page, and every individual product -- meaning
// none of them could show up correctly in search results or link previews.
//
// This hook updates the real <head> tags (the same ones index.html
// declares, matched by selector -- not duplicates) on every route change,
// and manages a single JSON-LD <script> for structured data. It runs after
// first paint, so it helps crawlers that execute JS (which is how Google
// indexes SPAs today) and social/link-preview bots that fetch the page
// fresh; it does NOT help a crawler that reads only the raw initial HTML.
// True first-byte-correct metadata for every crawler would need
// prerendering/SSR for these routes -- worth scoping as a follow-up once
// this is in place; see the audit doc's SEO section (#7).
// ---------------------------------------------------------------------------

export const SITE_URL = "https://shopcalmcanvas.com";
export const SITE_NAME = "Calm Canvas";
const DEFAULT_TITLE = "Calm Canvas | Premium Print-On-Demand Lifestyle Brand";
const DEFAULT_DESCRIPTION =
  "Calm Canvas is a premium print-on-demand lifestyle brand offering minimal, artistic hoodies, t-shirts, sweatshirts, tote bags, phone cases and mugs — designed for everyday elegance.";
const DEFAULT_IMAGE = `${SITE_URL}/logo.png`;

export function absoluteUrl(pathOrUrl) {
  if (!pathOrUrl) return DEFAULT_IMAGE;
  try {
    return new URL(pathOrUrl, SITE_URL).href;
  } catch {
    return DEFAULT_IMAGE;
  }
}

function setMeta(selector, attr, value) {
  if (!value) return;
  const el = document.head.querySelector(selector);
  if (el) el.setAttribute(attr, value);
}

function setCanonical(href) {
  let link = document.head.querySelector('link[rel="canonical"]');
  if (!link) {
    link = document.createElement("link");
    link.setAttribute("rel", "canonical");
    document.head.appendChild(link);
  }
  link.setAttribute("href", href);
}

function setJsonLd(data) {
  let script = document.getElementById("seo-jsonld");

  if (!data) {
    if (script) script.textContent = "";
    return;
  }

  if (!script) {
    script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = "seo-jsonld";
    document.head.appendChild(script);
  }

  script.textContent = JSON.stringify(data);
}

/**
 * @param {Object} opts
 * @param {string} [opts.title] - page title, shown as "<title> | Calm Canvas". Omit for the default site title.
 * @param {string} [opts.description] - meta/OG/Twitter description. Omit for the default site description.
 * @param {string} [opts.path] - route path (e.g. "/tshirts") used to build the canonical URL and og:url.
 * @param {string} [opts.image] - absolute or site-relative image URL for social previews.
 * @param {"website"|"product"} [opts.type] - og:type.
 * @param {object|object[]} [opts.jsonLd] - structured data to inject as JSON-LD.
 */
export default function useSEO({
  title,
  description,
  path = "/",
  image,
  type = "website",
  jsonLd,
} = {}) {
  useEffect(() => {
    const fullTitle = title ? `${title} | ${SITE_NAME}` : DEFAULT_TITLE;
    const desc = description || DEFAULT_DESCRIPTION;
    const url = absoluteUrl(path);
    const img = absoluteUrl(image);

    document.title = fullTitle;

    setMeta('meta[name="description"]', "content", desc);
    setMeta('meta[property="og:title"]', "content", fullTitle);
    setMeta('meta[property="og:description"]', "content", desc);
    setMeta('meta[property="og:image"]', "content", img);
    setMeta('meta[property="og:url"]', "content", url);
    setMeta('meta[property="og:type"]', "content", type);
    setMeta('meta[name="twitter:title"]', "content", fullTitle);
    setMeta('meta[name="twitter:description"]', "content", desc);
    setMeta('meta[name="twitter:image"]', "content", img);

    setCanonical(url);
    setJsonLd(jsonLd);
  }, [title, description, path, image, type, jsonLd]);
}

// Strips tags from a Printify description (already sanitized separately for
// rendering, see utils/sanitizeHtml.js) down to plain text, for use as a
// meta description -- which must not contain HTML.
export function toPlainText(html, maxLength = 160) {
  if (!html) return "";

  let text = html;
  try {
    const doc = new DOMParser().parseFromString(html, "text/html");
    text = doc.body.textContent || "";
  } catch {
    text = html.replace(/<[^>]*>/g, " ");
  }

  text = text.replace(/\s+/g, " ").trim();

  if (text.length <= maxLength) return text;

  const truncated = text.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(" ");

  return `${truncated.slice(0, lastSpace > 0 ? lastSpace : maxLength)}…`;
}
