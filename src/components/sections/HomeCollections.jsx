import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

// One photo per collection (taken from the collection images already on the
// site), in two square sizes (8-36 KB each), shown whole (not cropped).
import hoodies400 from "../../assets/home/cat-hoodies-400.webp";
import hoodies620 from "../../assets/home/cat-hoodies-620.webp";
import tshirts400 from "../../assets/home/cat-tshirts-400.webp";
import tshirts620 from "../../assets/home/cat-tshirts-620.webp";
import sweatshirts400 from "../../assets/home/cat-sweatshirts-400.webp";
import sweatshirts620 from "../../assets/home/cat-sweatshirts-620.webp";
import mugs400 from "../../assets/home/cat-mugs-400.webp";
import mugs620 from "../../assets/home/cat-mugs-620.webp";
import totebags400 from "../../assets/home/cat-totebags-400.webp";
import totebags620 from "../../assets/home/cat-totebags-620.webp";
import phonecases400 from "../../assets/home/cat-phonecases-400.webp";
import phonecases620 from "../../assets/home/cat-phonecases-620.webp";

// Soft, blurred flowers and leaves for the corners (decoration only, 3-5 KB).
import decorFlowers from "../../assets/home/decor-flowers.webp";
import decorLeaves from "../../assets/home/decor-leaves.webp";

// Small line icons for the round badges (drawn here so no icon library is
// needed for shapes it does not have, such as a hoodie or a sweater).
const ICONS = {
  hoodie: "M9.2 4.6C9.6 3.1 10.7 2.2 12 2.2s2.4.9 2.8 2.4M9.2 4.6 5 6.6 3.5 18.5H6l1.2-8.2V20h9.6v-9.7l1.2 8.2h2.5L19 6.6l-4.2-2c-.4 1.7-1.5 2.8-2.8 2.8S9.6 6.3 9.2 4.6zM9.5 14.5h5v3h-5z",
  tee: "M8.5 4 4 6.5l1.8 4 2.2-1V20h8V9.5l2.2 1 1.8-4L15.5 4c-.6 1.4-1.9 2.2-3.5 2.2S9.1 5.4 8.5 4z",
  sweater: "M9 4.5 5 6.2 3.5 18.5H6l1.2-8.2V20h9.6v-9.7l1.2 8.2h2.5L19 6.2l-4-1.7c-.5 1.2-1.7 2-3 2s-2.5-.8-3-2zM7.2 20h9.6",
  mug: "M5 7h11v8a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4V7zM16 9h1.5a2.5 2.5 0 0 1 0 5H16",
  tote: "M5 8h14l-1.2 12H6.2L5 8zM9 10V6.5a3 3 0 0 1 6 0V10",
  phone: "M8 2.8h8a1.6 1.6 0 0 1 1.6 1.6v15.2a1.6 1.6 0 0 1-1.6 1.6H8a1.6 1.6 0 0 1-1.6-1.6V4.4A1.6 1.6 0 0 1 8 2.8zM11 18h2",
};

const COLLECTIONS = [
  { name: "Hoodies", link: "/hoodies", icon: "hoodie", images: [hoodies400, hoodies620], alt: "Forest green hoodie with an \"It's okay to take a break\" print" },
  { name: "Sweatshirts", link: "/sweatshirts", icon: "sweater", images: [sweatshirts400, sweatshirts620], alt: "Pink sweatshirt with a floral line-art print" },
  { name: "T-Shirts", link: "/tshirts", icon: "tee", images: [tshirts400, tshirts620], alt: "Pink T-shirt with a moon and hand line-art print" },
  { name: "Mugs", link: "/mugs", icon: "mug", images: [mugs400, mugs620], alt: "Cream mug with a wildflower print" },
  { name: "Tote Bags", link: "/totebags", icon: "tote", images: [totebags400, totebags620], alt: "Canvas tote bag with a leaf and pink circle print" },
  { name: "Phone Cases", link: "/phonecases", icon: "phone", images: [phonecases400, phonecases620], alt: "Cream phone case with a pink wildflower print" },
];

function Icon({ name }) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={ICONS[name]} />
    </svg>
  );
}

