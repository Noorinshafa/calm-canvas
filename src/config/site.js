// ---------------------------------------------------------------------------
// ONE place for everything SEO-related that must be identical in two places:
//   1. the React app (what visitors see), and
//   2. the build script scripts/postbuild.mjs (the plain HTML search engines
//      and link-preview bots receive before any JavaScript runs).
//
// This file is plain JavaScript with no imports so Node can load it directly
// during the build. Change a title/description/intro here and both places
// update together.
// ---------------------------------------------------------------------------

// The version of the site that Google should index. The non-www address
// already redirects here, so every canonical, sitemap, social and structured-
// data URL must use this exact form.
export const SITE_URL = "https://www.shopcalmcanvas.com";
export const SITE_NAME = "Calm Canvas";
export const CONTACT_EMAIL = "shopcalmcanvas@gmail.com";

export const DEFAULT_TITLE =
  "Calm Canvas | Aesthetic Hoodies, Tees, Mugs & Phone Cases";
export const DEFAULT_DESCRIPTION =
  "Shop original-art hoodies, sweatshirts, T-shirts, tote bags, phone cases and mugs. Printed on demand and made for you. Browse Calm Canvas.";

// 1200x630 branded banner used for social previews of pages that have no
// product photo of their own.
export const DEFAULT_OG_IMAGE = "/og/calm-canvas.png";

// Your public profiles. Add the full URL of each one you have (for example
// "https://www.instagram.com/yourname") and they are automatically added to
// the site's structured data so Google can connect them to the brand.
export const SOCIAL_LINKS = [];

// Main markets named in the product structured data (ISO country codes). The
// store itself ships to most countries worldwide -- the full list customers can
// pick at checkout is in src/config/countries.js.
export const SHIPPING_COUNTRIES = ["US", "GB", "CA", "AU", "PK"];

// Printed-to-order timing, matching the Shipping & Returns page.
export const HANDLING_DAYS = { min: 2, max: 7 };

export const CURRENCY = "USD";

// IndexNow lets Bing, Yandex and other search engines learn about new and
// changed pages immediately. The key is public by design: it is also saved as
// public/<key>.txt so the engines can confirm the site is yours.
export const INDEXNOW_KEY = "684d8dbabe7e6d3cdd581e662197de9e";

