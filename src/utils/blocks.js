// Tiny helpers for blog content (src/content/posts.js).
//
// Post text may contain links written as [label](/path). These helpers turn
// that into pieces the React page and the build script can both render.
// No imports, so Node can load this file during the build.

const LINK_PATTERN = /\[([^\]]+)\]\((\/[^)\s]*)\)/g;

// "See [our hoodies](/hoodies) now" ->
//   [{ text: "See " }, { text: "our hoodies", href: "/hoodies" }, { text: " now" }]
export function parseInline(text = "") {
  const parts = [];
  let lastIndex = 0;
  let match;

  LINK_PATTERN.lastIndex = 0;

  while ((match = LINK_PATTERN.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ text: text.slice(lastIndex, match.index) });
    }

    parts.push({ text: match[1], href: match[2] });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push({ text: text.slice(lastIndex) });
  }

  return parts;
}

// Plain text with the link syntax removed (for word counts, summaries).
export function stripInline(text = "") {
  return parseInline(text)
    .map((part) => part.text)
    .join("");
}

export function formatPostDate(isoDate) {
  const date = new Date(`${isoDate}T00:00:00Z`);

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}
