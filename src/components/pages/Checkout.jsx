import { useState } from "react";
import { useCart } from "../../context/CartContext";
import useSEO from "../../hooks/useSEO";
import "../../styles/checkout.css";

function Checkout() {
  useSEO({ title: "Checkout", path: "/checkout", noindex: true });

  const { cart } = useCart();

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
    agree: false,
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [orderError, setOrderError] = useState("");

  const total = cart.reduce(
    (sum, item) => sum + (item.priceValue || 0) * item.quantity,
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

    if (!formData.email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = "Enter a valid email address.";
    }

    if (!formData.city.trim())
      newErrors.city = "City is required.";

    if (!formData.address.trim())
      newErrors.address = "Complete address is required.";

    if (!formData.agree)
      newErrors.agree = "Please accept the Terms & Conditions.";

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  }

  async function placeOrder(e) {
    e.preventDefault();

    if (!validateForm()) return;

    setOrderError("");
    setSubmitting(true);

    try {
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cart, shipping: formData }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || "Could not start the payment. Please try again."
        );
      }

      // Send the customer to Safepay's secure hosted payment page.
      // The cart is cleared only after payment is confirmed
      // (see OrderSuccess.jsx), so nothing is lost if they cancel.
      window.location.href = result.url;
    } catch (error) {
      setOrderError(error.message);
      setSubmitting(false);
    }
  }

  return (
    <section className="checkout-page">
      <div className="checkout-title">
        <span>✦ CHECKOUT</span>
        <h1>Complete Your Order</h1>
      </div>

      <div className="checkout-container">
        <form className="checkout-left" onSubmit={placeOrder} noValidate>
          <h2>Shipping Information</h2>

          <div className="input-row">
            <div>
              <label htmlFor="firstName" className="sr-only">
                First Name
              </label>
              <input
                id="firstName"
                name="firstName"
                placeholder="First Name"
                value={formData.firstName}
                onChange={handleChange}
                autoComplete="given-name"
                required
                aria-invalid={!!errors.firstName}
                aria-describedby="firstName-error"
              />
              <small id="firstName-error">{errors.firstName}</small>
            </div>

            <div>
              <label htmlFor="lastName" className="sr-only">
                Last Name
              </label>
              <input
                id="lastName"
                name="lastName"
                placeholder="Last Name"
                value={formData.lastName}
                onChange={handleChange}
                autoComplete="family-name"
                required
                aria-invalid={!!errors.lastName}
                aria-describedby="lastName-error"
              />
              <small id="lastName-error">{errors.lastName}</small>
            </div>
          </div>

          <label htmlFor="phone" className="sr-only">
            Phone Number
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            placeholder="Phone Number"
            value={formData.phone}
            onChange={handleChange}
            autoComplete="tel"
            required
            aria-invalid={!!errors.phone}
            aria-describedby="phone-error"
          />
          <small id="phone-error">{errors.phone}</small>

          <label htmlFor="email" className="sr-only">
            Email Address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            autoComplete="email"
            required
            aria-invalid={!!errors.email}
            aria-describedby="email-error"
          />
          <small id="email-error">{errors.email}</small>

          <div className="input-row">
            <div>
              <label htmlFor="country" className="sr-only">
                Country
              </label>
              <input
                id="country"
                name="country"
                value={formData.country}
                onChange={handleChange}
                autoComplete="country-name"
              />
            </div>

            <div>
              <label htmlFor="city" className="sr-only">
                City
              </label>
              <input
                id="city"
                name="city"
                placeholder="City"
                value={formData.city}
                onChange={handleChange}
                autoComplete="address-level2"
                required
                aria-invalid={!!errors.city}
                aria-describedby="city-error"
              />
            </div>
          </div>
          <small id="city-error">{errors.city}</small>

          <label htmlFor="postalCode" className="sr-only">
            Postal Code (optional)
          </label>
          <input
            id="postalCode"
            name="postalCode"
            placeholder="Postal Code (Optional)"
            value={formData.postalCode}
            onChange={handleChange}
            autoComplete="postal-code"
          />

          <label htmlFor="address" className="sr-only">
            Complete Address
          </label>
          <textarea
            id="address"
            rows="5"
            name="address"
            placeholder="Complete Address"
            value={formData.address}
            onChange={handleChange}
            autoComplete="street-address"
            required
            aria-invalid={!!errors.address}
            aria-describedby="address-error"
          />
          <small id="address-error">{errors.address}</small>

          <label htmlFor="notes" className="sr-only">
            Order Notes (optional)
          </label>
          <textarea
            id="notes"
            rows="3"
            name="notes"
            placeholder="Order Notes (Optional)"
            value={formData.notes}
            onChange={handleChange}
          />

          <h2>Payment</h2>

          <div className="payment-card active">
            💳 Pay securely by card
            <span>You'll enter your card details on the next screen</span>
          </div>

          <label className="agree-box">
            <input
              type="checkbox"
              name="agree"
              checked={formData.agree}
              onChange={handleChange}
              required
              aria-invalid={!!errors.agree}
              aria-describedby="agree-error"
            />
            I agree to the Terms & Conditions
          </label>
          <small id="agree-error">{errors.agree}</small>

          {orderError && (
            <p
              role="alert"
              style={{
                color: "#c0392b",
                marginTop: "0.75rem",
                fontWeight: 500,
              }}
            >
              {orderError}
            </p>
          )}

          <button
            type="submit"
            className="place-order-btn"
            disabled={submitting}
            aria-busy={submitting}
          >
            {submitting ? "Taking you to payment..." : "Continue to Payment"}
          </button>
        </form>

        <div className="checkout-right">
          <h2>Order Summary</h2>

          {cart.map((item) => (
            <div className="summary-item" key={item.id}>
              <img src={item.image} alt={item.title} />
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
            <span>${total.toFixed(2)}</span>
          </h3>
        </div>
      </div>
    </section>
  );
}

export default Checkout;
