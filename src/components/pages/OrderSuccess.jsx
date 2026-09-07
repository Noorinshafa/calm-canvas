import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import useTitle from "../../hooks/useTitle";
import "../../styles/ordersuccess.css";

function OrderSuccess() {
  useTitle("Order Confirmed");

  const { setCart } = useCart();
  const [searchParams] = useSearchParams();
  const tracker = searchParams.get("tracker");

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
