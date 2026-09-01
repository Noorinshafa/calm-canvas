import { Link } from "react-router-dom";
import useProducts from "../../hooks/useProducts";
import TiltCard from "../ui/TiltCard";
import "../../styles/bestsellers.css";

// Shows real, live products straight from the shop (not stock photos),
// so the homepage always reflects what's actually for sale right now.
function BestSellers() {
  const { products, loading, error } = useProducts();

  const featured = products.filter((product) => product.image).slice(0, 8);

  // Don't show an empty or broken-looking section while products are
  // still loading, or if something went wrong fetching them.
  if (loading || error || featured.length === 0) {
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

      <div className="bestsellers-row">

        {featured.map((product) => (
          <TiltCard
            className="bestseller-card"
            key={product.id}
            maxTilt={8}
          >
            <Link
              to={`/product/${product.id}`}
              className="bestseller-link"
            >

              <div className="bestseller-image">
                <img
                  src={product.image}
                  alt={product.title}
                  loading="lazy"
                  decoding="async"
                />
              </div>

              <div className="bestseller-info">
                <h3>{product.title}</h3>
                <span>{product.price}</span>
              </div>

            </Link>
          </TiltCard>
        ))}

      </div>

      <div className="bestsellers-footer">
        <Link to="/collections" className="bestsellers-btn">
          Browse Full Collection →
        </Link>
      </div>

    </section>
  );
}

export default BestSellers;
