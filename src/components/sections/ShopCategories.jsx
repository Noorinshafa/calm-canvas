import "../../styles/shopCategories.css";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

import hoodies from "../../assets/categories/hoodies.png";
import tshirts from "../../assets/categories/tshirts.png";
import mugs from "../../assets/categories/mugs.png";
import sweatshirts from "../../assets/categories/sweatshirts.png";
import phonecases from "../../assets/categories/phonecases.png";
import totebags from "../../assets/categories/totebags.png";

const categories = [
  {
    name: "Hoodies",
    image: hoodies,
    link: "/hoodies",
  },
  {
    name: "T-Shirts",
    image: tshirts,
    link: "/tshirts",
  },
  {
    name: "Mugs",
    image: mugs,
    link: "/mugs",
  },
  {
    name: "Sweatshirts",
    image: sweatshirts,
    link: "/sweatshirts",
  },
  {
    name: "Phone Cases",
    image: phonecases,
    link: "/phonecases",
  },
  {
    name: "Tote Bags",
    image: totebags,
    link: "/totebags",
  },
];

function ShopCategories() {
  return (
    <section className="shop-section">

      <div className="shop-heading">

        <span>SHOP BY COLLECTION</span>

        <h2>
          Discover Your
          <span> Style</span>
        </h2>

        <p>
          Explore our premium collections designed to
          add creativity and elegance to everyday life.
        </p>

      </div>

      <div className="shop-grid">

        {categories.map((item, index) => (

          <motion.div

            key={index}

            initial={{ opacity: 0, y: 70 }}

            whileInView={{ opacity: 1, y: 0 }}

            transition={{
              duration: .6,
              delay: index * .12
            }}

            viewport={{ once: true }}

          >

            <Link
              to={item.link}
              className="collection-card"
            >

              <img
                src={item.image}
                alt={item.name}
              />

              <div className="collection-overlay">

                <h3>{item.name}</h3>

                <button>
                  Explore Collection →
                </button>

              </div>

            </Link>

          </motion.div>

        ))}

      </div>

    </section>
  );
}

export default ShopCategories;