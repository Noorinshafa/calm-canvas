// Sends a push notification to the owner's phone through ntfy
// (https://ntfy.sh, free app for Android and iPhone).
//
// The phone app subscribes to a private topic. On ntfy.sh anyone who knows a
// topic name can read it, so the topic works like a password: it is a long
// random value kept only in the NTFY_TOPIC environment variable in Vercel,
// never in the code. For the same reason, alerts never include customer
// names, emails, phone numbers or addresses.
//
// This function never throws and gives up after 4 seconds. An alert that
// fails to send can never break an order, a payment or a page.

const NTFY_SERVER = "https://ntfy.sh";

// ntfy allows letters, numbers, "_" and "-", up to 64 characters. The lower
// limit of 20 refuses short, guessable topic names.
const TOPIC_PATTERN = /^[-_A-Za-z0-9]{20,64}$/;

// HTTP header values must be plain ASCII.
function headerSafe(value) {
  return String(value ?? "")
    .replace(/[^\x20-\x7E]/g, "")
    .slice(0, 200);
}

export async function sendAlert({ title, message, priority = 3, tags = [], click } = {}) {
  const topic = process.env.NTFY_TOPIC;

  if (!topic || !TOPIC_PATTERN.test(topic)) {
    console.warn("notify: NTFY_TOPIC is missing or invalid, alert not sent");
    return false;
  }

  const headers = {
    Title: headerSafe(title) || "ShopCalmCanvas",
    // 1 = min, 3 = default, 4 = high, 5 = urgent (ntfy priority levels)
    Priority: String(Math.min(5, Math.max(1, Math.round(Number(priority) || 3)))),
    "Content-Type": "text/plain; charset=utf-8",
  };
  const tagList = tags.map(headerSafe).filter(Boolean);
  if (tagList.length > 0) headers.Tags = tagList.join(",");
  if (click) headers.Click = headerSafe(click);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 4000);

  try {
    const response = await fetch(`${NTFY_SERVER}/${topic}`, {
      method: "POST",
      headers,
      // ntfy turns messages over 4096 bytes into attachments; stay well below.
      body: String(message ?? "").slice(0, 3000),
      signal: controller.signal,
    });

    if (!response.ok) {
      console.error("notify: ntfy answered with status", response.status);
      return false;
    }
    return true;
  } catch (error) {
    console.error(
      "notify: alert could not be sent:",
      error?.name === "AbortError" ? "timed out" : error?.message
    );
    return false;
  } finally {
    clearTimeout(timer);
  }
}
