import { motion } from "framer-motion";
import "../../styles/collections.css";


import Jewelry from "../../assets/collections/jewelry.png";
import Bows from "../../assets/collections/bows.png";
import Bracelets from "../../assets/collections/bracelets.png";
import Accessories from "../../assets/collections/accessories.png";

function Collections() {
  return (
    <section className="collections">

      <motion.div
        className="collections-heading"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <h2>Shop by Collection</h2>

        <p>
          Curated pieces designed to make every moment beautiful.
        </p>
      </motion.div>

      <div className="collections-grid">

        {/* Jewelry */}

        <motion.div
          className="collection-card large"
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: .7 }}
        >
          <img src={Jewelry} alt="Jewelry" />

          <div className="collection-overlay">

            <span>Luxury Collection</span>

            <h3>Jewelry</h3>

            <button>
              Explore Collection →
            </button>

          </div>

        </motion.div>

        {/* Hair Bows */}

        <motion.div
          className="collection-card small"
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: .1, duration: .7 }}
        >
          <img src={Bows} alt="Hair Bows" />

          <div className="collection-overlay">

            <span>Elegant Style</span>

            <h3>Hair Bows</h3>

            <button>
              Explore →
            </button>

          </div>

        </motion.div>

        {/* Bracelets */}

        <motion.div
          className="collection-card small"
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: .2, duration: .7 }}
        >
          <img src={Bracelets} alt="Bracelets" />

          <div className="collection-overlay">

            <span>Handcrafted</span>

            <h3>Bracelets</h3>

            <button>
              Explore →
            </button>

          </div>

        </motion.div>

        {/* Accessories */}

        <motion.div
          className="collection-card large"
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: .3, duration: .7 }}
        >
          <img src={Accessories} alt="Accessories" />

          <div className="collection-overlay">

            <span>Complete Your Look</span>

            <h3>Accessories</h3>

            <button>
              Explore Collection →
            </button>

          </div>

        </motion.div>

      </div>

    </section>
  );
}

export default Collections;