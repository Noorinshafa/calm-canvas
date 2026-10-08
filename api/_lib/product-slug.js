// Pure, dependency-free helpers for turning a Printify product title into a
// clean, readable web address (slug) like "watercolor-butterflies-hoodie"
// instead of "65f2a0c1d3b4e5f6a7b8c9d0".
//
// Used by:
//   - api/_lib/printify-shared.js  (adds `slug` to every product in the catalog)
//   - scripts/postbuild.mjs        (build-time page generation)
//
// Printify titles are usually written like "Main Name | extra search words".
// Only the first part is used for the slug, the page <title> and breadcrumbs,
// so addresses stay short and readable.

export function cleanProductName(title = "") {
  const first = String(title).split("|")[0];

  const name = first
    .replace(/[\s.]+$/g, "")
    .replace(/\s+/g, " ")
    .trim();

  return name || String(title).trim();
}

export function slugify(text = "") {
  return String(text)
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[’'"]/g, "")
    .replace(/&/g, " and ")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/, "");
}

// Returns a Map of product id -> unique slug. If two products would get the
// same slug, each of them gets the last 4 characters of its Printify id
// added, so addresses never collide and stay stable for each product.
export function assignSlugs(products) {
  const groups = new Map();

  for (const product of products) {
    const slug = slugify(cleanProductName(product.title)) || "product";

    if (!groups.has(slug)) {
      groups.set(slug, []);
    }

    groups.get(slug).push(String(product.id));
  }

  const result = new Map();

  for (const [slug, ids] of groups) {
    if (ids.length === 1) {
      result.set(ids[0], slug);
    } else {
      for (const id of ids) {
        result.set(id, `${slug}-${id.slice(-4)}`);
      }
    }
  }

  return result;
}

function normalizeForCompare(text = "") {
  return String(text)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
}

// A product whose title is just the supplier's default template name (for
// example "Tough Phone Cases" or "Weekender Bag") has no real design name,
// so its page would be thin and look like a duplicate of its siblings.
// Those pages are kept out of the sitemap and marked "noindex" until the
// product is given a real title in Printify.
export function hasGenericTitle(title = "", blueprintTitle = "") {
  const a = normalizeForCompare(cleanProductName(title));
  const b = normalizeForCompare(blueprintTitle);

  return Boolean(a) && Boolean(b) && a === b;
}
