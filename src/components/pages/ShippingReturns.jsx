import "../../styles/legal.css";
import useSEO from "../../hooks/useSEO";

function ShippingReturns() {
  useSEO({
    title: "Shipping, Returns & Refunds",
    description:
      "Our shipping times, order cancellation window, and returns and refunds policy for ShopCalmCanvas orders.",
    path: "/shipping-returns",
  });

  return (
    <section className="legal-page">

      <div className="legal-hero">

        <span>LEGAL</span>

        <h1>Shipping, Returns &amp; Refunds</h1>

        <p>
          Everything you need to know about order processing, shipping,
          cancellations, and returns.
        </p>

      </div>

      <div className="legal-content">

        <h2>Order Processing &amp; Shipping</h2>

        <p>
          Every ShopCalmCanvas item is made specially for you when you order
          it — nothing is pre-made or kept in a warehouse. Because of this,
          please allow around 2–7 business days for your order to be printed
          and prepared before it ships. Delivery time on top of that varies by
          your location and the shipping method used, and is handled by our
          production and courier partners once your order leaves production.
        </p>

        <h2>Order Cancellations &amp; Changes</h2>

        <p>
          Because production begins shortly after an order is placed, we can
          only cancel or change an order (such as the size, color, or shipping
          address) if you contact us within a few hours of placing it, before
          it has entered production. Once an order has entered production, it
          can no longer be cancelled, changed, or refunded for reasons other
          than those described below. If you need to make a change, email us
          immediately at{" "}
          <a href="mailto:shopcalmcanvas@gmail.com">shopcalmcanvas@gmail.com</a>{" "}
          with your order number.
        </p>

        <h2>Returns &amp; Exchanges</h2>

        <p>
          Because every item is custom printed specifically for you, we're
          unable to accept returns or exchanges for reasons such as ordering
          the wrong size or simply changing your mind. Please check our
          size guide carefully on each product page before ordering.
        </p>

        <h2>Damaged, Defective, or Incorrect Items</h2>

        <p>
          If your order arrives damaged, defective, or isn't what you
          ordered, we will make it right — at no cost to you — with a free
          reprint or a full refund. To request this, simply email us at{" "}
          <a href="mailto:shopcalmcanvas@gmail.com">shopcalmcanvas@gmail.com</a>{" "}
          within 14 days of delivery, including your order number and a
          photo of the issue, and we'll take care of the rest.
        </p>

        <h2>Refunds</h2>

        <p>
          Once a refund is approved, it is issued back to your original
          payment method through Safepay, our payment processor, and is
          typically reflected within 5–10 business days, depending on your
          bank.
        </p>

      </div>

    </section>
  );
}

export default ShippingReturns;
