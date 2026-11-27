import { Link } from "react-router-dom";

// The thin bar above the menu on the home page (rendered by Navbar). While
// the home page has its Christmas look (christmasThemeActive in
// src/content/christmas.js) it points to the Christmas gift page; the rest of
// the year it links to the shipping facts. Every claim here must match the
// Shipping & Returns page.
function HomeTopBar({ festive = false }) {
  return (
    <div className={`home-topbar ${festive ? "home-topbar--xmas" : ""}`}>
      <Link
        to={festive ? "/christmas-gifts" : "/shipping-returns"}
        className="home-topbar-link"
      >
        <span className="home-topbar-star" aria-hidden="true">★</span>
        <span className="home-topbar-long">
          {festive ? "Christmas Gifts Are Here" : "Printed to Order"}
          <span className="home-topbar-sep" aria-hidden="true">|</span>
          Shipping to the US, UK, Canada &amp; Europe
        </span>
        <span className="home-topbar-short">
          {festive ? "Christmas Gifts Are Here" : "Printed to Order · US, UK, Canada & Europe"}
        </span>
        <span className="home-topbar-star" aria-hidden="true">★</span>
      </Link>
    </div>
  );
}

export default HomeTopBar;
