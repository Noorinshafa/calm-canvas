import "../../styles/floatingproducts.css";

import FloatingCard from "../ui/FloatingCard";

import Product1 from "../../assets/products/product 1.avif";
import Product2 from "../../assets/products/product 2.webp";
import Product3 from "../../assets/products/product 3.jpg";
import Product4 from "../../assets/products/product 4.avif";

function FloatingProducts() {
  return (
    <section className="floating-products">

      <div className="floating-heading">

        <span>OUR SIGNATURE PIECES</span>

        <h2>Jewelry That Feels Like Magic</h2>

        <p>
          Elegant pieces thoughtfully selected to become part of your story.
        </p>

      </div>

      <div className="floating-layout">

        <FloatingCard
          image={Product1}
          title="Butterfly Pearl Set"
          price="Rs. 2,499"
          className="product-1"
        />

        <FloatingCard
          image={Product2}
          title="Golden Necklace"
          price="Rs. 3,499"
          className="product-2"
        />

        <FloatingCard
          image={Product3}
          title="Luxury Gift Box"
          price="Rs. 1,999"
          className="product-3"
        />

        <FloatingCard
          image={Product4}
          title="Crystal Earrings"
          price="Rs. 2,999"
          className="product-4"
        />

      </div>

      <button className="discover-btn">
        Discover Collection
      </button>

    </section>
  );
}

export default FloatingProducts;