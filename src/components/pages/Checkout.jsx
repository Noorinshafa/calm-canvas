import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import "../../styles/checkout.css";

function Checkout() {

  const { cart, setCart } = useCart();

  const navigate = useNavigate();

  const [formData, setFormData] = useState({

    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    country: "Pakistan",
    city: "",
    postalCode: "",
    address: "",
    notes: "",
    payment: "Cash on Delivery",
    agree: false,

  });

  const [errors, setErrors] = useState({});

  const total = cart.reduce(

    (sum, item) =>

      sum +

      Number(item.price.replace(/[^\d]/g, "")) *

      item.quantity,

    0

  );

  function handleChange(e) {

    const { name, value, type, checked } = e.target;

    setFormData({

      ...formData,

      [name]: type === "checkbox" ? checked : value,

    });

  }

  function validateForm() {

    let newErrors = {};

    if (!formData.firstName.trim())
      newErrors.firstName = "First name is required.";

    if (!formData.lastName.trim())
      newErrors.lastName = "Last name is required.";

    if (!formData.phone.trim())
      newErrors.phone = "Phone number is required.";

    if (!formData.email.trim())
      newErrors.email = "Email is required.";

    if (!formData.city.trim())
      newErrors.city = "City is required.";

    if (!formData.address.trim())
      newErrors.address = "Complete address is required.";

    if (!formData.agree)
      newErrors.agree = "Please accept the Terms & Conditions.";

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;

  }

  function placeOrder() {

    if (!validateForm()) return;

    setCart([]);

    navigate("/order-success");

  }

  return (

    <section className="checkout-page">

      <div className="checkout-title">

        <span>✦ CHECKOUT</span>

        <h1>Complete Your Order</h1>

      </div>

      <div className="checkout-container">

        <div className="checkout-left">

          <h2>Shipping Information</h2>

          <div className="input-row">

            <div>

              <input
                name="firstName"
                placeholder="First Name"
                value={formData.firstName}
                onChange={handleChange}
              />

              <small>{errors.firstName}</small>

            </div>

            <div>

              <input
                name="lastName"
                placeholder="Last Name"
                value={formData.lastName}
                onChange={handleChange}
              />

              <small>{errors.lastName}</small>

            </div>

          </div>

          <input
            name="phone"
            placeholder="Phone Number"
            value={formData.phone}
            onChange={handleChange}
          />

          <small>{errors.phone}</small>

          <input
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
          />

          <small>{errors.email}</small>

          <div className="input-row">

            <input
              name="country"
              value={formData.country}
              onChange={handleChange}
            />

            <input
              name="city"
              placeholder="City"
              value={formData.city}
              onChange={handleChange}
            />

          </div>

          <small>{errors.city}</small>

          <input
            name="postalCode"
            placeholder="Postal Code (Optional)"
            value={formData.postalCode}
            onChange={handleChange}
          />

          <textarea
            rows="5"
            name="address"
            placeholder="Complete Address"
            value={formData.address}
            onChange={handleChange}
          />

          <small>{errors.address}</small>

          <textarea
            rows="3"
            name="notes"
            placeholder="Order Notes (Optional)"
            value={formData.notes}
            onChange={handleChange}
          />

          <h2>Payment Method</h2>

          <div className="payment-card active">

            💵 Cash on Delivery

            <span>Available</span>

          </div>

          <div className="payment-card disabled">

            💳 Credit / Debit Card

            <span>Coming Soon</span>

          </div>

          <div className="payment-card disabled">

            📱 Apple Pay / Google Pay

            <span>Coming Soon</span>

          </div>

          <label className="agree-box">

            <input
              type="checkbox"
              name="agree"
              checked={formData.agree}
              onChange={handleChange}
            />

            I agree to the Terms & Conditions

          </label>

          <small>{errors.agree}</small>

          <button

            className="place-order-btn"

            onClick={placeOrder}

          >

            Place Order

          </button>

        </div>

        <div className="checkout-right">

          <h2>Order Summary</h2>

          {cart.map(item => (

            <div

              className="summary-item"

              key={item.id}

            >

              <img

                src={item.image}

                alt={item.title}

              />

              <div>

                <h4>{item.title}</h4>

                <p>{item.price}</p>

                <p>Qty: {item.quantity}</p>

              </div>

            </div>

          ))}

          <hr />

         <h3>

  <span>Total</span>

  <span>Rs. {total.toLocaleString()}</span>

</h3>

        </div>

      </div>

    </section>

  );

}

export default Checkout;