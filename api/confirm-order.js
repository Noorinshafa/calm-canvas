import { Safepay } from "@sfpy/node-sdk";
import { createPrintifyOrder } from "./_lib/create-printify-order.js";

export default async function handler(req, res) {
  const tracker = req.query.tracker;

  if (!tracker) {
    return res.status(400).json({ error: "Missing tracker." });
  }

  if (!process.env.SAFEPAY_SECRET_KEY) {
    return res
      .status(503)
      .json({ error: "Card payments aren't connected yet." });
  }

  try {
    const environment =
      process.env.SAFEPAY_ENV === "production" ? "production" : "sandbox";

    const safepay = new Safepay({
      environment,
      apiKey: process.env.SAFEPAY_SECRET_KEY,
      v1Secret: process.env.SAFEPAY_V1_SECRET || "",
      webhookSecret: process.env.SAFEPAY_WEBHOOK_SECRET || "",
    });

    // Never trust the redirect alone -- confirm with Safepay directly that
    // this specific payment really succeeded before we create anything.
    // Safepay's post-payment redirect is a GET request with `sig`/`tracker`
    // in the query string, but the SDK's verify.signature() reads from
    // request.body -- so we read from query (falling back to body) and
    // hand the SDK a normalized { body: { sig, tracker } } shape.
    const sig = req.query.sig || req.body?.sig;
    const signedTracker = req.query.tracker || req.body?.tracker;

    if (!sig) {
      console.error(
        "confirm-order: no `sig` on the redirect -- cannot verify authenticity."
      );
      return res.status(402).json({ error: "Payment could not be verified." });
    }

    const isValid = safepay.verify.signature({
      body: { sig, tracker: signedTracker },
    });

    if (!isValid) {
      return res.status(402).json({ error: "Payment could not be verified." });
    }

    // Order details now live in the cookie set by create-checkout-session.js
    // -- not in the web address -- so a customer can't tamper with the
    // price or items by editing the address bar.
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

    // Make sure this cookie actually belongs to THIS payment, not a
    // leftover from a different checkout attempt in the same browser.
    if (savedOrder.token !== tracker) {
      return res.status(400).json({
        error:
          "Your order details don't match this payment. Please try checking out again.",
      });
    }

    // We've read what we need from the cookie -- clear it so it isn't
    // reused if this page is somehow visited again later.
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
        message.includes("external_id") &&
        (message.includes("already") ||
          message.includes("exist") ||
          message.includes("duplicate")) ||
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
