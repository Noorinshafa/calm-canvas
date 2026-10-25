import "../../styles/footer.css";
import { Link } from "react-router-dom";
import { SOCIAL_LINKS, CONTACT_EMAIL } from "../../config/site";

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


        {/* FOLLOW */}

        <div className="footer-follow">

          <h3>Follow Along</h3>

          <p>
            Find new designs and collections
            on our social profiles.
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

          <p className="footer-contact">
            Questions about an order?{" "}
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
          </p>

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