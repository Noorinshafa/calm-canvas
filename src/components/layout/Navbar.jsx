import { Link } from "react-router-dom";
import { useState } from "react";
import {
  FiMenu,
  FiX,
  FiShoppingBag,
  FiSearch,
} from "react-icons/fi";

import "../../styles/navbar.css";

function Navbar() {

  const [menuOpen, setMenuOpen] = useState(false);

  return (

    <header className="navbar">

      <div className="container navbar-container">

        {/* Logo */}

        <Link
          to="/"
          className="logo"
        >

          <span className="logo-mark">
            ◌
          </span>

          <div>

            <h2>Calm Canvas</h2>

            <p>Minimal Lifestyle Store</p>

          </div>

        </Link>

        {/* Desktop Navigation */}

        <nav className="desktop-nav">

          <Link to="/">Home</Link>

          <Link to="/tshirts">
            T-Shirts
          </Link>

          <Link to="/hoodies">
            Hoodies
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

        {/* Right Side */}

        <div className="nav-actions">

          <button className="icon-btn">

            <FiSearch />

          </button>

          <Link
            to="/cart"
            className="icon-btn"
          >

            <FiShoppingBag />

          </Link>

          <button

            className="mobile-btn"

            onClick={() =>
              setMenuOpen(true)
            }

          >

            <FiMenu />

          </button>

        </div>

      </div>

      {/* Mobile Menu */}

      <div
        className={`mobile-menu ${
          menuOpen ? "active" : ""
        }`}
      >

        <div className="mobile-header">

          <h2>Menu</h2>

          <button
            onClick={() =>
              setMenuOpen(false)
            }
          >

            <FiX />

          </button>

        </div>

        <Link
          to="/"
          onClick={() =>
            setMenuOpen(false)
          }
        >

          Home

        </Link>

        <Link
          to="/tshirts"
          onClick={() =>
            setMenuOpen(false)
          }
        >

          T-Shirts

        </Link>

        <Link
          to="/hoodies"
          onClick={() =>
            setMenuOpen(false)
          }
        >

          Hoodies

        </Link>

        <Link
          to="/totebags"
          onClick={() =>
            setMenuOpen(false)
          }
        >

          Tote Bags

        </Link>

        <Link
          to="/phonecases"
          onClick={() =>
            setMenuOpen(false)
          }
        >

          Phone Cases

        </Link>

        <Link
          to="/mugs"
          onClick={() =>
            setMenuOpen(false)
          }
        >

          Mugs

        </Link>

      </div>

    </header>

  );

}

export default Navbar;