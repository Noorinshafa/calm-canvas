import { Link } from "react-router-dom";
import "../../styles/ordersuccess.css";

function OrderSuccess() {

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