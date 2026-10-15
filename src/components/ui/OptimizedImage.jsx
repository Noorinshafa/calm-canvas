import { useState } from "react";
import {
  canOptimize,
  optimizedImageUrl,
  optimizedSrcSet,
} from "../../utils/imageUrl.js";

// A product photo that downloads a small resized copy instead of Printify's
// full-size original (see src/utils/imageUrl.js).
//
//   widths    the widths (from IMAGE_WIDTHS) the browser may pick from
//   sizes     how wide the photo is on screen, so the browser picks the right one
//   priority  true for the first photo a visitor sees (loads right away, not lazily)
//
// If the resized copy ever fails to load (for example the image service is
// unavailable), the original photo is shown instead, so a photo can never
// just disappear. While developing on your own computer the originals are
// used, because Vercel's image service only exists on Vercel.
function OptimizedImage({
  src,
  alt,
  widths = [384, 768],
  sizes,
  priority = false,
  ...rest
}) {
  const [failedSrc, setFailedSrc] = useState("");

  const useOriginal = import.meta.env.DEV || !canOptimize(src) || failedSrc === src;

  if (useOriginal) {
    return (
      <img
        src={src}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : undefined}
        decoding="async"
        {...rest}
      />
    );
  }

  return (
    <img
      src={optimizedImageUrl(src, widths[Math.floor((widths.length - 1) / 2)])}
      srcSet={optimizedSrcSet(src, widths)}
      sizes={sizes}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : undefined}
      decoding="async"
      onError={() => setFailedSrc(src)}
      {...rest}
    />
  );
}

export default OptimizedImage;
