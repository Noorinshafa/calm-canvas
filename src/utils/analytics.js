// Visitor measurement for the shop. Two optional services, each completely OFF
// until its ID is set:
//
// - Google Analytics 4 (GA4): set VITE_GA_MEASUREMENT_ID (looks like
//   "G-XXXXXXXXXX") in Vercel's Environment Variables and redeploy.
// - Meta (Facebook / Instagram) Pixel, used to measure Meta adverts: set
//   META_PIXEL_ID in src/config/site.js.
//
// With no ID set, every function here does nothing, no outside script is
// downloaded and no data is collected.
//
// Privacy:
// - Visitors whose device is set to a European time zone (this includes the
//   UK, Switzerland and the EU) see a small accept/decline notice
//   (src/components/common/CookieBanner.jsx). For them neither Google's nor
//   Meta's script is even downloaded, and no cookie is set, unless they press
//   Accept. Their choice is remembered on their own device and can be changed
//   at any time with "Cookie settings" in the footer.
// - Everyone else is measured without a notice. Google's own advertising
//   storage is always denied.
// - As a safety net, Google's Consent Mode also starts as "denied" for
//   visitors Google locates in the EU/EEA, UK or Switzerland, so a European
//   visitor with a non-European time zone setting is never tracked by
//   Google Analytics by default either.
// - The Meta Pixel only ever receives what this file sends it: page views and
//   the shopping steps below (product ids, quantities, values). Its automatic
//   reading of buttons and page details is switched off, and no name, email,
//   address or payment detail is passed to it.

import { META_PIXEL_ID } from "../config/site.js";

const GA_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;
const PIXEL_ID = META_PIXEL_ID || "";

const CONSENT_DENIED_REGIONS = [
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR",
  "HU", "IE", "IT", "LV", "LT", "LU", "MT", "NL", "PL", "PT", "RO", "SK",
  "SI", "ES", "SE", "IS", "LI", "NO", "GB", "CH",
];

// "v2": the choice now covers the Meta Pixel as well as Google Analytics, so
// a visitor who accepted analytics only (the old "scc-analytics-consent" key)
// is asked again instead of being signed up for something they never saw.
const CONSENT_KEY = "scc-consent-v2";

// Asks the banner to open again (used by the footer's "Cookie settings").
export const OPEN_CONSENT_EVENT = "scc:open-cookie-settings";

let started = false; // Google Analytics
let pixelStarted = false; // Meta Pixel

function gtag() {
  window.dataLayer.push(arguments);
}

// "granted", "denied", or null when the visitor has not chosen yet.
export function getStoredConsent() {
  try {
    const value = window.localStorage.getItem(CONSENT_KEY);

    return value === "granted" || value === "denied" ? value : null;
  } catch {
    return null;
  }
}

// True when this visitor should be asked before any measurement runs. The
// device's time zone is used because it is available instantly, with no extra
// request: Europe/* covers the UK, Switzerland and the EU; Atlantic/* covers
// the Azores, Madeira and the Canary Islands; Arctic/* covers Svalbard. A few
// non-EU time zones match too (for example Turkey); they just see the notice.
export function visitorNeedsConsentChoice() {
  if ((!GA_ID && !PIXEL_ID) || typeof window === "undefined") return false;

  try {
    const zone = Intl.DateTimeFormat().resolvedOptions().timeZone || "";

    return /^(Europe|Atlantic|Arctic)\//.test(zone);
  } catch {
    return false;
  }
}

function startAnalytics() {
  if (!GA_ID || started || typeof window === "undefined") return;
  started = true;

  window.dataLayer = window.dataLayer || [];

  // Consent defaults MUST be set before the Google script loads.
  gtag("consent", "default", {
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    analytics_storage: "denied",
    region: CONSENT_DENIED_REGIONS,
  });
  gtag("consent", "default", {
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    analytics_storage: "granted",
  });

  // A visitor who already made a choice on an earlier visit.
  const saved = getStoredConsent();

  if (saved) {
    gtag("consent", "update", { analytics_storage: saved });
  }

  gtag("js", new Date());
  // Page views are sent manually on every route change (see trackPageView),
  // because this is a single-page app.
  gtag("config", GA_ID, { send_page_view: false });

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(
    GA_ID
  )}`;
  document.head.appendChild(script);
}

// Meta's standard loader, written as ordinary code instead of the inline
// <script> Meta hands out, because the site's security policy (vercel.json)
// does not allow inline scripts.
function startMetaPixel() {
  if (!PIXEL_ID || pixelStarted || typeof window === "undefined") return;
  pixelStarted = true;

  if (!window.fbq) {
    const fbq = function () {
      if (fbq.callMethod) {
        fbq.callMethod.apply(fbq, arguments);
      } else {
        fbq.queue.push(arguments);
      }
    };

    window.fbq = fbq;
    if (!window._fbq) window._fbq = fbq;
    fbq.push = fbq;
    fbq.loaded = true;
    fbq.version = "2.0";
    fbq.queue = [];

    // Page views are sent manually on every route change (see trackPageView),
    // so Meta's own "the address changed" detection is switched off to avoid
    // counting each page twice. Meta's script ignores a second PageView on
    // the same page load unless it is told that repeats are intended, which
    // they are here: one per page the visitor opens.
    fbq.disablePushState = true;
    fbq.allowDuplicatePageViews = true;

    const script = document.createElement("script");
    script.async = true;
    script.src = "https://connect.facebook.net/en_US/fbevents.js";
    document.head.appendChild(script);
  }

  // No automatic reading of button clicks or page details: the Pixel only
  // receives the events this file sends.
  window.fbq("set", "autoConfig", false, PIXEL_ID);
  window.fbq("init", PIXEL_ID);
}

export function initAnalytics() {
  if ((!GA_ID && !PIXEL_ID) || typeof window === "undefined") return;

  // Visitors who must be asked first: do nothing at all (no outside script is
  // downloaded) until they have pressed Accept.
  if (visitorNeedsConsentChoice() && getStoredConsent() !== "granted") return;

  startAnalytics();
  startMetaPixel();
}

// Removes the measurement cookies when a visitor withdraws consent: Google
// Analytics' _ga and _ga_XXXX, and the Meta Pixel's _fbp and _fbc. Tries the
// host name and each parent domain, because they are set on the parent domain
// (for example .shopcalmcanvas.com).
function clearAnalyticsCookies() {
  try {
    const labels = window.location.hostname.split(".");
    const domains = [""];

    for (let i = 0; i < labels.length - 1; i += 1) {
      domains.push(`;domain=.${labels.slice(i).join(".")}`);
    }

    document.cookie.split(";").forEach((entry) => {
      const name = entry.split("=")[0].trim();

      if (
        name === "_ga" ||
        name.startsWith("_ga_") ||
        name === "_fbp" ||
        name === "_fbc"
      ) {
        domains.forEach((domain) => {
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/${domain}`;
        });
      }
    });
  } catch {
    // Nothing to clear, or cookies are blocked.
  }
}

