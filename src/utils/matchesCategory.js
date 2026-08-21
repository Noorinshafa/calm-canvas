// Decides if a product belongs to a category.
//
// WHY THIS FILE EXISTS:
// Printify keeps adding new blueprint IDs (the number identifying the exact
// physical product template) for the same kind of item — e.g. two different
// "Weekender Bag" blueprints both being tote bags. Older code only checked
// a fixed list of known IDs, so any NEW id silently disappeared from the
// website until someone noticed and manually added it.
//
// Fix: the Printify API also tells us, for each product, which blueprint
// it uses AND (via api/printify.js) that blueprint's real name, e.g.
// "Weekender Bag" or "Crewneck Sweatshirt". We match on keywords in that
// name first. The old ID list is kept ONLY as a backup, in case the name
// lookup ever fails.
//
// Some words are shared between categories (a "Hooded Sweatshirt" is a
// hoodie, not a plain sweatshirt; "Crewneck" describes a neckline used by
// both t-shirts and sweatshirts). `excludeKeywords` lets a category say
// "match these words, UNLESS the name also contains one of these" so
// products don't get pulled into the wrong page.
export function isInCategory(product, keywords, fallbackIds = [], excludeKeywords = []) {
  const blueprintTitle = (product.blueprintTitle || "").toLowerCase();

  const matchesExclude = excludeKeywords.some((keyword) =>
    blueprintTitle.includes(keyword)
  );

  if (matchesExclude) {
    return false;
  }

  const matchesKeyword = keywords.some((keyword) =>
    blueprintTitle.includes(keyword)
  );

  const matchesFallbackId = fallbackIds.includes(Number(product.blueprint_id));

  return matchesKeyword || matchesFallbackId;
}
