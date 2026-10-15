import { Link } from "react-router-dom";
import useProducts from "../../hooks/useProducts";
import TiltCard from "../ui/TiltCard";
import OptimizedImage from "../ui/OptimizedImage";
import { ProductRowSkeleton } from "../ui/Skeletons";
import { productPath, cleanProductName } from "../../utils/seoShared.js";
import "../../styles/bestsellers.css";

// Shows real, live products straight from the shop (not stock photos),
// so the homepage always reflects what's actually for sale right now.
function BestSellers() {
  const { products, loading, error } = useProducts();

  const featured = products.filter((product) => product.image).slice(0, 8);

  // If something went wrong, or there is nothing to show, leave the section
  // out rather than show a broken-looking block. While products are still
  // loading, show grey placeholders so the page keeps its shape.
  if (!loading && (error || featured.length === 0)) {
    return null;
  }

  return (
    <section className="bestsellers-section">

      <div className="bestsellers-heading">

        <span className="bestsellers-tag">FRESH FROM THE SHOP</span>

        <h2>Loved Right Now</h2>

        <p>
          A live look at what's on the shelves — straight from the shop,
          no filler.
        </p>

      </div>

      {loading ? (
        <ProductRowSkeleton />
      ) : (
      <div className="bestsellers-row">

        {featured.map((product) => (
          <TiltCard
            className="bestseller-card"
            key={product.id}
            maxTilt={8}
          >
            <Link
              to={productPath(product)}
              className="bestseller-link"
            >

              <div className="bestseller-image">
                <OptimizedImage
                  src={product.image}
                  alt={cleanProductName(product.title)}
                  widths={[384, 768]}
                  sizes="(max-width: 640px) 200px, 260px"
                  width="600"
                  height="600"
                />
              </div>

              <div className="bestseller-info">
                <h3>{cleanProductName(product.title)}</h3>
                <span>{product.price}</span>
              </div>

            </Link>
          </TiltCard>
        ))}

      </div>
      )}

      <div className="bestsellers-footer">
        <Link to="/collections" className="bestsellers-btn">
          Browse Full Collection →
        </Link>
      </div>

    </section>
  );
}

export default BestSellers;
