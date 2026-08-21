import useProducts from "../../../hooks/useProducts";
import useTitle from "../../../hooks/useTitle";
import { isInCategory } from "../../../utils/matchesCategory";
import ProductCard from "../../ui/ProductCard";

function Hoodies() {
  useTitle("Hoodies");

  const { products, loading, error } = useProducts();

  const hoodies = products.filter((product) =>
    isInCategory(product, ["hoodie", "hooded"], [77, 450, 1525])
  );

  if (loading) return <h2>Loading...</h2>;

  if (error) return <h2>{error}</h2>;

  return (
    <section className="collection-page">

      <div className="collection-header">

        <span>CALM CANVAS</span>

        <h1>Hoodies</h1>

        <p>
          Discover premium oversized hoodies designed for comfort,
          elegance and everyday style.
        </p>

      </div>

      <div className="products-grid">

        {hoodies.map((product) => (
          <ProductCard
            key={product.id}
            {...product}
          />
        ))}

      </div>

    </section>
  );
}

export default Hoodies;
