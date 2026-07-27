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

      sum +

      Number(item.price.replace(/[^\d]/g, "")) *

      item.quantity,

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

          <p>Looks like you haven't added anything yet.</p>

        </div>

      ) : (

        <>

          <div className="cart-items">

            {cart.map((item) => (

              <div
                className="cart-item"
                key={item.id}
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

                  <div className="quantity-box">

                    <button

                      onClick={() => decreaseQuantity(item.id)}

                    >

                      −

                    </button>

                    <span>

                      {item.quantity}

                    </span>

                    <button

                      onClick={() => increaseQuantity(item.id)}

                    >

                      +

                    </button>

                  </div>

                  <button

                    className="remove-btn"

                    onClick={() => removeFromCart(item.id)}

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

              Total: Rs. {total.toLocaleString()}

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