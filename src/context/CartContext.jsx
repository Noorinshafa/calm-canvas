import { createContext, useContext, useState } from "react";

const CartContext = createContext();

export function CartProvider({ children }) {

  const [cart, setCart] = useState([]);

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