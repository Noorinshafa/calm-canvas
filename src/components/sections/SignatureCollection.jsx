import "../../styles/signaturecollection.css";

import Product1 from "../../assets/products/product 1.avif";
import Product2 from "../../assets/products/product 2.webp";
import Product3 from "../../assets/products/product 3.jpg";
import Product4 from "../../assets/products/product 4.avif";
import Product5 from "../../assets/products/product 5.webp";

const products = [
  {
    id: 1,
    image: Product1,
    title: "Butterfly Pearl Set",
    price: "Rs. 2,499",
    className: "bubble-one",
  },
  {
    id: 2,
    image: Product2,
    title: "Golden Necklace",
    price: "Rs. 3,499",
    className: "bubble-two",
  },
  {
    id: 3,
    image: Product3,
    title: "Luxury Gift Box",
    price: "Rs. 1,999",
    className: "bubble-three",
  },
  {
    id: 4,
    image: Product4,
    title: "Crystal Earrings",
    price: "Rs. 2,999",
    className: "bubble-four",
  },
  {
    id: 5,
    image: Product5,
    title: "Rose Gold Bracelet",
    price: "Rs. 2,299",
    className: "bubble-five",
  },
];

function SignatureCollection() {
  return (
    <section className="signature">

      <div className="signature-heading">

        <span>OUR SIGNATURE COLLECTION</span>

        <h2>Jewelry That Feels Like Magic</h2>

        <p>
          Delicate treasures floating in elegance,
          waiting to become part of your story.
        </p>

      </div>

      <div className="bubble-container">

        {products.map((product) => (

          <div
            key={product.id}
            className={`bubble ${product.className}`}
          >

            <div className="bubble-glow"></div>

            <div className="bubble-frame">

              <img
                src={product.image}
                alt={product.title}
              />

            </div>

            <div className="bubble-info">

              <h3>{product.title}</h3>

              <p>{product.price}</p>

            </div>

          </div>

        ))}

      </div>

    </section>
  );
}

export default SignatureCollection;