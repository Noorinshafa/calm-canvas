import { useState, useEffect, useMemo, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import useProducts from "../../hooks/useProducts";
import { getProduct } from "../../services/printifyApi";
import { sanitizeHtml } from "../../utils/sanitizeHtml";
import useSEO, { toPlainText } from "../../hooks/useSEO";
import {
  breadcrumbJsonLd,
  buildProductSeo,
  cleanProductName,
  formatPrice,
  productJsonLd,
  productPath,
  relatedProducts,
  crossCollectionPicks,
} from "../../utils/seoShared.js";
import { PRODUCT_COPY } from "../../content/productCopy.js";
import { themesForProduct } from "../../content/themes.js";
import { priceTag } from "../../content/sale.js";
import { buildProductFaq } from "../../content/productFaq.js";
import {
  buildOptionModel,
  findVariant,
  imagesForVariant,
  nextSelection,
} from "../../utils/variantOptions.js";
import { trackAddToCart, trackViewItem } from "../../utils/analytics";
import {
  canOptimize,
  optimizedImageUrl,
  optimizedSrcSet,
} from "../../utils/imageUrl.js";
import toast from "react-hot-toast";

import "../../styles/productdetails.css";
import "../../styles/seo-extras.css";
import ProductCard from "../ui/ProductCard";
import OptimizedImage from "../ui/OptimizedImage";
import ShippingEstimate from "../ui/ShippingEstimate";
import { ProductPageSkeleton } from "../ui/Skeletons";
import Breadcrumbs from "../common/Breadcrumbs";

// "You may also like" shows its cards larger than the shop grids do (see
// .related-grid in productdetails.css): one per row up to 768px wide, two per
// row up to 1100px, four per row above that. These tell the browser the real
// size, so it downloads a photo that is sharp at that size.
const RELATED_SIZES =
  "(max-width: 768px) calc(100vw - 50px), (max-width: 1100px) 43vw, 22vw";
const RELATED_WIDTHS = [384, 768, 1024];

// ---------------------------------------------------------------------------
// Photo gallery speed
//
// The big photo uses these widths/sizes (they must match the main photo in
// scripts/postbuild.mjs). Clicking a thumbnail used to start downloading the
// big copy only then, so the old photo stayed on screen for a moment. Now:
//  1. as soon as the thumbnails are on screen, the big copies of the current
//     colour's photos are fetched quietly, two at a time (skipped when the
//     visitor's phone asks to save data). This used to wait for the whole
//     page and the analytics scripts to finish loading, so a shopper who
//     tapped a thumbnail in the first few seconds (typical when arriving from
//     Pinterest) had to wait for a photo that had not even been asked for;
//  2. pointing at / touching / focusing a thumbnail fetches its big copy
//     straight away;
//  3. on click, a photo that is already downloaded is shown at once. If it is
//     still on its way, a copy that IS already on screen stands in for it
//     (its thumbnail, or else the photo shown until now) and the sharp copy
//     fades in over it as soon as it arrives, so the big frame is never
//     empty.
// ---------------------------------------------------------------------------
const MAIN_WIDTHS = [768, 1024];
const MAIN_SIZES = "(max-width: 900px) 100vw, 50vw";
const THUMB_WIDTH = 256;
const MAX_WARM_PHOTOS = 8;
const WARM_AT_ONCE = 2;

const resizable = (src) => !import.meta.env.DEV && canOptimize(src);

// Downloads the big copy exactly as the main photo would pick it (same
// srcset and sizes), so the browser cache has it when the photo is shown.
const warmedPhotos = new Map();
function warmPhoto(src) {
  if (!src || typeof window === "undefined") return null;
  if (warmedPhotos.has(src)) return warmedPhotos.get(src);

  const img = new window.Image();
  img.decoding = "async";
  if (resizable(src)) {
    img.sizes = MAIN_SIZES;
    img.srcset = optimizedSrcSet(src, MAIN_WIDTHS);
    img.src = optimizedImageUrl(src, MAIN_WIDTHS[0]);
  } else {
    img.src = src;
  }
  warmedPhotos.set(src, img);
  return img;
}

// The address of a photo element's picture if it has finished downloading
// (the exact file the browser chose, so showing it again costs nothing), or "".
function loadedPhotoUrl(img) {
  return img && img.complete && img.naturalWidth > 0 ? img.currentSrc || img.src : "";
}

function saveDataWanted() {
  const connection = typeof navigator !== "undefined" ? navigator.connection : null;
  return Boolean(connection && (connection.saveData || /2g/.test(connection.effectiveType || "")));
}

// Colour and size choices sit under the photos on wide screens (two-column
// layout, from 1101px), and next to the price on phones and tablets.
const WIDE_LAYOUT = "(min-width: 1101px)";
function useWideLayout() {
  const [wide, setWide] = useState(
    () => typeof window !== "undefined" && window.matchMedia(WIDE_LAYOUT).matches
  );

  useEffect(() => {
    const query = window.matchMedia(WIDE_LAYOUT);
    const update = () => setWide(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  return wide;
}

// The pre-built HTML for a product page (see scripts/postbuild.mjs) records
// which product it is on the #root element. Reading it lets a page opened
// directly at /products/<name> load its product immediately, without first
// waiting for the whole catalog just to look the name up. It's only trusted
// when it matches the address being shown.
function readPrerenderHint(slug) {
  if (!slug || typeof document === "undefined") return "";

  const root = document.getElementById("root");

  return root?.dataset?.productSlug === slug
    ? root.dataset.productId || ""
    : "";
}

// The pre-built page also records what it shows first -- the main photo, the
// product name and the breadcrumb trail -- so the app can put exactly that on
// screen while the product's full details (sizes, colours, price options) are
// still being fetched. Only used when it belongs to the address being shown,
// and ignored if anything about it looks wrong.
function readPrerenderSeed(slug) {
  if (!slug || typeof document === "undefined") return null;

  const root = document.getElementById("root");

  if (root?.dataset?.productSlug !== slug) return null;

  try {
    const seed = JSON.parse(root.dataset.productSeed || "");

    const crumbsOk =
      Array.isArray(seed?.crumbs) &&
      seed.crumbs.length > 0 &&
      seed.crumbs.every(
        (crumb) =>
          typeof crumb?.name === "string" &&
          typeof crumb?.path === "string" &&
          crumb.path.startsWith("/")
      );

    if (
      !crumbsOk ||
      typeof seed.name !== "string" ||
      typeof seed.image !== "string" ||
      !seed.image.startsWith("https://")
    ) {
      return null;
    }

    return seed;
  } catch {
    return null;
  }
}

function ProductDetails() {
  const { id: idParam, slug } = useParams();

  const navigate = useNavigate();

  const { addToCart } = useCart();

  const { products: allProducts, loading: catalogLoading } = useProducts();

  // Product pages now live at /products/<readable-name>. Old links of the
  // form /product/<id> still work. Either way we need the product's id to
  // ask Printify for the full details.
  const hintedId = useMemo(() => readPrerenderHint(slug), [slug]);
  const seed = useMemo(() => readPrerenderSeed(slug), [slug]);

  const productId = useMemo(() => {
    if (idParam) return idParam;
    if (hintedId) return hintedId;

    return allProducts.find((item) => item.slug === slug)?.id || "";
  }, [idParam, hintedId, allProducts, slug]);

  // Fetches just this one product (with its full variant details) instead
  // of the whole catalog -- see api/product.js for why. Related products
  // below still use the lightweight full-catalog list, which is fine since
  // that list was never the slow part once variants were removed from it.
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // True only when the server says this product does not exist (404). Any
  // other failure (a timeout, a busy moment at Printify, a dropped
  // connection) is temporary and must never make a real product page look
  // missing to search engines.
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!productId) return undefined;

    let cancelled = false;

    const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    async function fetchProduct() {
      try {
        setLoading(true);
        setError("");
        setNotFound(false);
        setProduct(null);

        // Try up to 3 times before giving up, so one slow or failed request
        // doesn't leave the visitor (or Googlebot's renderer) with an error
        // page. A 404 is final and is not retried.
        let data = null;
        let lastError = null;

        for (let attempt = 0; attempt < 3; attempt++) {
          if (attempt > 0) {
            await wait(attempt * 700);
            if (cancelled) return;
          }

          try {
            data = await getProduct(productId);
            lastError = null;
            break;
          } catch (err) {
            lastError = err;
            if (err?.status === 404 || err?.status === 400) break;
          }
        }

        if (cancelled) return;

        if (lastError) throw lastError;

        setProduct(data);
      } catch (err) {
        if (!cancelled) {
          setNotFound(err?.status === 404 || err?.status === 400);
          setError(err?.message || "Unable to load this product.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchProduct();

    return () => {
      cancelled = true;
    };
  }, [productId]);

  const [selectedImage, setSelectedImage] = useState("");
  // While the photo just switched to is still downloading:
  // { photo: its address, url: an already-downloaded picture shown in its
  // place meanwhile }. null when there is nothing to wait for.
  const [placeholder, setPlaceholder] = useState(null);
  const mainFrameRef = useRef(null);
  const thumbRowRef = useRef(null);
  const wideLayout = useWideLayout();
  const [quantity, setQuantity] = useState(1);
  // One entry per dropdown (colour, size, phone model, finish...), holding the
  // shopper's current choice for that dropdown.
  const [selection, setSelection] = useState([]);

  // The API now only ever sends enabled/purchasable variants (see
  // api/_lib/printify-shared.js), so anything listed here is safe to sell --
  // but a product can still legitimately have zero of them (fully sold out).
  const variants = useMemo(() => product?.variants || [], [product]);
  const hasVariants = variants.length > 0;

  // Which dropdowns this product has and what each one is called, taken from
  // Printify's own option list rather than guessed from the variant title --
  // see src/utils/variantOptions.js.
  const optionModel = useMemo(() => buildOptionModel(product), [product]);

  // The variant the shopper has picked right now. Variants of the same
  // product can cost different amounts (e.g. larger hoodie sizes), and the
  // server charges the price of the exact variant ordered -- so the price
  // shown on the page, in the cart and at checkout must come from this, not
  // from the product's lowest price.
  const activeVariant = useMemo(() => {
    if (!hasVariants) return undefined;

    return findVariant(optionModel, variants, selection) || variants[0];
  }, [hasVariants, optionModel, variants, selection]);

  // The thumbnails show only the photos made for the colour/variant that is
  // picked right now (when Printify has any -- see imagesForVariant), instead
  // of every colour's photos at once.
  const galleryImages = useMemo(
    () => imagesForVariant(product?.images || [], activeVariant?.id),
    [product, activeVariant]
  );

  const activePriceValue =
    typeof activeVariant?.price === "number"
      ? activeVariant.price / 100
      : product?.priceValue;

  const safeDescription = useMemo(
    () => sanitizeHtml(product?.description || ""),
    [product?.description]
  );

  const plainDescription = useMemo(
    () => toPlainText(product?.description || ""),
    [product?.description]
  );

  // The catalog entry carries the readable address (slug); the single-product
  // response doesn't, so take it from the catalog when it has loaded.
  const catalogEntry = useMemo(
    () => allProducts.find((item) => item.id === product?.id),
    [allProducts, product?.id]
  );

  const productSlug = slug || catalogEntry?.slug || "";

  const canonicalPath = product
    ? productPath({ id: product.id, slug: productSlug })
    : slug
    ? `/products/${slug}`
    : `/product/${idParam || ""}`;

  const seo = useMemo(
    () => (product ? buildProductSeo(product) : null),
    [product]
  );

  // Questions shoppers search for about this type of product, answered from
  // this product's own details (see src/content/productFaq.js). The pre-built
  // page shows the same list.
  const faq = useMemo(
    () => (product ? buildProductFaq(product, seo?.collection?.key) : []),
    [product, seo]
  );

  const crumbs = useMemo(() => {
    if (!product || !seo) return seed?.crumbs || [];

    const list = [{ name: "Home", path: "/" }];

    if (seo.collection) {
      list.push({ name: "Collections", path: "/collections" });
      list.push({ name: seo.collection.nav, path: seo.collection.path });
    } else {
      list.push({ name: "Collections", path: "/collections" });
    }

    list.push({ name: seo.name, path: canonicalPath });

    return list;
  }, [product, seo, canonicalPath, seed]);

  const jsonLd = useMemo(() => {
    if (!product) return undefined;

    return [
      breadcrumbJsonLd(crumbs),
      productJsonLd(
        { ...product, slug: productSlug },
        { inStock: hasVariants, plainDescription }
      ),
    ];
  }, [product, crumbs, productSlug, hasVariants, plainDescription]);

  // Per-product title/description/canonical/OG + Product structured data --
  // see src/hooks/useSEO.js for why this matters. Runs unconditionally
  // (before the loading/error early-returns below) since hooks can't be
  // called conditionally; useSEO itself is safe to call with an
  // undefined/loading product.
  const lookupFailed = !productId && !catalogLoading;

  // The page's pre-built title, canonical and "index, follow" tags are
  // already correct in the HTML Google reads first. They are only replaced
  // once there is something definite to say: the product has loaded, or the
  // product is confirmed missing. While loading -- or after a temporary
  // failure -- they are left alone. (Before this, a single failed request
  // flipped the page to "noindex" in Googlebot's renderer.)
  const confirmedMissing = lookupFailed || notFound;

  useSEO({
    title: seo?.name || (confirmedMissing ? "Product not found" : undefined),
    description: seo?.description,
    path: canonicalPath,
    image: product?.image,
    type: "product",
    jsonLd,
    noindex: confirmedMissing || product?.indexable === false,
    enabled: Boolean(product) || confirmedMissing,
  });

  useEffect(() => {
    if (product) {
      setSelectedImage(product.image);
      setQuantity(1);

      if (variants.length) {
        // Start on the cheapest option so the price shown on arrival is the
        // "from" price the listing and search results advertise.
        const cheapest = variants.reduce(
          (best, variant) =>
            typeof variant.price === "number" &&
            (!best || variant.price < best.price)
              ? variant
              : best,
          null
        );

        // Among equally cheap options, prefer the one whose colour the first
        // photo shows, so that photo (the one the pre-built page loads) doesn't
        // change as the page finishes loading.
        const firstPhoto = (product.images || []).find(
          (image) => image.src === product.image
        );

        const cheapestOnes = variants.filter(
          (variant) => variant.price === cheapest?.price
        );

        const withFirstPhoto = firstPhoto?.variantIds?.length
          ? cheapestOnes.filter((variant) =>
              firstPhoto.variantIds.includes(variant.id)
            )
          : [];

        const pool = withFirstPhoto.length
          ? withFirstPhoto
          : cheapestOnes.length
          ? cheapestOnes
          : variants;

        // When several options cost the same (often every size), start on the
        // one that reads first in the dropdowns -- size S, not 5XL.
        const position = (variant) =>
          (optionModel.picksByVariantId.get(variant.id) || []).reduce(
            (sum, pick, index) =>
              sum +
              Math.max(0, optionModel.groups[index]?.values.indexOf(pick)),
            0
          );

        const start = pool.reduce(
          (best, variant) => (position(variant) < position(best) ? variant : best),
          pool[0]
        );

        setSelection(optionModel.picksByVariantId.get(start.id) || []);

        // Show a photo of the colour the page starts on.
        const startGallery = imagesForVariant(product.images, start.id);

        if (
          startGallery.length &&
          !startGallery.some((image) => image.src === product.image)
        ) {
          // The photo from the pre-built page stays on screen until this one
          // has downloaded, instead of the frame going blank meanwhile.
          switchPhoto(startGallery[0].src);
        }
      }

      trackViewItem({
        id: product.id,
        name: cleanProductName(product.title),
        price: product.priceValue,
        category: seo?.collection?.nav,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product]);

  // Quietly download the big copies of the current colour's photos, two at a
  // time, as soon as the thumbnails are on screen (at the browser's next quiet
  // moment, at most 600 ms later), so tapping a thumbnail shows the photo at
  // once. These downloads have a lower priority than the photo on screen, so
  // they never slow it down. (Each copy is resized once by Vercel and then
  // cached, see vercel.json "images".)
  const gallerySources = galleryImages.map((image) => image.src).join("|");
  useEffect(() => {
    if (!gallerySources || saveDataWanted()) return undefined;

    const queue = gallerySources.split("|").slice(0, MAX_WARM_PHOTOS);
    let cancelled = false;
    let active = 0;
    let idleHandle;

    const pump = () => {
      while (!cancelled && active < WARM_AT_ONCE && queue.length) {
        const img = warmPhoto(queue.shift());
        if (!img || img.complete) continue;

        active += 1;
        const done = () => {
          active -= 1;
          pump();
        };
        img.addEventListener("load", done, { once: true });
        img.addEventListener("error", done, { once: true });
      }
    };

    if ("requestIdleCallback" in window) {
      idleHandle = window.requestIdleCallback(pump, { timeout: 600 });
    } else {
      idleHandle = window.setTimeout(pump, 300);
    }

    return () => {
      cancelled = true;
      if ("cancelIdleCallback" in window) window.cancelIdleCallback(idleHandle);
      else window.clearTimeout(idleHandle);
    };
  }, [gallerySources]);

  // What stands in for `src` in the big frame while its sharp copy loads:
  //   under: whatever the frame shows right now (the photo, or the stand-in
  //          covering for it), so the frame is never empty;
  //   thumb: the small copy its thumbnail uses. It appears over `under` the
  //          moment it has downloaded (usually it already has), so the
  //          shopper sees the new photo straight away, then the sharp copy
  //          fades in over both.
  function standInFor(src) {
    const frame = mainFrameRef.current;
    const under =
      loadedPhotoUrl(frame?.querySelector(".details-image-img:not(.is-loading)")) ||
      loadedPhotoUrl(frame?.querySelector(".details-image-standin--under")) ||
      loadedPhotoUrl(frame?.querySelector(".details-image-standin--thumb"));

    let thumb = "";
    const buttons = thumbRowRef.current?.querySelectorAll("[data-photo]") || [];
    for (const button of buttons) {
      if (button.dataset.photo === src) {
        const img = button.querySelector("img");
        thumb = img ? img.currentSrc || img.src || "" : "";
        break;
      }
    }

    return { under, thumb };
  }

  // Puts `src` in the big frame. Already downloaded: straight away. Still on
  // its way: stand-ins are shown until it arrives (see handleMainLoaded).
  function switchPhoto(src) {
    const cached = warmedPhotos.get(src);
    const ready = Boolean(cached && cached.complete && cached.naturalWidth > 0);
    const standIn = ready ? null : standInFor(src);

    setPlaceholder(
      standIn && (standIn.under || standIn.thumb)
        ? { photo: src, ...standIn, arrived: false }
        : null
    );
    setSelectedImage(src);
  }

  // The sharp copy has arrived: it fades in over the stand-ins (0.35 s, see
  // .details-image-img), which are removed once it has finished fading in.
  function handleMainLoaded(photo) {
    setPlaceholder((current) =>
      current && current.photo === photo ? { ...current, arrived: true } : current
    );
    window.setTimeout(() => {
      setPlaceholder((current) => (current && current.arrived ? null : current));
    }, 450);
  }

  if (!productId) {
    if (catalogLoading) {
      return <ProductPageSkeleton />;
    }

    return (
      <div style={{ textAlign: "center", padding: "180px 8% 120px" }}>
        <h1>Product not found</h1>
        <p style={{ margin: "16px 0" }}>
          This product may have been removed or the link may be incorrect.
        </p>
        <Link to="/collections">Browse all products</Link>
      </div>
    );
  }

  // While the product's details are still loading, a page that has its
  // pre-built copy shows that copy's photo and breadcrumb trail straight away
  // (instead of an empty placeholder), so the photo is on screen as soon as the
  // page's code has run rather than after the product request finishes.
  const pending = loading && !product && !error && Boolean(seed);

  if (loading && !pending) {
    return <ProductPageSkeleton />;
  }

  if (error) {
    return (
      <div style={{ textAlign: "center", padding: "180px 8% 120px" }}>
        <h1>{notFound ? "Product not found" : "We couldn't load this product"}</h1>
        <p style={{ margin: "16px 0" }}>
          {notFound
            ? "This product may have been removed or the link may be incorrect."
            : "Something went wrong while loading this product. Please try again in a moment."}
        </p>
        <Link to="/collections">Browse all products</Link>
      </div>
    );
  }

  if (!product && !pending) {
    return (
      <div style={{ textAlign: "center", padding: "180px 8% 120px" }}>
        <h1>Product not found</h1>
        <p style={{ margin: "16px 0" }}>
          This product may have been removed or the link may be incorrect.
        </p>
        <Link to="/collections">Browse all products</Link>
      </div>
    );
  }

  const productName = product ? cleanProductName(product.title) : seed.name;
  const extraCopy = product ? PRODUCT_COPY[product.id] : undefined;

  // The photo on show: the pre-built page's photo until the details arrive.
  // Once they have, the chosen photo (falling back to the product's first
  // photo for the moment before it is chosen) -- the same address, so the photo
  // already on screen stays put instead of being loaded again.
  const mainImage = product ? selectedImage || product.image : seed.image;
  // Stand-ins are on screen for the photo being shown...
  const standInShown = Boolean(placeholder && placeholder.photo === mainImage);
  // ...and the sharp copy is still downloading.
  const waitingForPhoto = standInShown && !placeholder.arrived;

  // Same products the pre-built page lists (see relatedProducts in
  // src/utils/seoShared.js). Empty until the catalog has loaded.
  const related = product ? relatedProducts(product, allProducts, 4) : [];

  // One product from each other collection -- the same picks the pre-built
  // page links to (see crossCollectionPicks in src/utils/seoShared.js).
  const otherCollections = product
    ? crossCollectionPicks(catalogEntry || product, allProducts, related)
    : [];

  // Theme gift pages this design belongs to (cat lovers, floral, ...), the
  // same links the pre-built page contains.
  const themes = product ? themesForProduct(product) : [];

  // "% OFF" for real price reductions only, "Special Price" for low-priced
  // sweatshirts (src/content/sale.js), from the price of the size/colour
  // chosen right now.
  const tag = product
    ? priceTag(productSlug, activePriceValue, seo?.collection?.key)
    : null;

  // The colour / size / model dropdowns. Rendered once: under the photos on
  // wide screens, above the quantity on phones and tablets (useWideLayout).
  const optionsBlock =
    product && hasVariants && optionModel.groups.length ? (
      <div className="product-options">
        {optionModel.groups.map((group, groupIndex) => (
          <div className="option-group" key={`${group.label}-${groupIndex}`}>
            <h4>Choose {group.label}</h4>

            <select
              className="product-select"
              value={selection[groupIndex] ?? ""}
              onChange={(e) => handleOptionChange(groupIndex, e.target.value)}
              aria-label={`Choose ${group.label.toLowerCase()}`}
            >
              {group.values.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>
    ) : null;

  function handleOptionChange(groupIndex, value) {
    const next = nextSelection(
      optionModel,
      variants,
      selection,
      groupIndex,
      value
    );

    const nextVariant = findVariant(optionModel, variants, next);
    const gallery = imagesForVariant(product.images, nextVariant?.id);

    setSelection(next);

    // Show the new colour's photo. If the photo on screen already belongs to
    // the new choice (e.g. only the size changed), leave it where it is.
    if (gallery.length && !gallery.some((image) => image.src === selectedImage)) {
      showPhoto(gallery[0].src);
    }
  }

  function showPhoto(src) {
    if (!src || src === mainImage) return;
    switchPhoto(src);
  }

  function handleAddToCart({ redirectToCheckout }) {
    const selectedVariant = activeVariant;

    if (!selectedVariant) {
      toast.error("This product is currently out of stock.");
      return;
    }

    // Price the cart line at the price of the variant actually chosen, so the
    // cart and checkout totals match what Safepay will charge (the server
    // always re-prices from Printify; see api/_lib/printify-shared.js).
    const variantPrice =
      typeof selectedVariant.price === "number"
        ? selectedVariant.price / 100
        : product.priceValue;

    // What the cart shows under the product name, e.g. "Color: White",
    // "Size: M". The variant itself (selectedVariant) is what is actually
    // priced and ordered; these are labels for the shopper only.
    const picks = optionModel.picksByVariantId.get(selectedVariant.id) || [];
    const selectedOptions = optionModel.groups.map((group, index) => ({
      label: group.label,
      value: picks[index],
    }));

    addToCart({
      ...product,
      price: formatPrice(variantPrice),
      priceValue: variantPrice,
      quantity,
      selectedVariant,
      selectedOptions,
    });

    trackAddToCart({
      id: product.id,
      name: productName,
      price: variantPrice,
      quantity,
      category: seo?.collection?.nav,
      variant: selectedVariant.title,
    });

    if (redirectToCheckout) {
      navigate("/checkout");
    } else {
      toast.success(`${productName} added to cart!`);
    }
  }

  return (
    <>
      <section className="product-details">
        <Breadcrumbs items={crumbs} />

        <div className="product-container">
          <div className="details-image">

  <div className="main-image" ref={mainFrameRef}>

    {standInShown && placeholder.under && (
      <img
        className="details-image-standin details-image-standin--under"
        src={placeholder.under}
        alt=""
        aria-hidden="true"
      />
    )}

    {standInShown && placeholder.thumb && (
      <img
        // A new element per photo, so a thumbnail that fails to load is
        // simply hidden and never shown for another photo.
        key={placeholder.thumb}
        className="details-image-standin details-image-standin--thumb"
        src={placeholder.thumb}
        alt=""
        aria-hidden="true"
        onError={(event) => {
          event.currentTarget.hidden = true;
        }}
      />
    )}

    {waitingForPhoto && <span className="details-image-wait" aria-hidden="true" />}

    {mainImage && (

  <OptimizedImage
    // A new element per photo, so the previous photo disappears at once
    // and the thumbnail placeholder behind it shows until this one is ready.
    key={mainImage}
    className={`details-image-img${waitingForPhoto ? " is-loading" : ""}`}
    src={mainImage}
    alt={productName}
    widths={MAIN_WIDTHS}
    sizes={MAIN_SIZES}
    width="760"
    height="760"
    priority
    onLoad={() => handleMainLoaded(mainImage)}
  />

)}

  </div>

  <div className="thumbnail-row" ref={thumbRowRef}>

    {galleryImages.map((img, index) => (

      <button
        key={img.src}
        type="button"
        className={`thumbnail-btn${selectedImage === img.src ? " active" : ""}`}
        data-photo={img.src}
        aria-label={`Show view ${index + 1}`}
        aria-pressed={selectedImage === img.src}
        onClick={() => showPhoto(img.src)}
        onPointerEnter={() => warmPhoto(img.src)}
        onTouchStart={() => warmPhoto(img.src)}
        onFocus={() => warmPhoto(img.src)}
      >
        <OptimizedImage
          src={img.src}
          alt=""
          className="thumbnail"
          widths={[THUMB_WIDTH]}
          width="95"
          height="95"
        />
      </button>

    ))}

  </div>

  {wideLayout && optionsBlock}

</div>

{product && (

<div className="product-info">

  <span className="product-category">
    SHOPCALMCANVAS
  </span>

  <h1>{productName}</h1>

  <p className="product-price">
    {formatPrice(activePriceValue)}
    {tag?.wasPrice && (
      <s className="price-was">
        <span className="sr-only">Was </span>
        {formatPrice(tag.wasPrice)}
      </s>
    )}
    {tag && <span className="sale-tag sale-tag--inline">{tag.label}</span>}
  </p>

  <div
    className="product-description"
    dangerouslySetInnerHTML={{
      __html: safeDescription,
    }}
  />

  {!hasVariants ? (

    <p className="out-of-stock-notice">
      This product is currently out of stock. Check back soon.
    </p>

  ) : (

    <>

  {!wideLayout && optionsBlock}

  <div className="quantity-section">

  <h4>Quantity</h4>

  <div className="quantity-box">

    <button
      onClick={() =>
        setQuantity((q) => Math.max(1, q - 1))
      }
      aria-label="Decrease quantity"
    >
      −
    </button>

    <span aria-live="polite">{quantity}</span>

    <button
      onClick={() =>
        setQuantity((q) => q + 1)
      }
      aria-label="Increase quantity"
    >
      +
    </button>

  </div>

</div>

<div className="product-buttons">

  <button
    className="add-cart-btn"
    onClick={() => handleAddToCart({ redirectToCheckout: false })}
  >
    Add to Cart
  </button>

  <button
    className="buy-now-btn"
    onClick={() => handleAddToCart({ redirectToCheckout: true })}
  >
    Buy Now
  </button>

</div>

<ShippingEstimate
  productId={product.id}
  variantId={activeVariant?.id}
  quantity={quantity}
/>

    </>

  )}

<div className="product-features">

  <div className="feature-item">
    ✓ Premium Print Quality
  </div>

  <div className="feature-item">
    ✓ Secure Checkout
  </div>

  <div className="feature-item">
    ✓ Printed On Demand
  </div>

  <div className="feature-item">
    ✓ Customize Your Design
  </div>

</div>

</div>

)}

</div>

</section>

{extraCopy && (

<section className="product-extra">

  <h2>About this design</h2>

  {extraCopy.map((paragraph) => (
    <p key={paragraph.slice(0, 48)}>{paragraph}</p>
  ))}

</section>

)}

<section className="product-extra">

  <h2>Shipping &amp; returns at a glance</h2>

  <ul>
    <li>
      Made to order: each item is printed after you order it, so please
      allow around 2–7 business days to print and prepare, plus delivery.
    </li>
    <li>
      Damaged, defective or incorrect items are replaced with a free
      reprint or fully refunded when you contact us within 14 days of
      delivery.
    </li>
    <li>
      Because every item is custom printed, we can't accept returns for the
      wrong size or a change of mind, so check the size options above.
    </li>
    <li>
      Secure checkout through Safepay. Read the full{" "}
      <Link to="/shipping-returns">Shipping, Returns &amp; Refunds</Link>{" "}
      policy.
    </li>
  </ul>

</section>

{faq.length > 0 && (

<section className="product-extra product-faq">

  <h2>Frequently asked questions</h2>

  <div className="faq-list">
    {faq.map((entry) => (
      <details key={entry.q}>
        <summary>{entry.q}</summary>
        <p>{entry.a}</p>
      </details>
    ))}
  </div>

</section>

)}

{themes.length > 0 && (

<section className="product-extra">

  <h2>More designs like this</h2>

  <ul>
    {themes.map((theme) => (
      <li key={theme.key}>
        <Link to={theme.path}>{theme.nav}</Link>
      </li>
    ))}
  </ul>

</section>

)}

{related.length > 0 && (

<section className="related-products">

  <div className="related-heading">

    <span>✦ MORE TO LOVE</span>

    <h2>You May Also Like</h2>

    <p>
      Discover more beautiful products curated just for you.
    </p>

  </div>

  <div className="related-grid">

    {related.map((item) => (

      <ProductCard
        key={item.id}
        {...item}
        sizes={RELATED_SIZES}
        widths={RELATED_WIDTHS}
      />

    ))}

  </div>

</section>

)}

{otherCollections.length > 0 && (

<section className="related-products related-products--explore">

  <div className="related-heading">

    <span>✦ SHOP THE STUDIO</span>

    <h2>Explore Other Collections</h2>

  </div>

  <div className="related-grid">

    {otherCollections.map((item) => (

      <ProductCard key={item.id} {...item} />

    ))}

  </div>

</section>

)}

</>

);

}

export default ProductDetails;
