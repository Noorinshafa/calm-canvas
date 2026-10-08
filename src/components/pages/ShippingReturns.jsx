import { Fragment } from "react";
import "../../styles/legal.css";
import "../../styles/seo-extras.css";
import useSEO from "../../hooks/useSEO";
import {
  PAGES,
  CONTACT_EMAIL,
  SHIPPING_SECTIONS,
  SHIPPING_FAQ,
} from "../../config/site.js";
import { breadcrumbJsonLd, faqJsonLd } from "../../utils/seoShared.js";

// Turns the support email address inside a paragraph into a mailto link.
function withEmailLink(text) {
  const parts = text.split(CONTACT_EMAIL);

  return parts.map((part, index) => (
    <Fragment key={index}>
      {part}
      {index < parts.length - 1 && (
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
      )}
    </Fragment>
  ));
}

const JSON_LD = [
  breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Shipping & Returns", path: PAGES.shipping.path },
  ]),
  faqJsonLd(SHIPPING_FAQ),
];

// The policy text and the FAQ live in src/config/site.js so the HTML
// generated at build time matches this page exactly.
function ShippingReturns() {
  useSEO({
    title: PAGES.shipping.title,
    description: PAGES.shipping.description,
    path: PAGES.shipping.path,
    jsonLd: JSON_LD,
  });

  return (
    <section className="legal-page">
      <div className="legal-hero">
        <span>LEGAL</span>

        <h1>Shipping, Returns &amp; Refunds</h1>

        <p>
          Everything you need to know about order processing, shipping,
          cancellations, and returns.
        </p>
      </div>

      <div className="legal-content">
        {SHIPPING_SECTIONS.map((section) => (
          <Fragment key={section.heading}>
            <h2>{section.heading}</h2>

            {section.paragraphs.map((text) => (
              <p key={text}>{withEmailLink(text)}</p>
            ))}
          </Fragment>
        ))}

        <h2>Frequently Asked Questions</h2>

        <div className="faq-list">
          {SHIPPING_FAQ.map((entry) => (
            <details key={entry.q}>
              <summary>{entry.q}</summary>
              <p>{withEmailLink(entry.a)}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export default ShippingReturns;
