import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import { Toaster } from "react-hot-toast";


import "./styles/global.css";
import "./styles/theme.css";
import App from "./App";

createRoot(document.getElementById("root")).render(

  <StrictMode>

  <BrowserRouter>

    <CartProvider>

      <App />
      <Toaster position="top-right" />

    </CartProvider>

  </BrowserRouter>

</StrictMode>

);