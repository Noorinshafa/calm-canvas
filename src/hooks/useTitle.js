import { useEffect } from "react";

/**
 * Sets a page-specific browser tab title for SEO and usability.
 * Usage: useTitle("Mugs") -> "Mugs | Calm Canvas"
 * Usage: useTitle() -> falls back to the default brand title.
 */
export default function useTitle(pageTitle) {
  useEffect(() => {
    document.title = pageTitle
      ? `${pageTitle} | Calm Canvas`
      : "Calm Canvas | Premium Print-On-Demand Lifestyle Brand";
  }, [pageTitle]);
}
