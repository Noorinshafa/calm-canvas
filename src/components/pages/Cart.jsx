import "../../styles/cart.css";
import { Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";

function Cart() {
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

                <img
                  src={item.image}
                  alt={item.title}
                  className="cart-item-image"
                />

                <div className="cart-item-info">

                  <h3>{item.title}</h3>

                  <p className="cart-price">
                    {item.price}
                  </p>

                  {item.selectedSize && (
                    <p>
                      Size: {item.selectedSize}
                    </p>
                  )}

                  {item.selectedColor && (
                    <p>
                      Color: {item.selectedColor}
                    </p>
                  )}

                  <div className="quantity-box">

                    <button
                      onClick={() =>
                        decreaseQuantity(item.cartItemId)
                      }
                    >
                      −
                    </button>

                    <span>
                      {item.quantity}
                    </span>

                    <button
                      onClick={() =>
                        increaseQuantity(item.cartItemId)
                      }
                    >
                      +
                    </button>

                  </div>

                  <button
                    className="remove-btn"
                    onClick={() =>
                      removeFromCart(item.cartItemId)
                    }
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
              Total: ${total.toFixed(2)}
            </h3>

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
