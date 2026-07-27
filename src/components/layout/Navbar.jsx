import { useState, useEffect, useRef } from "react";
import "../../styles/navbar.css";

import { Link } from "react-router-dom";

import SearchBar from "../ui/SearchBar";

import jewellery from "../../data/jewellery";
import accessories from "../../data/accessories";
import gifts from "../../data/gifts";
import {
  FiSearch,
  FiShoppingBag,
  FiMenu,
  FiX
} from "react-icons/fi";

import { useCart } from "../../context/CartContext";

function Navbar() {

  const [showNavbar, setShowNavbar] = useState(true);
  const [showSearch, setShowSearch] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

const [search, setSearch] = useState("");
const searchRef = useRef(null);


  const { cart } = useCart();
  const allProducts = [

  ...jewellery,

  ...accessories,

  ...gifts,

];

  useEffect(() => {

    let lastScroll = 0;

    const handleScroll = () => {

      const currentScroll = window.pageYOffset;

      if (currentScroll <= 0) {
        setShowNavbar(true);
        return;
      }

      if (currentScroll > lastScroll) {

        setShowNavbar(false);

      } else {

        setShowNavbar(true);

      }

      lastScroll = currentScroll;

    };

    window.addEventListener("scroll", handleScroll);

    return () =>
      window.removeEventListener("scroll", handleScroll);

  }, []);
  useEffect(() => {

  function handleClickOutside(event) {

    if (
      searchRef.current &&
      !searchRef.current.contains(event.target)
    ) {

      setShowSearch(false);
      setSearch("");

    }

  }

  document.addEventListener(
    "mousedown",
    handleClickOutside
  );

  return () => {

    document.removeEventListener(
      "mousedown",
      handleClickOutside
    );

  };

}, []);

  return (

    <header className={`navbar ${showNavbar ? "show" : "hide"}`}>
      <button
  className="mobile-menu-btn"
  onClick={() => setMenuOpen(true)}
>

  <FiMenu />

</button>

      <div className="logo">

        <span className="logo-icon">✿</span>

        <h2>Calm Canvas</h2>

      </div>

      <nav>

        <ul className="nav-links">

          <li><Link to="/">Home</Link></li>

          <li className="dropdown">

            <span className="dropdown-title">

              Categories ▾

            </span>

            <ul className="dropdown-menu">

              <li><Link to="/jewellery">Jewellery</Link></li>

              <li><Link to="/accessories">Accessories</Link></li>

              <li><Link to="/gifts">Gifts</Link></li>

            </ul>

          </li>

          <li><Link to="/collections">Collections</Link></li>

          <li><Link to="/about">About</Link></li>

          <li><Link to="/contact">Contact</Link></li>

        </ul>

      </nav>

      <div className="nav-icons">

        
<div
  className="search-container"
  ref={searchRef}
>

  <button
  className="icon-btn"
  onClick={() => setShowSearch(!showSearch)}
>

    <FiSearch />

  </button>

  {showSearch && (

    <SearchBar

      search={search}

      setSearch={setSearch}

      products={allProducts}

      closeSearch={() => {
        setShowSearch(false);
        setSearch("");
      }}

    />

  )}

</div>

        <Link
          to="/cart"
          className="cart-btn"
        >

          <FiShoppingBag />

          {cart.length > 0 && (

            <span className="cart-count">

              {cart.length}

            </span>

          )}

        </Link>

      </div>
      {menuOpen && (

<div className="mobile-menu">

  <div className="mobile-menu-header">

    <h2>Menu</h2>

    <button
      onClick={() => setMenuOpen(false)}
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
    to="/jewellery"
    onClick={() => setMenuOpen(false)}
  >
    Jewellery
  </Link>

  <Link
    to="/accessories"
    onClick={() => setMenuOpen(false)}
  >
    Accessories
  </Link>

  <Link
    to="/gifts"
    onClick={() => setMenuOpen(false)}
  >
    Gifts
  </Link>

  <Link
    to="/collections"
    onClick={() => setMenuOpen(false)}
  >
    Collections
  </Link>

  <Link
    to="/about"
    onClick={() => setMenuOpen(false)}
  >
    About
  </Link>

  <Link
    to="/contact"
    onClick={() => setMenuOpen(false)}
  >
    Contact
  </Link>

</div>

)}

    </header>

  );

}

export default Navbar;