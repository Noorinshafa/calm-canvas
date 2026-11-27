import { useMemo } from "react";
import useProducts from "./useProducts";
import { COLLECTIONS } from "../config/site.js";
import { cleanProductName, productInCollection } from "../utils/seoShared.js";

// A home page photo from src/content/homeImages.js, checked against the shop.
//
// While products are loading (or could not be loaded) the photo is used as
// written. Once they have loaded, if its product is no longer in the shop the
// photo is swapped for one of a product that is: first from `collectionKey`
// (e.g. "hoodies") when given, preferring a photo of a real model, then a
// plain product photo. So a removed product can never leave a broken picture
// or a link to a missing page on the home page.
//
// Returns { slug, src, alt, name, kind } with kind "model" or "front".
export default function useHomePhoto(look, collectionKey = "") {
  const { products, loading, error } = useProducts();

  return useMemo(() => {
    if (loading || error || products.length === 0) return look;
    if (products.some((product) => product.slug === look.slug)) return look;

    const collection = COLLECTIONS.find((item) => item.key === collectionKey);
    const pool = products.filter(
      (product) =>
        product.indexable !== false &&
        (!collection || productInCollection(product, collection))
    );
    const replacement =
      pool.find((product) => product.modelImage) ||
      pool.find((product) => product.cardImage);

    if (!replacement) return look;

    const name = cleanProductName(replacement.title);
    const useModel = look.kind !== "front" && Boolean(replacement.modelImage);

    return {
      ...look,
      slug: replacement.slug,
      src: useModel ? replacement.modelImage : replacement.cardImage || replacement.modelImage,
      alt: name,
      name,
      kind: useModel || !replacement.cardImage ? "model" : "front",
    };
  }, [look, collectionKey, products, loading, error]);
}
