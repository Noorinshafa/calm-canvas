// Frequently asked questions shown on every product page.
//
// The questions are the ones shoppers actually search for, researched on
// 16 Nov 2026 (US, English):
//   - Google Search Console for this site (e.g. "how to style oversized
//     hoodie", "what to wear with oversized hoodie": real searches that
//     already show this site);
//   - Google autocomplete and "People also ask" for each product type
//     ("do sweatshirts shrink", "how to wash graphic tees without cracking",
//     "should hoodies be oversized", "are ceramic mugs microwave safe",
//     "can you wash tote bags", "can you use a tote bag as a personal item",
//     "does a phone case affect wireless charging", "what phone cases fit"...);
//   - Google Trends, to pick the bigger topic when two were close ("how to
//     wash hoodie" far above "do hoodies shrink"; "mug size oz"; "tote bag for
//     laptop"; "is my phone case magsafe").
//
// Honesty rules: an answer only states what is true for THIS product.
// Material, care, microwave/dishwasher, MagSafe and size facts are read from
// the product's own description (the "Product features" and "Care
// instructions" lists Printify provides, also shown on the page). When the
// description doesn't say, the answer says so or the question is left out;
// nothing is guessed. Shipping and returns answers repeat the site's
// policies (src/config/shipping.js and src/config/site.js).
//
// Plain JavaScript with no browser or React code: the product page and the
// build script (scripts/postbuild.mjs, api/product-page.js) use the same
// function, so the page source and the page a visitor sees say the same.
//
// No FAQPage structured data is added for these: Google asks that a question
// repeated on many pages of a site is marked up only once, and these repeat
// across products of the same type. The questions are normal visible page
// text, which search engines and AI assistants read.

import { CONTACT_EMAIL } from "../config/site.js";
import { PRINT_TIME_TEXT } from "../config/shipping.js";

const MIN_QUESTIONS = 5;
const MAX_QUESTIONS = 6;

const CHANGE_ORDER = {
  q: "Can I change or cancel my order?",
  a: "Only within a few hours of ordering, before it goes into production. Email us right away with your order number and what you'd like to change.",
};

// ---------------------------------------------------------------------------
// Reading the product description
// ---------------------------------------------------------------------------

const ENTITIES = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
  "&#039;": "'",
  "&apos;": "'",
  "&nbsp;": " ",
  "&sup2;": "²",
  "&reg;": "®",
  "&trade;": "™",
  "&deg;": "°",
};

function descriptionLines(html) {
  return String(html || "")
    .replace(/<\s*br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|li|h[1-6]|ul|ol)>/gi, "\n")
    .replace(/<[^>]*>/g, " ")
    .replace(/&[a-z0-9#]+;/gi, (entity) => ENTITIES[entity.toLowerCase()] ?? " ")
    .split("\n")
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean);
}

// The "- ..." lines that follow a heading such as "Product features".
function listAfter(lines, heading) {
  const start = lines.findIndex((line) => heading.test(line));
  if (start < 0) return [];

  const items = [];
  for (let i = start + 1; i < lines.length; i++) {
    const line = lines[i];
    if (!/^[-•–]\s*/.test(line)) break;
    const text = line.replace(/^[-•–]\s*/, "").trim();
    if (text) items.push(text);
  }
  return items;
}

