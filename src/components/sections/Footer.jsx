import { Link } from "react-router-dom";
import "../../styles/footer.css";

function Footer() {
  return (
    <footer className="footer">

      <div className="footer-top">

        {/* Brand */}

        <div className="footer-brand">

          <h2>✿ Calm Canvas</h2>

          <p>
            Elegant jewellery, charming accessories,
            and thoughtful gifts crafted to make every
            moment beautiful.
          </p>

        </div>

        {/* Links */}

        <div className="footer-links">

          {/* Shop */}

          <div>

            <h4>Shop</h4>

            <Link to="/jewellery">
              Jewellery
            </Link>

            <Link to="/accessories">
              Accessories
            </Link>

            <Link to="/gifts">
              Gifts
            </Link>

          </div>

          {/* Support */}

          <div>

            <h4>Support</h4>

            <span>Shipping</span>

            <span>Returns</span>

            <span>FAQ</span>

          </div>

          {/* Company */}

          <div>

            <h4>Company</h4>

            <Link to="/about">
              About
            </Link>

            <Link to="/contact">
              Contact
            </Link>

            <span>Privacy</span>

          </div>

        </div>

      </div>

      {/* Newsletter */}

      <div className="footer-newsletter">

        <h3>Join Our Newsletter</h3>

        <p>
          Be the first to discover new collections,
          exclusive offers and special surprises.
        </p>

        <div className="newsletter-box">

          <input
            type="email"
            placeholder="Enter your email"
          />

          <button>
            Subscribe
          </button>

        </div>

      </div>

      {/* Bottom */}

      <div className="footer-bottom">

        <p>
          © {new Date().getFullYear()} Calm Canvas. Crafted with love.
        </p>

      </div>

    </footer>
  );
}

export default Footer;