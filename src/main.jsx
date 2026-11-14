import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import { ProductsProvider } from "./context/ProductsContext";
import { Toaster } from "react-hot-toast";


// The two site fonts, served from this site (files are bundled with
// fingerprinted names and cached for a year). Latin letters only, and only the
// weights the design uses. A file is downloaded only when text on the page
// needs that weight.
import "@fontsource/cormorant-garamond/latin-400.css";
import "@fontsource/cormorant-garamond/latin-500.css";
import "@fontsource/cormorant-garamond/latin-600.css";
import "@fontsource/cormorant-garamond/latin-700.css";
import "@fontsource/cormorant-garamond/latin-500-italic.css";
import "@fontsource/cormorant-garamond/latin-600-italic.css";
import "@fontsource/manrope/latin-400.css";
import "@fontsource/manrope/latin-500.css";
import "@fontsource/manrope/latin-600.css";
import "@fontsource/manrope/latin-700.css";

import "./styles/global.css";
import "./styles/theme.css";
import App from "./App";
import { initAnalytics } from "./utils/analytics";

initAnalytics();

createRoot(document.getElementById("root")).render(

  <StrictMode>

  <BrowserRouter>

    <ProductsProvider>

    <CartProvider>

      <App />
      <Toaster position="top-right" />

    </CartProvider>

    </ProductsProvider>

  </BrowserRouter>

</StrictMode>

);