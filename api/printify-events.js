import crypto from "crypto";
import { sendAlert } from "./_lib/notify.js";
import { printifyHeaders, PRINTIFY_SHOP_ID } from "./_lib/printify-shared.js";

// Order alerts for the owner's phone.
//
// POST: Printify calls this address whenever one of the shop's orders
// changes (new order, sent to production, shipped, delivered, problem). We
// look the order up again through Printify's API and send a short push
// notification through ntfy (see _lib/notify.js).
//
// GET ?key=...&action=status|setup|test: the owner opens this in a browser
// once, to connect the alerts to Printify (setup), check them (status) or
// send a test alert (test).
//
// SECURITY
// - Every request must carry the secret PRINTIFY_WEBHOOK_KEY (set in Vercel)
//   as ?key=. Requests without it are refused.
// - We never trust the event content: the order is fetched from Printify
//   with our own token, so a forged request can only trigger an alert about
//   a real order of this shop.
// - Alerts contain no customer names, emails, phones or addresses.
// - This file is not part of checkout or payment. If it fails, orders and
//   payments carry on exactly as before.

const PRINTIFY_API = "https://api.printify.com/v1";
const PRINTIFY_APP = "https://printify.com/app/";
const SITE = "https://www.shopcalmcanvas.com";
const ORDER_ID = /^[a-f0-9]{24}$/i;

// The order events this file handles (names from Printify's API reference).
const TOPICS = [
  "order:created",
  "order:updated",
  "order:sent-to-production",
  "order:shipment:created",
  "order:shipment:delivered",
  "order:line-item:canceled",
];

// order:updated statuses that are already covered by their own event, or
// are normal steps that need no alert.
const QUIET_STATUSES = new Set([
  "pending",
  "on-hold",
  "cost-calculation",
  "sending-to-production",
  "in-production",
  "fulfilled",
]);

function keyIsValid(given) {
  const expected = process.env.PRINTIFY_WEBHOOK_KEY;
  if (!expected || expected.length < 32 || typeof given !== "string") return false;
  // Compare hashes so both sides have the same length (timingSafeEqual needs it).
  const a = crypto.createHash("sha256").update(given).digest();
  const b = crypto.createHash("sha256").update(expected).digest();
  return crypto.timingSafeEqual(a, b);
}

function eventUrl() {
  return `${SITE}/api/printify-events?key=${encodeURIComponent(
    process.env.PRINTIFY_WEBHOOK_KEY
  )}`;
}