// Called by the cookie notice. Remembers the choice on this device.
export function setAnalyticsConsent(granted) {
  try {
    window.localStorage.setItem(CONSENT_KEY, granted ? "granted" : "denied");
  } catch {
    // Storage blocked: the choice simply lasts until the page is closed.
  }

  if ((!GA_ID && !PIXEL_ID) || typeof window === "undefined") return;

  if (granted) {
    const gaWasRunning = started;
    const pixelWasRunning = pixelStarted;

    if (gaWasRunning) {
      gtag("consent", "update", { analytics_storage: "granted" });
    } else {
      // First time Google Analytics starts on this visit. It reads the
      // choice saved just above.
      startAnalytics();
    }

    if (pixelWasRunning) {
      sendPixel("consent", "grant");
    } else {
      startMetaPixel();
    }

    // Count the page the visitor is looking at for whichever service has
    // only just started.
    if (!gaWasRunning) {
      sendGooglePageView(window.location.pathname, document.title);
    }

    if (!pixelWasRunning) {
      sendPixel("track", "PageView");
    }

    return;
  }

  if (started) {
    gtag("consent", "update", { analytics_storage: "denied" });
  }

  if (pixelStarted) {
    sendPixel("consent", "revoke");
  }

  clearAnalyticsCookies();
}

function send(eventName, params) {
  if (!GA_ID || !started) return;
  try {
    gtag("event", eventName, params);
  } catch {
    // Analytics must never break the shop.
  }
}

// One call to the Meta Pixel, for example sendPixel("track", "AddToCart", {...}).
function sendPixel(...args) {
  if (!PIXEL_ID || !pixelStarted || typeof window.fbq !== "function") return;
  try {
    window.fbq(...args);
  } catch {
    // Analytics must never break the shop.
  }
}

function sendGooglePageView(path, title) {
  send("page_view", {
    page_path: path,
    page_title: title,
    page_location: window.location.href,
  });
}

export function trackPageView(path, title) {
  sendGooglePageView(path, title);
  sendPixel("track", "PageView");
}

function toItem(item) {
  return {
    item_id: String(item.id),
    item_name: item.name,
    item_category: item.category,
    item_variant: item.variant,
    price: Number(item.price) || 0,
    quantity: item.quantity || 1,
  };
}

// The same items in the shape Meta expects.
function pixelContents(items) {
  return {
    content_type: "product",
    content_ids: items.map((item) => String(item.id)),
    contents: items.map((item) => ({
      id: String(item.id),
      quantity: item.quantity || 1,
      item_price: Number(item.price) || 0,
    })),
    num_items: items.reduce((sum, item) => sum + (item.quantity || 1), 0),
  };
}

export function trackViewItem(item) {
  const value = Number(item.price) || 0;

  send("view_item", {
    currency: "USD",
    value,
    items: [toItem(item)],
  });

  sendPixel("track", "ViewContent", {
    ...pixelContents([item]),
    content_name: item.name,
    content_category: item.category,
    currency: "USD",
    value,
  });
}

export function trackAddToCart(item) {
  const value = (Number(item.price) || 0) * (item.quantity || 1);

  send("add_to_cart", {
    currency: "USD",
    value,
    items: [toItem(item)],
  });

  sendPixel("track", "AddToCart", {
    ...pixelContents([item]),
    content_name: item.name,
    content_category: item.category,
    currency: "USD",
    value,
  });
}

export function trackBeginCheckout(items, value) {
  const total = Number(value) || 0;

  send("begin_checkout", {
    currency: "USD",
    value: total,
    items: items.map(toItem),
  });

  sendPixel("track", "InitiateCheckout", {
    ...pixelContents(items),
    currency: "USD",
    value: total,
  });
}

export function trackPurchase({ transactionId, value, items }) {
  const list = items || [];
  const total = Number(value) || 0;

  send("purchase", {
    transaction_id: transactionId,
    currency: "USD",
    value: total,
    items: list.map(toItem),
  });

  // The order reference is passed as the event's id, so Meta counts a
  // purchase once even if it is ever reported a second time.
  sendPixel(
    "track",
    "Purchase",
    { ...pixelContents(list), currency: "USD", value: total },
    transactionId ? { eventID: String(transactionId) } : undefined
  );
}
