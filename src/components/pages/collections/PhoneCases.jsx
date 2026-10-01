import useProducts from "../../../hooks/useProducts";
import useSEO from "../../../hooks/useSEO";
import { isInCategory } from "../../../utils/matchesCategory";
import ProductCard from "../../ui/ProductCard";

function PhoneCases() {
  useSEO({
    title: "Phone Cases",
    description:
      "Premium phone cases that combine everyday protection with artistic designs you'll enjoy carrying everywhere.",
    path: "/phonecases",
  });

  const { products, loading, error } = useProducts();

  const phonecases = products.filter((product) =>
    isInCategory(
      product,
      // Printify's own blueprint names aren't consistently singular or
      // plural ("iPhone Case" vs "Slim Phone Cases"), and the matching in
      // matchesCategory.js only counts a WHOLE word as a match -- "case"
      // deliberately does not match "cases" (same reason "hoodie" doesn't
      // wrongly match "hoodies" by accident elsewhere). Listing both forms
      // here, same pattern already used by Hoodies ("hoodie"/"hooded") and
      // Totebags ("bag"/"tote").
      ["case", "cases"],
      // 268 = "Slim Phone Cases" blueprint, added as a fallback too so this
      // specific blueprint still matches even if its name changes later.
      [268, 269, 370, 421, 841, 1521, 1273]
    )
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
