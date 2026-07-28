import useProducts from "../../../hooks/useProducts";
import ProductCard from "../../ui/ProductCard";

function Totebags() {

  const { products, loading, error } = useProducts();

  const totebags = products.filter(product =>
    [326, 1313, 1389].includes(product.blueprint_id)
  );

  if (loading) return <h2>Loading...</h2>;

  if (error) return <h2>{error}</h2>;

  return (

    <section className="collection-page">

      <h1>Tote Bags</h1>

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