import { FiPackage, FiGlobe, FiLock, FiRefreshCw } from "react-icons/fi";

// Four short promises, each one taken from the Shipping & Returns page
// (src/config/site.js). Nothing here may be added unless it is a real policy.
const ITEMS = [
  { icon: FiPackage, title: "Printed to order", text: "Made for you in 2–7 business days" },
  { icon: FiGlobe, title: "Ships worldwide", text: "US, UK, Canada & most countries" },
  { icon: FiLock, title: "Secure checkout", text: "Payments processed by Safepay" },
  { icon: FiRefreshCw, title: "Arrived damaged?", text: "Free reprint or full refund" },
];

function HomeTrust() {
  return (
    <section className="home-trust" aria-label="Why shop with us">
      <ul className="home-trust-list">
        {ITEMS.map(({ icon: Icon, title, text }) => (
          <li key={title}>
            <Icon className="home-trust-icon" aria-hidden="true" />
            <span>
              <strong>{title}</strong>
              <span>{text}</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default HomeTrust;
