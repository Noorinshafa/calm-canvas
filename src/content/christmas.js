// Christmas gift picks and copy.
//
// This file is plain JavaScript with no React in it, so the page components
// and the build script (scripts/postbuild.mjs) read exactly the same text.
// Prices, photos and links always come from the live product list; only the
// short labels below are written by hand. A slug that no longer exists in the
// shop is skipped automatically, so removing a product never breaks the page.
//
// `tags` drive the filter buttons:
//   xmas  = Christmas picks      cozy = cozy winter wear     pet = dog & cat lovers
// ("Under $25" is worked out from each product's real price.)
//
// `home: true` marks the eight picks shown on the home page. The Christmas
// page shows all of them.

export const CHRISTMAS_PICKS = [
  {
    slug: "merry-christmas-script-mug",
    home: true,
    tags: ["xmas"],
    badge: "Christmas",
    line: "Coffee mug for a cozy Christmas morning",
    alt: "Merry Christmas Script Mug with a red glitter background, Christmas tree and gifts",
  },
  {
    slug: "red-glitter-drip-mug",
    home: true,
    tags: ["xmas"],
    badge: "Christmas",
    line: "Holiday sparkle coffee cup",
    alt: "Red glitter drip Christmas coffee mug with snowflakes on a wooden board",
  },
  {
    slug: "red-glitter-drip-phone-case",
    home: true,
    tags: ["xmas"],
    badge: "Christmas",
    line: "Christmas phone case and stocking stuffer",
    alt: "Red glitter and snowflake Christmas phone case",
  },
  {
    slug: "pink-ribbon-bow-hoodie",
    home: true,
    tags: ["cozy"],
    badge: "Cozy winter",
    line: "Cozy hoodie gift for her",
    alt: "Burgundy hoodie with a pink bow design",
  },
  {
    slug: "black-cat-trio-hoodie",
    home: true,
    tags: ["cozy", "pet"],
    badge: "Cozy winter",
    line: "Hoodie gift for cat lovers",
    alt: "Cream hoodie with three black cats in a row",
  },
  {
    slug: "schnauzer-pattern-tote-bag",
    home: true,
    tags: ["pet"],
    badge: "Dog lovers",
    line: "Tote gift for dog moms and dads",
    alt: "Tote bag with a schnauzer portrait surrounded by other dogs",
  },
  {
    slug: "cool-sunglasses-dog-mug",
    home: true,
    tags: ["pet"],
    badge: "Dog lovers",
    line: "Stocking stuffer for dog people",
    alt: "White mug with a dog in sunglasses and paw prints",
  },
  {
    slug: "gold-glitter-wave-weekender-bag",
    home: true,
    tags: ["xmas"],
    badge: "Holiday sparkle",
    line: "Holiday travel bag in burgundy and gold",
    alt: "Burgundy weekender bag with a gold glitter wave",
  },

  // More picks for the Christmas page only.
  {
    slug: "vintage-cat-with-glasses-sweatshirt",
    tags: ["cozy", "pet"],
    badge: "Cozy winter",
    line: "Sweatshirt gift for cat lovers",
  },
  {
    slug: "schnauzer-and-pack-of-dogs-crewneck-sweatshirt",
    tags: ["cozy", "pet"],
    badge: "Cozy winter",
    line: "Sweatshirt gift for dog lovers",
  },
  {
    slug: "meow-paw-print-hoodie",
    tags: ["cozy", "pet"],
    badge: "Cozy winter",
    line: "Hoodie gift for cat lovers",
  },
  {
    slug: "gorgeous-floral-be-kind-sweatshirt",
    tags: ["cozy"],
    badge: "Cozy winter",
    line: "Floral sweatshirt gift for her",
  },
  {
    slug: "silhouette-couple-holding-hands-hoodie",
    tags: ["cozy"],
    badge: "Cozy winter",
    line: "Hoodie gift for couples",
  },
  {
    slug: "red-marble-floral-latte-mug",
    tags: [],
    badge: "Gift for her",
    line: "Latte mug for tea and coffee lovers",
  },
  {
    slug: "watercolor-pink-floral-latte-mug",
    tags: [],
    badge: "Gift for her",
    line: "Pretty latte mug gift",
  },
];

export const CHRISTMAS_FILTERS = [
  { key: "all", label: "All gifts" },
  { key: "xmas", label: "Christmas picks" },
  { key: "cozy", label: "Cozy winter wear" },
  { key: "pet", label: "Dog & cat lovers" },
  { key: "u25", label: "Under $25" },
];

export const CHRISTMAS_UNDER = 25;

// The home page section.
export const CHRISTMAS_HOME = {
  heading: "Christmas gifts for",
  headingEm: "everyone on your list",
  lede:
    "Sparkly Christmas mugs, cozy hoodies for winter nights, phone cases and totes with real personality. Original Calm Canvas art, printed to order and easy to wrap.",
  button: "Shop all Christmas gifts",
  note: "Every item is made after you order, so place Christmas orders early.",
  trust: ["Original Calm Canvas art", "Printed to order", "Secure Safepay checkout"],
};

