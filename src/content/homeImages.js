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

// The three banners at the top of the home page (they take turns). Each photo
// is one of Printify's real lifestyle photos of a shop product (a product in a
// real room or on a real table). The first banner holds the page's main
// heading and is the page's largest picture: scripts/postbuild.mjs tells the
// browser to start downloading its photo straight away.
//   tone   the colour of the text panel: "ivory", "forest" or "sage"
//   side   which side the photo is on (computers): "left" or "right"
//   season "christmas" = only 1 November to 26 December, "rest" = only the
//          rest of the year, left out = always shown
export const HERO_SLIDES = [
  {
    key: "brand",
    slug: "silhouette-couple-love-t-shirt",
    src: "https://images-api.printify.com/mockup/6a9dc80cc46cb584ca0d1c5f/38192/127673/silhouette-couple-love-t-shirt-romantic-couple-graphic-tee.jpg?camera_label=lifestyle",
    alt: "Woman relaxing on a living room floor in a black T-shirt with a couple silhouette print",
    position: "50% 40%",
    tone: "ivory",
    side: "left",
    heading: "Aesthetic Hoodies & Gifts Made From Original Art",
    text: "Cozy sweatshirts, graphic tees, mugs, tote bags and phone cases, printed to order just for you.",
    cta: { label: "Shop the collection", path: "/collections" },
  },
  {
    key: "christmas",
    season: "christmas",
    slug: "pastel-butterflies-mug",
    src: "https://images-api.printify.com/mockup/6a95deeef9f093a7d4025e3f/33719/10393/pastel-butterflies-mug-colorful-butterfly-ceramic-coffee-cup.jpg?camera_label=context-1",
    alt: "Pastel butterflies mug filled with coffee on a winter table with candles and pine cones",
    position: "50% 50%",
    tone: "forest",
    side: "right",
    heading: "Christmas gifts, printed just for them",
    text: "Hoodies, sweatshirts, mugs and phone cases with original art, made to order for everyone on your list.",
    cta: { label: "Shop Christmas gifts", path: "/christmas-gifts" },
  },
  {
    key: "mugs",
    season: "rest",
    slug: "yellow-and-red-tulips-mug",
    src: "https://images-api.printify.com/mockup/6a95a10fe5757574e30522e0/65216/71754/yellow-and-red-tulips-mug-ceramic-floral-coffee-cup.jpg?camera_label=context-7",
    alt: "Hands in a cream knit sweater holding a mug printed with yellow and red tulips",
    position: "50% 50%",
    tone: "forest",
    side: "right",
    heading: "Mugs for slow mornings",
    text: "Florals, animals and seasonal designs on ceramic mugs, printed when you order.",
    cta: { label: "Shop mugs", path: "/mugs" },
  },
  {
    key: "sweatshirts",
    slug: "sunflower-bouquet-crewneck-sweatshirt",
    src: "https://images-api.printify.com/mockup/6a848f905b2598a3e1059e0c/25458/128101/sunflower-bouquet-crewneck-sweatshirt-yellow-floral-sleeve-design.jpg?camera_label=folded-2",
    alt: "Folded white sweatshirt with a sunflower bouquet print beside a woven basket",
    position: "50% 45%",
    tone: "sage",
    side: "left",
    heading: "Soft sweatshirts, original art",
    text: "Florals, animals and seasonal designs on warm everyday crewnecks, printed when you order.",
    cta: { label: "Shop sweatshirts", path: "/sweatshirts" },
  },
];

// The banners shown today: three, whatever the season.
export function heroSlidesFor(festive) {
  return HERO_SLIDES.filter(
    (slide) => !slide.season || slide.season === (festive ? "christmas" : "rest")
  );
}

// How wide a banner photo is on screen, so the browser picks the right copy:
// 60% of the screen on computers, the full width on phones and tablets. Must
// match .hero-slide-media in hero.css; scripts/postbuild.mjs uses the same
// text for its early download.
export const HERO_SIZES = "(max-width: 1023px) 100vw, 60vw";
export const HERO_WIDTHS = [384, 768, 1024];

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
