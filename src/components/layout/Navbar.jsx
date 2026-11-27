import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import {
  FiMenu,
  FiX,
  FiShoppingBag,
  FiSearch,
  FiChevronDown,
} from "react-icons/fi";
import useProducts from "../../hooks/useProducts";
import { useCart } from "../../context/CartContext";
import OptimizedImage from "../ui/OptimizedImage";
import HomeTopBar from "../sections/HomeTopBar";
import { productPath, cleanProductName } from "../../utils/seoShared.js";
import { christmasThemeActive } from "../../content/christmas.js";
import "../../styles/navbar.css";
// The logo at the sizes it is shown (68px, and 136px for sharp screens):
// 3-9 KB instead of the 69 KB logo.png, which stays for structured data.
import logo68 from "../../assets/logo-68.webp";
import logo136 from "../../assets/logo-136.webp";
// Pictures in the Shop panel: real product photos (the same ones as the home
// page's "Shop by category"). Only downloaded when the panel opens.
import { CATEGORY_TILES } from "../../content/homeImages.js";

// Every page linked here already exists.
const CATEGORIES = [
  { to: "/hoodies", label: "Hoodies" },
  { to: "/sweatshirts", label: "Sweatshirts" },
  { to: "/tshirts", label: "T-Shirts" },
  { to: "/mugs", label: "Mugs" },
  { to: "/totebags", label: "Tote Bags" },
  { to: "/phonecases", label: "Phone Cases" },
];

const GIFT_COLLECTIONS = [
  { to: "/christmas-gifts", label: "Christmas Gifts" },
  { to: "/thanksgiving-gifts", label: "Thanksgiving Gifts" },
  { to: "/cat-lover-gifts", label: "Cat Lover Gifts" },
  { to: "/dog-lover-gifts", label: "Dog Lover Gifts" },
  { to: "/floral-gifts", label: "Floral Gifts" },
  { to: "/halloween", label: "Halloween & Spooky" },
];

const SHOP_TILES = ["hoodies", "totebags"]
  .map((key) => CATEGORY_TILES.find((tile) => tile.key === key))
  .filter(Boolean)
  .map((tile) => ({ to: tile.path, label: tile.label, image: tile.src }));

// The row of links beside "Shop" on computers. `wideOnly` links are hidden
// between 1024 and 1279px, where they don't all fit; they stay one click away
// in the Shop panel.
const TOP_LINKS = [
  { to: "/hoodies", label: "Hoodies" },
  { to: "/sweatshirts", label: "Sweatshirts" },
  { to: "/tshirts", label: "T-Shirts" },
  { to: "/mugs", label: "Mugs", wideOnly: true },
  { to: "/totebags", label: "Tote Bags", wideOnly: true },
  { to: "/phonecases", label: "Phone Cases", wideOnly: true },
  { to: "/christmas-gifts", label: "Christmas Gifts" },
];

