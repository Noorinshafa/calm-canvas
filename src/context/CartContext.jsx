import { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

const CART_STORAGE_KEY = "calmcanvas_cart_v1";

// Cart used to live in plain React state -- refreshing the page, opening a
// new tab, or coming back tomorrow silently emptied it. Persisting to
// localStorage (read once on load, written on every change) fixes that
// without pulling in any new dependency.
function loadStoredCart() {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    // Corrupted data, privacy mode, storage disabled, etc -- fail closed to
    // an empty cart rather than throwing on load.
    return [];
  }
}

export function CartProvider({ children }) {

  const [cart, setCart] = useState(loadStoredCart);

  useEffect(() => {
    try {
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch {
      // Storage full or unavailable -- the cart still works for this
      // session, it just won't survive a refresh. Not worth surfacing to
      // the shopper over.
    }
  }, [cart]);

  function addToCart(product) {

    const cartItemId = `${product.id}-${product.selectedVariant?.id || "default"}`;

    const quantityToAdd = product.quantity || 1;

    setCart((currentCart) => {

      const existing = currentCart.find(
        (item) => item.cartItemId === cartItemId
      );

      if (existing) {

        return currentCart.map((item) =>
          item.cartItemId === cartItemId
            ? {
                ...item,
                quantity: item.quantity + quantityToAdd,
              }
            : item
        );

      }

      return [
        ...currentCart,
        {
          ...product,
          quantity: quantityToAdd,
          cartItemId,
        },
      ];

    });

  }

  function increaseQuantity(cartItemId) {

    setCart((currentCart) =>
      currentCart.map((item) =>
        item.cartItemId === cartItemId
          ? {
              ...item,
              quantity: item.quantity + 1,
            }
          : item
      )
    );

  }

  function decreaseQuantity(cartItemId) {

    setCart((currentCart) =>
      currentCart.map((item) =>
        item.cartItemId === cartItemId
          ? {
              ...item,
              quantity:
                item.quantity > 1
                  ? item.quantity - 1
                  : 1,
            }
          : item
      )
    );

  }

  function removeFromCart(cartItemId) {

    setCart((currentCart) =>
      currentCart.filter(
        (item) => item.cartItemId !== cartItemId
      )
    );

  }

  return (

    <CartContext.Provider
      value={{
        cart,
        setCart,
        addToCart,
        increaseQuantity,
        decreaseQuantity,
        removeFromCart,
      }}
    >

      {children}

    </CartContext.Provider>

  );

}

export function useCart() {

  return useContext(CartContext);

}
