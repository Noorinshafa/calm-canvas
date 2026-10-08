import { useMemo } from "react";
import { Link } from "react-router-dom";
import useSEO from "../../hooks/useSEO";
import Breadcrumbs from "../common/Breadcrumbs";
import { PAGES } from "../../config/site.js";
import { POSTS } from "../../content/posts.js";
import { formatPostDate } from "../../utils/blocks.js";
import { breadcrumbJsonLd } from "../../utils/seoShared.js";

import "../../styles/seo-extras.css";

function BlogIndex() {
  const crumbs = useMemo(
    () => [
      { name: "Home", path: "/" },
      { name: "Journal", path: "/blog" },
    ],
    []
  );

  const jsonLd = useMemo(() => breadcrumbJsonLd(crumbs), [crumbs]);

  useSEO({
    title: PAGES.blog.title,
    description: PAGES.blog.description,
    path: PAGES.blog.path,
    image: PAGES.blog.ogImage,
    jsonLd,
  });

  const posts = [...POSTS].sort((a, b) => (a.date < b.date ? 1 : -1));

  return (
    <section className="blog-page">
      <div className="blog-wrap">
        <Breadcrumbs items={crumbs} />

        <div className="blog-head">
          <span>THE JOURNAL</span>

          <h1>Gift &amp; Style Ideas</h1>

          <p>
            Gift guides, styling ideas and cozy-aesthetic inspiration to help
            you choose the right piece for someone you love, or for yourself.
          </p>
        </div>

        <ul className="blog-list">
          {posts.map((post) => (
            <li key={post.slug} className="blog-card">
              <time dateTime={post.date}>{formatPostDate(post.date)}</time>

              <h2>
                <Link to={`/blog/${post.slug}`}>{post.title}</Link>
              </h2>

              <p>{post.excerpt}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default BlogIndex;
