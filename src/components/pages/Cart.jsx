import "../../styles/cart.css";
import "../../styles/shipping.css";
import { Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import useSEO from "../../hooks/useSEO";
import OptimizedImage from "../ui/OptimizedImage";

function Cart() {
  useSEO({ title: "Cart", path: "/cart", noindex: true });

  const {
    cart,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
  } = useCart();

  const total = cart.reduce(
    (sum, item) =>
      sum + (item.priceValue || 0) * item.quantity,
    0
  );

  return (
    <section className="cart-page">

      <div className="cart-heading">

        <span>✦ YOUR CART</span>

        <h1>Shopping Cart</h1>

      </div>

      {cart.length === 0 ? (

        <div className="empty-cart">

          <h2>Your cart is empty.</h2>

          <p>
            Looks like you haven't added anything yet.
          </p>

          <Link to="/collections">
            Continue Shopping
          </Link>

        </div>

      ) : (

        <>

          <div className="cart-items">

            {cart.map((item) => (

              <div
                className="cart-item"
                key={item.cartItemId}
              >

                <OptimizedImage
                  src={item.image}
                  alt={item.title}
                  className="cart-item-image"
                  widths={[384]}
                />

                <div className="cart-item-info">

                  <h3>{item.title}</h3>

                  <p className="cart-price">
                    {item.price}
                  </p>

                  {Array.isArray(item.selectedOptions) &&
                  item.selectedOptions.length > 0 ? (
                    item.selectedOptions.map((option) => (
                      <p key={option.label}>
                        {option.label}: {option.value}
                      </p>
                    ))
                  ) : (
                    // Carts saved before this change only know the variant's
                    // own title (e.g. "White / S"), which is always correct.
                    item.selectedVariant?.title && (
                      <p>Options: {item.selectedVariant.title}</p>
                    )
                  )}

                  <div className="quantity-box">

                    <button
                      onClick={() =>
                        decreaseQuantity(item.cartItemId)
                      }
                      aria-label={`Decrease quantity of ${item.title}`}
                    >
                      −
                    </button>

                    <span aria-live="polite">
                      {item.quantity}
                    </span>

                    <button
                      onClick={() =>
                        increaseQuantity(item.cartItemId)
                      }
                      aria-label={`Increase quantity of ${item.title}`}
                    >
                      +
                    </button>

                  </div>

                  <button
                    className="remove-btn"
                    onClick={() =>
                      removeFromCart(item.cartItemId)
                    }
                    aria-label={`Remove ${item.title} from cart`}
                  >
                    Remove
                  </button>

                </div>

              </div>

            ))}

          </div>

          <div className="cart-summary">

            <h2>Order Summary</h2>

            <h3>
              Subtotal: ${total.toFixed(2)}
            </h3>

            <p className="cart-shipping-note">
              Shipping is worked out at checkout from your country, so you
              see the exact price before you pay.
            </p>

            <Link
              to="/checkout"
              className="checkout-btn"
            >
              Proceed to Checkout
            </Link>

          </div>

        </>

      )}

    </section>
  );
}

export default Cart;