export function readProductFacts(product) {
  const lines = descriptionLines(product?.description);
  const features = listAfter(lines, /^product features\b/i);
  const care = listAfter(lines, /^care instructions\b/i);
  const all = [...features, ...care].join(" \n ");
  const names = `${product?.title || ""} ${product?.blueprintTitle || ""}`;
  // The product template (e.g. "Unisex Heavy Blend™ Crewneck Sweatshirt"):
  // the cut is read from this, never from the design's name ("Women's Floral
  // LOVE Sweatshirt" is still a unisex sweatshirt).
  const template = product?.blueprintTitle || "";

  const has = (pattern) => pattern.test(all);
  const not = (word) => new RegExp(`(not|never|no)\\s+(be\\s+)?${word}`, "i").test(all);

  return {
    features,
    care,
    // The fabric line: one giving percentages or a blend ratio first, then
    // any line naming the fabric (but not "ethically sourced US cotton").
    material:
      features.find((line) => /\d+\s?%|\b\d{2}\/\d{2}\b/.test(line)) ||
      features.find(
        (line) =>
          /cotton|polyester|fleece|canvas/i.test(line) && !/made in|sourced|dyes?\b/i.test(line)
      ) ||
      "",
    caseBuild: features.find((line) => /polycarbonate|tpu|shell|liner/i.test(line)) || "",
    dtgMain: /dtg for (the )?main design|direct[- ]to[- ]garment/i.test(all),
    microwave: not("microwave") ? "no" : has(/microwave[- ]safe|microwavable/i) ? "yes" : "",
    dishwasher: not("dishwasher") ? "no" : has(/dishwasher[- ]safe|clean in dishwasher|dishwasher-? and/i) ? "yes" : "",
    topRack: has(/top rack/i),
    // Just the claim itself, e.g. "lead- and BPA-free" or
    // "lead-, cadmium-, and BPA-compliant".
    leadFree: (all.match(/\blead\b[-\s,]*(?:and\s+)?[^.;\n]*?\b(?:free|compliant)\b/i) || [])[0] || "",
    magsafe: has(/non-magsafe|not magsafe/i)
      ? "no"
      : has(/magsafe|magnet/i) || /magnetic/i.test(names)
      ? "yes"
      : "",
    wireless: has(/wireless charging/i) ? (not("wireless charging") ? "no" : "yes") : "",
    uvFinish: has(/uv[- ]protect/i),
    ounces: [
      ...new Set(
        [...`${names} ${all}`.matchAll(/\b(\d{2})\s?-?oz\b(?!\s*\/)/gi)].map((match) => Number(match[1]))
      ),
    ]
      .filter((oz) => oz >= 8 && oz <= 30)
      .sort((a, b) => a - b),
    dimensions:
      (all.match(/\b\d{1,2}(\.\d+)?\s?(?:"|”|''|in(?:ches)?|-inch)?\s?[x×]\s?\d{1,2}(\.\d+)?\s?(?:"|”|''|-inch(?:es)?|in(?:ches)?)/i) ||
        [])[0] || "",
    sizesLine: features.find((line) => /available in .*sizes?|one-size|sizes? with/i.test(line)) || "",
    unisex: /unisex/i.test(template),
    womens: /women'?s/i.test(template),
    polyester: /100%\s*(spun\s*)?polyester/i.test(all),
    cotton100: /100%\s*(ring-spun\s*)?cotton/i.test(all),
    clearCase: /\bclear\b|flexi/i.test(names),
  };
}

// "Machine wash: cold (max 30C or 90F)" -> "machine wash cold (max 30C or 90F)"
function careSentence(care) {
  const parts = care
    .map((line) =>
      line
        .replace(/\s*:\s*/g, " ")
        .replace(/\.$/, "")
        .trim()
    )
    .filter(Boolean)
    .map((line) => line.charAt(0).toLowerCase() + line.slice(1));

  if (!parts.length) return "";
  return `The care instructions for this item: ${parts.join("; ")}.`;
}

function lowerFirst(text) {
  return text ? text.charAt(0).toLowerCase() + text.slice(1) : text;
}

// "Dual-layer protection: rigid polycarbonate shell for impact" ->
// "rigid polycarbonate shell"
function cleanFeature(text) {
  return lowerFirst(
    String(text || "")
      .replace(/^[A-Za-z][A-Za-z &/-]{2,45}:\s+/, "")
      .replace(/;.*$/, "")
      .replace(/\s+—\s+.*$/, "")
      .replace(/\s+for\s+.*$/i, "")
      .replace(/\.$/, "")
  );
}

// A feature line quoted whole (only the full stop removed).
function wholeFeature(text) {
  return lowerFirst(String(text || "").replace(/\.$/, ""));
}

function listWords(values) {
  if (values.length <= 1) return values.join("");
  return `${values.slice(0, -1).join(", ")} and ${values[values.length - 1]}`;
}

// ---------------------------------------------------------------------------
// Answers shared by every product type (from the site's policies)
// ---------------------------------------------------------------------------

function arrivalAnswer(noun) {
  return {
    q: `How long will it take to arrive?`,
    a: `Each ${noun} is printed for you after you order, which takes about ${PRINT_TIME_TEXT}. Delivery then takes about 2–5 business days in the US with Standard shipping (2–3 with Priority), and about 10–30 business days to other countries (3–5 with Priority). You'll see the exact shipping price for your country before you pay. If it's a gift for a date, order a little early.`,
  };
}

