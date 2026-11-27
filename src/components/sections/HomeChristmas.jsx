import { useMemo } from "react";
import { Link } from "react-router-dom";
import useProducts from "../../hooks/useProducts";
import useHomePhoto from "../../hooks/useHomePhoto";
import OptimizedImage from "../ui/OptimizedImage";
import { ProductGridSkeleton } from "../ui/Skeletons";
import { CHRISTMAS_PAGE, resolvePicks } from "../../content/christmas.js";
import { BAND_SIZES, BAND_WIDTHS, CHRISTMAS_LOOK } from "../../content/homeImages.js";
import { HomeProductCard } from "./HomePicks";

// Christmas banner (replaces the brand banner from 1 November to 26 December):
// a large photo of a real model in one of the shop's Christmas sweatshirts
// beside a forest green panel, followed by the Christmas picks.
function HomeChristmas() {
  const { products, loading, error } = useProducts();
  const photo = useHomePhoto(CHRISTMAS_LOOK, "sweatshirts");
  const picks = useMemo(
    () => resolvePicks(products, { homeOnly: true }).map(({ product }) => product),
    [products]
  );

  if (!loading && (error || picks.length < 4)) return null;

  return (
    <>
      <section className="home-band" aria-labelledby="xmas-banner-title">
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
          <h2 id="xmas-banner-title">Gifts they&apos;ll love this Christmas</h2>
          <p>
            Cozy hoodies, festive mugs and little extras, each one printed
            just for the person you&apos;re giving it to.
          </p>
          <Link to={CHRISTMAS_PAGE.path} className="btn btn--light">
            Shop Christmas gifts
          </Link>
        </div>
      </section>

      <section className="home-section home-picks" aria-labelledby="xmas-picks-title">
        <div className="home-head">
          <h2 id="xmas-picks-title" className="home-title">Christmas picks</h2>
          <Link to={CHRISTMAS_PAGE.path} className="home-head-link">
            Shop all Christmas gifts
          </Link>
        </div>

        {loading ? (
          <ProductGridSkeleton count={8} className="home-picks-grid" />
        ) : (
          <ul className="home-picks-grid">
            {picks.map((product) => (
              <li key={product.id}>
                <HomeProductCard product={product} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}

export default HomeChristmas;
