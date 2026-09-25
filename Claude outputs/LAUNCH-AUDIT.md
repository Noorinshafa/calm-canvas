# ShopCalmCanvas — Launch Audit

Date: 2026-09-24
Scope: 20-point pre-launch audit requested by the site owner. Covers SEO, security headers, accessibility, forms, error handling, and cross-browser/device readiness. Existing visual identity, content, routes and working functionality were preserved — no redesign, no replacement of working systems.

**Important honesty note (per the owner's explicit instruction):** This audit does NOT claim the site is fully secure, legally compliant, or guaranteed to rank in search engines. It documents what was checked, what was fixed, what was already correct, and what still needs a human decision or a professional (lawyer, designer, native-device tester).

Legend: ✅ DONE · ➖ NOT APPLICABLE · 🟡 NEEDS INPUT · ⚠️ NEEDS LEGAL REVIEW

---

## 1. Canonical URLs

**Status:** ✅ DONE (already correct, verified, one enhancement added)

Every route already sets a canonical `<link>` via the site's `useSEO()` hook, using the production domain `https://shopcalmcanvas.com`. Verified by grep across every page and collection component — About, Contact, Terms, Privacy, Shipping/Returns, Checkout, Cart, OrderSuccess, ProductDetails, all 6 collection pages, and the generic CollectionPage all call `useSEO()` with a distinct `path`. `index.html`'s default canonical matches.

**Files:** `src/hooks/useSEO.js` (mechanism), all page components (usage) — no changes needed.
**Verification:** Manual grep of every `useSEO(` call site; confirmed each supplies a unique `path`.

---

## 2. Open Graph tags

**Status:** ✅ DONE (already correct)

`index.html` already ships `og:title`, `og:description`, `og:type`, `og:url`, `og:image`, plus Twitter Card tags. These are static defaults (SPA limitation — see NEEDS INPUT note below), but they are accurate for the homepage and are a reasonable fallback for any shared page.

**Files:** `index.html` — no changes needed.
🟡 **NEEDS INPUT:** Because this is a client-rendered single-page app, social sharing previews (Facebook/X/WhatsApp link unfurls) for individual product or collection pages will show the homepage's OG image/description, not that product's own image/title, because these crawlers usually don't execute JavaScript. Fixing this properly requires per-page server-rendered meta tags (e.g. a small serverless prerender step or migrating specific routes to SSR), which is a bigger architectural change outside the scope of "safe changes only." Documented here as a known limitation, not fixed in this pass.

---

## 3. Security headers (CSP, HSTS, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, frame-ancestors)

**Status:** ✅ DONE (was missing entirely, now added)

**Problem:** `vercel.json` previously had no `headers` block at all — zero security headers were being sent.

**Fix:** Added a `headers` block in `vercel.json` applying to every route:
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `X-Frame-Options: DENY`
- `Permissions-Policy: camera=(), microphone=(), geolocation=(), usb=(), payment=(), interest-cohort=()`
- `Strict-Transport-Security: max-age=63072000; includeSubDomains`
- `Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https://images-api.printify.com https://*.cloudfront.net; connect-src 'self'; form-action 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'`

The CSP was built from an actual inventory of the site's real resources, not guessed: grep confirmed no third-party analytics/trackers exist in the codebase; Google Fonts is the only external CSS/font source; Printify/Safepay calls happen server-side only (never a client-side `fetch` to those domains), so `connect-src 'self'` is safe. `style-src` needs `'unsafe-inline'` because React's `style={{...}}` props compile to inline `style` attributes. `img-src` was verified live against the deployed site — real product images load from `images-api.printify.com` and Printify's CloudFront distribution — and tightened to those two hosts plus `data:` instead of a blanket `https:`.

**Files:** `vercel.json`.
**Verification:** JSON validated for syntax. Header values checked against actual site resources (grep for external script/style/fetch/img URLs) and against a live network inspection of product images. After deploy, verify at securityheaders.com or via browser dev tools' Network tab, and load a product page to confirm images still render (the CSP was deliberately built to allow the exact hosts observed live).

---

## 4. robots.txt

**Status:** ✅ DONE (already correct)

`public/robots.txt` already allows crawling, disallows `/cart` and `/checkout`, and points to the dynamic sitemap at `/api/sitemap`.

**Files:** `public/robots.txt` — no changes needed.

---

## 5. sitemap.xml

**Status:** ✅ DONE (dynamic sitemap already exists) / 🟡 NEEDS INPUT (stale static file)

The site has a working dynamic sitemap at `/api/sitemap` (a serverless function, built earlier in this project) that lists real, current product/category URLs pulled from Printify — this is the one `robots.txt` points to and is correct.

🟡 **NEEDS INPUT / cleanup needed:** `public/sitemap.xml` is an old, stale, hand-written static file (10 fixed URLs, no products) left over from before the dynamic sitemap existed. It isn't linked from `robots.txt` and Google won't use it, but it's dead weight sitting in the repo and could confuse a future maintainer, or get crawled if discovered directly. I do not have delete access to your files in this session (no shell/delete tool available here), so I could not remove it. **Action needed from you:** delete `public/sitemap.xml` from the repo (safe — nothing references it) whenever convenient. Not urgent, not a launch blocker.

**Files:** `api/sitemap.js` (existing, working), `public/sitemap.xml` (stale, flagged for manual deletion).

---

## 6. Unique page titles

**Status:** ✅ DONE (already correct)

Every route sets a distinct `<title>` via `useSEO()`. Verified by grep — no duplicates found.

**Files:** all page components — no changes needed.

---

## 7. Meta descriptions

**Status:** ✅ DONE (already correct)

Same mechanism as #6 — every route supplies its own accurate `description` to `useSEO()`.

**Files:** all page components — no changes needed.

---

## 8. Alt text on images

**Status:** ✅ DONE (already correct)

Every `<img>` across the codebase (ProductCard, ShopCategories, Hero, BestSellers, CollectionPage, Navbar ×2, Checkout, Cart, ProductDetails ×2) already has meaningful `alt` text — product titles, category names, or "Calm Canvas" for the logo. No empty or missing `alt` attributes found.

**Files:** no changes needed.

---

## 9. Internal links (crawlable, not click-handler-only)

**Status:** ✅ DONE (already correct, one addition)

Navigation across the site already uses real `<Link>`/`<a>` elements (react-router `Link`), not `onClick`-only `<div>`s, so search engines and keyboard/screen-reader users can follow them normally.

**Addition:** The "Product not found" state in ProductDetails.jsx previously showed only a bare heading with no way out. Added an explanatory message and a real `<Link to="/collections">Browse all products</Link>` so a dead product link doesn't strand a visitor (or a crawler) on a page with no forward path.

**Files:** `src/components/pages/ProductDetails.jsx`.
**Verification:** Manual code review of every nav/footer/card link; confirmed all use `<Link>`/`<a href>`.

---

## 10. Custom 404 page with a real HTTP 404 status

**Status:** ✅ DONE (was broken, now fixed)

**Problem (confirmed live on the current production site):** the site is a single-page app where every unknown path was rewritten to `/index.html`, which returns HTTP 200. I tested this directly against the live site:

```
fetch('/this-page-does-not-exist-xyz123') → status 200
```

This is a "soft 404" — search engines can index junk/broken URLs as if they were real pages, and any tool checking link health sees success instead of failure.

**Fix (two layers):**
1. `vercel.json`'s catch-all rewrite was replaced with an explicit list of every real route. Any path not on that list now falls through to `public/404.html`, a new static branded error page, which Vercel serves with a genuine HTTP 404 status.
2. A new `NotFound.jsx` React component was added and wired as the app's in-app fallback route (`path="*"`), so a broken internal link clicked *while already inside the app* also shows a branded, on-brand 404 instead of silently redirecting to the homepage (the previous behavior, which hid broken links instead of surfacing them). It's marked `noindex` so it can never itself be indexed.

**Files:** `vercel.json`, `public/404.html` (new), `src/components/pages/NotFound.jsx` (new), `src/App.jsx`.
**Verification:** Live `fetch()` test against production confirmed the current 200-status bug (documented above as the "before" baseline). After deploy, re-run the same test against a nonexistent URL and confirm it returns 404, and visit the URL directly in a browser to confirm the branded page displays correctly.

---

## 11. Privacy policy page

**Status:** ✅ DONE (page exists, content accurate) / ⚠️ NEEDS LEGAL REVIEW

A full Privacy Policy already exists at `/privacy-policy`, covering data collected, how it's used, who it's shared with (Printify, Safepay), retention, and security. Added one new accurate section this pass: **"Cookies and Local Storage"**, clarifying that the site does not use tracking/analytics cookies and only stores cart contents in the browser's local storage (a gap the previous version didn't mention).

