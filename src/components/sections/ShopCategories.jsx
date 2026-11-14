import "../../styles/shopCategories.css";
import { Link } from "react-router-dom";

// Each category photo comes in three widths (480, 800 and the 1254 px
// original) so a phone downloads a small copy instead of the full-size file.
// `sizes` matches the grid in shopCategories.css: one column up to 900px
// wide, two columns (max 1400px in total) above that.
import hoodies from "../../assets/categories/hoodies.webp";
import hoodies480 from "../../assets/categories/hoodies-480.webp";
import hoodies800 from "../../assets/categories/hoodies-800.webp";
import tshirts from "../../assets/categories/tshirts.webp";
import tshirts480 from "../../assets/categories/tshirts-480.webp";
import tshirts800 from "../../assets/categories/tshirts-800.webp";
import mugs from "../../assets/categories/mugs.webp";
import mugs480 from "../../assets/categories/mugs-480.webp";
import mugs800 from "../../assets/categories/mugs-800.webp";
import sweatshirts from "../../assets/categories/sweatshirts.webp";
import sweatshirts480 from "../../assets/categories/sweatshirts-480.webp";
import sweatshirts800 from "../../assets/categories/sweatshirts-800.webp";
import phonecases from "../../assets/categories/phonecases.webp";
import phonecases480 from "../../assets/categories/phonecases-480.webp";
import phonecases800 from "../../assets/categories/phonecases-800.webp";
import totebags from "../../assets/categories/totebags.webp";
import totebags480 from "../../assets/categories/totebags-480.webp";
import totebags800 from "../../assets/categories/totebags-800.webp";

const SIZES =
  "(max-width: 900px) 90vw, (max-width: 1628px) calc(43vw - 20px), 680px";

const categories = [
  { name: "Hoodies", link: "/hoodies", images: [hoodies480, hoodies800, hoodies] },
  { name: "T-Shirts", link: "/tshirts", images: [tshirts480, tshirts800, tshirts] },
  { name: "Mugs", link: "/mugs", images: [mugs480, mugs800, mugs] },
  { name: "Sweatshirts", link: "/sweatshirts", images: [sweatshirts480, sweatshirts800, sweatshirts] },
  { name: "Phone Cases", link: "/phonecases", images: [phonecases480, phonecases800, phonecases] },
  { name: "Tote Bags", link: "/totebags", images: [totebags480, totebags800, totebags] },
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
        {categories.map((item) => {
          const [small, medium, large] = item.images;
          return (
            <Link key={item.link} to={item.link} className="collection-card">
              <img
                src={medium}
                srcSet={`${small} 480w, ${medium} 800w, ${large} 1254w`}
                sizes={SIZES}
                alt={item.name}
                width="1254"
                height="1254"
                loading="lazy"
                decoding="async"
              />
              {/* A label, not a button: the whole card is already the link. */}
              <div className="collection-overlay">
                <h3>{item.name}</h3>
                <span className="collection-cta" aria-hidden="true">
                  Explore Collection →
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

export default ShopCategories;
