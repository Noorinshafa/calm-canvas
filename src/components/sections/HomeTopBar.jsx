import { Link } from "react-router-dom";

// The slim bar above the header on the home page (rendered by Navbar). While
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
        <span className="home-topbar-long">
          {festive ? "Christmas gifts are here." : "Printed to order for you."}{" "}
          Shipping to the US, UK, Canada and Europe.
        </span>
        <span className="home-topbar-short">
          {festive ? "Christmas gifts are here" : "Shipping to the US, UK, Canada & Europe"}
        </span>
      </Link>
    </div>
  );
}

export default HomeTopBar;
