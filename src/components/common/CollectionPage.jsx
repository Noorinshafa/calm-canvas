import { Link } from "react-router-dom";
import useProducts from "../../hooks/useProducts";
import useSEO from "../../hooks/useSEO";
import ShopPage, { bannerPhotos } from "./ShopPage";
import { COLLECTIONS, PAGES } from "../../config/site.js";
import { breadcrumbJsonLd } from "../../utils/seoShared.js";
import "../../styles/seo-extras.css";

const CRUMBS = [
  { name: "Home", path: "/" },
  { name: "Collections", path: "/collections" },
];

// One photo each from three collections for the banner.
const PHOTOS = [
  ...bannerPhotos("hoodies", [2]),
  ...bannerPhotos("mugs", [1]),
  ...bannerPhotos("totebags", [2]),
];

// /collections: every product in the shop, with the category filter in the
// sidebar (ShopPage). Links to each collection page stay at the bottom.
function CollectionPage() {
  useSEO({
    title: PAGES.collections.title,
    description: PAGES.collections.description,
    path: PAGES.collections.path,
    jsonLd: breadcrumbJsonLd(CRUMBS),
  });

  const { products, loading, error } = useProducts();

  return (
    <ShopPage
      crumbs={CRUMBS}
      title="Our Products"
      subtitle="Discover original-art hoodies, sweatshirts, tees, mugs, tote bags and phone cases that match your vibe."
      photos={PHOTOS}
      products={products}
      loading={loading}
      error={error}
      emptyNote="New designs are on the way. Please check back soon."
    >
      <nav className="collection-links" aria-label="Collections">
        <h2>Shop by collection</h2>
        <ul>
          {COLLECTIONS.map((item) => (
            <li key={item.key}>
              <Link to={item.path}>{item.nav}</Link>
            </li>
          ))}
          <li>
            <Link to="/christmas-gifts">Christmas Gifts</Link>
          </li>
          <li>
            <Link to="/blog">Gift &amp; style ideas</Link>
          </li>
        </ul>
      </nav>
    </ShopPage>
  );
}

export default CollectionPage;