function returnsAnswer(noun, damagedWording) {
  return {
    q: damagedWording
      ? `What if it arrives damaged or broken?`
      : `Can I return or exchange it if the size is wrong?`,
    a: damagedWording
      ? `Email ${CONTACT_EMAIL} within 14 days of delivery with your order number and a photo, and we'll send a free replacement or give you a full refund. Because every ${noun} is printed just for you, we can't take returns for a change of mind.`
      : `Because every ${noun} is printed just for you, we can't accept returns or exchanges for the wrong size or a change of mind, so please check your size before ordering. If it arrives damaged, defective or not what you ordered, email ${CONTACT_EMAIL} within 14 days of delivery for a free replacement or a full refund.`,
  };
}

// ---------------------------------------------------------------------------
// Clothing: hoodies, sweatshirts, tees
// ---------------------------------------------------------------------------

function shrinkAnswer(facts, noun) {
  let a;
  if (facts.polyester) {
    a = `It's made of polyester, which holds its shape and doesn't shrink the way cotton can. Washing it cold and letting it hang dry or tumble dry on low keeps it looking new.`;
  } else if (facts.cotton100) {
    a = `Cotton can shrink a little, mostly from hot water and a hot dryer. Wash it cold and tumble dry on low or hang it to dry and it keeps its size.`;
  } else {
    a = `Cotton and cotton-blend ${noun}s can shrink a little, mostly from hot water and high dryer heat. Wash it cold and tumble dry on low (or hang it to dry) and the fit stays the same.`;
  }

  const material = facts.material ? ` Fabric: ${wholeFeature(facts.material)}.` : "";
  return { q: `Will this ${noun} shrink after washing?`, a: a + material };
}

function washAnswer(facts, noun) {
  const care = careSentence(facts.care);
  return {
    q: `How do I wash it so the print lasts?`,
    a:
      `Turn the ${noun} inside out, wash it cold on a gentle cycle with similar colors, and avoid chlorine bleach and fabric softener. Hanging it to dry or tumbling it on low heat is gentlest on the print, and never iron directly over the design.` +
      (care ? ` ${care}` : ""),
  };
}

function fitAnswer(facts, noun) {
  if (facts.womens) {
    return {
      q: `How does it fit?`,
      a: `This is a women's cut, so it's shaped closer to the body than a unisex ${noun}. Choose your usual size for the intended fit, or go one size up if you like it looser. Every size in the size menu above can be ordered.`,
    };
  }

  return {
    q: `How does it fit? Should I size up for an oversized look?`,
    a: facts.unisex
      ? `It's a unisex ${noun} with a classic, relaxed fit. Order your usual size for a regular fit, or one to two sizes up for an oversized look. Many women pick their usual size for a relaxed fit or one size down for a closer fit. Every size in the size menu above can be ordered.`
      : `Order your usual size for a regular fit, or one to two sizes up for a roomier, oversized look. Every size in the size menu above can be ordered.`,
  };
}

function styleAnswer(noun) {
  const ideas = {
    hoodie:
      "Pair an oversized hoodie with leggings or bike shorts and sneakers for an easy everyday look, or with straight or wide-leg jeans for running errands. Layer a collared shirt or a tee underneath, or add a denim or puffer jacket on top when it's cold.",
    sweatshirt:
      "Wear it loose over leggings or bike shorts with sneakers, tuck the front into high-waisted jeans, or layer a collared shirt underneath so the collar shows. It also works over a skirt with boots in autumn.",
    "T-shirt":
      "Wear it loose with jeans or shorts, half-tuck it into high-waisted trousers or a skirt, or layer it under an open shirt, cardigan or jacket. An oversized tee also works over bike shorts.",
  };
  return {
    q:
      noun === "T-shirt"
        ? `How can I style a graphic tee?`
        : `How can I style an oversized ${noun}?`,
    a: ideas[noun],
  };
}

function printAnswer(facts) {
  const method = facts.dtgMain
    ? " The main design is printed with direct-to-garment (DTG) printing, where the ink soaks into the cotton instead of sitting on top as a thick layer."
    : "";
  return {
    q: `Will the print crack or fade?`,
    a: `With normal care it stays bright for a long time.${method} What makes prints crack or fade is mostly heat and harsh washing, so wash it inside out in cold water, avoid chlorine bleach, dry it on low or hang it, and don't iron over the design.`,
  };
}

