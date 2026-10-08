import { useMemo } from "react";
import { Link } from "react-router-dom";
import useProducts from "../../hooks/useProducts";
import useSEO from "../../hooks/useSEO";
import ProductCard from "../ui/ProductCard";
import Breadcrumbs from "./Breadcrumbs";
import { COLLECTIONS, getCollection } from "../../config/site.js";
import {
  productInCollection,
  breadcrumbJsonLd,
  collectionJsonLd,
} from "../../utils/seoShared.js";

import "../../styles/seo-extras.css";

// One template for every category page (hoodies, T-shirts, sweatshirts, tote
// bags, phone cases, mugs). The text for each lives in src/config/site.js --
// the same place the build script reads, so the HTML search engines receive
// matches what visitors see.
function CollectionView({ collectionKey }) {
  const collection = getCollection(collectionKey);
  const { products, loading, error } = useProducts();

  const items = useMemo(
    () => products.filter((product) => productInCollection(product, collection)),
    [products, collection]
  );

  const crumbs = useMemo(
    () => [
      { name: "Home", path: "/" },
      { name: "Collections", path: "/collections" },
      { name: collection.nav, path: collection.path },
    ],
    [collection]
  );

  const jsonLd = useMemo(
    () => [
      breadcrumbJsonLd(crumbs),
      collectionJsonLd(
        collection,
        items.filter((product) => product.indexable !== false)
      ),
    ],
    [crumbs, collection, items]
  );

  useSEO({
    title: collection.title,
    description: collection.description,
    path: collection.path,
    image: collection.ogImage,
    jsonLd,
  });

  if (loading) return <h2>Loading...</h2>;

  if (error) return <h2>{error}</h2>;

  const otherCollections = COLLECTIONS.filter((item) => item.key !== collection.key);

  return (
    <section className="collection-page">
      <Breadcrumbs items={crumbs} />

      <div className="collection-header">
        <span>{collection.eyebrow}</span>

        <h1>{collection.h1}</h1>

        <p>{collection.tagline}</p>
      </div>

      {items.length === 0 ? (
        <p className="collection-empty">
          New designs are on the way. Browse our{" "}
          <Link to="/collections">other collections</Link> in the meantime.
        </p>
      ) : (
        <div className="products-grid">
          {items.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      )}

      <div className="collection-intro">
        <h2>About our {collection.nav.toLowerCase()}</h2>

        {collection.intro.map((paragraph) => (
          <p key={paragraph.slice(0, 40)}>{paragraph}</p>
        ))}
      </div>

      <nav className="collection-links" aria-label="More collections">
        <h2>Keep browsing</h2>

        <ul>
          {otherCollections.map((item) => (
            <li key={item.key}>
              <Link to={item.path}>{item.nav}</Link>
            </li>
          ))}

          <li>
            <Link to="/blog">Gift &amp; style ideas</Link>
          </li>
        </ul>
      </nav>
    </section>
  );
}

export default CollectionView;
