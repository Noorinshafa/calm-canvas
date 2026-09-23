import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiMenu,
  FiX,
  FiShoppingBag,
  FiSearch,
} from "react-icons/fi";
import useProducts from "../../hooks/useProducts";

import "../../styles/navbar.css";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [navbarHidden, setNavbarHidden] = useState(false);

  // Reads the catalog the app already fetched once via <ProductsProvider>
  // (see src/context/ProductsContext.jsx) instead of firing its own
  // separate request the first time search opens -- search is instant now
  // since the data is already there by the time anyone clicks the icon.
  const { products } = useProducts();

  /* =========================
     NAVBAR SCROLL BEHAVIOR
  ========================= */

  useEffect(() => {
    let previousScroll = window.scrollY;

    function handleScroll() {
      const currentScroll = window.scrollY;

      if (currentScroll <= 20) {
        setNavbarHidden(false);
      } else if (currentScroll > previousScroll) {
        setNavbarHidden(true);
      } else if (currentScroll < previousScroll) {
        setNavbarHidden(false);
      }

      previousScroll = currentScroll;
    }

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  /* =========================
     SEARCH
  ========================= */

  const filteredProducts = products.filter((product) =>
    product.title
      ?.toLowerCase()
      .includes(search.toLowerCase())
  );

  function closeSearch() {
    setSearch("");
    setSearchOpen(false);
  }

  return (
    <header
      className={`navbar ${
        navbarHidden ? "navbar-hidden" : ""
      }`}
    >
      <div className="navbar-inner">

        {/* LOGO */}

        <Link
          to="/"
          className="navbar-logo"
        >
          <img
            src="/logo.png"
            alt="Calm Canvas"
            width="68"
            height="68"
          />

          <div className="navbar-brand">
            <h2>Calm Canvas</h2>

            <p>
              Minimal Lifestyle Store
            </p>
          </div>
        </Link>


        {/* NAVIGATION */}

        <nav className="navbar-links">

          <Link to="/">
            Home
          </Link>

          <Link to="/tshirts">
            T-Shirts
          </Link>

          <Link to="/hoodies">
            Hoodies
          </Link>

          <Link to="/sweatshirts">
            Sweatshirts
          </Link>

          <Link to="/totebags">
            Tote Bags
          </Link>

          <Link to="/phonecases">
            Phone Cases
          </Link>

          <Link to="/mugs">
            Mugs
          </Link>

        </nav>


        {/* ACTIONS */}

        <div className="navbar-actions">

          <button
            className="navbar-icon"
            onClick={() =>
              setSearchOpen((open) => !open)
            }
            aria-label="Search"
          >
            <FiSearch />
          </button>

          <Link
            to="/cart"
            className="navbar-icon"
            aria-label="Shopping cart"
          >
            <FiShoppingBag />
          </Link>

          <button
            className="navbar-menu-button"
            onClick={() =>
              setMenuOpen(true)
            }
            aria-label="Open menu"
          >
            <FiMenu />
          </button>

        </div>


        {/* SEARCH */}

        {searchOpen && (

          <div className="navbar-search">

            <div className="navbar-search-inner">

              <FiSearch />

              <input
                autoFocus
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
              />

              <button
                className="search-close"
                onClick={closeSearch}
                aria-label="Close search"
              >
                <FiX />
              </button>

            </div>

            {search && (

              <div className="navbar-search-results">

                {filteredProducts.length > 0 ? (

                  filteredProducts.map((product) => (

                    <Link
                      key={product.id}
                      to={`/product/${product.id}`}
                      className="navbar-search-product"
                      onClick={closeSearch}
                    >

                      <img
                        src={product.image}
                        alt={product.title}
                      />

                      <div>

                        <h4>
                          {product.title}
                        </h4>

                        <p>
                          {product.price}
                        </p>

                      </div>

                    </Link>

                  ))

                ) : (

                  <p className="no-search-results">
                    No products found.
                  </p>

                )}

              </div>

            )}

          </div>

        )}

      </div>


      {/* MOBILE MENU */}

      <div
        className={`mobile-menu ${
          menuOpen ? "mobile-menu-open" : ""
        }`}
      >

        <div className="mobile-menu-header">

          <div className="mobile-menu-title">

            <img
              src="/logo.png"
              alt="Calm Canvas"
              width="45"
              height="45"
            />

            <span>
              Menu
            </span>

          </div>

          <button
            onClick={() =>
              setMenuOpen(false)
            }
            aria-label="Close menu"
          >
            <FiX />
          </button>

        </div>


        <Link
          to="/"
          onClick={() => setMenuOpen(false)}
        >
          Home
        </Link>

        <Link
          to="/tshirts"
          onClick={() => setMenuOpen(false)}
        >
          T-Shirts
        </Link>

        <Link
          to="/hoodies"
          onClick={() => setMenuOpen(false)}
        >
          Hoodies
        </Link>

        <Link
          to="/sweatshirts"
          onClick={() => setMenuOpen(false)}
        >
          Sweatshirts
        </Link>

        <Link
          to="/totebags"
          onClick={() => setMenuOpen(false)}
        >
          Tote Bags
        </Link>

        <Link
          to="/phonecases"
          onClick={() => setMenuOpen(false)}
        >
          Phone Cases
        </Link>

        <Link
          to="/mugs"
          onClick={() => setMenuOpen(false)}
        >
          Mugs
        </Link>

      </div>

    </header>
  );
}

export default Navbar;