function clothingFaq(facts, kind) {
  const noun = kind === "tshirts" ? "T-shirt" : kind === "hoodies" ? "hoodie" : "sweatshirt";
  const list = [shrinkAnswer(facts, noun), washAnswer(facts, noun), fitAnswer(facts, noun)];
  list.push(noun === "T-shirt" ? printAnswer(facts) : styleAnswer(noun));
  list.push(arrivalAnswer(noun), returnsAnswer(noun, false));
  return list;
}

// ---------------------------------------------------------------------------
// Mugs
// ---------------------------------------------------------------------------

function mugFaq(facts) {
  const list = [];

  if (facts.ounces.length) {
    const sizes = facts.ounces.map((oz) => `${oz} oz (${Math.round(oz * 29.5735)} ml)`);
    list.push({
      q: facts.ounces.length > 1 ? `What sizes does this mug come in?` : `How big is this mug?`,
      a:
        facts.ounces.length > 1
          ? `It comes in ${listWords(sizes)}. Choose the size in the menu above. 11 oz is a standard coffee mug; 15 oz holds a large latte, tea or hot chocolate.`
          : `It holds ${sizes[0]}.`,
    });
  }

  list.push({
    q: `Is it microwave safe?`,
    a:
      facts.microwave === "yes"
        ? `Yes, it's microwave-safe, so you can reheat your coffee or tea in it.`
        : facts.microwave === "no"
        ? `No, it shouldn't go in the microwave. Heat your drink separately and pour it in.`
        : `The maker's details for this mug don't list it as microwave-safe, so we recommend heating your drink separately and pouring it in.`,
  });

  list.push({
    q: `Is it dishwasher safe?`,
    a:
      facts.dishwasher === "yes"
        ? `Yes, it's dishwasher-safe${facts.topRack ? " (place it on the top rack)" : ""}. Washing by hand with warm, soapy water keeps the print brightest over years of use.`
        : facts.dishwasher === "no"
        ? `No, please wash it by hand with warm water and dish soap to protect the print.`
        : `Wash it by hand with warm water and dish soap to keep the print bright.`,
  });

  if (facts.leadFree) {
    list.push({
      q: `Is it lead-free?`,
      a: `The maker lists it as ${facts.leadFree.charAt(0).toLowerCase() + facts.leadFree.slice(1)}.`,
    });
  }

  list.push(arrivalAnswer("mug"), returnsAnswer("mug", true));
  return list;
}

// ---------------------------------------------------------------------------
// Bags
// ---------------------------------------------------------------------------

function bagFaq(facts, product) {
  const list = [];
  const noun = /weekender/i.test(`${product?.blueprintTitle} ${product?.title}`) ? "bag" : "tote bag";

  if (facts.dimensions || facts.sizesLine) {
    list.push({
      q: `How big is it? Will my laptop fit?`,
      a: facts.dimensions
        ? `It measures ${facts.dimensions.replace(/\s*-inch(es)?/i, " in").replace(/\s?[x×]\s?/i, " × ")}. Compare that with your laptop's width and height (most 13–14 inch laptops are about 12–13 inches wide) before you put one in.`
        : `${facts.sizesLine.replace(/;.*$/, "")}. Pick the size in the menu above; the measurements are shown there. Compare them with your laptop's width and height before you put one in.`,
    });
  }

  if (facts.material) {
    list.push({
      q: `What is it made of?`,
      a: `${cleanFeature(facts.material).replace(/^made from /, "").replace(/^./, (c) => c.toUpperCase())}.${facts.features.some((f) => /reinforced/i.test(f)) ? " The handles are reinforced for everyday carrying." : ""}`,
    });
  }

  const care = careSentence(facts.care);
  const ironNote = facts.care.some((line) => /iron/i.test(line))
    ? ""
    : " Avoid ironing directly over the print.";
  list.push({
    q: `Can I wash it?`,
    a: !care
      ? `Spot clean it or hand wash it in cool water with a little detergent, then let it air dry. Avoid bleach, the dryer and ironing over the print.`
      : facts.care.some((line) => /machine wash/i.test(line))
      ? `Yes. ${care}${ironNote}`
      : facts.care.some((line) => /spot clean/i.test(line))
      ? `Spot clean it rather than putting it in the washing machine. ${care}${ironNote}`
      : `Clean it by hand rather than in the washing machine. ${care}${ironNote}`,
  });

  list.push({
    q: `Can I use it as a carry-on or personal item on a plane?`,
    a: `Most airlines let you bring a bag like this as a personal item if it fits under the seat in front of you, but size limits differ by airline${facts.dimensions ? `, so compare this bag's size (above) with your airline's limit` : ", so check your airline's limit"} before you fly.`,
  });

  list.push(arrivalAnswer(noun), returnsAnswer(noun, true));
  return list;
}

