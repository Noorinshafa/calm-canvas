import { useEffect } from "react";

/**
 * Sets a page-specific browser tab title for SEO and usability.
 * Usage: useTitle("Mugs") -> "Mugs | ShopCalmCanvas"
 * Usage: useTitle() -> falls back to the default brand title.
 */
export default function useTitle(pageTitle) {
  useEffect(() => {
    document.title = pageTitle
      ? `${pageTitle} | ShopCalmCanvas`
      : "ShopCalmCanvas | Premium Print-On-Demand Lifestyle Brand";
  }, [pageTitle]);
}
