// The photos on the home page (and in the menu's Shop panel).
//
// Every photo is a real product from the shop, photographed by Printify: a
// real model wearing it ("person" photos) or the product on its own ("front"
// photos), both on a plain white background that the page shows on its light
// grey (see .studio in home.css). Nothing here is AI-generated.
//
// `slug` is the product the photo links to. If that product is ever removed
// from the shop, the photo is replaced by one from a product that still exists
// (see src/hooks/useHomePhoto.js), so
// the home page never shows a broken picture.
//
// To change a photo: open the product in Printify, copy the address of the
// mockup you want (it contains "camera_label=..."), and paste it as `src`.
// Only addresses from images-api.printify.com/mockup/ can be resized by the
// site (see src/utils/imageUrl.js).

// The banner at the top of the home page: the heading, text and buttons stay
// still, and behind them three little "studio sets" take turns every few
// seconds. Each set is a painted plaster wall in white or grey (made by code, see
// src/assets/home/wall-*.webp) with an arch and a round plinth (drawn with
// CSS), and three real shop products on it: Printify's plain "front" photos,
// whose white background blends into the wall (see .hero-set in hero.css).
//   wall   "white", "grey" or "stone"
//   season "christmas" = only 1 November to 26 December, "rest" = only the
//          rest of the year, left out = always shown
//   main   the large product in front of the arch
//   side   a smaller product leaning on the left
//   plinth the product standing on the plinth (a mug looks best)
//   tag    the small link under the set
// The first set's main photo is the page's largest picture:
// scripts/postbuild.mjs tells the browser to start downloading it at once.
export const HERO_SETS = [
  {
    key: "cozy",
    wall: "white",
    tag: { label: "Shop hoodies", path: "/hoodies" },
    main: {
      slug: "watercolor-butterflies-hoodie",
      collection: "hoodies",
      name: "Watercolor Butterflies Hoodie",
      src: "https://images-api.printify.com/mockup/6a8a08a6346a01c09106e0c3/33379/98424/watercolor-butterflies-hoodie-pastel-pink-blue-green-butterfly-sweatshirt.jpg?camera_label=front",
    },
    side: {
      slug: "pink-strawberry-daisy-pattern-slim-phone-case",
      collection: "phonecases",
      name: "Pink Strawberry Daisy Phone Case",
      src: "https://images-api.printify.com/mockup/6abe376a502f8eabca0df000/130103/111286/pink-strawberry-daisy-pattern-slim-phone-case-pastel-floral-hearts.jpg?camera_label=front",
    },
    plinth: {
      slug: "hanging-daisy-floral-mug",
      collection: "mugs",
      name: "Hanging Daisy Floral Mug",
      src: "https://images-api.printify.com/mockup/6a95dffd0e3c28244a0b80e4/96176/108345/hanging-daisy-floral-mug-ceramic-coffee-cup-11oz-15oz.jpg?camera_label=front",
    },
  },
  {
    key: "christmas",
    season: "christmas",
    wall: "grey",
    tag: { label: "Shop Christmas gifts", path: "/christmas-gifts" },
    main: {
      slug: "christmas-penguin-and-tree-merry-christmas-sweatshirt",
      collection: "sweatshirts",
      name: "Christmas Penguin Sweatshirt",
      src: "https://images-api.printify.com/mockup/6adf8247c392daed6500d74f/25462/98502/christmas-penguin-and-tree-merry-christmas-sweatshirt.jpg?camera_label=front",
    },
    side: {
      slug: "pink-strawberry-daisy-pattern-slim-phone-case",
      collection: "phonecases",
      name: "Pink Strawberry Daisy Phone Case",
      src: "https://images-api.printify.com/mockup/6abe376a502f8eabca0df000/130103/111286/pink-strawberry-daisy-pattern-slim-phone-case-pastel-floral-hearts.jpg?camera_label=front",
    },
    plinth: {
      slug: "red-glitter-drip-mug",
      collection: "mugs",
      name: "Red Glitter Drip Mug",
      src: "https://images-api.printify.com/mockup/6a7f5bada00da47900093706/71302/12360/red-glitter-drip-mug-holiday-sparkle-coffee-cup.jpg?camera_label=front",
    },
  },
  {
    key: "gifts",
    season: "rest",
    wall: "grey",
    tag: { label: "Shop mugs", path: "/mugs" },
    main: {
      slug: "pink-ribbon-bow-hoodie",
      collection: "hoodies",
      name: "Pink Ribbon Bow Hoodie",
      src: "https://images-api.printify.com/mockup/6a89d4437087bb9709071f9d/42229/98424/pink-ribbon-bow-hoodie-cute-bow-sleeve-design.jpg?camera_label=front",
    },
    side: {
      slug: "sunflower-field-tough-phone-case",
      collection: "phonecases",
      name: "Sunflower Field Phone Case",
      src: "https://images-api.printify.com/mockup/6a888966a9520d71fa0e90a1/112814/106392/sunflower-field-tough-phone-case.jpg?camera_label=front",
    },
    plinth: {
      slug: "yellow-and-red-tulips-mug",
      collection: "mugs",
      name: "Yellow and Red Tulips Mug",
      src: "https://images-api.printify.com/mockup/6a95a10fe5757574e30522e0/65216/6310/yellow-and-red-tulips-mug-ceramic-floral-coffee-cup.jpg?camera_label=front",
    },
  },
  {
    key: "sweatshirts",
    wall: "stone",
    tag: { label: "Shop sweatshirts", path: "/sweatshirts" },
    main: {
      slug: "watercolor-purple-and-pink-butterflies-crewneck-sweatshirt",
      collection: "sweatshirts",
      name: "Watercolor Butterflies Sweatshirt",
      src: "https://images-api.printify.com/mockup/6a8a0dd23ca68b402a0fd6e0/25448/98502/watercolor-purple-and-pink-butterflies-crewneck-sweatshirt.jpg?camera_label=front",
    },
    side: {
      slug: "sunflower-field-tough-phone-case",
      collection: "phonecases",
      name: "Sunflower Field Phone Case",
      src: "https://images-api.printify.com/mockup/6a888966a9520d71fa0e90a1/112814/106392/sunflower-field-tough-phone-case.jpg?camera_label=front",
    },
    plinth: {
      slug: "yellow-and-red-tulips-mug",
      collection: "mugs",
      name: "Yellow and Red Tulips Mug",
      src: "https://images-api.printify.com/mockup/6a95a10fe5757574e30522e0/65216/6310/yellow-and-red-tulips-mug-ceramic-floral-coffee-cup.jpg?camera_label=front",
    },
  },
];

