import "../../styles/featuredcollection.css";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

import model1 from "../../assets/hero/model1.png";
import model2 from "../../assets/hero/model2.png";
import model3 from "../../assets/hero/model3.jpg";
import model4 from "../../assets/hero/model4.png";
import model5 from "../../assets/hero/model5.jpg";

const products = [
  {
    id: 1,
    image: model1,
    title: "Minimal Tees",
    category: "Graphic Wear",
    className: "featured-card orbit-left-top",
  },
  {
    id: 2,
    image: model2,
    title: "Signature Hoodies",
    category: "Premium Apparel",
    className: "featured-card orbit-center",
  },
  {
    id: 3,
    image: model3,
    title: "Canvas Totes",
    category: "Accessories",
    className: "featured-card orbit-right-top",
  },
  {
    id: 4,
    image: model4,
    title: "Phone Cases",
    category: "Lifestyle",
    className: "featured-card orbit-left-bottom",
  },
  {
    id: 5,
    image: model5,
    title: "Premium Mugs",
    category: "Home",
    className: "featured-card orbit-right-bottom",
  },
];

function FeaturedCollection() {
  return (
    <motion.section
      className="featured-section"
      initial={{ opacity: 0, y: 120 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 1 }}
    >
      {/* ================= HEADING ================= */}

<div className="featured-heading">

  <span className="featured-tag">
    CURATED COLLECTION
  </span>

  <h2>
    Floating
    <span> Collection</span>
  </h2>

  <p>
    Carefully designed premium products that blend
    creativity, elegance and modern lifestyle.
  </p>

</div>


{/* ================= ORBIT SHOWCASE ================= */}

<div className="orbit-showcase">

  <div className="orbit-ring ring-one"></div>
  <div className="orbit-ring ring-two"></div>

  {products.map((product, index) => (

    <motion.article

      key={product.id}

      className={product.className}

      initial={{
        opacity: 0,
        y: 120,
        scale: .8
      }}

      whileInView={{
        opacity: 1,
        y: 0,
        scale: 1
      }}

      viewport={{ once: true }}

      transition={{
        duration: .8,
        delay: index * .15
      }}

      whileHover={{
        y: -20,
        rotateX: 10,
        rotateY: -10,
        scale: 1.05
      }}

    >

      <div
        className="orbit-image"
        style={{
          backgroundImage: `url(${product.image})`
        }}
      >

        <div className="orbit-overlay">

          <span>{product.category}</span>

          <h3>{product.title}</h3>

          <Link to="/collections">
            Explore →
          </Link>

        </div>

      </div>

    </motion.article>

  ))}
  </div>

{/* ================= FOOTER ================= */}

<div className="featured-footer">

  <h3>
    Designed to Inspire Everyday Life
  </h3>

  <p>
    Explore premium print-on-demand products crafted
    with creativity, minimalism and timeless aesthetics.
  </p>

  <Link
    to="/collections"
    className="footer-button"
  >
    View Collection
  </Link>

</div>

</motion.section>

  );
}

export default FeaturedCollection;