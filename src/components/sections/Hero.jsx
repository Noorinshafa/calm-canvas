import { Link } from "react-router-dom";
import "../../styles/hero.css";
import OptimizedImage from "../ui/OptimizedImage";
import useHomePhoto from "../../hooks/useHomePhoto";
import { HERO_LOOKS, HERO_SIZES, HERO_WIDTHS } from "../../content/homeImages.js";

// One of the two large photos: a real model wearing a real product from the
// shop, on the same light grey as the rest of the page. The photo links to
// that product. The first photo is the page's largest picture, so it loads
// first and at top priority (scripts/postbuild.mjs also starts it early).
function HeroLook({ look, first }) {
  const photo = useHomePhoto(look, "hoodies");

  return (
    <Link to={`/products/${photo.slug}`} className="hero-look studio">
      <OptimizedImage
        className="hero-look-img studio-img"
        src={photo.src}
        alt={photo.alt}
        widths={HERO_WIDTHS}
        sizes={HERO_SIZES}
        priority={first}
        loading="eager"
        width="1200"
        height="1200"
      />
      <span className="hero-look-name">{photo.name}</span>
    </Link>
  );
}

// Top of the home page: the heading and buttons on the left, two large photos
// of real models on the right (stacked below the text on phones and tablets).
// The heading text is the page's main search heading: keep it in step with
// the home page in scripts/postbuild.mjs.
function Hero({ festive = false }) {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero-copy">
        <h1 id="hero-title" className="hero-title">
          Aesthetic Hoodies &amp; Gifts Made From Original Art
        </h1>

        <p className="hero-subtitle">
          Cozy sweatshirts, graphic tees, mugs, tote bags and phone cases,
          printed to order just for you.
        </p>

        <div className="hero-actions">
          <Link to="/collections" className="btn btn--primary">
            Shop the collection
          </Link>
          {festive ? (
            <Link to="/christmas-gifts" className="btn btn--outline">
              Christmas gifts
            </Link>
          ) : (
            <a href="#collections" className="btn btn--outline">
              Shop by category
            </a>
          )}
        </div>
      </div>

      <div className="hero-looks">
        {HERO_LOOKS.map((look, index) => (
          <HeroLook key={look.slug} look={look} first={index === 0} />
        ))}
      </div>
    </section>
  );
}

export default Hero;
