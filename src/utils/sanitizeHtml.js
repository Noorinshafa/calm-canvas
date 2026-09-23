// A small, dependency-free HTML sanitizer for product descriptions.
//
// WHY THIS EXISTS: ProductDetails renders `product.description` with
// `dangerouslySetInnerHTML` because Printify descriptions legitimately
// contain basic formatting (bold, line breaks, lists). Since you control
// your own Printify catalog this isn't user-generated content, but it's
// still worth stripping anything that could execute -- a compromised
// Printify account, or a description copy-pasted from somewhere that
// included a stray <script>/<iframe> tag, shouldn't be able to run code in
// a customer's browser. This runs in the browser (uses DOMParser), so it
// only applies where description HTML is actually rendered.
//
// This is a denylist, not a full sanitizer library (no DOMPurify -- kept
// dependency-free on purpose). It's adequate for "our own catalog data,
// defense in depth," not for arbitrary untrusted/user-submitted HTML.
const DISALLOWED_TAGS = new Set([
  "script",
  "style",
  "iframe",
  "object",
  "embed",
  "link",
  "meta",
  "form",
  "base",
]);

function isUnsafeUrl(value) {
  const trimmed = (value || "").trim().toLowerCase();
  return trimmed.startsWith("javascript:") || trimmed.startsWith("data:text/html");
}

function sanitizeNode(node) {
  // Walk children back-to-front so removing a node doesn't skip its sibling.
  for (let i = node.children.length - 1; i >= 0; i--) {
    const el = node.children[i];
    const tag = el.tagName.toLowerCase();

    if (DISALLOWED_TAGS.has(tag)) {
      el.remove();
      continue;
    }

    for (const attr of [...el.attributes]) {
      const name = attr.name.toLowerCase();

      if (name.startsWith("on")) {
        el.removeAttribute(attr.name);
        continue;
      }

      if ((name === "href" || name === "src") && isUnsafeUrl(attr.value)) {
        el.removeAttribute(attr.name);
      }
    }

    sanitizeNode(el);
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
