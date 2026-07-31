import useProducts from "../../../hooks/useProducts";
import ProductCard from "../../ui/ProductCard";

function Tshirts() {

  const { products, loading, error } = useProducts();

  const tshirts = products.filter(product =>
    [6, 145, 281, 706].includes(product.blueprint_id)
  );

  if (loading) return <h2>Loading...</h2>;

  if (error) return <h2>{error}</h2>;

  return (

    <section className="collection-page">

      <h1>T-Shirts</h1>

      <div className="products-grid">

        {tshirts.map(product => (

          <ProductCard
            key={product.id}
            {...product}
          />

        ))}

      </div>

    </section>

  );

}

export default Tshirts;