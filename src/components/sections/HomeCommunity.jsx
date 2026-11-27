import { FiInstagram } from "react-icons/fi";
import { FaPinterestP } from "react-icons/fa";
import { SOCIAL_LINKS } from "../../config/site.js";

// "Join our community": links to the shop's real social profiles. (There is
// no newsletter yet, so there is no email box; one can be added once a real
// email service is set up.)
const NETWORKS = [
  { match: "instagram.com", label: "Instagram", icon: FiInstagram },
  { match: "pinterest.", label: "Pinterest", icon: FaPinterestP },
];

function HomeCommunity() {
  const links = NETWORKS.map((network) => ({
    ...network,
    url: SOCIAL_LINKS.find((url) => url.includes(network.match)),
  })).filter((network) => network.url);

  if (links.length === 0) return null;

  return (
    <section className="home-section home-community" aria-labelledby="community-title">
      <div className="home-community-card">
        <div className="home-community-text">
          <h2 id="community-title">Join Our Community</h2>
          <p>Follow ShopCalmCanvas for new designs and gift ideas.</p>
        </div>
        <ul className="home-community-links">
          {links.map(({ label, url, icon: Icon }) => (
            <li key={label}>
              <a href={url} target="_blank" rel="noopener noreferrer">
                <Icon aria-hidden="true" />
                {label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default HomeCommunity;
