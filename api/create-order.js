// DISABLED on purpose.
//
// This endpoint used to create a Printify order WITHOUT taking any payment
// (a cash-on-delivery idea that was never connected to the website). Nothing
// calls it, and left switched on it would let anyone place unpaid orders --
// and, now that shipping is charged at checkout, skip the shipping charge
// too. Orders are only created after a verified Safepay payment, in
// confirm-order.js and safepay-webhook.js.
//
// If cash on delivery is ever wanted, build it properly (including the
// shipping price from api/_lib/shipping.js) instead of re-enabling this file.
export default function handler(req, res) {
  return res.status(410).json({ error: "This endpoint is no longer available." });
}