// The sets shown today: three, whatever the season.
export function heroSetsFor(festive) {
  return HERO_SETS.filter(
    (set) => !set.season || set.season === (festive ? "christmas" : "rest")
  );
}

// How wide each product photo is on screen, so the browser picks the right
// copy. The set is drawn on a stage up to 820px wide (the full width on
// phones); the main product is 62% of it, the others about 20%. Must match
// .hero-stage in hero.css; scripts/postbuild.mjs uses MAIN for its early
// download.
export const HERO_MAIN_SIZES = "(max-width: 1023px) 62vw, 510px";
export const HERO_MAIN_WIDTHS = [384, 768];
export const HERO_SMALL_SIZES = "(max-width: 1023px) 22vw, 180px";
export const HERO_SMALL_WIDTHS = [256, 384];

// "Shop by category": one large photo per collection.
// kind "model": a real model wearing the product (fills the tile).
// kind "front": the product on its own (shown whole, centred).
export const CATEGORY_TILES = [
  {
    key: "hoodies",
    label: "Hoodies",
    path: "/hoodies",
    slug: "watercolor-butterflies-hoodie",
    kind: "model",
    src: "https://images-api.printify.com/mockup/6a8a08a6346a01c09106e0c3/33379/98427/watercolor-butterflies-hoodie-pastel-pink-blue-green-butterfly-sweatshirt.jpg?camera_label=person-1",
    alt: "Woman wearing a purple hoodie with pastel watercolour butterflies",
  },
  {
    key: "sweatshirts",
    label: "Sweatshirts",
    path: "/sweatshirts",
    slug: "watercolor-purple-and-pink-butterflies-crewneck-sweatshirt",
    kind: "model",
    src: "https://images-api.printify.com/mockup/6a8a0dd23ca68b402a0fd6e0/25448/98507/watercolor-purple-and-pink-butterflies-crewneck-sweatshirt.jpg?camera_label=person-4",
    alt: "Woman wearing a light pink sweatshirt with purple and pink butterflies",
  },
  {
    key: "tshirts",
    label: "T-Shirts",
    path: "/tshirts",
    slug: "sketch-dragon-t-shirt",
    kind: "model",
    src: "https://images-api.printify.com/mockup/6a9d442d4cf105d9a00d2649/38185/100619/sketch-dragon-t-shirt-black-ink-fantasy-dragon-illustration.jpg?camera_label=person-2-front",
    alt: "Man wearing a light blue T-shirt with a black ink dragon sketch",
  },
  {
    key: "mugs",
    label: "Mugs",
    path: "/mugs",
    slug: "hanging-daisy-floral-mug",
    kind: "front",
    src: "https://images-api.printify.com/mockup/6a95dffd0e3c28244a0b80e4/96176/108345/hanging-daisy-floral-mug-ceramic-coffee-cup-11oz-15oz.jpg?camera_label=front",
    alt: "Black mug with hanging green vines and white daisies",
  },
  {
    key: "totebags",
    label: "Tote Bags",
    path: "/totebags",
    slug: "watercolor-wildflower-botanical-tote-bag",
    kind: "model",
    src: "https://images-api.printify.com/mockup/688a2b8722a87b68c70e0d1a/103602/108946/watercolor-wildflower-botanical-tote-bag.jpg?camera_label=person-3",
    alt: "Woman carrying a white tote bag with watercolour wildflowers",
  },
  {
    key: "phonecases",
    label: "Phone Cases",
    path: "/phonecases",
    slug: "sunflower-field-tough-phone-case",
    kind: "front",
    src: "https://images-api.printify.com/mockup/6a888966a9520d71fa0e90a1/112814/106392/sunflower-field-tough-phone-case.jpg?camera_label=front",
    alt: "Dark green phone case with a field of sunflowers",
  },
];

