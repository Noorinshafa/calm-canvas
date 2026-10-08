import { useEffect } from "react";

// ---------------------------------------------------------------------------
// Lightweight, dependency-free per-page SEO metadata.
//
// WHY THIS EXISTS: this is a client-rendered React app. The build step
// (scripts/postbuild.mjs) now writes real HTML -- title, description,
// canonical, social tags, structured data and visible content -- into every
// page's initial response, so search engines and link-preview bots no longer
// depend on JavaScript. This hook keeps those same tags correct while a
// visitor moves between pages WITHOUT a full page reload (client-side
// navigation), by updating the real <head> tags (matched by selector, not
// duplicated) and a single JSON-LD <script>. It reads its titles and text
// from src/config/site.js and src/utils/seoShared.js, the same sources the
// build script uses, so the two can never disagree.
// ---------------------------------------------------------------------------

import {
  SITE_URL,
  SITE_NAME,
  DEFAULT_DESCRIPTION,
  DEFAULT_OG_IMAGE,
} from "../config/site.js";
import { absoluteUrl, buildTitle, buildDescription } from "../utils/seoShared.js";

export { SITE_URL, SITE_NAME, absoluteUrl };

function setMeta(selector, attr, value) {
  if (!value) return;
  const el = document.head.querySelector(selector);
  if (el) el.setAttribute(attr, value);
}

function setRobotsMeta(content) {
  let meta = document.head.querySelector('meta[name="robots"]');
  if (!meta) {
    meta = document.createElement("meta");
    meta.setAttribute("name", "robots");
    document.head.appendChild(meta);
  }
  meta.setAttribute("content", content);
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
 * @param {boolean} [opts.noindex] - true for pages that should never appear
 *   in search results (cart, checkout, order confirmation, 404) -- sets
 *   <meta name="robots" content="noindex, follow"> instead of the default
 *   "index, follow". This is a second, independent layer on top of
 *   robots.txt (which only blocks crawling, not indexing a URL that's
 *   linked to from elsewhere) and on top of /api/sitemap already leaving
 *   these routes out.
 */
export default function useSEO({
  title,
  description,
  path = "/",
  image,
  type = "website",
  jsonLd,
  noindex = false,
} = {}) {
  useEffect(() => {
    const fullTitle = buildTitle(title);
    const desc = description ? buildDescription(description) : DEFAULT_DESCRIPTION;
    const url = absoluteUrl(path);
    const img = absoluteUrl(image || DEFAULT_OG_IMAGE);

    document.title = fullTitle;

    setRobotsMeta(noindex ? "noindex, follow" : "index, follow");

    setMeta('meta[name="description"]', "content", desc);
    setMeta('meta[property="og:title"]', "content", fullTitle);
    setMeta('meta[property="og:description"]', "content", desc);
    setMeta('meta[property="og:image"]', "content", img);
    setMeta('meta[property="og:url"]', "content", url);
    setMeta('meta[property="og:type"]', "content", type);
    setMeta('meta[name="twitter:card"]', "content", "summary_large_image");
    setMeta('meta[name="twitter:title"]', "content", fullTitle);
    setMeta('meta[name="twitter:description"]', "content", desc);
    setMeta('meta[name="twitter:image"]', "content", img);

    setCanonical(url);
    setJsonLd(jsonLd);
  }, [title, description, path, image, type, jsonLd, noindex]);
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
