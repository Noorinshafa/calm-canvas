import "../../styles/parallaxBanner.css";
import { Link } from "react-router-dom";

import banner from "../../assets/parallax/parallax banner.png";

function ParallaxBanner() {

  return (

    <section
      className="parallax-banner"
      style={{
        backgroundImage: `url(${banner})`,
      }}
    >

      <div className="parallax-overlay">

        <span>CALM CANVAS</span>

        <h2>
          Wear Art.
          <br />
          Live Beautifully.
        </h2>

        <p>
          Every design tells a story. Discover premium
          apparel and accessories created to inspire
          your everyday moments.
        </p>

        <Link
          to="/collections"
          className="parallax-btn"
        >
          Explore Collection
        </Link>

      </div>

    </section>

  );

}

export default ParallaxBanner;