// ---------------------------------------------------------------------------
// Collections (category pages)
//
// `match` mirrors the rules that decide which products appear on each page,
// so the build script can list the same products in the HTML it generates.
// ---------------------------------------------------------------------------
export const COLLECTIONS = [
  {
    key: "hoodies",
    path: "/hoodies",
    nav: "Hoodies",
    noun: "hoodie",
    title: "Aesthetic Graphic Hoodies for Women & Men",
    h1: "Aesthetic Graphic Hoodies",
    tagline:
      "Discover premium oversized hoodies designed for comfort, elegance and everyday style.",
    eyebrow: "CALM CANVAS COLLECTION",
    description:
      "Shop cozy graphic hoodies with original artwork: watercolor florals, quiet illustrations and cat designs. Printed on demand and easy to gift.",
    intro: [
      "Our hoodies are printed to order with artwork you won't find on a store rack: soft watercolor florals, quiet line illustrations, playful cats and cozy autumn scenes. Choose from classic heavy-blend pullovers, midweight fleece hoodies, a full-zip style and all-over-print hoodies where the design wraps the whole piece.",
      "Every hoodie is made for you after you order it, with the artwork placed on the front, sleeves or back, so styles range from subtle to statement. Sizes are unisex, so check the size guide on each product page and size up for a roomier, relaxed fit. A hoodie with a design you love is an easy gift for anyone who likes art, nature or a calm, cozy look.",
    ],
    ogImage: "/og/hoodies.png",
    match: {
      keywords: ["hoodie", "hooded"],
      ids: [77, 450, 1525, 66],
      exclude: [],
    },
  },
  {
    key: "tshirts",
    path: "/tshirts",
    nav: "T-Shirts",
    noun: "T-shirt",
    title: "Graphic T-Shirts: Floral, Art & Gift Tees",
    h1: "Graphic T-Shirts & Art Tees",
    tagline:
      "Minimal, comfortable, and beautifully designed T-shirts created to bring art and personality into your everyday wardrobe.",
    eyebrow: "CALM CANVAS COLLECTION",
    description:
      "Graphic T-shirts with original illustrations, from floral bouquets to cats, dragons and romantic line art. Printed on demand. Find your next favorite tee.",
    intro: [
      "These T-shirts turn everyday dressing into a small piece of art. Browse floral bouquets, sunflower hearts, romantic silhouettes, fantasy illustrations and playful animal designs, printed on softstyle, heavy cotton, garment-dyed and women's-cut tees.",
      "Each shirt is made to order, so you pick the size and color you want and we print it for you. Tees are unisex unless the product page says otherwise, so check the size guide before you order. They layer easily under a hoodie or sweatshirt and make a thoughtful, affordable gift for friends who love art, animals or flowers. Softstyle tees are known for a smooth, lightweight feel, while heavy cotton tees feel classic and substantial. Every product page lists the sizes and colors available.",
    ],
    ogImage: "/og/tshirts.png",
    match: {
      keywords: ["t-shirt", "tee shirt", "tshirt"],
      ids: [6, 145, 281, 466, 706, 800, 1476],
      exclude: [],
    },
  },
  {
    key: "sweatshirts",
    path: "/sweatshirts",
    nav: "Sweatshirts",
    noun: "sweatshirt",
    title: "Crewneck Sweatshirts with Artistic Designs",
    h1: "Artistic Crewneck Sweatshirts",
    tagline:
      "Soft, comfortable sweatshirts designed for relaxed everyday style with the Calm Canvas aesthetic.",
    eyebrow: "CALM CANVAS COLLECTION",
    description:
      "Cozy crewneck sweatshirts with original art: Renaissance portraits, butterflies, sunflowers and cats. Printed on demand. Shop the collection.",
    intro: [
      "A crewneck sweatshirt is the easy, no-hood alternative to a hoodie, and ours carry artwork worth noticing. Browse watercolor butterflies, sunflower bouquets, Renaissance-inspired portraits, cat and dog illustrations and gentle lettering, printed on heavy-blend, lightweight and garment-dyed crewnecks.",
      "Each sweatshirt is printed after you order, often with a design on the back or sleeve as well as the front. Sizing is unisex, so compare your measurements with the size guide on the product page. They are a good fit for layering, working from home or giving as a gift to someone who loves a calm, artistic wardrobe. Open any design to see its sizes, colors and photos before you order.",
    ],
    ogImage: "/og/sweatshirts.png",
    match: {
      keywords: ["sweatshirt"],
      ids: [49, 1405, 1296, 446],
      exclude: ["hooded"],
    },
  },
  {
    key: "totebags",
    path: "/totebags",
    nav: "Tote Bags",
    noun: "tote bag",
    title: "Aesthetic Tote Bags & Weekender Bags",
    h1: "Aesthetic Tote & Weekender Bags",
    tagline:
      "Elegant tote bags designed to make every outing feel lighter, more organized, and effortlessly stylish.",
    eyebrow: "CALM CANVAS COLLECTION",
    description:
      "Floral and watercolor tote bags and large weekender bags with original artwork. Printed on demand. Everyday carry with a calm, artistic look.",
    intro: [
      "Carry a little art with you. Our tote bags and weekender bags feature watercolor florals, wildflower meadows, butterflies and seasonal patterns, printed on cotton canvas totes, all-over-print totes and large travel weekender bags with rope handles.",
      "Each bag is made to order, so nothing sits in a warehouse waiting for you. A canvas tote is a practical gift for book lovers, students and market shoppers, and a weekender bag suits short trips, the gym or a beach day. Pick the style that matches how you carry your day. Open any design to see its photos, size and options before you order.",
    ],
    ogImage: "/og/totebags.png",
    match: {
      keywords: ["bag", "tote"],
      ids: [1313, 1389, 326],
      exclude: [],
    },
  },
  {
    key: "phonecases",
    path: "/phonecases",
    nav: "Phone Cases",
    noun: "phone case",
    title: "Aesthetic Phone Cases: Floral & Art Designs",
    h1: "Aesthetic Phone Cases",
    tagline:
      "Premium phone cases that combine everyday protection with artistic designs you'll enjoy carrying everywhere.",
    eyebrow: "CALM CANVAS COLLECTION",
    description:
      "Protective phone cases with floral, watercolor and illustrated designs. Tough, slim, flexi and magnetic styles, printed on demand. Choose your phone model.",
    intro: [
      "Give your phone the same calm, artistic look as the rest of your day. Our phone cases feature pastel florals, cherry blossoms, butterflies, daisy vines and vintage scenes, printed on tough, slim, flexi, impact-resistant and magnetic cases.",
      "Pick your phone model on each product page and the case is printed for that exact fit. Tough and impact-resistant styles add everyday protection, while slim and flexi cases keep your phone light. A printed phone case is also an easy small gift for friends who like pretty, personal things. Not sure your model is available? Open a case and check the model list on its product page before you order.",
    ],
    ogImage: "/og/phonecases.png",
    match: {
      keywords: ["case", "cases"],
      ids: [268, 269, 370, 421, 841, 1521, 1273],
      exclude: [],
    },
  },
  {
    key: "mugs",
    path: "/mugs",
    nav: "Mugs",
    noun: "mug",
    title: "Ceramic Coffee Mugs with Floral & Art Prints",
    h1: "Floral & Artistic Coffee Mugs",
    tagline:
      "Beautiful mugs made for peaceful mornings, cozy evenings, and every warm drink that brightens your day.",
    eyebrow: "CALM CANVAS COLLECTION",
    description:
      "Ceramic coffee mugs with watercolor poppies, tulips, daisies and more. 11oz and 15oz sizes, printed on demand. A pretty gift for tea and coffee lovers.",
    intro: [
      "Make the morning feel a little slower. Our ceramic mugs carry watercolor poppies, tulips, daisies, butterflies and playful illustrations, available in 11oz and 15oz sizes, plus latte mugs, accent mugs with a colored handle and black mugs.",
      "Every mug is made to order. Choose the size that suits your cup of tea or coffee, then enjoy a design that looks lovely on a desk or kitchen shelf. A printed mug is one of the easiest gifts to send, whether it's for a birthday, a thank-you or a friend who deserves a calm cup. Check the size options on each mug's page to see whether 11oz, 15oz or both are available.",
    ],
    ogImage: "/og/mugs.png",
    match: {
      keywords: ["mug", "mugs"],
      ids: [68, 478, 425, 479, 289, 635, 583, 1151],
      exclude: [],
    },
  },
];

