import useProducts from "../../../hooks/useProducts";
import useTitle from "../../../hooks/useTitle";
import ProductCard from "../../ui/ProductCard";

function Tshirts() {
  useTitle("T-Shirts");

  const { products, loading, error } = useProducts();

  const tshirts = products.filter((product) =>
    [6, 145, 281, 466, 706, 800, 1476].includes(
      Number(product.blueprint_id)
    )
  );

  if (loading) return <h2>Loading...</h2>;

  if (error) return <h2>{error}</h2>;

  return (
    <section className="collection-page">

      <div className="collection-header">

        <span>CALM CANVAS COLLECTION</span>

        <h1>Everyday Essentials</h1>

        <p>
          Minimal, comfortable, and beautifully designed T-shirts
          created to bring art and personality into your everyday wardrobe.
        </p>

      </div>

      <div className="products-grid">

        {tshirts.map((product) => (
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
