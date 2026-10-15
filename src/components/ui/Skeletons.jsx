import "../../styles/skeleton.css";

// Grey placeholder shapes shown while products are still loading, so a page
// never looks empty or broken. They use the same sizes as the real cards, so
// nothing jumps around when the real products appear.

// A grid of product-card placeholders. `className` lets a caller reuse the
// page's own grid (for example "products-grid") so the columns match.
export function ProductGridSkeleton({ count = 8, className = "products-grid" }) {
  return (
    <div className={className} role="status" aria-live="polite" aria-busy="true">
      <span className="sr-only">Loading products</span>

      {Array.from({ length: count }, (_, index) => (
        <div className="skeleton-card" key={index} aria-hidden="true">
          <div className="skeleton-block skeleton-card-image" />

          <div className="skeleton-card-body">
            <div className="skeleton-block skeleton-line" />
            <div className="skeleton-block skeleton-line skeleton-line-short" />
          </div>
        </div>
      ))}
    </div>
  );
}

// The Best Sellers row on the home page.
export function ProductRowSkeleton({ count = 5 }) {
  return (
    <div className="skeleton-row" role="status" aria-live="polite" aria-busy="true">
      <span className="sr-only">Loading products</span>

      {Array.from({ length: count }, (_, index) => (
        <div className="skeleton-card skeleton-row-card" key={index} aria-hidden="true">
          <div className="skeleton-block skeleton-card-image" />

          <div className="skeleton-card-body">
            <div className="skeleton-block skeleton-line" />
            <div className="skeleton-block skeleton-line skeleton-line-short" />
          </div>
        </div>
      ))}
    </div>
  );
}

// The whole product page: photo on the left, details on the right.
export function ProductPageSkeleton() {
  return (
    <section
      className="skeleton-product"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <span className="sr-only">Loading product</span>

      <div className="skeleton-product-grid" aria-hidden="true">
        <div className="skeleton-block skeleton-product-image" />

        <div className="skeleton-product-info">
          <div className="skeleton-block skeleton-line skeleton-line-tiny" />
          <div className="skeleton-block skeleton-line skeleton-line-title" />
          <div className="skeleton-block skeleton-line skeleton-line-price" />
          <div className="skeleton-block skeleton-line" />
          <div className="skeleton-block skeleton-line" />
          <div className="skeleton-block skeleton-line skeleton-line-short" />
          <div className="skeleton-block skeleton-button" />
        </div>
      </div>
    </section>
  );
}
