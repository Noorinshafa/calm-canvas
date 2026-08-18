import useProducts from "../../../hooks/useProducts";
import useTitle from "../../../hooks/useTitle";
import ProductCard from "../../ui/ProductCard";

function Sweatshirts() {
  useTitle("Sweatshirts");

  const { products, loading, error } = useProducts();

  const sweatshirts = products.filter((product) =>
    [49, 1405].includes(Number(product.blueprint_id))
  );

  if (loading) {
    return <h2>Loading...</h2>;
  }

  if (error) {
    return <h2>{error}</h2>;
  }

  return (
    <section className="collection-page">

      <div className="collection-header">

        <span>CALM CANVAS COLLECTION</span>

        <h1>Effortless Comfort</h1>

        <p>
          Soft, comfortable sweatshirts designed for relaxed
          everyday style with the Calm Canvas aesthetic.
        </p>

      </div>

      <div className="products-grid">

        {sweatshirts.map((product) => (
          <ProductCard
            key={product.id}
            {...product}
          />
        ))}

      </div>

    </section>
  );
}

export default Sweatshirts;