async function printifyFetch(path, options = {}) {
  const response = await fetch(`${PRINTIFY_API}${path}`, {
    ...options,
    headers: {
      ...printifyHeaders(),
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  const text = await response.text();
  let body = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }
  return { ok: response.ok, status: response.status, body };
}

async function fetchOrder(orderId) {
  if (!ORDER_ID.test(orderId || "")) return null;
  try {
    const result = await printifyFetch(
      `/shops/${PRINTIFY_SHOP_ID}/orders/${orderId}.json`
    );
    return result.ok && result.body && typeof result.body === "object"
      ? result.body
      : null;
  } catch (error) {
    console.error("printify-events: order lookup failed:", error.message);
    return null;
  }
}

function itemLines(order) {
  const items = Array.isArray(order?.line_items) ? order.line_items : [];
  if (items.length === 0) return "Items: see Printify";
  return items
    .map((item) => {
      const title = item?.metadata?.title || "Item";
      const option = item?.metadata?.variant_label
        ? ` (${item.metadata.variant_label})`
        : "";
      return `${item?.quantity || 1} x ${title}${option}`;
    })
    .join("\n");
}

function shipTo(order) {
  const country = order?.address_to?.country;
  return country ? `Ship to: ${country}` : "";
}

function orderRef(orderId) {
  return `Printify order: ${String(orderId || "unknown").slice(-8)}`;
}

function buildAlert(type, order, orderId, data) {
  const ref = orderRef(orderId);

  switch (type) {
    case "order:created":
      return {
        title: "New order received",
        priority: 5,
        tags: ["tada", "moneybag"],
        message: [
          itemLines(order),
          shipTo(order),
          "",
          "Printify will charge your card for production + shipping when the order goes to production (about 24 hours). Make sure your card has enough balance.",
          ref,
        ]
          .filter((line) => line !== null)
          .join("\n"),
      };

    case "order:sent-to-production":
      return {
        title: "Order sent to production",
        priority: 3,
        tags: ["package"],
        message: [
          itemLines(order),
          "Printify has charged your card and started making this order. The exact amount is in the Printify app or Wallet.",
          ref,
        ].join("\n"),
      };

    case "order:shipment:created": {
      const shipments = Array.isArray(order?.shipments) ? order.shipments : [];
      const last = shipments[shipments.length - 1];
      const tracking = last
        ? `Carrier: ${last.carrier || "-"}\nTracking: ${last.number || "-"}${
            last.url ? `\n${last.url}` : ""
          }`
        : "Tracking: see Printify";
      return {
        title: "Order shipped",
        priority: 3,
        tags: ["truck"],
        message: [itemLines(order), tracking, ref].join("\n"),
      };
    }

    case "order:shipment:delivered":
      return {
        title: "Order delivered",
        priority: 2,
        tags: ["white_check_mark"],
        message: [itemLines(order), ref].join("\n"),
      };

    case "order:line-item:canceled": {
      const reason = data?.status_details ? `Reason: ${data.status_details}` : "";
      return {
        title: "ACTION NEEDED: item canceled",
        priority: 5,
        tags: ["rotating_light"],
        message: [
          "Printify canceled an item in this order. The customer has already paid. Open Printify to fix it, or refund the customer.",
          reason,
          itemLines(order),
          ref,
        ]
          .filter(Boolean)
          .join("\n"),
      };
    }

    case "order:updated": {
      const status = String(data?.status || order?.status || "").toLowerCase();
      if (!status || QUIET_STATUSES.has(status)) return null;
      const problem = /payment|issue|cancel/.test(status);
      return {
        title: problem ? `ACTION NEEDED: order ${status}` : `Order status: ${status}`,
        priority: problem ? 5 : 3,
        tags: problem ? ["warning"] : ["information_source"],
        message: [
          problem
            ? "Open Printify now. If it is a payment problem, add money to your card or Printify Balance, then press Retry payment on the order."
            : "",
          itemLines(order),
          ref,
        ]
          .filter(Boolean)
          .join("\n"),
      };
    }

    default:
      return null;
  }
}

async function handleEvent(req, res) {
  const event = req.body && typeof req.body === "object" ? req.body : {};
  const type = String(event.type || "");
  const orderId = event?.resource?.id;
  const data = event?.resource?.data || {};

  if (!TOPICS.includes(type)) {
    return res.status(200).json({ received: true, ignored: "topic" });
  }

  // Ignore events that name a different shop.
  if (data.shop_id !== undefined && String(data.shop_id) !== String(PRINTIFY_SHOP_ID)) {
    return res.status(200).json({ received: true, ignored: "shop" });
  }

  const order = await fetchOrder(orderId);
  const alert = buildAlert(type, order, orderId, data);

  if (alert) {
    await sendAlert({ ...alert, click: PRINTIFY_APP });
  }

  // Always answer 200: Printify stops sending events to an address that
  // keeps failing, and a lost alert must never block later ones.
  return res.status(200).json({ received: true });
}

async function handleAdmin(req, res) {
  const action = String(req.query.action || "status");
  const url = eventUrl();

  const list = await printifyFetch(`/shops/${PRINTIFY_SHOP_ID}/webhooks.json`);
  if (!list.ok) {
    return res.status(502).json({
      ok: false,
      step: "list webhooks",
      printifyStatus: list.status,
      hint:
        list.status === 401 || list.status === 403
          ? "The Printify API token in Vercel does not have webhook permission. Create a token with webhook access (or all scopes) in Printify and update PRINTIFY_API_TOKEN in Vercel."
          : "Printify did not answer as expected. Try again in a minute.",
    });
  }

  const existing = Array.isArray(list.body) ? list.body : list.body?.data || [];
  const ours = existing.filter((hook) => hook?.url === url);
  const connected = TOPICS.filter((topic) => ours.some((hook) => hook.topic === topic));
  const missing = TOPICS.filter((topic) => !connected.includes(topic));

  if (action === "status") {
    return res.status(200).json({
      ok: missing.length === 0,
      connected,
      missing,
      alertsConfigured: Boolean(process.env.NTFY_TOPIC),
    });
  }

  if (action === "setup") {
    const created = [];
    const failed = [];
    for (const topic of missing) {
      const result = await printifyFetch(`/shops/${PRINTIFY_SHOP_ID}/webhooks.json`, {
        method: "POST",
        body: JSON.stringify({ topic, url }),
      });
      if (result.ok) created.push(topic);
      else failed.push({ topic, printifyStatus: result.status });
    }
    return res.status(failed.length ? 502 : 200).json({
      ok: failed.length === 0,
      alreadyConnected: connected,
      created,
      failed,
    });
  }

  if (action === "test") {
    const sent = await sendAlert({
      title: "Test alert",
      message:
        "ShopCalmCanvas order alerts are working. You will get a message like this the moment a customer orders.",
      priority: 4,
      tags: ["white_check_mark"],
      click: PRINTIFY_APP,
    });
    return res.status(sent ? 200 : 502).json({
      ok: sent,
      hint: sent ? "Check your phone." : "Check NTFY_TOPIC in Vercel and the topic in the ntfy app.",
    });
  }

  return res.status(400).json({ ok: false, error: "Unknown action." });
}

export default async function handler(req, res) {
  if (!keyIsValid(req.query.key)) {
    return res.status(401).json({ error: "Not allowed." });
  }

  try {
    if (req.method === "POST") return await handleEvent(req, res);
    if (req.method === "GET") return await handleAdmin(req, res);
    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("printify-events: unexpected error:", error.message);
    // For Printify events answer 200 so it keeps sending future events.
    return res.status(req.method === "POST" ? 200 : 500).json({ received: req.method === "POST" });
  }
}
