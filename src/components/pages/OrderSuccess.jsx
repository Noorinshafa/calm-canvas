import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import useSEO from "../../hooks/useSEO";
import { trackPurchase } from "../../utils/analytics";
import "../../styles/ordersuccess.css";

function OrderSuccess() {
  useSEO({ title: "Order Confirmed", path: "/order-success", noindex: true });

  const { cart, setCart } = useCart();

  // Keeps the latest cart so the purchase can be reported to analytics at
  // the moment the payment is confirmed, just before the cart is cleared.
  const cartRef = useRef(cart);
  cartRef.current = cart;
  const [searchParams] = useSearchParams();
  // Safepay redirects back here with its own "order_id" -- which we set
  // equal to our tracker when the payment page was created -- rather than
  // any query string of our own (see create-checkout-session.js for why).
  const tracker = searchParams.get("order_id") || searchParams.get("tracker");

  const [status, setStatus] = useState(tracker ? "confirming" : "done");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!tracker) return;

    let cancelled = false;

    async function confirm() {
      try {
        const response = await fetch(
          `/api/confirm-order?tracker=${encodeURIComponent(tracker)}`
        );
        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result.error || "We couldn't confirm your payment."
          );
        }

        if (!cancelled) {
          const items = cartRef.current;

          // Only report when there is something to report (a refreshed
          // success page has an empty cart, and must not add a $0 sale).
          if (items.length > 0) {
            trackPurchase({
              transactionId: tracker,
              value: items.reduce(
                (sum, item) => sum + (item.priceValue || 0) * item.quantity,
                0
              ),
              items: items.map((item) => ({
                id: item.id,
                name: item.title,
                price: item.priceValue,
                quantity: item.quantity,
                variant: item.selectedVariant?.title,
              })),
            });
          }

          setCart([]);
          setStatus("done");
        }
      } catch (error) {
        if (!cancelled) {
          setStatus("error");
          setErrorMsg(error.message);
        }
      }
    }

    confirm();

    return () => {
      cancelled = true;
    };
  }, [tracker, setCart]);

  if (status === "confirming") {
    return (
      <section className="order-success">
        <div className="success-card">
          <h1>Confirming your payment...</h1>
          <p>Please wait a moment, this only takes a second.</p>
        </div>
      </section>
    );
  }

  if (status === "error") {
    return (
      <section className="order-success">
        <div className="success-card">
          <h1>Something went wrong</h1>
          <p>{errorMsg}</p>
          <p>
            If money was taken from your account, don't worry — please
            contact us with your email so we can confirm your order
            manually.
          </p>
          <Link to="/contact" className="continue-btn">
            Contact Us
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="order-success">

      <div className="success-card">

        <div className="success-icon">

          ✓

        </div>

        <h1>Thank You!</h1>

        <p>

          Your order has been placed successfully.

        </p>

        <p>

          We'll contact you shortly to confirm your order.

        </p>

        <Link

          to="/"

          className="continue-btn"

        >

          Continue Shopping

        </Link>

      </div>

    </section>

  );

}

export default OrderSuccess;
