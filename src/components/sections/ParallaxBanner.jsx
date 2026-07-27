import "../../styles/parallaxbanner.css";

import { Link } from "react-router-dom";

import Banner from "../../assets/banners/gifts-banner.png";

function ParallaxBanner() {

  return (

    <section
      className="parallax-banner"
      style={{ backgroundImage: `url(${Banner})` }}
    >

      <div className="parallax-overlay">

        <div className="parallax-content">

          <span>✦ CALM CANVAS</span>

          <h2>
            Crafted With Love
          </h2>

          <p>
            Every piece at Calm Canvas is thoughtfully
            selected to bring beauty, elegance and
            a little happiness into your everyday life.
          </p>

          <Link
            to="/collections"
            className="parallax-btn"
          >
            Explore Collections →
          </Link>

        </div>

      </div>

    </section>

  );

}

export default ParallaxBanner;