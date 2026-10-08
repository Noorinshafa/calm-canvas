import { Link } from "react-router-dom";
import "../../styles/about.css";
import useSEO from "../../hooks/useSEO";
import { PAGES, ABOUT_SECTIONS } from "../../config/site.js";
import { breadcrumbJsonLd } from "../../utils/seoShared.js";

// Plain-text copy lives in src/config/site.js so the HTML generated at build
// time (what search engines read first) is identical to what is shown here.
const CRUMBS = [
  { name: "Home", path: "/" },
  { name: "About", path: PAGES.about.path },
];

function About() {
  useSEO({
    title: PAGES.about.title,
    description: PAGES.about.description,
    path: PAGES.about.path,
    jsonLd: breadcrumbJsonLd(CRUMBS),
  });

  return (
    <section className="about">
      <div className="about-hero">
        <span>ABOUT CALM CANVAS</span>

        <h1>
          More Than Accessories.
          <br />
          Little Moments of Joy.
        </h1>

        <p>
          Calm Canvas is a place where elegance, creativity, and thoughtful
          design come together to make everyday moments feel special.
        </p>
      </div>

      <div className="about-body">
        {ABOUT_SECTIONS.map((section) => (
          <div key={section.heading} className="about-block">
            <h2>{section.heading}</h2>

            {section.paragraphs.map((text) => (
              <p key={text}>{text}</p>
            ))}
          </div>
        ))}

        <p className="about-links">
          <Link to="/collections">Browse all collections</Link>
          <Link to="/shipping-returns">Shipping &amp; returns</Link>
          <Link to="/contact">Contact us</Link>
        </p>
      </div>
    </section>
  );
}

export default About;
