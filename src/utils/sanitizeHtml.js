// A small, dependency-free HTML sanitizer for product descriptions.
//
// WHY THIS EXISTS: ProductDetails renders `product.description` with
// `dangerouslySetInnerHTML` because Printify descriptions legitimately
// contain basic formatting (line breaks, paragraphs, lists, bold). Since you
// control your own Printify catalog this isn't user-generated content, but
// it's still worth making sure nothing in it can execute -- a compromised
// Printify account, or a description copy-pasted from somewhere that
// included a stray <script>/<iframe> tag, shouldn't be able to run code in a
// customer's browser. This runs in the browser (uses DOMParser), so it only
// applies where description HTML is actually rendered.
//
// This is an ALLOWLIST: only the tags below survive, and they keep no
// attributes at all (apart from a safe web address on links). Anything else
// is unwrapped (its text stays) or, for the tags that can run code or load
// other content, removed together with everything inside it. A sample of
// real descriptions (5 Nov 2026) used only <br>, <p>, <ul>, <li> and
// <strong>, so nothing visible changes. Still dependency-free on purpose.
const ALLOWED_TAGS = new Set([
  "p",
  "br",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "ul",
  "ol",
  "li",
  "h2",
  "h3",
  "h4",
  "a",
]);

// Removed together with their contents (never just unwrapped).
const DROP_WITH_CONTENT = new Set([
  "script",
  "style",
  "iframe",
  "frame",
  "frameset",
  "object",
  "embed",
  "link",
  "meta",
  "form",
  "base",
  "svg",
  "math",
  "template",
  "noscript",
  "textarea",
  "select",
  "button",
  "input",
  "audio",
  "video",
  "applet",
]);

// Browsers ignore tabs, new lines and other control characters inside a web
// address, so "java\tscript:" still runs. Strip them before checking.
function isSafeUrl(value) {
  const cleaned = (value || "")
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u0020\u007f-\u009f]/g, "")
    .toLowerCase();

  return (
    cleaned.startsWith("https:") ||
    cleaned.startsWith("http:") ||
    cleaned.startsWith("mailto:") ||
    cleaned.startsWith("tel:") ||
    cleaned.startsWith("/") ||
    cleaned.startsWith("#")
  );
}

function sanitizeNode(node) {
  // Walk children back-to-front so changing a node doesn't skip its sibling.
  for (let i = node.children.length - 1; i >= 0; i--) {
    const el = node.children[i];
    const tag = el.tagName.toLowerCase();

    if (DROP_WITH_CONTENT.has(tag)) {
      el.remove();
      continue;
    }

    // Clean the inside first, then decide what to do with this element.
    sanitizeNode(el);

    if (!ALLOWED_TAGS.has(tag)) {
      // Keep the text and any allowed children, drop the unknown wrapper.
      el.replaceWith(...el.childNodes);
      continue;
    }

    const href = tag === "a" ? el.getAttribute("href") : null;

    for (const attr of [...el.attributes]) {
      el.removeAttribute(attr.name);
    }

    if (tag === "a" && href && isSafeUrl(href)) {
      el.setAttribute("href", href.trim());
      el.setAttribute("rel", "noopener noreferrer");
    }
  }
}

export function sanitizeHtml(html) {
  if (!html || typeof window === "undefined" || !window.DOMParser) {
    return "";
  }

  try {
    const doc = new DOMParser().parseFromString(html, "text/html");
    sanitizeNode(doc.body);
    return doc.body.innerHTML;
  } catch {
    // If parsing fails for any reason, fail closed rather than render
    // whatever came back.
    return "";
  }
}
