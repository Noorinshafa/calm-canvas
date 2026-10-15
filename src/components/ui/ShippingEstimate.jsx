import { useState } from "react";
import { Link } from "react-router-dom";
import { COUNTRIES } from "../../config/countries.js";
import { PRINT_TIME_TEXT } from "../../config/shipping.js";
import useShippingQuote from "../../hooks/useShippingQuote";
import { getSavedCountry, saveCountry } from "../../utils/shippingCountry";
import "../../styles/shipping.css";

// "How much is shipping to me?" on a product page. Nothing is requested until
// the shopper picks a country, and the price comes straight from Printify for
// the exact size/colour and quantity chosen above it.
function ShippingEstimate({ productId, variantId, quantity }) {
  const [country, setCountry] = useState(getSavedCountry);

  const quote = useShippingQuote(
    [{ id: productId, variantId, quantity }],
    country
  );

  function handleChange(event) {
    setCountry(event.target.value);
    saveCountry(event.target.value);
  }

  return (
    <div className="ship-estimate">
      <h4>Shipping estimate</h4>

      <label htmlFor="ship-estimate-country" className="sr-only">
        Country to ship to
      </label>
      <select
        id="ship-estimate-country"
        className="product-select"
        value={country}
        onChange={handleChange}
      >
        <option value="">Choose your country</option>
        {COUNTRIES.map((item) => (
          <option key={item.code} value={item.name}>
            {item.name}
          </option>
        ))}
      </select>

      <div className="ship-estimate-result" aria-live="polite">
        {!country && (
          <p className="ship-note">
            Pick your country to see what shipping costs for this item.
          </p>
        )}

        {country && quote.status === "loading" && (
          <p className="ship-note">Calculating shipping…</p>
        )}

        {country && quote.status === "error" && (
          <p className="ship-problem" role="alert">
            {quote.error}
          </p>
        )}

        {country && quote.status === "ready" && (
          <ul className="ship-list">
            {quote.options.map((option) => (
              <li key={option.key}>
                <span>
                  <strong>{option.label}</strong>
                  <span className="ship-eta">{option.estimate}</span>
                </span>
                <span className="ship-price">{option.price}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <p className="ship-note">
        Shipping is added at checkout and is not part of the item price. Each
        item is printed first ({PRINT_TIME_TEXT}).{" "}
        <Link to="/shipping-returns">Shipping &amp; returns</Link>
      </p>
    </div>
  );
}

export default ShippingEstimate;
