import "../../../styles/jewellery.css";

import GiftsBanner from "../../../assets/banners/gifts-banner.png";

import gifts from "../../../data/gifts";

import ProductCard from "../../ui/ProductCard";

function Gifts() {

  return (

    <section className="jewellery-page">

      <section className="jewellery-hero">

        <img
          src={GiftsBanner}
          alt="Gifts Banner"
          className="jewellery-bg"
        />

        <div className="jewellery-overlay"></div>

        <div className="jewellery-content">

          <span>✦ CALM CANVAS GIFTS</span>

          <h1>Thoughtfully Wrapped</h1>

          <p>
            Beautiful gifts carefully selected
            to celebrate birthdays,
            anniversaries and unforgettable moments.
          </p>

        </div>

      </section>

      <section className="products-section">

        <div className="products-heading">

          <span>OUR COLLECTION</span>

          <h2>Featured Gifts</h2>

        </div>

        <div className="products-grid">

          {gifts.map((product) => (

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

export default Gifts;