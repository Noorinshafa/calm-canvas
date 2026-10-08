import { Link } from "react-router-dom";
import { parseInline } from "../../utils/blocks.js";

// Renders text containing [label](/path) links as text and <Link>s.
export function InlineText({ text }) {
  return parseInline(text).map((part, index) =>
    part.href ? (
      <Link key={index} to={part.href}>
        {part.text}
      </Link>
    ) : (
      part.text
    )
  );
}

// Renders a post's content blocks (paragraphs, headings, bullet lists).
function BlogBlocks({ blocks }) {
  return blocks.map((block, index) => {
    if (block.type === "h2") {
      return (
        <h2 key={index}>
          <InlineText text={block.text} />
        </h2>
      );
    }

    if (block.type === "h3") {
      return (
        <h3 key={index}>
          <InlineText text={block.text} />
        </h3>
      );
    }

    if (block.type === "ul") {
      return (
        <ul key={index}>
          {block.items.map((item, itemIndex) => (
            <li key={itemIndex}>
              <InlineText text={item} />
            </li>
          ))}
        </ul>
      );
    }

    return (
      <p key={index}>
        <InlineText text={block.text} />
      </p>
    );
  });
}

export default BlogBlocks;