// Search shows at most this many matches, so a short word like "a" does not
// render the whole catalog at once.
const MAX_SEARCH_RESULTS = 24;

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [navbarHidden, setNavbarHidden] = useState(false);
  const [atTop, setAtTop] = useState(true);
  const [shopOpen, setShopOpen] = useState(false);
  const navRef = useRef(null);

  const { pathname } = useLocation();
  const isHome = pathname === "/";

  // Reads the catalog the app already fetched once via <ProductsProvider>.
  const { products } = useProducts();

  const { cart } = useCart();
  const cartCount = cart.reduce((total, item) => total + (item.quantity || 1), 0);

  /* =========================
     NAVBAR SCROLL BEHAVIOR
  ========================= */
  useEffect(() => {
    let previousScroll = window.scrollY;

    function handleScroll() {
      const currentScroll = window.scrollY;
      setAtTop(currentScroll <= 20);
      if (currentScroll <= 20) {
        setNavbarHidden(false);
      } else if (currentScroll > previousScroll) {
        setNavbarHidden(true);
        setShopOpen(false);
      } else if (currentScroll < previousScroll) {
        setNavbarHidden(false);
      }
      previousScroll = currentScroll;
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* =========================
     SHOP PANEL
     Closes on a click outside the menu, on the Escape key, or when one of
     its links is followed.
  ========================= */
  useEffect(() => {
    if (!shopOpen) return undefined;

    function handlePointer(event) {
      if (navRef.current && !navRef.current.contains(event.target)) {
        setShopOpen(false);
      }
    }
    function handleKey(event) {
      if (event.key === "Escape") setShopOpen(false);
    }

    document.addEventListener("pointerdown", handlePointer);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("pointerdown", handlePointer);
      document.removeEventListener("keydown", handleKey);
    };
  }, [shopOpen]);

  // A mouse click keeps the panel open (it was opened on hover); a keyboard
  // press (event.detail === 0) opens and closes it.
  function toggleShop(event) {
    const fromKeyboard = event.detail === 0;
    setShopOpen((current) => (fromKeyboard ? !current : true));
  }

  /* =========================
     SEARCH
  ========================= */
  const query = search.trim().toLowerCase();
  const filteredProducts = query
    ? products
        .filter((product) => product.title?.toLowerCase().includes(query))
        .slice(0, MAX_SEARCH_RESULTS)
    : [];

  function closeSearch() {
    setSearch("");
    setSearchOpen(false);
  }

  function closeMobileMenu() {
    setMenuOpen(false);
  }

  // On the home page, while it is scrolled to the very top and nothing is
  // open in the header, the header sits one layer below the hero models so
  // their heads can rise over its lower edge. Any scroll, menu or search puts
  // the header back on top.
  const underHero = isHome && atTop && !menuOpen && !searchOpen && !shopOpen;

  return (
    <header
      className={`navbar ${isHome ? "navbar--with-bar" : ""} ${
        underHero ? "navbar--top" : ""
      } ${navbarHidden ? "navbar-hidden" : ""}`}
    >
      {isHome && <HomeTopBar festive={christmasThemeActive()} />}

      <div className="navbar-inner">
        {/* LOGO */}
        <Link to="/" className="navbar-logo">
          {/* Decorative: the brand name is written out next to it. */}
          <img
            src={logo68}
            srcSet={`${logo68} 1x, ${logo136} 2x`}
            alt=""
            width="68"
            height="68"
          />
          <span className="navbar-brand">
            <span className="brand-name">ShopCalmCanvas</span>
          </span>
        </Link>

        {/* NAVIGATION */}
        <nav className="navbar-links" aria-label="Main" ref={navRef}>
          <div
            className={`nav-dd nav-dd--mega ${shopOpen ? "is-open" : ""}`}
            onMouseEnter={() => setShopOpen(true)}
            onMouseLeave={() => setShopOpen(false)}
          >
            <button
              type="button"
              className="nav-dd-toggle"
              aria-expanded={shopOpen}
              aria-controls="nav-menu-shop"
              onClick={toggleShop}
            >
              Shop
              <FiChevronDown aria-hidden="true" />
            </button>

            <div id="nav-menu-shop" className="nav-mega" hidden={!shopOpen}>
              <div className="nav-mega-inner">
                <div className="nav-mega-col">
                  <p className="nav-mega-heading" id="nav-mega-categories">
                    Shop by category
                  </p>
                  <ul aria-labelledby="nav-mega-categories">
                    {CATEGORIES.map((link) => (
                      <li key={link.to}>
                        <Link to={link.to} onClick={() => setShopOpen(false)}>
                          {link.label}
                        </Link>
                      </li>
                    ))}
                    <li>
                      <Link
                        to="/collections"
                        className="nav-mega-all"
                        onClick={() => setShopOpen(false)}
                      >
                        Shop all
                      </Link>
                    </li>
                  </ul>
                </div>

                <div className="nav-mega-col">
                  <p className="nav-mega-heading" id="nav-mega-gifts">
                    Gift collections
                  </p>
                  <ul aria-labelledby="nav-mega-gifts">
                    {GIFT_COLLECTIONS.map((link) => (
                      <li key={link.to}>
                        <Link to={link.to} onClick={() => setShopOpen(false)}>
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Pictures are only put on the page while the panel is open,
                    so they are never downloaded for visitors who don't open it. */}
                {shopOpen && (
                  <div className="nav-mega-tiles">
                    {SHOP_TILES.map((tile) => (
                      <Link
                        key={tile.to}
                        to={tile.to}
                        className="nav-mega-tile"
                        onClick={() => setShopOpen(false)}
                      >
                        <span className="nav-mega-tile-media studio">
                          <OptimizedImage
                            className="studio-img"
                            src={tile.image}
                            alt=""
                            widths={[384]}
                            sizes="220px"
                            width="384"
                            height="384"
                          />
                        </span>
                        <span>{tile.label}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {TOP_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={link.wideOnly ? "nav-wide-only" : undefined}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* ACTIONS */}
        <div className="navbar-actions">
          <button
            className="navbar-icon"
            onClick={() => setSearchOpen((open) => !open)}
            aria-label="Search"
            aria-expanded={searchOpen}
          >
            <FiSearch />
          </button>

          <Link
            to="/cart"
            className="navbar-icon navbar-cart"
            aria-label={
              cartCount > 0
                ? `Shopping bag, ${cartCount} ${cartCount === 1 ? "item" : "items"}`
                : "Shopping bag"
            }
          >
            <FiShoppingBag />
            {cartCount > 0 && (
              <span className="navbar-cart-count" aria-hidden="true">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </Link>

          <button
            className="navbar-menu-button"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
          >
            <FiMenu />
          </button>
        </div>

        {/* SEARCH */}
        {searchOpen && (
          <div className="navbar-search">
            <div className="navbar-search-inner">
              <FiSearch />
              <label htmlFor="navbar-search-input" className="sr-only">
                Search products
              </label>
              <input
                id="navbar-search-input"
                autoFocus
                type="text"
                placeholder="Search products"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button
                className="search-close"
                onClick={closeSearch}
                aria-label="Close search"
              >
                <FiX />
              </button>
            </div>

            {query && (
              <div className="navbar-search-results">
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <Link
                      key={product.id}
                      to={productPath(product)}
                      className="navbar-search-product"
                      onClick={closeSearch}
                    >
                      <OptimizedImage
                        src={product.image}
                        alt={cleanProductName(product.title)}
                        widths={[256]}
                        width="256"
                        height="256"
                      />
                      <div>
                        <h4>{product.title}</h4>
                        <p>{product.price}</p>
                      </div>
                    </Link>
                  ))
                ) : (
                  <p className="no-search-results">
                    No products match “{search.trim()}”. Try a shorter word.
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* MOBILE MENU */}
      <div
        id="mobile-menu"
        className={`mobile-menu ${menuOpen ? "mobile-menu-open" : ""}`}
        aria-hidden={!menuOpen}
        inert={!menuOpen}
      >
        <div className="mobile-menu-header">
          <span className="mobile-menu-title">Menu</span>
          <button onClick={closeMobileMenu} aria-label="Close menu">
            <FiX />
          </button>
        </div>

        <div className="mobile-menu-group">
          <p className="mobile-menu-heading">Shop by category</p>
          {CATEGORIES.map((link) => (
            <Link key={link.to} to={link.to} onClick={closeMobileMenu}>
              {link.label}
            </Link>
          ))}
          <Link to="/collections" onClick={closeMobileMenu}>
            Shop all
          </Link>
        </div>

        <div className="mobile-menu-group">
          <p className="mobile-menu-heading">Gift collections</p>
          {GIFT_COLLECTIONS.map((link) => (
            <Link key={link.to} to={link.to} onClick={closeMobileMenu}>
              {link.label}
            </Link>
          ))}
        </div>

        <div className="mobile-menu-group mobile-menu-group--plain">
          <Link to="/about" onClick={closeMobileMenu}>
            About us
          </Link>
          <Link to="/contact" onClick={closeMobileMenu}>
            Contact
          </Link>
          <Link to="/shipping-returns" onClick={closeMobileMenu}>
            Shipping &amp; returns
          </Link>
        </div>
      </div>

      {/* Dims the page behind the open phone menu; a tap closes it. */}
      {menuOpen && (
        <button
          type="button"
          className="mobile-menu-backdrop"
          aria-label="Close menu"
          tabIndex={-1}
          onClick={closeMobileMenu}
        />
      )}
    </header>
  );
}

export default Navbar;
