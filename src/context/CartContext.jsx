import { createContext, useContext, useState } from "react";

const CartContext = createContext();

export function CartProvider({ children }) {

  const [cart, setCart] = useState([]);

  function addToCart(product) {

    const existing = cart.find(
      item => item.id === product.id
    );

    if (existing) {

      setCart(

        cart.map(item =>
          item.id === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
              }
            : item
        )

      );

    } else {

      setCart([

        ...cart,

        {
          ...product,
          quantity: 1,
        },

      ]);

    }

  }

  function increaseQuantity(id) {

    setCart(

      cart.map(item =>
        item.id === id
          ? {
              ...item,
              quantity: item.quantity + 1,
            }
          : item
      )

    );

  }

  function decreaseQuantity(id) {

    setCart(

      cart.map(item =>
        item.id === id
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

  function removeFromCart(id) {

    setCart(

      cart.filter(item => item.id !== id)

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