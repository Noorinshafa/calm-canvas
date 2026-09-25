import { Link } from "react-router-dom";
import "../../styles/legal.css";
import useSEO from "../../hooks/useSEO";

// Client-side fallback shown when someone navigates to an unknown route
// while already inside the app (e.g. a stale internal link). A direct,
// fresh browser request to an unknown URL never reaches this component at
// all -- it's caught earlier, at the Vercel hosting level, by
// public/404.html, which returns a real HTTP 404 status instead of loading
// the app first. See LAUNCH-AUDIT.md, requirement 10.
function NotFound() {
  useSEO({
    title: "Page Not Found",
    description: "The page you're looking for doesn't exist.",
    path: "/404",
    noindex: true,
  });

  return (
    <section className="legal-page">
      <div className="legal-hero">
        <span>404</span>

        <h1>We Couldn't Find That Page</h1>

        <p>
          The page you're looking for may have been moved, renamed, or
          no longer exists. Here are a few places to pick up from:
        </p>
      </div>

      <div
        className="legal-content"
        style={{ textAlign: "center", display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}
      >
        <Link to="/">Go to Homepage</Link>
        <Link to="/collections">Browse All Products</Link>
        <Link to="/contact">Contact Us</Link>
      </div>
    </section>
  );
}

export default NotFound;
