import { Safepay } from "@sfpy/node-sdk";
import { createPrintifyOrder } from "./_lib/create-printify-order.js";

export default async function handler(req, res) {
  const tracker = req.query.tracker;
  const encodedState = req.query.state;

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
    const isValid = safepay.verify.signature(req);

    if (!isValid) {
      return res.status(402).json({ error: "Payment could not be verified." });
    }

    if (!encodedState) {
      return res.status(400).json({ error: "Missing order details." });
    }

    let orderState;
    try {
      orderState = JSON.parse(
        Buffer.from(encodedState, "base64url").toString("utf8")
      );
    } catch {
      return res.status(400).json({ error: "Could not read order details." });
    }

    const { cart, shipping } = orderState;

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
