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