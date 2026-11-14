import { Link } from "react-router-dom";
import brand480 from "../../assets/home/brand-480.webp";
import brand845 from "../../assets/home/brand-845.webp";

// Brand banner, shown when the Christmas banner is not (after 26 December
// until 1 November).
function HomeStory() {
  return (
    <section className="home-section home-story" aria-labelledby="story-title">
      <div className="home-story-card">
        <div className="home-story-text">
          <p className="home-script">More Than Just a Brand</p>
          <h2 id="story-title">It&apos;s a Lifestyle.</h2>
          <p>
            ShopCalmCanvas is for dreamers, creators and everyone who loves
            the little things.
          </p>
          <Link to="/about" className="home-btn home-btn--pink">
            Discover Our Story
            <span aria-hidden="true">→</span>
          </Link>
        </div>
        <div className="home-story-media">
          <img
            src={brand845}
            srcSet={`${brand480} 480w, ${brand845} 845w`}
            sizes="(max-width: 860px) 92vw, 46vw"
            alt="Man in a forest green hoodie with a mountain line-art print, next to matching phone cases"
            width="845"
            height="921"
            loading="lazy"
            decoding="async"
          />
        </div>
      </div>
    </section>
  );
}

export default HomeStory;