// ---------------------------------------------------------------------------
// Other pages
// ---------------------------------------------------------------------------
export const PAGES = {
  home: {
    path: "/",
    title: "", // empty = use DEFAULT_TITLE exactly
    description: DEFAULT_DESCRIPTION,
    ogImage: DEFAULT_OG_IMAGE,
  },
  collections: {
    path: "/collections",
    title: "Shop Hoodies, Tees, Mugs & Phone Cases",
    description:
      "Browse every Calm Canvas collection: hoodies, sweatshirts, T-shirts, tote bags, phone cases and mugs with original artwork, printed on demand.",
    ogImage: DEFAULT_OG_IMAGE,
  },
  about: {
    path: "/about",
    title: "About Calm Canvas",
    description:
      "Calm Canvas makes artwork-led hoodies, tees, mugs and more, printed on demand after you order. Learn how we work and how to reach us.",
    ogImage: DEFAULT_OG_IMAGE,
  },
  contact: {
    path: "/contact",
    title: "Contact Us",
    description:
      "Questions about an order, a design or a collaboration? Contact Calm Canvas by email. We aim to reply within 2 business days.",
    ogImage: DEFAULT_OG_IMAGE,
  },
  shipping: {
    path: "/shipping-returns",
    title: "Shipping, Returns & Refunds",
    description:
      "How long Calm Canvas orders take to print and ship, how cancellations work, and our policy for damaged or incorrect items and refunds.",
    ogImage: DEFAULT_OG_IMAGE,
  },
  terms: {
    path: "/terms",
    title: "Terms & Conditions",
    description:
      "The terms and conditions for using the Calm Canvas website and placing orders.",
    ogImage: DEFAULT_OG_IMAGE,
  },
  privacy: {
    path: "/privacy-policy",
    title: "Privacy Policy",
    description:
      "How Calm Canvas collects, uses and protects your personal data when you browse and order.",
    ogImage: DEFAULT_OG_IMAGE,
  },
  blog: {
    path: "/blog",
    title: "The Calm Canvas Journal: Gift & Style Ideas",
    description:
      "Gift guides, styling ideas and cozy-aesthetic inspiration from Calm Canvas. Find the right hoodie, mug, tote or phone case for someone you love.",
    ogImage: DEFAULT_OG_IMAGE,
  },
};

// Pages that must never appear in search results.
export const NOINDEX_PATHS = ["/cart", "/checkout", "/order-success"];

