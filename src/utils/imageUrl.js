// Product photos come straight from Printify and are full-size originals,
// from 0.3 MB up to about 2.5 MB each. Showing one of them in a 260 pixel
// card used to download the whole file. These helpers send the browser to
// Vercel's built-in image service instead, which returns a small, modern
// (WebP) copy at the width we ask for and keeps it cached.
//
// Plain JavaScript with no browser or React code in it, so the React
// components and the build script (scripts/postbuild.mjs) share it.
//
// The allowed hosts, widths and quality below MUST match the "images"
// section of vercel.json, or Vercel refuses the request (the page then falls
// back to the original photo; see OptimizedImage.jsx).

export const IMAGE_QUALITY = 75;

// Every width used anywhere on the site. Keep in sync with vercel.json.
export const IMAGE_WIDTHS = [256, 384, 768, 1024];

const OPTIMIZABLE_HOSTS = ["d123s6f1z9g2wk.cloudfront.net", "images-api.printify.com"];

// Can this photo be resized by Vercel? Only https photos from the two hosts
// Printify uses. Anything else (for example a photo from some other site) is
// left exactly as it is.
export function canOptimize(src) {
  if (!src || typeof src !== "string") return false;

  try {
    const url = new URL(src);
    return url.protocol === "https:" && OPTIMIZABLE_HOSTS.includes(url.hostname);
  } catch {
    return false;
  }
}

// The address of a resized copy. `width` must be one of IMAGE_WIDTHS. Returns
// the original address unchanged when the photo cannot be resized.
export function optimizedImageUrl(src, width) {
  if (!canOptimize(src)) return src;

  return `/_vercel/image?url=${encodeURIComponent(src)}&w=${width}&q=${IMAGE_QUALITY}`;
}

// "<address> 384w, <address> 768w" for the srcset attribute.
export function optimizedSrcSet(src, widths) {
  if (!canOptimize(src)) return undefined;

  return widths.map((width) => `${optimizedImageUrl(src, width)} ${width}w`).join(", ");
}
