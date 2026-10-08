// Google Analytics 4 (GA4) with e-commerce events -- completely OFF until you
// set VITE_GA_MEASUREMENT_ID (looks like "G-XXXXXXXXXX") in Vercel's
// Environment Variables and redeploy. With no ID set, every function here
// does nothing, no Google script is downloaded and no data is collected.
//
// Privacy: in the EU/EEA, UK and Switzerland, Google Consent Mode starts as
// "denied" (no analytics cookies, no ad storage) because the site has no
// cookie banner yet. Everywhere else it starts as "granted" for analytics
// only; advertising storage is always denied. If you later add a cookie
// banner, call setAnalyticsConsent(true) when a visitor accepts.

const GA_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;

const CONSENT_DENIED_REGIONS = [
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR",
  "HU", "IE", "IT", "LV", "LT", "LU", "MT", "NL", "PL", "PT", "RO", "SK",
  "SI", "ES", "SE", "IS", "LI", "NO", "GB", "CH",
];

let started = false;

function gtag() {
  window.dataLayer.push(arguments);
}

export function initAnalytics() {
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

export function setAnalyticsConsent(granted) {
  if (!GA_ID || !started) return;
  gtag("consent", "update", {
    analytics_storage: granted ? "granted" : "denied",
  });
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
