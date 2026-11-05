// Google Analytics 4 (GA4) with e-commerce events -- completely OFF until you
// set VITE_GA_MEASUREMENT_ID (looks like "G-XXXXXXXXXX") in Vercel's
// Environment Variables and redeploy. With no ID set, every function here
// does nothing, no Google script is downloaded and no data is collected.
//
// Privacy:
// - Visitors whose device is set to a European time zone (this includes the
//   UK, Switzerland and the EU) see a small accept/decline notice
//   (src/components/common/CookieBanner.jsx). For them Google's script is NOT
//   even downloaded, and no analytics cookie is set, unless they press
//   Accept. Their choice is remembered on their own device and can be changed
//   at any time with "Cookie settings" in the footer.
// - Everyone else is measured as before (analytics only; advertising storage
//   is always denied) and sees no notice.
// - As a safety net, Google's Consent Mode also starts as "denied" for
//   visitors Google locates in the EU/EEA, UK or Switzerland, so a European
//   visitor with a non-European time zone setting is never tracked by
//   default either.

const GA_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;

const CONSENT_DENIED_REGIONS = [
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR",
  "HU", "IE", "IT", "LV", "LT", "LU", "MT", "NL", "PL", "PT", "RO", "SK",
  "SI", "ES", "SE", "IS", "LI", "NO", "GB", "CH",
];

const CONSENT_KEY = "scc-analytics-consent";

// Asks the banner to open again (used by the footer's "Cookie settings").
export const OPEN_CONSENT_EVENT = "scc:open-cookie-settings";

let started = false;

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

// True when this visitor should be asked before any analytics runs. The
// device's time zone is used because it is available instantly, with no extra
// request: Europe/* covers the UK, Switzerland and the EU; Atlantic/* covers
// the Azores, Madeira and the Canary Islands; Arctic/* covers Svalbard. A few
// non-EU time zones match too (for example Turkey); they just see the notice.
export function visitorNeedsConsentChoice() {
  if (!GA_ID || typeof window === "undefined") return false;

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

export function initAnalytics() {
  if (!GA_ID || typeof window === "undefined") return;

  // Visitors who must be asked first: do nothing at all (Google's script is
  // not downloaded) until they have pressed Accept.
  if (visitorNeedsConsentChoice() && getStoredConsent() !== "granted") return;

  startAnalytics();
}

// Removes Google Analytics' own cookies (_ga and _ga_XXXX) when a visitor
// withdraws consent. Tries the host name and each parent domain, because
// Google sets them on the parent domain (for example .shopcalmcanvas.com).
function clearAnalyticsCookies() {
  try {
    const labels = window.location.hostname.split(".");
    const domains = [""];

    for (let i = 0; i < labels.length - 1; i += 1) {
      domains.push(`;domain=.${labels.slice(i).join(".")}`);
    }

    document.cookie.split(";").forEach((entry) => {
      const name = entry.split("=")[0].trim();

      if (name === "_ga" || name.startsWith("_ga_")) {
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

  if (!GA_ID || typeof window === "undefined") return;

  if (granted) {
    if (started) {
      gtag("consent", "update", { analytics_storage: "granted" });
    } else {
      // First time analytics starts on this visit. It reads the choice saved
      // just above, then the page the visitor is looking at is counted.
      startAnalytics();
      trackPageView(window.location.pathname, document.title);
    }

    return;
  }

  if (started) {
    gtag("consent", "update", { analytics_storage: "denied" });
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

export function trackPageView(path, title) {
  send("page_view", {
    page_path: path,
    page_title: title,
    page_location: window.location.href,
  });
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

export function trackViewItem(item) {
  send("view_item", {
    currency: "USD",
    value: Number(item.price) || 0,
    items: [toItem(item)],
  });
}

export function trackAddToCart(item) {
  send("add_to_cart", {
    currency: "USD",
    value: (Number(item.price) || 0) * (item.quantity || 1),
    items: [toItem(item)],
  });
}

export function trackBeginCheckout(items, value) {
  send("begin_checkout", {
    currency: "USD",
    value: Number(value) || 0,
    items: items.map(toItem),
  });
}

export function trackPurchase({ transactionId, value, items }) {
  send("purchase", {
    transaction_id: transactionId,
    currency: "USD",
    value: Number(value) || 0,
    items: (items || []).map(toItem),
  });
}
