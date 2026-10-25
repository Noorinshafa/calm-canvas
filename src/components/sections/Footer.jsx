import "../../styles/footer.css";
import { Link } from "react-router-dom";
import { SOCIAL_LINKS } from "../../config/site";

// "https://www.instagram.com/shopcalmcanvas/" -> "Instagram"
function socialLabel(url) {
  const name = new URL(url).hostname.replace(/^www\./, "").split(".")[0];
  return name.charAt(0).toUpperCase() + name.slice(1);
}

function Footer() {
  return (
    <footer className="footer">

      <div className="footer-container">

        {/* LEFT */}

        <div className="footer-brand">

          <h2>ShopCalmCanvas</h2>

          <p>
            Art made for everyday living.
            Premium print-on-demand products
            designed to inspire creativity.
          </p>

          {SOCIAL_LINKS.length > 0 && (
            <nav className="footer-social" aria-label="Social media">
              {SOCIAL_LINKS.map((url) => (
                <a
                  key={url}
                  href={url}
                  target="_blank"
                  rel="me noopener noreferrer"
                >
                  {socialLabel(url)}
                </a>
              ))}
            </nav>
          )}

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

          <Link to="/christmas-gifts">Christmas Gifts</Link>

        </div>


        {/* COMPANY */}

       <div className="footer-links">

  <h3>Company</h3>

  <Link to="/about">
    About Us
  </Link>

  <Link to="/blog">
    Gift &amp; Style Journal
  </Link>

  <Link to="/contact">
    Contact Us
  </Link>

  <Link to="/shipping-returns">
    Shipping &amp; Returns
  </Link>

  <Link to="/terms">
    Terms &amp; Conditions
  </Link>

  <Link to="/privacy-policy">
    Privacy Policy
  </Link>

</div>


        {/* NEWSLETTER */}

        <div className="footer-newsletter">

          <h3>Stay Inspired</h3>

          <p>
            Join our newsletter for new
            collections and exclusive offers.
          </p>

          {/* NOTE: this is not yet wired to an email/CRM service -- see
              LAUNCH-AUDIT.md (requirement 16) for what's needed before this
              can actually deliver a submitted address anywhere. Left as a
              properly labelled, keyboard-accessible form in the meantime,
              rather than faking a "subscribed" response with nowhere for
              the email to go. */}
          <form
            className="newsletter-box"
            onSubmit={(e) => e.preventDefault()}
          >

            <label htmlFor="newsletter-email" className="sr-only">
              Email address
            </label>

            <input
              id="newsletter-email"
              name="email"
              type="email"
              placeholder="Your email"
              autoComplete="email"
              required
            />

            <button type="submit">

              Join

            </button>

          </form>

        </div>

      </div>


      <div className="footer-bottom">

        <p>

          © 2026 ShopCalmCanvas. All rights reserved.

        </p>

      </div>

    </footer>
  );
}

export default Footer;