function Arrow({ left = false }) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={left ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7"} />
    </svg>
  );
}

// Six cards in a sideways-scrolling row (five fit on a computer screen):
// the full product photo, the collection name and a "Shop Now" button. The
// round arrow buttons only appear when there is more to see; on phones the
// row is swiped.
function HomeCollections() {
  const rowRef = useRef(null);
  const [canScroll, setCanScroll] = useState({ prev: false, next: false });

  useEffect(() => {
    const row = rowRef.current;
    if (!row) return undefined;

    function update() {
      const max = row.scrollWidth - row.clientWidth;
      setCanScroll({ prev: row.scrollLeft > 4, next: row.scrollLeft < max - 4 });
    }

    update();
    row.addEventListener("scroll", update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(row);
    return () => {
      row.removeEventListener("scroll", update);
      observer.disconnect();
    };
  }, []);

  function scrollRow(direction) {
    const row = rowRef.current;
    if (!row) return;
    const card = row.querySelector("li");
    const step = card ? card.getBoundingClientRect().width + 18 : row.clientWidth * 0.8;
    row.scrollBy({ left: direction * step, behavior: "smooth" });
  }

  return (
    <section id="collections" className="home-collections" aria-labelledby="collections-title">
      <img className="home-collections-decor home-collections-decor--leaves" src={decorLeaves} alt="" width="342" height="580" loading="lazy" decoding="async" />
      <img className="home-collections-decor home-collections-decor--leaves-left" src={decorLeaves} alt="" width="342" height="580" loading="lazy" decoding="async" />
      <img className="home-collections-decor home-collections-decor--flowers" src={decorFlowers} alt="" width="300" height="290" loading="lazy" decoding="async" />

      <div className="home-collections-inner">
        <div className="home-collections-head">
          <h2 id="collections-title">Our Collections</h2>
          <span className="home-collections-mark" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
              <path d="M12 20.5s-7.5-4.6-9.3-9.2C1.4 7.9 3.6 4.5 7 4.5c2.1 0 3.6 1.2 5 3 1.4-1.8 2.9-3 5-3 3.4 0 5.6 3.4 4.3 6.8-1.8 4.6-9.3 9.2-9.3 9.2z" />
            </svg>
          </span>
          <p>Explore our curated collections made for every vibe.</p>
        </div>

        <div className="home-coll-carousel">
          {canScroll.prev && (
            <button type="button" className="home-coll-nav home-coll-nav--prev" onClick={() => scrollRow(-1)} aria-label="Previous collections">
              <Arrow left />
            </button>
          )}

          <ul className="home-collections-row" ref={rowRef}>
            {COLLECTIONS.map(({ name, link, icon, images: [small, large], alt }) => (
              <li key={link}>
                <Link to={link} className="home-coll-card">
                  <span className="home-coll-media">
                    <img
                      src={large}
                      srcSet={`${small} 400w, ${large} 620w`}
                      sizes="(max-width: 640px) 70vw, 260px"
                      alt={alt}
                      width="620"
                      height="620"
                      loading="lazy"
                      decoding="async"
                    />
                    <span className="home-coll-icon">
                      <Icon name={icon} />
                    </span>
                  </span>
                  <span className="home-coll-body">
                    <span className="home-coll-name">{name}</span>
                    <span className="home-coll-shop" aria-hidden="true">
                      Shop Now
                      <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12h14M13 6l6 6-6 6" />
                      </svg>
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          {canScroll.next && (
            <button type="button" className="home-coll-nav home-coll-nav--next" onClick={() => scrollRow(1)} aria-label="More collections">
              <Arrow />
            </button>
          )}
        </div>
      </div>

      {/* Soft pink and green waves at the bottom of the section. */}
      <svg className="home-collections-wave" viewBox="0 0 1440 120" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0 70C220 20 420 20 640 55s420 60 800 0V120H0z" fill="#F3D3D8" />
        <path d="M0 96C260 50 520 60 760 88s420 30 680-10V120H0z" fill="#143C35" />
        <path d="M0 108C300 80 560 92 800 108s420 14 640-4V120H0z" fill="#FCF6F4" />
      </svg>
    </section>
  );
}

export default HomeCollections;
