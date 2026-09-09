import { createSafepayClient, extractValue } from "./_lib/safepay-node-core.js";
import { createPrintifyOrder } from "./_lib/create-printify-order.js";

export default async function handler(req, res) {
  const tracker = req.query.tracker;

  if (!tracker) {
    return res.status(400).json({ error: "Missing tracker." });
  }

  const safepay = createSafepayClient();

  if (!safepay) {
    return res
      .status(503)
      .json({ error: "Card payments aren't connected yet." });
  }

  try {
    // Never trust the redirect alone -- ask Safepay directly whether this
    // specific payment actually succeeded before we create anything. This
    // replaces the old SDK's signature check, which doesn't exist in this
    // newer SDK; asking Safepay for the tracker's real status directly is
    // just as safe (a customer can't fake this response).
    let statusResponse;
    try {
      statusResponse = await safepay.reporter.payments.fetch(tracker);
    } catch (error) {
      console.error(
        "confirm-order: reporter.payments.fetch failed:",
        error.message,
        error.status ? `(status ${error.status})` : ""
      );
      return res.status(402).json({ error: "Payment could not be verified." });
    }

    const state = extractValue(statusResponse, [
      "data.state",
      "state",
      "data.tracker.state",
    ]);

    if (state !== "TRACKER_ENDED") {
      console.error(
        "confirm-order: payment not completed for tracker",
        tracker,
        "-- state:",
        state,
        "raw:",
        JSON.stringify(statusResponse)
      );
      return res.status(402).json({ error: "Payment could not be verified." });
    }

    // Order details live in the cookie set by create-checkout-session.js --
    // not in the web address -- so a customer can't tamper with the price or
    // items by editing the address bar.
    const cookieHeader = req.headers.cookie || "";
    const cookieMatch = cookieHeader
      .split(";")
      .map((part) => part.trim())
      .find((part) => part.startsWith("cc_order="));

    if (!cookieMatch) {
      return res.status(400).json({
        error:
          "We couldn't find your order details. Please try checking out again.",
      });
    }

    let savedOrder;
    try {
      savedOrder = JSON.parse(
        Buffer.from(
          cookieMatch.slice("cc_order=".length),
          "base64url"
        ).toString("utf8")
      );
    } catch {
      return res.status(400).json({ error: "Could not read order details." });
    }

    // Make sure this cookie actually belongs to THIS payment, not a leftover
    // from a different checkout attempt in the same browser.
    if (savedOrder.tracker !== tracker) {
      return res.status(400).json({
        error:
          "Your order details don't match this payment. Please try checking out again.",
      });
    }

    // We've read what we need from the cookie -- clear it so it isn't reused
    // if this page is somehow visited again later.
    res.setHeader(
      "Set-Cookie",
      "cc_order=; Max-Age=0; Path=/; HttpOnly; Secure; SameSite=Lax"
    );

    const { cart, shipping } = savedOrder;

    const orderCart = (cart || []).map((item) => ({
      id: item.id,
      selectedVariant: { id: item.variantId },
      quantity: item.qty,
    }));

    try {
      const order = await createPrintifyOrder({
        cart: orderCart,
        shipping,
        externalId: `calmcanvas-card-${tracker}`,
      });

      return res.status(200).json({ success: true, order });
    } catch (orderError) {
      // If this success page is loaded twice for the same payment (e.g. a
      // refresh), Printify will reject the second attempt because we reuse
      // the same external_id -- treat that as already-handled, not a
      // failure, so the customer doesn't see an error for something that
      // already worked.
      const message = (orderError.message || "").toLowerCase();
      const details = JSON.stringify(orderError.details || "").toLowerCase();

      if (
        (message.includes("external_id") &&
          (message.includes("already") ||
            message.includes("exist") ||
            message.includes("duplicate"))) ||
        (details.includes("external_id") &&
          (details.includes("already") ||
            details.includes("exist") ||
            details.includes("duplicate")))
      ) {
        return res.status(200).json({ success: true, alreadyProcessed: true });
      }

      throw orderError;
    }
  } catch (error) {
    return res.status(error.status || 500).json({
      error: error.message,
      details: error.details,
    });
  }
}