// About-page copy (shared by the React page and the generated HTML).
export const ABOUT_SECTIONS = [
  {
    heading: "What Calm Canvas is",
    paragraphs: [
      "Calm Canvas is an online store for artwork-led everyday pieces: hoodies, sweatshirts, T-shirts, tote bags, phone cases and mugs. Our designs lean toward calm and thoughtful: soft watercolor florals, quiet illustrations, cozy seasonal scenes and a few playful surprises.",
    ],
  },
  {
    heading: "Made when you order it",
    paragraphs: [
      "Nothing is kept in a warehouse waiting for a buyer. Each item is printed on demand after you order it by our print partners, which means less waste and no overstock. Please allow around 2–7 business days for printing and preparation, plus delivery time to your location.",
    ],
  },
  {
    heading: "If something isn't right",
    paragraphs: [
      "If your order arrives damaged, defective or not as ordered, we'll make it right with a free reprint or a full refund when you contact us within 14 days of delivery. The full details are on our Shipping, Returns & Refunds page.",
    ],
  },
  {
    heading: "Get in touch",
    paragraphs: [
      `Questions, collaboration ideas or help with an order? Email ${CONTACT_EMAIL}. We aim to reply within 2 business days.`,
    ],
  },
];

// Shipping & Returns copy (shared by the React page and the generated HTML).
export const SHIPPING_SECTIONS = [
  {
    heading: "Order Processing & Shipping",
    paragraphs: [
      "Every Calm Canvas item is made specially for you when you order it — nothing is pre-made or kept in a warehouse. Because of this, please allow around 2–7 business days for your order to be printed and prepared before it ships. Delivery time on top of that varies by your location and the shipping method used, and is handled by our production and courier partners once your order leaves production.",
    ],
  },
  {
    heading: "Order Cancellations & Changes",
    paragraphs: [
      `Because production begins shortly after an order is placed, we can only cancel or change an order (such as the size, color, or shipping address) if you contact us within a few hours of placing it, before it has entered production. Once an order has entered production, it can no longer be cancelled, changed, or refunded for reasons other than those described below. If you need to make a change, email us immediately at ${CONTACT_EMAIL} with your order number.`,
    ],
  },
  {
    heading: "Returns & Exchanges",
    paragraphs: [
      "Because every item is custom printed specifically for you, we're unable to accept returns or exchanges for reasons such as ordering the wrong size or simply changing your mind. Please check our size guide carefully on each product page before ordering.",
    ],
  },
  {
    heading: "Damaged, Defective, or Incorrect Items",
    paragraphs: [
      `If your order arrives damaged, defective, or isn't what you ordered, we will make it right — at no cost to you — with a free reprint or a full refund. To request this, simply email us at ${CONTACT_EMAIL} within 14 days of delivery, including your order number and a photo of the issue, and we'll take care of the rest.`,
    ],
  },
  {
    heading: "Refunds",
    paragraphs: [
      "Once a refund is approved, it is issued back to your original payment method through Safepay, our payment processor, and is typically reflected within 5–10 business days, depending on your bank.",
    ],
  },
];

// Real questions customers ask, answered from the policies above. Used for
// the FAQ section and FAQPage structured data on the Shipping & Returns page.
export const SHIPPING_FAQ = [
  {
    q: "How long does it take to receive my order?",
    a: "Each item is printed after you order it, so please allow around 2–7 business days for printing and preparation. Delivery time then depends on your location and the shipping method.",
  },
  {
    q: "Can I return an item if the size is wrong?",
    a: "Because every item is custom printed for you, we can't accept returns or exchanges for the wrong size or a change of mind, so please check the size guide before ordering. Damaged, defective or incorrect items are replaced or refunded.",
  },
  {
    q: "What if my order arrives damaged?",
    a: `Email ${CONTACT_EMAIL} within 14 days of delivery with your order number and a photo of the issue. We'll send a free reprint or issue a full refund.`,
  },
  {
    q: "Can I cancel or change my order?",
    a: "Only within a few hours of placing it, before it enters production. Email us right away with your order number.",
  },
  {
    q: "How long do refunds take?",
    a: "Approved refunds go back to your original payment method through Safepay and usually appear within 5–10 business days, depending on your bank.",
  },
];

export function getCollection(key) {
  return COLLECTIONS.find((collection) => collection.key === key);
}

export function getCollectionByPath(path) {
  return COLLECTIONS.find((collection) => collection.path === path);
}
