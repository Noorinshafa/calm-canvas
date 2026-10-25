import { useMemo } from "react";
import { Link } from "react-router-dom";
import useProducts from "../../hooks/useProducts";
import useSEO from "../../hooks/useSEO";
import Breadcrumbs from "../common/Breadcrumbs";
import ChristmasGrid from "../sections/ChristmasGrid";
import { ProductGridSkeleton } from "../ui/Skeletons";
import { breadcrumbJsonLd, collectionJsonLd } from "../../utils/seoShared.js";
import {
  CHRISTMAS_PAGE,
  christmasSeason,
  daysLabel,
  resolvePicks,
} from "../../content/christmas.js";

import "../../styles/seo-extras.css";
import "../../styles/christmas.css";

const CRUMBS = [
  { name: "Home", path: "/" },
  { name: "Christmas Gifts", path: CHRISTMAS_PAGE.path },
];

// The page that search engines and Pinterest should rank for Christmas gift
// searches. Its text lives in src/content/christmas.js, the same file the
// build script reads, so the HTML search engines receive matches what
// visitors see. The page stays online all year; only the countdown is
// seasonal.
function ChristmasGiftsPage() {
  const { products, loading, error } = useProducts();

  const picks = useMemo(() => resolvePicks(products), [products]);

  const jsonLd = useMemo(
    () => [
      breadcrumbJsonLd(CRUMBS),
      collectionJsonLd(
        CHRISTMAS_PAGE,
        picks.map((entry) => entry.product)
      ),
    ],
    [picks]
  );

  useSEO({
    title: CHRISTMAS_PAGE.title,
    description: CHRISTMAS_PAGE.description,
    path: CHRISTMAS_PAGE.path,
    image: CHRISTMAS_PAGE.ogImage,
    jsonLd,
  });

  const { daysLeft } = christmasSeason();
  const count = daysLabel(daysLeft);

  return (
    <main className="xmas-page">
      <Breadcrumbs items={CRUMBS} />

      <div className="xmas-head">
        {count && <span className="xmas-count">{count}</span>}

        <h1>{CHRISTMAS_PAGE.h1}</h1>

        <p className="xmas-lede">{CHRISTMAS_PAGE.tagline}</p>
      </div>

      <div className="xmas-grid-wrap">
        {loading && <ProductGridSkeleton count={8} className="xmas-grid" />}

        {!loading && error && (
            <p className="xmas-empty">
              We couldn't load the gifts just now. Please refresh the page in a moment.
            </p>
          )}

        {!loading && !error && picks.length === 0 && (
          <p className="xmas-empty">
            New gift ideas are on the way. Browse our{" "}
            <Link to="/collections">collections</Link> in the meantime.
          </p>
        )}

        {!loading && !error && picks.length > 0 && <ChristmasGrid picks={picks} />}
      </div>

      <div className="xmas-guide">
        <div>
          <h2>Christmas gifts from ShopCalmCanvas</h2>

          {CHRISTMAS_PAGE.intro.map((paragraph) => (
            <p key={paragraph.slice(0, 40)}>{paragraph}</p>
          ))}
        </div>

        {CHRISTMAS_PAGE.sections.map((section) => (
          <div key={section.heading}>
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
      </div>
    </main>
  );
}

export default ChristmasGiftsPage;
