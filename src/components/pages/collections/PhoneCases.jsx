import useProducts from "../../../hooks/useProducts";
import useTitle from "../../../hooks/useTitle";
import { isInCategory } from "../../../utils/matchesCategory";
import ProductCard from "../../ui/ProductCard";

function PhoneCases() {
  useTitle("Phone Cases");

  const { products, loading, error } = useProducts();

  const phonecases = products.filter((product) =>
    isInCategory(product, ["case"], [269, 370, 421, 841, 1521, 1273])
  );

  if (loading) return <h2>Loading...</h2>;

  if (error) return <h2>{error}</h2>;

  return (

    <section className="collection-page">

      <div className="collection-header">

        <span>CALM CANVAS COLLECTION</span>

<h1>Protection Meets Style</h1>

<p>
Premium phone cases that combine everyday protection with artistic designs you'll enjoy carrying everywhere.
</p>

    </div>

      <div className="products-grid">

        {phonecases.map(product => (

          <ProductCard
            key={product.id}
            {...product}
          />

        ))}

      </div>

    </section>

  );

}

export default PhoneCases;