// The banners below (Christmas, brand): the photo panel is half the page wide
// on computers and the full width on phones and tablets, and the square photo
// covers it, so the copy needed is as wide as the panel. Must match
// .home-band-media in home.css.
export const BAND_SIZES = "(max-width: 1023px) 100vw, 50vw";
export const BAND_WIDTHS = [384, 768, 1024];

// The large photo in the Christmas banner (1 November to 26 December).
export const CHRISTMAS_LOOK = {
  slug: "christmas-penguin-and-tree-merry-christmas-sweatshirt",
  name: "Christmas Penguin Sweatshirt",
  src: "https://images-api.printify.com/mockup/6adf8247c392daed6500d74f/25462/98504/christmas-penguin-and-tree-merry-christmas-sweatshirt.jpg?camera_label=person-1",
  alt: "Woman wearing a forest green Merry Christmas sweatshirt with a penguin and tree",
};

// The large photo in the brand banner (shown when the Christmas one is not).
export const STORY_LOOK = {
  slug: "womens-floral-love-graphic-sweatshirt",
  name: "Floral LOVE Sweatshirt",
  src: "https://images-api.printify.com/mockup/6af9c72559c1284d9f0228f2/25450/98504/womens-floral-love-graphic-sweatshirt-black-crewneck-pullover.jpg?camera_label=person-1",
  alt: "Woman wearing a dark sweatshirt with a floral LOVE print",
};
