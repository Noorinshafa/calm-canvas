import { useEffect } from "react";
import { Link } from "react-router-dom";
import "../../styles/hero.css";

// Soft, blurred room photo behind the hero (tiny files: 10 KB and 21 KB).
import bg960 from "../../assets/home/hero-bg-960.webp";
import bg1672 from "../../assets/home/hero-bg-1672.webp";
// Phones and tablets: a tall pastel room photo (arch, plants) that fits a
// portrait screen instead of a cropped strip of the wide one (6-14 KB).
import bgM480 from "../../assets/home/hero-bg-m-480.webp";
import bgM720 from "../../assets/home/hero-bg-m-720.webp";
import bgM941 from "../../assets/home/hero-bg-m-941.webp";

// Three models (transparent background) in graphic tees, hoodies and a
// tote bag. Their heads rise a little into the header and their shoes step
// into the section below (see .hero-models in hero.css).
import models560 from "../../assets/home/models-560.webp";
import models820 from "../../assets/home/models-820.webp";
import models1129 from "../../assets/home/models-1129.webp";
// The same photo as AVIF (about 25% smaller); browsers that cannot show AVIF
// use the WebP files above.
import models560avif from "../../assets/home/models-560.avif";
import models820avif from "../../assets/home/models-820.avif";
import models1129avif from "../../assets/home/models-1129.avif";

// Shared with scripts/postbuild.mjs, which tells the browser to start loading
// these photos from the home page HTML (before the app has even started).
export const MODELS_SIZES = "(max-width: 1023px) min(92vw, 440px), 660px";
export const BG_SIZES = "100vw";
// Below this width the tall phone photo is used (must match postbuild.mjs).
export const BG_PHONE_MEDIA = "(max-width: 1023px)";

// The handwritten lines on the home page use the "Allura" script font. Only
// the letters in these lines are downloaded (Google Fonts "text=" option, a
// file of a few KB), and it is loaded after the page has appeared, so it can
// never slow down the first view. Until it arrives a normal serif is shown.
export const SCRIPT_LINES = [
  "Welcome to ShopCalmCanvas",
  "The Christmas Gift Shop",
  "More Than Just a Brand",
];

function useScriptFont() {
  useEffect(() => {
    const id = "scc-script-font";
    if (document.getElementById(id)) return;
    const letters = [...new Set(SCRIPT_LINES.join(""))].join("");
    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href = `https://fonts.googleapis.com/css2?family=Allura&display=swap&text=${encodeURIComponent(letters)}`;
    document.head.appendChild(link);
  }, []);
}

function Hero({ festive = false }) {
  useScriptFont();

  return (
    <section className="hero" aria-labelledby="hero-title">
      <picture>
        <source
          media={BG_PHONE_MEDIA}
          srcSet={`${bgM480} 480w, ${bgM720} 720w, ${bgM941} 941w`}
          sizes={BG_SIZES}
          width="941"
          height="1672"
        />
        <img
          className="hero-bg-img"
          src={bg1672}
          srcSet={`${bg960} 960w, ${bg1672} 1672w`}
          sizes={BG_SIZES}
          width="1672"
          height="941"
          alt=""
          // Largest picture on the first screen (the page's LCP): top priority.
          fetchPriority="high"
        />
      </picture>

      <div className="hero-inner">
        <div className="hero-copy">
          <p className="hero-script">
            Welcome to ShopCalmCanvas
            <svg
              viewBox="0 0 24 24"
              width="22"
              height="22"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M12 20.5s-7.5-4.6-9.3-9.2C1.4 7.9 3.6 4.5 7 4.5c2.1 0 3.6 1.2 5 3 1.4-1.8 2.9-3 5-3 3.4 0 5.6 3.4 4.3 6.8-1.8 4.6-9.3 9.2-9.3 9.2z" />
            </svg>
          </p>

          <h1 id="hero-title" className="hero-title">
            Aesthetic Hoodies &amp; Gifts{" "}
            <span className="hero-title-accent">Made From Original Art</span>
          </h1>

          <h2 className="hero-subtitle">
            Cozy sweatshirts, graphic tees, mugs, tote bags and phone cases,
            printed to order just for you.
          </h2>

          <div className="hero-actions">
            <Link to="/collections" className="hero-btn hero-btn--primary">
              {/* Shorter label on phones, where the two buttons sit side by side. */}
              <span className="hero-btn-long">Shop the Collection</span>
              <span className="hero-btn-short">Shop Now</span>
              <svg
                viewBox="0 0 24 24"
                width="18"
                height="18"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </Link>
            {festive ? (
              <Link to="/christmas-gifts" className="hero-btn hero-btn--ghost">
                Christmas Gifts
              </Link>
            ) : (
              <a href="#collections" className="hero-btn hero-btn--ghost">
                Explore Collections
              </a>
            )}
          </div>
        </div>
      </div>

      <picture className="hero-models">
        <source
          type="image/avif"
          srcSet={`${models560avif} 560w, ${models820avif} 820w, ${models1129avif} 1129w`}
          sizes={MODELS_SIZES}
        />
        <img
          src={models820}
          srcSet={`${models560} 560w, ${models820} 820w, ${models1129} 1129w`}
          sizes={MODELS_SIZES}
          width="1129"
          height="1297"
          alt="Three friends wearing a dragon graphic tee, a burgundy fall LOVE hoodie and a sage green faith hoodie with a floral tote bag"
          loading="eager"
          fetchPriority="high"
        />
      </picture>
    </section>
  );
}

export default Hero;
