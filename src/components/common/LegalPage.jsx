import "../../styles/legal.css";
import useSEO from "../../hooks/useSEO";
import { parseLegalInline } from "../../content/legal.js";

// Text with **bold** words and [label](mailto:address) links.
function LegalText({ text }) {
  return parseLegalInline(text).map((part, index) => {
    if (part.href) {
      return (
        <a key={index} href={part.href}>
          {part.text}
        </a>
      );
    }

    if (part.strong) {
      return <strong key={index}>{part.text}</strong>;
    }

    return part.text;
  });
}

// The layout shared by the Terms & Conditions and Privacy Policy pages. The
// wording itself lives in src/content/legal.js.
//   page: the entry from PAGES in src/config/site.js (title, description, path)
//   doc:  TERMS or PRIVACY from src/content/legal.js
function LegalPage({ page, doc }) {
  useSEO({
    title: page.title,
    description: page.description,
    path: page.path,
  });

  return (
    <section className="legal-page">

      <div className="legal-hero">

        <span>LEGAL</span>

        <h1>{doc.h1}</h1>

        <p>{doc.intro}</p>

      </div>

      <div className="legal-content">

        {doc.blocks.map((block, index) => {
          if (block.type === "h2") {
            return <h2 key={index}>{block.text}</h2>;
          }

          if (block.type === "ul") {
            return (
              <ul key={index}>
                {block.items.map((item, itemIndex) => (
                  <li key={itemIndex}>
                    <LegalText text={item} />
                  </li>
                ))}
              </ul>
            );
          }

          return (
            <p key={index}>
              <LegalText text={block.text} />
            </p>
          );
        })}

      </div>

    </section>
  );
}

export default LegalPage;