**Files:** `src/components/pages/Privacy.jsx`.

⚠️ **NEEDS LEGAL REVIEW:** This policy was written to be accurate to what the code actually does, but it has not been reviewed by a lawyer and should not be treated as a legally-binding document as-is. It's also missing concrete business details a real policy needs: your registered business name/entity, business address, and — if you plan to serve customers in the EU/UK or California — you may need explicit GDPR/CCPA language, a named Data Protection Officer or contact, and a cookie-consent banner (currently not needed since no tracking cookies are used, but that changes the moment you add analytics or ads). **Action needed from you:** have a lawyer (or a service like Termly/Iubenda) review this before you consider the business fully compliant, especially before your Safepay account processes real payments.

---

## 12. HTTPS + redirect

**Status:** ✅ DONE (Vercel-managed, verified)

Vercel automatically provisions TLS certificates and redirects all HTTP traffic to HTTPS for custom domains — this is a platform-level guarantee, not something the app code controls. Live evidence: the browser itself refused to even attempt a plain `http://` request to the site from an HTTPS tab (blocked as mixed content before it could leave the browser), and the new HSTS header (`Strict-Transport-Security: max-age=63072000; includeSubDomains`, added in #3) tells browsers to never try HTTP again for two years once they've visited once.

**Files:** `vercel.json` (HSTS header, added under #3) — redirect itself is Vercel platform behavior, not app code.
**Verification:** After deploy, test directly by typing `http://shopcalmcanvas.com` (not `https://`) into a fresh browser or incognito window and confirming it lands on `https://`.

---

## 13. Exposed secrets scan

**Status:** ✅ DONE — no secrets found in tracked source

Searched the entire tracked codebase for hardcoded API keys, tokens, and credentials (grep for common patterns, plus manual review of every file that talks to Printify/Safepay). Result: **no secrets found in the code itself.**

- `.env.local` (which holds real keys) is correctly listed in `.gitignore` and is never committed.
- All Printify/Safepay calls happen inside `/api/*.js` serverless functions, which read keys from `process.env` at request time on Vercel's server — never shipped to the browser.
- Grep confirmed no `import.meta.env.VITE_*` secret leaking into any client-side (`src/`) file.

Per your instruction, if a real secret had been found exposed, this report would mark it **COMPROMISED** and tell you to rotate it (generate a new key and revoke the old one) rather than just deleting it from the file — because once a secret has been committed to git history or deployed publicly, deleting it later doesn't undo the exposure; only rotating it does. That situation was not found.

**Files:** none changed — this was a verification pass only.
**Verification:** Grep for token/key/secret patterns across `src/`, `api/`, and config files; manual read of every file touching Printify/Safepay; confirmed `.gitignore` coverage.

🟡 **NEEDS INPUT (process, not code):** I do not have access to your actual git commit history in this session, only the current working tree. If a key was ever accidentally committed in an *earlier* commit and later removed, it can still be recoverable from git history even though it's not in the code today. If you're not sure, the safest move is to rotate your Printify and Safepay keys once after launch regardless — cheap insurance.

---

## 14. Mobile responsiveness across breakpoints

**Status:** ✅ DONE (reviewed, existing responsive design confirmed sound) — 🟡 see device-testing note under #20

The site's CSS already uses a mobile-first responsive approach (flexbox/grid layouts, breakpoints in the existing stylesheets). No layout-breaking issues were found in code review. Full confirmation across real device sizes is covered under #20's browser/device matrix.

**Files:** no changes needed from this review; see #20 for what's still outstanding.

---

## 15. Page speed

**Status:** ✅ DONE (reviewed, one investigation closed out, no bug found)

The site already benefits from earlier work in this project: route-based code-splitting (each page loads its own JS bundle on demand via `lazy()` instead of one giant bundle), a single efficient product-catalog fetch, and optimized images.

**This pass:** investigated an apparent 6–7× duplicate `/api/printify` network request pattern observed in a browser dev-tool log. Full code review of the data-fetching layer (`ProductsContext.jsx`, `printifyApi.js`, `useProducts.js`, and every collection page) found only a single, correct fetch on mount, with no redundant calls anywhere. Confirmed with a clean, page-scoped browser measurement (`performance.getEntriesByType('resource')` on a fresh `/mugs` load) that showed **exactly one** `/api/printify` request. Conclusion: this was a false alarm — a display artifact of the logging tool accumulating history across multiple page navigations in one browser session, not a real bug. No code change was needed.

**Files:** none changed — investigation only.
**Verification:** Live `performance.getEntriesByType('resource')` check on a fresh page load, filtered to the API call, returned exactly 1 entry.

🟡 **NEEDS INPUT:** A full Lighthouse/PageSpeed Insights/Core Web Vitals report requires running an audit tool against the *live deployed* site after these changes go out, which needs to happen from your end after deploy (or ask me to do it once the changes are live). I did not have a way to run Lighthouse in this session.

---

## 16. Working forms (server-side validation, spam protection)

**Status:** ✅ DONE (checkout form) / 🟡 NEEDS INPUT (newsletter form)

**Checkout form** — the site's one functional, order-placing form:
- **Problem:** the shipping fields were a bare `<div>`, not a real `<form>` — no `<label>`s, no `type="email"`/`type="tel"`, submission was wired to a button's `onClick` rather than form submission, and there was no server-side validation of the shipping fields (only client-side, which anyone can bypass by calling the API directly).
- **Fix:** rewrote as a real `<form onSubmit={...} noValidate>` with proper `<label>`s (visually hidden where a placeholder already shows the same info), correct `type="email"`/`type="tel"`, `autoComplete` attributes, and `required` fields. Added matching server-side validation in `api/create-checkout-session.js` — required-field checks and an email-format check — so the API rejects a malformed or incomplete order even if the browser-side check is bypassed entirely. This is "defense in depth": client-side validation is for a good user experience, server-side validation is what actually protects your data and your Printify order queue from garbage input.

**Files:** `src/components/pages/Checkout.jsx`, `api/create-checkout-session.js`.

🟡 **Spam protection:** the checkout form isn't a public spam target the way a contact form is (each submission triggers a real Printify order, which costs money to fulfil — so accidental spam has natural friction), so no CAPTCHA was added. If you later see abusive/bogus test orders, adding a lightweight bot-check (like Cloudflare Turnstile) to checkout would be a reasonable follow-up — not done here since it wasn't an observed problem.

**Footer newsletter form:**
- **Problem:** the sign-up input had no `<form>`, no label, and clicking "submit" did nothing at all — it wasn't wired to anything.
- **Fix:** gave it real form semantics (`<form>`, `<label>`, `type="email"`, `required`, proper submit button) so it's now a correctly-structured, accessible form.
- 🟡 **NEEDS INPUT:** It is **still not connected to an actual email list or CRM** — I don't know what service you want to use (Mailchimp, Klaviyo, a Google Sheet, something else), so I deliberately did not fake a "Thanks, you're subscribed!" message for a signup that goes nowhere. Right now submitting the form does nothing visible, which is honest but not a finished feature. **Action needed from you:** tell me which email service you want (or that you don't want this feature yet), and I'll wire it up properly.

**Contact form:** uses the existing, already-functional contact flow from earlier in this project — no changes needed this pass.

---

## 17. Form feedback (loading/error/success states, accessible to assistive tech)

**Status:** ✅ DONE (checkout) / ➖ NOT APPLICABLE (newsletter, until #16's backend is chosen)

Checkout already had a submitting/error state; this pass tightened it for accessibility: the submit button now sets `aria-busy={submitting}` so screen readers announce the loading state, invalid fields get `aria-invalid` + `aria-describedby` pointing at their specific error message, and the order-level error message got `role="alert"` so assistive tech announces it immediately instead of it being silently visible-only.

**Files:** `src/components/pages/Checkout.jsx`.
**Verification:** Code review confirming ARIA attributes are correctly paired (each `aria-describedby` id matches a real element). Live behavioral confirmation (typing invalid input and confirming the error announces) should be done once deployed, ideally with a real screen reader (VoiceOver on Mac/iPhone, or NVDA on Windows) — see #19.

---

## 18. Clear CTAs

**Status:** ✅ DONE (reviewed, already clear) — no changes needed

Primary calls-to-action ("Add to Cart," "Checkout," "Continue Shopping," collection browse links) already use clear, action-oriented, unambiguous labels with sufficient visual weight (existing button styling). No vague "Click Here" or "Submit"-only labels found.

**Files:** no changes needed.

---

## 19. Accessibility

**Status:** ✅ DONE (concrete fixes made) — automated + partial manual check only, not a full WCAG audit

**The main problem found:** a site-wide keyboard-focus-visibility failure. `global.css` had a blanket `button { outline: none; }` rule with no replacement focus style for most interactive elements — meaning a person navigating by keyboard (Tab key) instead of a mouse had no visual indication of which button, link, or field was currently focused. This fails WCAG 2.4.7 (Focus Visible) and makes the site very hard to use without a mouse.

**Fix:** added `:focus-visible` styles across the site's stylesheets (`global.css`, `checkout.css`, `footer.css`, `productdetails.css`, `shopCategories.css`, `navbar.css`). This modern CSS approach shows a clear focus ring for keyboard users while staying invisible for mouse clicks — so it fixes the accessibility gap without changing how the site looks or feels for the majority of visitors who use a mouse or touchscreen.

**Other fixes this pass:**
- Cart: quantity increase/decrease and "Remove" buttons now have descriptive `aria-label`s naming the specific product, and the quantity number itself announces changes via `aria-live="polite"`.
- Product page: quantity buttons, and the size/color `<select>` dropdowns, now have proper `aria-label`s; same `aria-live` treatment on the quantity.
- Checkout: every field now has a real, programmatically-associated `<label>` (see #16/#17).
- Icon-only nav buttons (search, cart, menu) were already correctly labelled — confirmed, no change needed.
- Every image already had alt text — confirmed, no change needed (#8).

**Files:** `src/styles/global.css`, `src/styles/checkout.css`, `src/styles/footer.css`, `src/styles/productdetails.css`, `src/styles/shopCategories.css`, `src/styles/navbar.css`, `src/components/pages/Cart.jsx`, `src/components/pages/ProductDetails.jsx`, `src/components/pages/Checkout.jsx`.

**Verification:** manual keyboard-only navigation (Tab/Shift+Tab through key pages) is recommended after deploy to confirm the focus ring now shows correctly everywhere. Manual screen-reader spot-check (VoiceOver/NVDA) on the checkout form is also recommended.

🟡 **Per your instruction, this is explicitly NOT a claim of full WCAG 2.1/2.2 compliance.** This pass fixed the concrete, verifiable problems found (focus visibility, missing labels, missing alt text checks) through code review — it is not a substitute for a full manual accessibility audit or an automated scanner run (like axe DevTools or Lighthouse's accessibility category) against the live site, which I'd recommend running once these changes are deployed.

---

## 20. Browser testing across Chrome/Safari/Firefox/Edge + mobile

**Status:** 🟡 NEEDS INPUT (partial — see matrix and honest limitation below)

**What I could actually test:** live verification against the deployed production site was done using one browser (Chromium-based, via the in-app browser tool available in this session) — homepage load, collection page titles, console errors (none found on pages checked), and the network-request/404 behaviors documented above.

**What I could NOT test in this session, and why:** I only have access to one browser engine here — I do not have Safari, Firefox, or Edge installed in this environment, and I have no access to a real iPhone/Android device or emulator. So a genuine cross-browser/cross-device test matrix is **not something I can complete from this session.**

| Browser / Device | Tested this session? | Notes |
|---|---|---|
| Chrome (desktop) | ✅ Yes | Core flows checked live on production |
| Edge (desktop) | ➖ Not tested | Edge uses the same rendering engine as Chrome (Chromium), so risk is low, but not verified |
| Safari (desktop, macOS) | ➖ Not tested | Different rendering engine (WebKit) — genuinely needs its own check, especially for CSS `:focus-visible` support (well-supported in modern Safari, but worth confirming) and the Printify/Safepay iframe/redirect flows |
| Firefox (desktop) | ➖ Not tested | Different engine (Gecko) — needs its own check |
| Mobile Safari (iOS) | ➖ Not tested | Needs a real iPhone or a Mac with Simulator |
| Mobile Chrome (Android) | ➖ Not tested | Needs a real Android device or emulator |

🟡 **Action needed from you:** the most efficient way to close this out is for you to open the live site on your own phone (both an iPhone if you have one, and an Android if you have one) and in Firefox/Safari/Edge on desktop, and walk through: homepage → browse a collection → open a product → add to cart → checkout. Look specifically for: layout breaking or overlapping text, buttons that don't respond to tap, and the Safepay payment redirect completing correctly. Anything that looks *broken* (not just slightly different spacing) is worth reporting back to me so I can fix it — cosmetic differences between browsers (slightly different font rendering, minor spacing) are normal and not something to chase.

---

## Final Verification Checklist (per your spec)

| Check | Status |
|---|---|
| Pages work on desktop and mobile | ✅ Reviewed in code; 🟡 real-device confirmation still needed (#20) |
| Metadata uses production domain, not localhost | ✅ Confirmed — `index.html` and `useSEO()` both use `https://shopcalmcanvas.com` |
| robots.txt / sitemap.xml / privacy route / a fake missing URL behave correctly on the deployed version | 🟡 Correct in code; needs re-confirmation live **after this round is deployed** (the 404 fix isn't live yet) |
| HTTPS redirects correctly, no mixed content | ✅ Vercel-managed; HSTS added; verify once more after deploy |
| No credentials exposed in client code or git history | ✅ Client code confirmed clean; git history not accessible from this session (see #13) |
| Forms submit with accurate feedback, or marked N/A | ✅ Checkout done; newsletter marked NEEDS INPUT (no backend chosen yet) |
| Console has no new errors | ✅ Clean on pages checked live this session |
| Security policy (CSP) doesn't block required resources | ✅ Built from real observed resources; **please re-check product images load correctly after deploy**, since CSP mistakes are the #1 way a security header accidentally breaks a working page |
| Primary journey works across the documented browser/device matrix | 🟡 Chrome confirmed; Safari/Firefox/Edge/mobile need your manual check (#20) |
| Report of every manual action still required from you | ✅ See "Summary of action needed from you" below |

---

## Summary of action needed from you

1. **Delete `public/sitemap.xml`** (the old stale file) — safe, not urgent.
2. **Get the Privacy Policy reviewed by a lawyer** before treating the business as compliant, and fill in your real business address/entity name into it.
3. **Decide on an email/newsletter service** (or tell me to leave it unwired for now) so the footer signup can actually do something.
4. **Rotate your Printify and Safepay API keys once**, as cheap insurance, since I couldn't check git history for old exposures.
5. **After this round is deployed**, spend 10–15 minutes checking the site on your own phone and in Safari/Firefox/Edge if you have access, especially: the checkout flow, product images loading, and visiting a nonsense URL to confirm the new 404 page shows up.
6. **Run a Lighthouse/PageSpeed report** against the live site after deploy for an official performance/SEO score (I couldn't run that tool from this session).

Nothing above is a launch blocker except possibly #2 depending on your risk tolerance — everything else is a "do this soon" rather than a "do this before anyone sees the site."
