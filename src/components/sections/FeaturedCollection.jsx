import "../../styles/featuredcollection.css";
import useProducts from "../../hooks/useProducts";

import ProductCard from "../ui/ProductCard";
import ExploreCard from "../ui/ExploreCard";

function FeaturedCollection() {
  const { products, loading, error } = useProducts();

  const tshirts = products.filter((p) =>
    [6, 145, 281, 706].includes(p.blueprint_id)
  );

  const hoodies = products.filter((p) =>
    [49, 1296].includes(p.blueprint_id)
  );

  const totebags = products.filter((p) =>
    [326, 1313, 1389].includes(p.blueprint_id)
  );

  const phonecases = products.filter((p) =>
    [269, 370, 421].includes(p.blueprint_id)
  );

  if (loading) return <h2>Loading products...</h2>;

  if (error) return <h2>{error}</h2>;

  return (
    <section className="featured">

      <div className="featured-heading">
        <span>SHOP OUR FAVORITES</span>

        <h2>Made to Express Your Style</h2>

        <p>
          Discover premium graphic apparel and accessories designed to
          reflect your personality.
        </p>
      </div>

      {/* T-Shirts */}

      <div className="category-heading">
        <span>✦ TRENDING T-SHIRTS</span>

        <h3>Graphic T-Shirts You'll Love</h3>

        <p>
          Comfortable, stylish and designed to express your personality.
        </p>
      </div>

      <div className="products-row">
        {tshirts.slice(0, 4).map((product) => (
          <ProductCard
            key={product.id}
            {...product}
          />
        ))}

        <ExploreCard link="/tshirts" />
      </div>

      {/* Hoodies */}

      <div className="category-heading">
        <span>✦ COZY HOODIES</span>

        <h3>Wrap Yourself in Comfort</h3>

        <p>
          Soft, stylish hoodies made for everyday comfort and effortless
          streetwear.
        </p>
      </div>

      <div className="products-row">
        {hoodies.slice(0, 4).map((product) => (
          <ProductCard
            key={product.id}
            {...product}
          />
        ))}

        <ExploreCard link="/hoodies" />
      </div>

      {/* Tote Bags */}

      <div className="category-heading">
        <span>✦ EVERYDAY TOTE BAGS</span>

        <h3>Carry Style Everywhere</h3>

        <p>
          Practical tote bags with unique designs that make every outing
          more stylish.
        </p>
      </div>

      <div className="products-row">
        {totebags.slice(0, 4).map((product) => (
          <ProductCard
            key={product.id}
            {...product}
          />
        ))}

        <ExploreCard link="/totebags" />
      </div>

      {/* Phone Cases */}

      <div className="category-heading">
        <span>✦ STYLISH PHONE CASES</span>

        <h3>Protect Your Phone in Style</h3>

        <p>
          Durable phone cases that keep your device safe while showing off
          your personality.
        </p>
      </div>

      <div className="products-row">
        {phonecases.slice(0, 4).map((product) => (
          <ProductCard
            key={product.id}
            {...product}
          />
        ))}

        <ExploreCard link="/phonecases" />
      </div>

    </section>
  );
}

export default FeaturedCollection;