// ---------------------------------------------------------------------------
// Phone cases
// ---------------------------------------------------------------------------

function caseFaq(facts) {
  const list = [
    {
      q: `Which phone models does it fit?`,
      a: `Choose your exact model in the phone model menu above: each case is made for that model, with openings for its buttons, ports and cameras. Only models listed in the menu are available, so check the name matches your phone (for example "Pro" or "Pro Max").`,
    },
  ];

  if (facts.magsafe || facts.wireless) {
    list.push({
      q: `Does it work with wireless charging and MagSafe?`,
      a:
        facts.magsafe === "yes"
          ? `Yes. It has built-in magnets for MagSafe, so it works with MagSafe chargers and accessories as well as wireless charging.`
          : facts.magsafe === "no"
          ? `It supports wireless charging, but it isn't a MagSafe case: it has no built-in magnets, so magnetic MagSafe accessories won't stick to it.`
          : facts.wireless === "yes"
          ? `It supports wireless charging. The maker's details don't mention MagSafe magnets, so magnetic accessories may not hold to it.`
          : `The maker's details say it doesn't support wireless charging.`,
    });
  }

  if (facts.caseBuild) {
    list.push({
      q: `How protective is it?`,
      a: `It's built for everyday protection: ${facts.features
        .filter((line) => /polycarbonate|tpu|liner|bezel/i.test(line))
        .slice(0, 2)
        .map(cleanFeature)
        .join("; ")}. It helps protect against everyday bumps and scratches, but no case can promise to prevent all damage.`,
    });
  }

  if (!facts.clearCase) {
    list.push({
      q: `Will it turn yellow or fade?`,
      a: `It isn't a clear case, and yellowing mostly affects clear cases.${facts.uvFinish ? " The printed finish is UV-protected to keep the colors bright." : ""} Keeping it out of long, direct sun and cleaning it gently keeps the design looking new.`,
    });
  }

  const care = careSentence(facts.care);
  list.push({
    q: `How do I clean it?`,
    a: care
      ? `Take it off your phone first. ${care} Avoid alcohol and harsh cleaners, which can damage the print.`
      : `Take it off your phone and wipe it with a soft cloth dampened with water and a drop of dish soap, then let it dry. Avoid alcohol and harsh cleaners, which can damage the print.`,
  });

  list.push(arrivalAnswer("case"), returnsAnswer("case", true));
  return list;
}

// ---------------------------------------------------------------------------

// [{ q, a }] for a product, or [] when its type is not one of ours.
// `collectionKey` is the product's collection ("hoodies", "mugs"...).
export function buildProductFaq(product, collectionKey) {
  if (!product) return [];

  const facts = readProductFacts(product);
  let list;

  switch (collectionKey) {
    case "hoodies":
    case "sweatshirts":
    case "tshirts":
      list = clothingFaq(facts, collectionKey);
      break;
    case "mugs":
      list = mugFaq(facts);
      break;
    case "totebags":
      list = bagFaq(facts, product);
      break;
    case "phonecases":
      list = caseFaq(facts);
      break;
    default:
      return [];
  }

  // When the description says too little for five answers, add the
  // order-change question (true for every product, from the site's policy).
  if (list.length < MIN_QUESTIONS) {
    list.splice(list.length - 2, 0, CHANGE_ORDER);
  }

  // Keep the shipping and returns answers (the last two) and trim the
  // product-specific ones so there are at most MAX_QUESTIONS.
  if (list.length > MAX_QUESTIONS) {
    list = [...list.slice(0, MAX_QUESTIONS - 2), ...list.slice(-2)];
  }

  return list;
}
