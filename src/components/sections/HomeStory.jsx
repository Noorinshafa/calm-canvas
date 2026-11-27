import { Link } from "react-router-dom";
import useHomePhoto from "../../hooks/useHomePhoto";
import OptimizedImage from "../ui/OptimizedImage";
import { BAND_SIZES, BAND_WIDTHS, STORY_LOOK } from "../../content/homeImages.js";

// Brand banner, shown when the Christmas banner is not (27 December to
// 31 October): a real model in one of the shop's sweatshirts beside a forest
// green panel.
function HomeStory() {
  const photo = useHomePhoto(STORY_LOOK, "sweatshirts");

  return (
    <section className="home-band" aria-labelledby="story-title">
      <Link to={`/products/${photo.slug}`} className="home-band-media studio">
        <OptimizedImage
          className="home-band-img studio-img"
          src={photo.src}
          alt={photo.alt}
          widths={BAND_WIDTHS}
          sizes={BAND_SIZES}
          width="1200"
          height="1200"
        />
        <span className="hero-look-name">{photo.name}</span>
      </Link>

      <div className="home-band-text">
        <h2 id="story-title">Original art, made to wear and gift</h2>
        <p>
          ShopCalmCanvas is for dreamers, creators and everyone who loves
          the little things.
        </p>
        <Link to="/about" className="btn btn--light">
          Discover our story
        </Link>
      </div>
    </section>
  );
}

export default HomeStory;
