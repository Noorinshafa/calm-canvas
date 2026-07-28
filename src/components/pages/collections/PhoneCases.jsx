import useProducts from "../../../hooks/useProducts";
import ProductCard from "../../ui/ProductCard";

function PhoneCases() {

  const { products, loading, error } = useProducts();

  const phonecases = products.filter(product =>
    [269, 370, 421].includes(product.blueprint_id)
  );

  if (loading) return <h2>Loading...</h2>;

  if (error) return <h2>{error}</h2>;

  return (

    <section className="collection-page">

      <h1>Phone Cases</h1>

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