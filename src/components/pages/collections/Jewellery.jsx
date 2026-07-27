import "../../../styles/jewellery.css";

import JewelleryBanner from "../../../assets/banners/jewellery-banner.png";

import jewellery from "../../../data/jewellery";

import ProductCard from "../../ui/ProductCard";

function Jewellery() {
  return (
    <section className="jewellery-page">

      {/* ===============================
          HERO SECTION
      ================================ */}

      <section className="jewellery-hero">

        <img
          src={JewelleryBanner}
          alt="Jewellery Banner"
          className="jewellery-bg"
        />

        <div className="jewellery-overlay"></div>

        <div className="jewellery-content">

          <span>✦ CALM CANVAS JEWELLERY</span>

          <h1>Timeless Jewellery</h1>

          <p>
            Discover elegant necklaces, bracelets,
            earrings and rings crafted to make every
            moment shine beautifully.
          </p>

        </div>

      </section>

      {/* ===============================
          PRODUCTS SECTION
      ================================ */}

      <section className="products-section">

        <div className="products-heading">

          <span>OUR COLLECTION</span>

          <h2>Featured Jewellery</h2>

        </div>

        <div className="products-grid">

          {jewellery.map((product) => (

            <ProductCard
              key={product.id}
              id={product.id}
              image={product.image}
              title={product.title}
              description={product.description}
              price={product.price}
            />

          ))}

        </div>

      </section>

    </section>
  );
}

export default Jewellery;