import "../../styles/footer.css";
import { Link } from "react-router-dom";
import { SOCIAL_LINKS, CONTACT_EMAIL } from "../../config/site";
import {
  OPEN_CONSENT_EVENT,
  visitorNeedsConsentChoice,
} from "../../utils/analytics";

// "https://www.instagram.com/shopcalmcanvas/" -> "Instagram"
function socialLabel(url) {
  const name = new URL(url).hostname.replace(/^www\./, "").split(".")[0];
  return name.charAt(0).toUpperCase() + name.slice(1);
}

// The same links (and URLs) are written into every pre-built page by
// scripts/postbuild.mjs (footerHtml): keep the two in step.
const COLUMNS = [
  {
    id: "shop",
    title: "Shop",
    links: [
      { to: "/hoodies", label: "Hoodies" },
      { to: "/sweatshirts", label: "Sweatshirts" },
      { to: "/tshirts", label: "T-Shirts" },
      { to: "/mugs", label: "Mugs" },
      { to: "/totebags", label: "Tote Bags" },
      { to: "/phonecases", label: "Phone Cases" },
      { to: "/christmas-gifts", label: "Christmas Gifts" },
    ],
  },
  {
    id: "gifts",
    title: "Gift collections",
    links: [
      { to: "/cat-lover-gifts", label: "Cat Lover Gifts" },
      { to: "/dog-lover-gifts", label: "Dog Lover Gifts" },
      { to: "/floral-gifts", label: "Floral Gifts" },
      { to: "/thanksgiving-gifts", label: "Thanksgiving Gifts" },
      { to: "/halloween", label: "Halloween & Spooky" },
    ],
  },
  {
    id: "care",
    title: "Customer care",
    links: [
      { to: "/contact", label: "Contact us" },
      { to: "/shipping-returns", label: "Shipping & returns" },
    ],
  },
  {
    id: "about",
    title: "About",
    links: [
      { to: "/about", label: "Our story" },
      { to: "/blog", label: "Gift & Style Journal" },
    ],
  },
  {
    id: "legal",
    title: "Legal",
    links: [
      { to: "/privacy-policy", label: "Privacy policy" },
      { to: "/terms", label: "Terms & conditions" },
    ],
  },
];

function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="footer-brand">
          <p className="footer-name">ShopCalmCanvas</p>
          <p className="footer-about">
            Original artwork on hoodies, sweatshirts, tees, mugs, tote bags and
            phone cases, printed to order for you.
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
            Help with an order:{" "}
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
          </p>
        </div>

        <nav className="footer-nav" aria-label="Footer">
          {COLUMNS.map((column) => (
            <div className="footer-col" key={column.id}>
              <h2 id={`footer-${column.id}`}>{column.title}</h2>
              <ul aria-labelledby={`footer-${column.id}`}>
                {column.links.map((link) => (
                  <li key={link.to}>
                    <Link to={link.to}>{link.label}</Link>
                  </li>
                ))}
                {column.id === "care" && (
                  <li>
                    <a href={`mailto:${CONTACT_EMAIL}`}>Order support</a>
                  </li>
                )}
                {column.id === "legal" && visitorNeedsConsentChoice() && (
                  <li>
                    <button
                      type="button"
                      className="footer-cookie-link"
                      onClick={() =>
                        window.dispatchEvent(new Event(OPEN_CONSENT_EVENT))
                      }
                    >
                      Cookie settings
                    </button>
                  </li>
                )}
              </ul>
            </div>
          ))}
        </nav>
      </div>

      <div className="footer-bottom">
        <p>© {year} ShopCalmCanvas</p>
        <p>Shipping to the US, UK, Canada and Europe</p>
        <p>Secure card payments by Safepay</p>
      </div>
    </footer>
  );
}

export default Footer;
