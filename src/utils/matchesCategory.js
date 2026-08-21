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
// name.
//
// IMPORTANT — word-boundary matching, not "contains anywhere":
// A naive "does this text contain this word" check has a hidden trap:
// short words can hide INSIDE longer, unrelated words. For example the
// letters "tshirt" appear inside "sweatshirt" (sweaT-SHIRT), so a plain
// "includes" check would wrongly count every sweatshirt as a t-shirt too.
// To prevent this whole class of bug, we only match a keyword when it
// appears as a whole, standalone word (or phrase) — using a word-boundary
// regular expression — never as a fragment buried inside a bigger word.
//
// Some words are also shared between categories on purpose (a "Hooded
// Sweatshirt" is a hoodie, not a plain sweatshirt). `excludeKeywords` lets
// a category say "match these words, UNLESS the name also contains one of
// these [whole] words" so products don't get pulled into the wrong page.
function containsWholeWord(text, phrase) {
  if (!text || !phrase) return false;

  // Escape any regex-special characters in the phrase itself (safety net
  // in case a keyword ever includes something like "." or "+").
  const escapedPhrase = phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  const pattern = new RegExp(`\\b${escapedPhrase}\\b`, "i");
  return pattern.test(text);
}

export function isInCategory(product, keywords, fallbackIds = [], excludeKeywords = []) {
  const blueprintTitle = product.blueprintTitle || "";

  const matchesExclude = excludeKeywords.some((keyword) =>
    containsWholeWord(blueprintTitle, keyword)
  );

  if (matchesExclude) {
    return false;
  }

  const matchesKeyword = keywords.some((keyword) =>
    containsWholeWord(blueprintTitle, keyword)
  );

  const matchesFallbackId = fallbackIds.includes(Number(product.blueprint_id));

  return matchesKeyword || matchesFallbackId;
}
