import "../../styles/footer.css";
import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="footer">

      <div className="footer-container">

        {/* LEFT */}

        <div className="footer-brand">

          <h2>Calm Canvas</h2>

          <p>
            Art made for everyday living.
            Premium print-on-demand products
            designed to inspire creativity.
          </p>

        </div>


        {/* SHOP */}

        <div className="footer-links">

          <h3>Shop</h3>

          <Link to="/hoodies">Hoodies</Link>

          <Link to="/tshirts">T-Shirts</Link>

          <Link to="/sweatshirts">Sweatshirts</Link>

          <Link to="/mugs">Mugs</Link>

          <Link to="/phonecases">Phone Cases</Link>

          <Link to="/totebags">Tote Bags</Link>

        </div>


        {/* COMPANY */}

        <div className="footer-links">

          <h3>Company</h3>

          <a href="#">About</a>

          <a href="#">Contact</a>

          <a href="#">FAQs</a>

          <a href="#">Shipping</a>

          <a href="#">Returns</a>

        </div>


        {/* NEWSLETTER */}

        <div className="footer-newsletter">

          <h3>Stay Inspired</h3>

          <p>
            Join our newsletter for new
            collections and exclusive offers.
          </p>

          <div className="newsletter-box">

            <input
              type="email"
              placeholder="Your email"
            />

            <button>

              Join

            </button>

          </div>

        </div>

      </div>


      <div className="footer-bottom">

        <p>

          © 2026 Calm Canvas. All rights reserved.

        </p>

      </div>

    </footer>
  );
}

export default Footer;