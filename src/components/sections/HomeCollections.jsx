import { Link } from "react-router-dom";
import OptimizedImage from "../ui/OptimizedImage";
import useHomePhoto from "../../hooks/useHomePhoto";
import { CATEGORY_TILES } from "../../content/homeImages.js";

// How wide a tile photo is on screen. Tiles are 4:5 and the square photo
// fills them, so the photo is as wide as the tile is tall (1.25 x its width):
// 2 tiles across below 1024px, 3 across up to the 1380px page width.
const TILE_SIZES = "(max-width: 1023px) 58vw, (max-width: 1500px) 38vw, 580px";
const TILE_WIDTHS = [384, 768, 1024];

function CategoryTile({ tile }) {
  const photo = useHomePhoto(tile, tile.key);

  return (
    <li>
      <Link to={tile.path} className="home-tile">
        <span className={`home-tile-media studio home-tile-media--${photo.kind}`}>
          <OptimizedImage
            className="home-tile-img studio-img"
            src={photo.src}
            alt={photo.alt}
            widths={TILE_WIDTHS}
            sizes={TILE_SIZES}
            width="1200"
            height="1200"
          />
        </span>
        <span className="home-tile-label">
          <span className="home-tile-name">{tile.label}</span>
          <span className="home-tile-cta" aria-hidden="true">Shop now</span>
        </span>
      </Link>
    </li>
  );
}

// "Shop by category": one large photo per collection, each a real product
// from the shop (see src/content/homeImages.js). The whole tile is a link.
function HomeCollections() {
  return (
    <section id="collections" className="home-section home-categories" aria-labelledby="collections-title">
      <div className="home-head">
        <h2 id="collections-title" className="home-title">Shop by category</h2>
        <Link to="/collections" className="home-head-link">
          View all products
        </Link>
      </div>

      <ul className="home-tiles">
        {CATEGORY_TILES.map((tile) => (
          <CategoryTile key={tile.key} tile={tile} />
        ))}
      </ul>
    </section>
  );
}

export default HomeCollections;
