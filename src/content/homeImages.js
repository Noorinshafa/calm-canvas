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

// The gifts banner at the top of the home page (src/components/sections/
// Hero.jsx) shows three real shop products as photo cards: Printify's own
// lifestyle photos of a mug, a phone case and a tote bag. Each card links to
// its product. If a product is ever removed from the shop, another one from
// the same collection takes its place (src/hooks/useHomePhoto.js).
export const GIFT_CARDS = [
  {
    slug: "pastel-butterflies-mug",
    collection: "mugs",
    kind: "model",
    name: "Pastel Butterflies Mug",
    src: "https://images-api.printify.com/mockup/6a95deeef9f093a7d4025e3f/33719/10393/pastel-butterflies-mug-colorful-butterfly-ceramic-coffee-cup.jpg?camera_label=context-1",
    alt: "Pastel butterflies mug filled with coffee on a table with candles and pine cones",
  },
  {
    slug: "pink-tulip-bouquet-phone-case",
    collection: "phonecases",
    kind: "model",
    name: "Pink Tulip Bouquet Phone Case",
    src: "https://images-api.printify.com/mockup/6a89b928d83a98eae80ce4cb/62584/97555/pink-tulip-bouquet-phone-case-floral-iphone-case.jpg?camera_label=context-1",
    alt: "Pink phone case with a white tulip bouquet print, standing on a stone",
  },
  {
    slug: "watercolor-wildflower-botanical-tote-bag",
    collection: "totebags",
    kind: "model",
    name: "Watercolor Wildflower Tote Bag",
    src: "https://images-api.printify.com/mockup/688a2b8722a87b68c70e0d1a/103602/108946/watercolor-wildflower-botanical-tote-bag.jpg?camera_label=person-3",
    alt: "Woman carrying a white tote bag with watercolour wildflowers",
  },
];

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
