import useProducts from "../../../hooks/useProducts";
import useTitle from "../../../hooks/useTitle";
import { isInCategory } from "../../../utils/matchesCategory";
import ProductCard from "../../ui/ProductCard";

function Totebags() {
  useTitle("Tote Bags");

  const { products, loading, error } = useProducts();

  const totebags = products.filter((product) =>
    isInCategory(product, ["bag", "tote"], [1313, 1389, 326])
  );

  if (loading) return <h2>Loading...</h2>;

  if (error) return <h2>{error}</h2>;

  return (

    <section className="collection-page">

       <div className="collection-header">

      <span>CALM CANVAS COLLECTION</span>

<h1>Carry Beauty Everywhere</h1>

<p>
Elegant tote bags designed to make every outing feel lighter, more organized, and effortlessly stylish.
</p>

    </div>

      <div className="products-grid">

        {totebags.map(product => (

          <ProductCard
            key={product.id}
            {...product}
          />

        ))}

      </div>

    </section>

  );

}

export default Totebags;
