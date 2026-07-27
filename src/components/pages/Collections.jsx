import "../../styles/collections.css";

import { Link } from "react-router-dom";

import JewelleryBanner from "../../assets/banners/jewellery-banner.png";
import AccessoriesBanner from "../../assets/banners/accessories-banner.png";
import GiftsBanner from "../../assets/banners/gifts-banner.png";

function Collections() {
  return (
    <section className="collections">

      {/* =======================
          PAGE HEADING
      ======================== */}

      <div className="collections-heading">

        <span>OUR COLLECTIONS</span>

        <h1>Curated For Every Moment</h1>

        <p>
          Discover beautiful collections carefully curated
          to celebrate elegance, everyday charm,
          and thoughtful gifting.
        </p>

      </div>

      {/* =======================
          JEWELLERY
      ======================== */}

      <section className="collection-banner">

        <div className="banner-image">

          <img
            src={JewelleryBanner}
            alt="Jewellery Collection"
          />

        </div>

        <div className="banner-content">

          <span>✦ JEWELLERY</span>

          <h2>Timeless Elegance</h2>

          <p>
            Discover necklaces, bracelets, earrings,
            and elegant pieces crafted to make
            every moment unforgettable.
          </p>

          <Link
            to="/jewellery"
            className="banner-button"
          >
            Discover Jewellery →
          </Link>

        </div>

      </section>

      {/* =======================
          ACCESSORIES
      ======================== */}

      <section className="collection-banner reverse">

        <div className="banner-image">

          <img
            src={AccessoriesBanner}
            alt="Accessories Collection"
          />

        </div>

        <div className="banner-content">

          <span>✦ ACCESSORIES</span>

          <h2>Little Details, Big Charm</h2>

          <p>
            Cute bows, elegant hair bands,
            charming keychains and beautiful
            everyday accessories designed
            to complete your look.
          </p>

          <Link
            to="/accessories"
            className="banner-button"
          >
            Explore Accessories →
          </Link>

        </div>

      </section>

      {/* =======================
          GIFTS
      ======================== */}

      <section className="collection-banner">

        <div className="banner-image">

          <img
            src={GiftsBanner}
            alt="Gift Collection"
          />

        </div>

        <div className="banner-content">

          <span>✦ THOUGHTFUL GIFTS</span>

          <h2>Wrapped With Love</h2>

          <p>
            Beautiful gifts carefully selected
            to celebrate birthdays,
            anniversaries and unforgettable
            moments.
          </p>

          <Link
            to="/gifts"
            className="banner-button"
          >
            Find The Perfect Gift →
          </Link>

        </div>

      </section>

    </section>
  );
}

export default Collections;