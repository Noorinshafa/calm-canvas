import Stripe from "stripe";
import { createPrintifyOrder } from "./_lib/create-printify-order.js";

export default async function handler(req, res) {
  const sessionId = req.query.session_id;

  if (!sessionId) {
    return res.status(400).json({ error: "Missing session_id." });
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return res
      .status(503)
      .json({ error: "Card payments aren't connected yet." });
  }

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      return res.status(402).json({ error: "Payment was not completed." });
    }

    // Avoid creating a duplicate Printify order if this success page
    // is loaded/refreshed more than once for the same payment.
    if (session.metadata?.printifyOrderCreated === "true") {
      return res.status(200).json({ success: true, alreadyProcessed: true });
    }

    const cart = JSON.parse(session.metadata.cart || "[]");

    const shipping = {
      firstName: session.metadata.firstName,
      lastName: session.metadata.lastName,
      phone: session.metadata.phone,
      email: session.metadata.email,
      country: session.metadata.country,
      city: session.metadata.city,
      postalCode: session.metadata.postalCode,
      address: session.metadata.address,
      notes: session.metadata.notes,
    };

    const orderCart = cart.map((item) => ({
      id: item.id,
      selectedVariant: { id: item.variantId },
      quantity: item.qty,
    }));

    const order = await createPrintifyOrder({
      cart: orderCart,
      shipping,
      externalId: `calmcanvas-card-${sessionId}`,
    });

    try {
      await stripe.checkout.sessions.update(sessionId, {
        metadata: { ...session.metadata, printifyOrderCreated: "true" },
      });
    } catch {
      // Non-fatal: the order itself was created successfully even if
      // this bookkeeping update fails.
    }

    return res.status(200).json({ success: true, order });
  } catch (error) {
    return res.status(error.status || 500).json({
      error: error.message,
      details: error.details,
    });
  }
}
