import { useMemo } from "react";
import { Link } from "react-router-dom";
import useProducts from "../../hooks/useProducts";
import useSEO from "../../hooks/useSEO";
import ShopPage from "./ShopPage";
import { COLLECTIONS } from "../../config/site.js";
import { THEME_PAGES, getTheme, themeProducts } from "../../content/themes.js";
import { breadcrumbJsonLd, collectionJsonLd } from "../../utils/seoShared.js";

import "../../styles/seo-extras.css";

// One template for every theme gift page (cat lovers, dog lovers, floral,
// Halloween). The text lives in src/content/themes.js, the same file the build
// script reads, so the HTML search engines receive matches what visitors see.
// It is laid out like the category pages (ShopPage: banner with photos of
// the theme's products, filters, sorting, grid), and the products
// shown are every product whose name contains one of the theme's words.
function ThemeView({ themeKey }) {
  const theme = getTheme(themeKey);
  const { products, loading, error } = useProducts();

  const items = useMemo(() => themeProducts(theme, products), [theme, products]);

  const crumbs = useMemo(
    () => [
      { name: "Home", path: "/" },
      { name: theme.nav, path: theme.path },
    ],
    [theme]
  );

  const jsonLd = useMemo(
    () => [breadcrumbJsonLd(crumbs), collectionJsonLd(theme, items)],
    [crumbs, theme, items]
  );

  useSEO({
    title: theme.title,
    description: theme.description,
    path: theme.path,
    image: theme.ogImage,
    jsonLd,
  });

  const otherThemes = THEME_PAGES.filter((item) => item.key !== theme.key);

  return (
    <ShopPage
      crumbs={crumbs}
      title={theme.h1}
      subtitle={theme.tagline}
      products={items}
      loading={loading}
      error={error}
      emptyNote={
        <>
          New designs are on the way. Browse our{" "}
          <Link to="/collections">collections</Link> in the meantime.
        </>
      }
    >
      <div className="collection-intro">
        <h2>{theme.h1}: what you will find here</h2>

        {theme.intro.map((paragraph) => (
          <p key={paragraph.slice(0, 40)}>{paragraph}</p>
        ))}
      </div>

      {theme.sections.map((section) => (
        <div className="collection-intro" key={section.heading}>
          <h2>{section.heading}</h2>

          {section.paragraphs.map((paragraph) => (
            <p key={paragraph.slice(0, 40)}>{paragraph}</p>
          ))}

          {section.links && (
            <ul>
              {section.links.map((item) => (
                <li key={item.to}>
                  <Link to={item.to}>{item.text}</Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}

      <nav className="collection-links" aria-label="More gift ideas">
        <h2>Keep browsing</h2>

        <ul>
          {otherThemes.map((item) => (
            <li key={item.key}>
              <Link to={item.path}>{item.nav}</Link>
            </li>
          ))}

          <li>
            <Link to="/christmas-gifts">Christmas Gifts</Link>
          </li>

          {COLLECTIONS.map((item) => (
            <li key={item.key}>
              <Link to={item.path}>{item.nav}</Link>
            </li>
          ))}

          <li>
            <Link to="/blog">Gift &amp; style ideas</Link>
          </li>
        </ul>
      </nav>
    </ShopPage>
  );
}

export default ThemeView;
