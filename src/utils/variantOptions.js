// Works out which choices a shopper makes on a product page (colour, size,
// phone model, finish...) from Printify's own option list.
//
// Why not read the variant title? A title such as "White / S" lists the
// choices in whatever order that particular product uses. T-shirts are
// "Colour / Size", sweatshirts are "Size / Colour", phone cases are
// "Model / Finish". Guessing "the first part is the size" mislabels about
// half of the catalogue. Printify gives every variant a list of option-value
// IDs, and the product a list that says what each ID is -- that is what this
// uses.

const SIZE_ORDER = [
  "XXS",
  "XS",
  "S",
  "M",
  "L",
  "XL",
  "2XL",
  "3XL",
  "4XL",
  "5XL",
  "6XL",
];

// "Colors" -> "Color", "Sizes" -> "Size", "Phone Models" -> "Phone Model".
// Names that don't end in a plain "s" ("Surface", "Glass") are left alone.
function singular(name) {
  const text = String(name || "").trim();
  if (!text || /ss$/i.test(text) || !/s$/i.test(text)) return text;
  return text.slice(0, -1);
}

// Clothing sizes read S, M, L, XL, 2XL... instead of Printify's arbitrary
// order. Only applied when every value is a known clothing size; anything
// else (phone models, bag dimensions) keeps its original order.
function sortSizes(values) {
  const known = values.every((value) =>
    SIZE_ORDER.includes(String(value).toUpperCase())
  );

  if (!known) return values;

  return [...values].sort(
    (a, b) =>
      SIZE_ORDER.indexOf(String(a).toUpperCase()) -
      SIZE_ORDER.indexOf(String(b).toUpperCase())
  );
}

/**
 * Returns { groups, picksByVariantId }.
 *
 * groups: [{ label, type, values: [string] }] -- one dropdown each, colour
 *   first, then the rest in Printify's order.
 * picksByVariantId: Map(variantId -> [value for each group]).
 *
 * If a product's option list is missing or doesn't account for every
 * variant, this falls back to ONE dropdown listing each variant's full title
 * ("White / S"). That is always correct, just less tidy.
 */
export function buildOptionModel(product) {
  const variants = product?.variants || [];
  const definitions = Array.isArray(product?.options) ? product.options : [];

  const lookup = new Map();

  definitions.forEach((definition, index) => {
    (definition.values || []).forEach((value) => {
      lookup.set(value.id, { index, title: value.title });
    });
  });

  const resolved = variants.map((variant) => {
    const picks = new Array(definitions.length).fill(null);

    for (const id of variant.options || []) {
      const hit = lookup.get(id);
      if (hit) picks[hit.index] = hit.title;
    }

    return picks;
  });

  const usable =
    definitions.length > 0 &&
    resolved.every((picks) => picks.every((value) => value !== null));

  if (!usable) {
    const picksByVariantId = new Map(
      variants.map((variant) => [variant.id, [variant.title || ""]])
    );

    return {
      groups: variants.length
        ? [
            {
              label: "Option",
              type: "other",
              values: [...new Set(variants.map((variant) => variant.title || ""))],
            },
          ]
        : [],
      picksByVariantId,
    };
  }

  // Colour first (it is what shoppers choose with their eyes), then the rest
  // in the order Printify lists them.
  const order = definitions
    .map((definition, index) => index)
    .sort((a, b) => {
      const aColor = definitions[a].type === "color" ? 0 : 1;
      const bColor = definitions[b].type === "color" ? 0 : 1;
      return aColor - bColor || a - b;
    });

  const groups = order.map((index) => {
    const definition = definitions[index];
    const used = new Set(resolved.map((picks) => picks[index]));
    let values = (definition.values || [])
      .map((value) => value.title)
      .filter((title, position, all) => used.has(title) && all.indexOf(title) === position);

    if (definition.type === "size") values = sortSizes(values);

    return {
      label: singular(definition.name) || "Option",
      type: definition.type,
      values,
    };
  });

  const picksByVariantId = new Map(
    variants.map((variant, position) => [
      variant.id,
      order.map((index) => resolved[position][index]),
    ])
  );

  return { groups, picksByVariantId };
}

// The product photos to show for one variant: the photos Printify made for
// it, plus any photo that isn't tied to a particular variant. If Printify
// published no photo for this variant at all (common for clothing, where often
// only one colour's photos are published), ALL photos are returned instead of
// a thinned-out gallery.
export function imagesForVariant(images, variantId) {
  const all = images || [];

  if (variantId == null) return all;

  const isShared = (image) =>
    !Array.isArray(image.variantIds) || image.variantIds.length === 0;

  const hasOwnPhoto = all.some(
    (image) => !isShared(image) && image.variantIds.includes(variantId)
  );

  if (!hasOwnPhoto) return all;

  return all.filter(
    (image) => isShared(image) || image.variantIds.includes(variantId)
  );
}

// The variant whose choices are exactly `selection`, if there is one.
export function findVariant(model, variants, selection) {
  return variants.find((variant) => {
    const picks = model.picksByVariantId.get(variant.id);
    return picks && picks.every((value, i) => value === selection[i]);
  });
}

// What the selection becomes when the shopper changes one dropdown. Not every
// colour comes in every size, so if the exact combination doesn't exist this
// keeps the new choice and moves the others to the closest combination that
// does -- the page can then never show a choice that isn't a real product.
export function nextSelection(model, variants, selection, groupIndex, value) {
  const candidates = variants.filter(
    (variant) => model.picksByVariantId.get(variant.id)?.[groupIndex] === value
  );

  if (!candidates.length) return selection;

  let best = candidates[0];
  let bestScore = -1;

  for (const variant of candidates) {
    const picks = model.picksByVariantId.get(variant.id);
    const score = picks.reduce(
      (total, pick, i) => total + (i !== groupIndex && pick === selection[i] ? 1 : 0),
      0
    );

    if (score > bestScore) {
      best = variant;
      bestScore = score;
    }
  }

  return model.picksByVariantId.get(best.id);
}
