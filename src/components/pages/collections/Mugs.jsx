import useProducts from "../../../hooks/useProducts";
import ProductCard from "../../ui/ProductCard";

function Mugs() {

  const { products, loading, error } = useProducts();

  const mugs = products.filter(
  product => Number(product.blueprint_id) === 478
);

  if (loading) return <h2>Loading...</h2>;

  if (error) return <h2>{error}</h2>;

  return (

    <section className="collection-page">

      <div className="collection-header">

        <span>CALM CANVAS COLLECTION</span>

        <h1>Moments Worth Savoring</h1>

        <p>
          Beautiful mugs made for peaceful mornings, cozy evenings,
          and every warm drink that brightens your day.
        </p>

      </div>

      <div className="products-grid">

        {mugs.map(product => (

          <ProductCard
            key={product.id}
            {...product}
          />

        ))}

      </div>

    </section>

  );

}

export default Mugs;