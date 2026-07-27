import "../../../styles/jewellery.css";

import AccessoriesBanner from "../../../assets/banners/accessories-banner.png";

import accessories from "../../../data/accessories";

import ProductCard from "../../ui/ProductCard";

function Accessories() {

  return (

    <section className="jewellery-page">

      {/* =========================
          HERO
      ========================= */}

      <section className="jewellery-hero">

        <img
          src={AccessoriesBanner}
          alt="Accessories Banner"
          className="jewellery-bg"
        />

        <div className="jewellery-overlay"></div>

        <div className="jewellery-content">

          <span>✦ CALM CANVAS ACCESSORIES</span>

          <h1>Little Details, Big Charm</h1>

          <p>
            Discover beautiful bows, elegant hair bands,
            stylish clips and charming accessories
            designed to complete your everyday look.
          </p>

        </div>

      </section>

      {/* =========================
          PRODUCTS
      ========================= */}

      <section className="products-section">

        <div className="products-heading">

          <span>OUR COLLECTION</span>

          <h2>Featured Accessories</h2>

        </div>

        <div className="products-grid">

          {accessories.map((product) => (

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

export default Accessories;