// Theme gift pages: cat lovers, dog lovers, floral & watercolor, Halloween.
//
// Each theme is a landing page for something people search for by name
// ("gifts for cat lovers", "schnauzer bag", "floral hoodie"). The page text
// below is written by hand. The products on each page are NOT listed by hand:
// every product whose name contains one of the theme's words is included, so a
// new design added in Printify (for example "Orange Tabby Cat Hoodie")
// appears on the right page by itself after the next build.
//
// This file is plain JavaScript with no React in it, so the page component,
// the build script (scripts/postbuild.mjs) and the sitemap (api/sitemap.js)
// all read exactly the same text. Relative imports must keep the ".js"
// extension because Node loads this file too.
//
// To add a theme: add an entry below, then add its path to vercel.json (one
// more "rewrites" block, copy the cat-lover-gifts one) and a <Route> in
// src/App.jsx. The sitemap and the build script pick it up automatically.

const SIZING_AND_ORDERING = {
  heading: "Sizing and ordering",
  paragraphs: [
    "Hoodies, sweatshirts and tees are unisex, so check the size guide on the product page and size up if you want a roomier fit. Every item is printed after you order it, so allow about 2-7 business days to print plus delivery, and order early if the gift has a date. Because each item is custom printed, we can't accept returns for the wrong size or a change of mind. If something arrives damaged, defective or incorrect, contact us within 14 days and we will replace or refund it.",
  ],
  links: [{ to: "/shipping-returns", text: "Shipping, returns & refunds" }],
};

