import { useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import useSEO from "../../hooks/useSEO";
import useProducts from "../../hooks/useProducts";
import Breadcrumbs from "../common/Breadcrumbs";
import BlogBlocks from "../common/BlogBlocks";
import ProductCard from "../ui/ProductCard";
import NotFound from "./NotFound";
import { POSTS } from "../../content/posts.js";
import { formatPostDate } from "../../utils/blocks.js";
import { articleJsonLd, breadcrumbJsonLd } from "../../utils/seoShared.js";

import "../../styles/seo-extras.css";

function BlogPostView({ post }) {
  const { products } = useProducts();

  const picks = useMemo(
    () =>
      post.productPicks
        .map((id) => products.find((product) => product.id === id))
        .filter(Boolean),
    [post, products]
  );

  const crumbs = useMemo(
    () => [
      { name: "Home", path: "/" },
      { name: "Journal", path: "/blog" },
      { name: post.title, path: `/blog/${post.slug}` },
    ],
    [post]
  );

  const jsonLd = useMemo(
    () => [
      breadcrumbJsonLd(crumbs),
      articleJsonLd({ ...post, image: picks[0]?.image }),
    ],
    [post, crumbs, picks]
  );

  useSEO({
    title: post.seoTitle,
    description: post.description,
    path: `/blog/${post.slug}`,
    image: picks[0]?.image,
    type: "article",
    jsonLd,
  });

  const otherPosts = POSTS.filter((item) => item.slug !== post.slug);

  return (
    <section className="blog-page">
      <div className="blog-wrap blog-post">
        <Breadcrumbs items={crumbs} />

        <h1>{post.title}</h1>

        <p className="blog-meta">
          <time dateTime={post.date}>{formatPostDate(post.date)}</time> ·{" "}
          {post.category} · {post.readingMinutes} min read
        </p>

        <div className="blog-body">
          <BlogBlocks blocks={post.blocks} />
        </div>

        {picks.length > 0 && (
          <div className="blog-picks">
            <h2>Designs mentioned in this guide</h2>

            <div className="products-grid">
              {picks.map((product) => (
                <ProductCard key={product.id} {...product} />
              ))}
            </div>
          </div>
        )}

        <div className="blog-picks">
          <h2>Keep reading</h2>

          <ul>
            {otherPosts.map((item) => (
              <li key={item.slug}>
                <Link to={`/blog/${item.slug}`}>{item.title}</Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

// Unknown post address -> the normal "page not found" screen.
function BlogPost() {
  const { slug } = useParams();
  const post = POSTS.find((item) => item.slug === slug);

  return post ? <BlogPostView post={post} /> : <NotFound />;
}

export default BlogPost;
