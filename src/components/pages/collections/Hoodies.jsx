import useProducts from "../../../hooks/useProducts";
import ProductCard from "../../ui/ProductCard";

function Hoodies() {

  const { products, loading, error } = useProducts();

  const hoodies = products.filter(product =>
    [49, 1296].includes(product.blueprint_id)
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

        {hoodies.map(product => (

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