// The /christmas-gifts page.
export const CHRISTMAS_PAGE = {
  path: "/christmas-gifts",
  title: "Christmas Gifts for Her, Mugs & Cozy Hoodies",
  h1: "Christmas Gifts with Original Art",
  tagline:
    "Christmas mugs, cozy hoodies and sweatshirts, phone cases and totes, printed to order from original Calm Canvas artwork.",
  description:
    "Original-art Christmas mugs, cozy hoodies, phone cases and totes, printed to order. Find a gift for her, for dog lovers and for cat lovers.",
  ogImage: "/og/christmas-gifts.png",
  intro: [
    "Christmas gifts feel best when they say something about the person who opens them. Everything here is printed to order from original Calm Canvas artwork: sparkly red Christmas mugs, a holiday phone case, cozy hoodies and sweatshirts for winter nights, and totes and weekender bags for the person who is always on the move.",
    "Use the buttons above to narrow the list. Christmas picks are the pieces made for the season. Cozy winter wear gathers the hoodies and sweatshirts. Dog and cat lovers shows designs for people who adore their pets, and Under $25 shows the easiest stocking stuffers.",
  ],
  sections: [
    {
      heading: "Christmas gifts for her",
      paragraphs: [
        "A good gift for her is something she will use every day and enjoy looking at. A glittery Christmas coffee mug or latte mug turns a morning drink into a small ritual. A cozy hoodie or floral sweatshirt is made for slow weekends, and a printed phone case or weekender bag brings a bit of art into her everyday things.",
      ],
      links: [
        { to: "/mugs", text: "Browse all mugs" },
        { to: "/hoodies", text: "Browse all hoodies" },
        { to: "/sweatshirts", text: "Browse all sweatshirts" },
      ],
    },
    {
      heading: "Gifts for dog and cat lovers",
      paragraphs: [
        "If someone on your list talks about their pet all year, a design that celebrates it is a safe bet. There are dog portrait totes and mugs, plus cat hoodies and sweatshirts, and the mugs are an easy stocking stuffer.",
      ],
      links: [
        { to: "/totebags", text: "Browse tote bags" },
        { to: "/phonecases", text: "Browse phone cases" },
      ],
    },
    {
      heading: "Cozy hoodies and sweatshirts for winter",
      paragraphs: [
        "Hoodies and crewneck sweatshirts are some of the most useful gifts you can give in the colder months. Sizes are unisex, so check the size guide on each product page. If you are unsure, sizing up gives a relaxed, comfortable fit.",
      ],
      links: [
        { to: "/hoodies", text: "Browse hoodies" },
        { to: "/sweatshirts", text: "Browse sweatshirts" },
        { to: "/tshirts", text: "Browse T-shirts" },
      ],
    },
    {
      heading: "Ordering for Christmas",
      paragraphs: [
        "Every Calm Canvas item is printed after you order it, so it needs time to print before it ships. Place your Christmas order early and read the timings on our Shipping, Returns & Refunds page before you buy. Because each item is custom printed, check the size and options carefully before you pay.",
      ],
      links: [{ to: "/shipping-returns", text: "Shipping, returns & refunds" }],
    },
  ],
};

// Shows the home page section from 1 September until 26 December, and the
// countdown only until Christmas Day. Outside those dates the home page goes
// back to normal by itself; the /christmas-gifts page stays online all year
// so it keeps its place in search results from one season to the next.
export function christmasSeason(now = new Date()) {
  const month = now.getMonth(); // 0 = January
  const day = now.getDate();

  const visible = month >= 8 && !(month === 11 && day > 26);

  const today = new Date(now.getFullYear(), month, day);
  const christmas = new Date(now.getFullYear(), 11, 25);
  const daysLeft =
    today <= christmas ? Math.round((christmas - today) / 86400000) : null;

  return { visible, daysLeft };
}

export function daysLabel(daysLeft) {
  if (daysLeft === null) return "";
  if (daysLeft === 0) return "Merry Christmas";
  return `${daysLeft} ${daysLeft === 1 ? "day" : "days"} until Christmas`;
}

// Matches picks to real products, keeping the order written above. Picks whose
// product does not exist (or has no photo) are dropped.
export function resolvePicks(products, { homeOnly = false } = {}) {
  const bySlug = new Map(products.map((product) => [product.slug, product]));

  return CHRISTMAS_PICKS.filter((pick) => !homeOnly || pick.home)
    .map((pick) => ({ pick, product: bySlug.get(pick.slug) }))
    .filter(({ product }) => product && product.image && product.indexable !== false);
}

export function matchesFilter({ pick, product }, filter) {
  if (filter === "all") return true;
  if (filter === "u25") return Number(product.priceValue) < CHRISTMAS_UNDER;
  return pick.tags.includes(filter);
}