export const THEME_PAGES = [
  {
    key: "cat-lovers",
    path: "/cat-lover-gifts",
    nav: "Cat Lover Gifts",
    eyebrow: "CAT DESIGNS",
    title: "Cat Lover Gifts: Cat Hoodies, Sweatshirts & Mugs",
    h1: "Gifts for Cat Lovers",
    tagline:
      "Original cat designs on hoodies, sweatshirts, tees and mugs, printed to order. From a black cat trio to a city-night cat, there is a design for every cat person.",
    description:
      "Cat hoodies, sweatshirts, tees and mugs with original cat artwork, printed to order. Gift ideas for cat lovers, cat moms and anyone who adores their cat.",
    // A product is on this page when its name contains one of these whole
    // words (and none of the optional excludeWords).
    words: ["cat", "cats", "kitten", "kittens", "meow"],
    intro: [
      "Cat people like gifts that show it. Every design on this page features a cat, from a black cat trio on a hoodie to a vintage cat in glasses and a hungry orange cat on a long-sleeve tee. All of it is printed to order from original ShopCalmCanvas artwork.",
      "Hoodies and sweatshirts are the cozy picks for cooler months, a mug is an easy stocking stuffer, and a tee works all year. Open any design to see its photos, sizes and colors before you order.",
    ],
    sections: [
      {
        heading: "Choosing a gift for a cat lover",
        paragraphs: [
          "Think about how the person lives. A cat mom who works from home will get a lot of wear out of a hoodie or sweatshirt, and the City Nightscape Cat Mug is a quiet, everyday gift for a tea or coffee drinker. For someone who likes a playful look, try the Black Cat 'Meow' Sign Sweatshirt or the Hungry Orange Cat long sleeve tee.",
          "Our journal has a longer guide to which designs suit which kind of cat person.",
        ],
        links: [
          { to: "/blog/gifts-for-cat-lovers", text: "Read: gifts for cat lovers" },
          { to: "/hoodies", text: "Browse all hoodies" },
          { to: "/sweatshirts", text: "Browse all sweatshirts" },
          { to: "/mugs", text: "Browse all mugs" },
        ],
      },
      SIZING_AND_ORDERING,
      {
        heading: "More gifts for pet lovers and the holidays",
        paragraphs: [
          "Have a dog person on your list too? See our dog lover gifts. For the holidays, the Christmas gifts page includes a cozy Christmas cat sweatshirt.",
        ],
        links: [
          { to: "/dog-lover-gifts", text: "Dog lover gifts" },
          { to: "/christmas-gifts", text: "Christmas gifts" },
        ],
      },
    ],
  },

  {
    key: "dog-lovers",
    path: "/dog-lover-gifts",
    nav: "Dog Lover Gifts",
    eyebrow: "DOG DESIGNS",
    title: "Dog Lover Gifts: Schnauzer, Pitbull & Dog Designs",
    h1: "Gifts for Dog Lovers",
    tagline:
      "Dog designs on totes, sweatshirts, tees, mugs and phone cases, printed to order, including schnauzer, pitbull and Australian shepherd artwork.",
    description:
      "Dog lover gifts printed to order: a schnauzer tote, dog sweatshirts, a pitbull tee, a dog mug and dog phone cases. Original artwork for dog moms and dads.",
    words: ["dog", "dogs", "puppy", "puppies", "schnauzer", "pitbull", "shepherd"],
    intro: [
      "If someone on your list talks about their dog all year, a design that celebrates dogs is a safe bet. This page gathers every dog design in the shop: a schnauzer portrait tote with a pack of other dogs, a schnauzer sweatshirt, a red-eyed pitbull illustration tee, an Australian shepherd in a witch hat, a dog in sunglasses on a mug, and dog-face phone cases.",
      "Totes, mugs and phone cases are easy gifts because there is no size to guess. Sweatshirts and tees are unisex, so check the size guide on each product page.",
    ],
    sections: [
      {
        heading: "Gifts for dog moms and dads",
        paragraphs: [
          "A tote bag suits someone who is always out and about with their dog, a mug makes a good stocking stuffer, and a phone case is a small gift they see every day. For a cozy gift, the Schnauzer and Pack of Dogs Crewneck Sweatshirt is made for cooler months.",
        ],
        links: [
          { to: "/totebags", text: "Browse tote bags" },
          { to: "/mugs", text: "Browse mugs" },
          { to: "/phonecases", text: "Browse phone cases" },
        ],
      },
      {
        heading: "Schnauzer, pitbull and shepherd designs",
        paragraphs: [
          "Breed designs mean more to people who love that breed. The shop currently has schnauzer artwork on a tote and a sweatshirt, a pitbull illustration on a tee and an Australian shepherd on a sweatshirt. If your dog is another breed, the more general dog designs on this page may still fit.",
        ],
      },
      SIZING_AND_ORDERING,
      {
        heading: "More gifts for pet lovers",
        paragraphs: [
          "Buying for a cat person as well? See our cat lover gifts, or browse the Christmas gifts page for holiday ideas.",
        ],
        links: [
          { to: "/cat-lover-gifts", text: "Cat lover gifts" },
          { to: "/christmas-gifts", text: "Christmas gifts" },
        ],
      },
    ],
  },

  {
    key: "floral",
    path: "/floral-gifts",
    nav: "Floral Gifts",
    eyebrow: "FLORAL & WATERCOLOR",
    title: "Floral Gifts for Her: Hoodies, Bags, Mugs & Cases",
    h1: "Floral & Watercolor Gifts",
    tagline:
      "Watercolor florals, wildflowers, tulips, daisies and sunflowers on hoodies, sweatshirts, tees, tote and weekender bags, mugs and phone cases, all printed to order.",
    description:
      "Floral and watercolor gifts printed to order: hoodies, sweatshirts, tees, weekender and tote bags, mugs and phone cases with original flower artwork.",
    words: [
      "floral",
      "flower",
      "flowers",
      "wildflower",
      "wildflowers",
      "tulip",
      "tulips",
      "daisy",
      "daisies",
      "poppy",
      "poppies",
      "rose",
      "roses",
      "sunflower",
      "sunflowers",
      "botanical",
      "lavender",
      "hollyhock",
      "blossom",
      "bouquet",
      "bloom",
      "watercolor",
      "butterfly",
      "butterflies",
    ],
    // Not floral, even though it is a watercolor design.
    excludeWords: ["samurai"],
    intro: [
      "Flowers are one of the easiest themes to give. They suit almost anyone, they work in every season, and they look good on things people use every day. This page collects the floral and botanical designs in the shop, from watercolor poppies and tulips to wildflower meadows, daisies, sunflowers and roses.",
      "Choose the item first, then the design. A mug or phone case is a small, low-risk gift. A tote or weekender bag is practical for travel and everyday errands. A hoodie, sweatshirt or tee is more personal once you know the size.",
    ],
    sections: [
      {
        heading: "Floral gifts for her",
        paragraphs: [
          "A floral mug or latte mug turns a morning drink into a small ritual, and a floral phone case brings a bit of art into everyday things. For someone who travels, a floral weekender bag suits short trips, the gym or a beach day.",
        ],
        links: [
          { to: "/mugs", text: "Browse all mugs" },
          { to: "/phonecases", text: "Browse all phone cases" },
          { to: "/totebags", text: "Browse tote and weekender bags" },
        ],
      },
      {
        heading: "Watercolor and wildflower designs",
        paragraphs: [
          "Many of these designs are in a watercolor style. Look for the Watercolor Floral Pattern Hoodie, the Pink Watercolor Floral Weekender Bag and the Watercolor Wildflower Botanical Tote Bag. If you want something small and affordable, our journal has a guide to gifts under $35.",
        ],
        links: [
          { to: "/hoodies", text: "Browse all hoodies" },
          { to: "/sweatshirts", text: "Browse all sweatshirts" },
          { to: "/blog/cozy-gift-ideas-under-35", text: "Read: cozy gift ideas under $35" },
        ],
      },
      SIZING_AND_ORDERING,
    ],
  },

  {
    key: "halloween",
    path: "/halloween",
    nav: "Halloween & Spooky",
    eyebrow: "HALLOWEEN & SPOOKY",
    title: "Halloween & Spooky Designs: Shirts, Hoodies & Mugs",
    h1: "Halloween & Spooky Designs",
    tagline:
      "Ghosts, skulls, spiders, bats and witches on shirts, hoodies, sweatshirts, mugs, totes and phone cases, printed to order.",
    description:
      "Halloween and spooky designs printed to order: ghost sweatshirts, skull and skeleton tees, spider web hoodies, bat phone cases and Halloween mugs.",
    words: [
      "halloween",
      "spooky",
      "ghost",
      "ghosts",
      "spider",
      "spiderweb",
      "bat",
      "bats",
      "skull",
      "skulls",
      "skeleton",
      "witch",
      "vampire",
      "haunted",
      "jack-o'-lantern",
      "boo",
      "bootiful",
    ],
    intro: [
      "This page gathers the shop's Halloween and spooky designs: ghosts, skulls and skeletons, spiders and webs, bats, witches and a jack-o'-lantern. Some are made for October, like the Spooky Mama Halloween mom shirt and the ghost sweatshirts. Others, like the skull and spider web designs, are dark and graphic enough to wear all year.",
      "Everything is printed after you order, so for Halloween, order well before the date. Allow about 2-7 business days to print plus delivery.",
    ],
    sections: [
      {
        heading: "Halloween shirts, hoodies and sweatshirts",
        paragraphs: [
          "Tees are the easy choice for a party or a school day, and hoodies and sweatshirts are the cozy option when the evening turns cold. Sizing is unisex, so check the size guide on each product page.",
        ],
        links: [
          { to: "/tshirts", text: "Browse all T-shirts" },
          { to: "/hoodies", text: "Browse all hoodies" },
          { to: "/sweatshirts", text: "Browse all sweatshirts" },
        ],
      },
      {
        heading: "Skull and skeleton designs for any time of year",
        paragraphs: [
          "Skull, skeleton and spider web designs are not only for October. The Die First Skull Flames T-Shirt, the Distressed Skull Graphic Tee and the Royal Skull Crown Hoodie are graphic pieces that work all year.",
        ],
      },
      {
        heading: "Small Halloween gifts",
        paragraphs: [
          "Not sure about sizes? A Halloween mug, or a ghost, bat or spider web phone case, is an easy gift or party favor.",
        ],
        links: [
          { to: "/mugs", text: "Browse all mugs" },
          { to: "/phonecases", text: "Browse all phone cases" },
        ],
      },
      SIZING_AND_ORDERING,
    ],
  },
];

export function getTheme(key) {
  return THEME_PAGES.find((theme) => theme.key === key);
}

// "Name | extra keywords" -> "Name" (same rule as cleanProductName in
// src/utils/seoShared.js, repeated here so this file has no imports).
function productName(product) {
  return String(product?.title || "").split("|")[0];
}

function hasWholeWord(text, word) {
  const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(^|[^a-z0-9])${escaped}($|[^a-z0-9])`, "i").test(text);
}

export function productInTheme(product, theme) {
  const name = productName(product);

  if ((theme.excludeWords || []).some((word) => hasWholeWord(name, word))) {
    return false;
  }

  return theme.words.some((word) => hasWholeWord(name, word));
}

// Every product that belongs on the theme's page, in catalog order. Products
// hidden from search engines are left out.
export function themeProducts(theme, products) {
  if (!Array.isArray(products)) return [];

  return products.filter(
    (product) =>
      product && product.indexable !== false && productInTheme(product, theme)
  );
}

// The theme pages a product belongs to (used for the "More designs like
// this" links on product pages), at most `limit`.
export function themesForProduct(product, limit = 3) {
  if (!product) return [];

  return THEME_PAGES.filter((theme) => productInTheme(product, theme)).slice(
    0,
    limit
  );
}
