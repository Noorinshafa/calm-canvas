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

// The two drop-down menus. Every page linked here already exists.
const MENUS = [
  {
    id: "shop",
    label: "Shop",
    links: [
      { to: "/hoodies", label: "Hoodies" },
      { to: "/sweatshirts", label: "Sweatshirts" },
      { to: "/tshirts", label: "T-Shirts" },
      { to: "/mugs", label: "Mugs" },
      { to: "/totebags", label: "Tote Bags" },
      { to: "/phonecases", label: "Phone Cases" },
      { to: "/collections", label: "Shop All" },
    ],
  },
  {
    id: "collections",
    label: "Collections",
    links: [
      { to: "/christmas-gifts", label: "Christmas Gifts" },
      { to: "/thanksgiving-gifts", label: "Thanksgiving Gifts" },
      { to: "/cat-lover-gifts", label: "Cat Lover Gifts" },
      { to: "/dog-lover-gifts", label: "Dog Lover Gifts" },
      { to: "/floral-gifts", label: "Floral Gifts" },
      { to: "/halloween", label: "Halloween & Spooky" },
    ],
  },
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
  const [openMenu, setOpenMenu] = useState(null);
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
        setOpenMenu(null);
      } else if (currentScroll < previousScroll) {
        setNavbarHidden(false);
      }
      previousScroll = currentScroll;
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* =========================
     DROP-DOWN MENUS
     Close on a click outside the menu or on the Escape key.
  ========================= */
  useEffect(() => {
    if (!openMenu) return undefined;

    function handlePointer(event) {
      if (navRef.current && !navRef.current.contains(event.target)) {
        setOpenMenu(null);
      }
    }
    function handleKey(event) {
      if (event.key === "Escape") setOpenMenu(null);
    }

    document.addEventListener("pointerdown", handlePointer);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("pointerdown", handlePointer);
      document.removeEventListener("keydown", handleKey);
    };
  }, [openMenu]);

  // A mouse click keeps the menu open (it was opened on hover); a keyboard
  // press (event.detail === 0) opens and closes it.
  function toggleMenu(event, id) {
    const fromKeyboard = event.detail === 0;
    setOpenMenu((current) => (fromKeyboard && current === id ? null : id));
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
  // their heads can rise over its lower edge. Any scroll, menu or search puts the
  // header back on top.
  const underHero = isHome && atTop && !menuOpen && !searchOpen && !openMenu;

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
          <NavLink to="/" end>
            Home
          </NavLink>

          {MENUS.map((menu) => {
            const open = openMenu === menu.id;
            return (
              <div
                key={menu.id}
                className={`nav-dd ${open ? "is-open" : ""}`}
                onMouseEnter={() => setOpenMenu(menu.id)}
                onMouseLeave={() => setOpenMenu(null)}
              >
                <button
                  type="button"
                  className="nav-dd-toggle"
                  aria-expanded={open}
                  aria-controls={`nav-menu-${menu.id}`}
                  onClick={(event) => toggleMenu(event, menu.id)}
                >
                  {menu.label}
                  <FiChevronDown aria-hidden="true" />
                </button>
                <div
                  id={`nav-menu-${menu.id}`}
                  className="nav-dd-panel"
                  hidden={!open}
                >
                  <ul>
                    {menu.links.map((link) => (
                      <li key={link.to}>
                        <Link to={link.to} onClick={() => setOpenMenu(null)}>
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}

          <NavLink to="/about">About</NavLink>
          <NavLink to="/contact">Contact</NavLink>
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
                ? `Shopping cart, ${cartCount} ${cartCount === 1 ? "item" : "items"}`
                : "Shopping cart"
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
                placeholder="Search products..."
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
                  <p className="no-search-results">No products found.</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* MOBILE MENU */}
      <div className={`mobile-menu ${menuOpen ? "mobile-menu-open" : ""}`}>
        <div className="mobile-menu-header">
          <div className="mobile-menu-title">
            <img
              src={logo68}
              srcSet={`${logo68} 1x, ${logo136} 2x`}
              alt="ShopCalmCanvas"
              width="45"
              height="45"
              loading="lazy"
            />
            <span>Menu</span>
          </div>
          <button onClick={closeMobileMenu} aria-label="Close menu">
            <FiX />
          </button>
        </div>

        <Link to="/" onClick={closeMobileMenu}>
          Home
        </Link>

        {MENUS.map((menu) => (
          <div key={menu.id} className="mobile-menu-group">
            <p className="mobile-menu-heading">{menu.label}</p>
            {menu.links.map((link) => (
              <Link key={link.to} to={link.to} onClick={closeMobileMenu}>
                {link.label}
              </Link>
            ))}
          </div>
        ))}

        <Link to="/about" onClick={closeMobileMenu}>
          About
        </Link>
        <Link to="/contact" onClick={closeMobileMenu}>
          Contact
        </Link>
      </div>
    </header>
  );
}

export default Navbar;
