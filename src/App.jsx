import { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";

import ScrollToTop from "./components/ScrollToTop";

import Navbar from "./components/layout/Navbar";
import Hero from "./components/sections/Hero";
import FeaturedCollection from "./components/sections/FeaturedCollection";
import ParallaxBanner from "./components/sections/ParallaxBanner";
import Footer from "./components/sections/Footer";

import Collections from "./components/pages/Collections";
import About from "./components/pages/About";
import Contact from "./components/pages/Contact";

import ProductDetails from "./components/pages/ProductDetails";
import Cart from "./components/pages/Cart";
import Checkout from "./components/pages/Checkout";
import OrderSuccess from "./components/pages/OrderSuccess";

import Tshirts from "./components/pages/collections/Tshirts";
import Hoodies from "./components/pages/collections/Hoodies";
import Totebags from "./components/pages/collections/Totebags";
import PhoneCases from "./components/pages/collections/PhoneCases";
import Mugs from "./components/pages/collections/Mugs";

import "./styles/global.css";
import "./styles/navbar.css";
import "./styles/logo.css";
import "./styles/hero.css";
import "./App.css";

function App() {

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {

    const handleResize = () => {

      setIsMobile(window.innerWidth <= 768);

    };

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);

  }, []);

  return (

    <div className="app">

      <Navbar />

      <ScrollToTop />

      <Routes>

        <Route
          path="/"
          element={
            <>
              <Hero />

              <FeaturedCollection />

              {!isMobile && <ParallaxBanner />}
            </>
          }
        />

        <Route path="/collections" element={<Collections />} />

        <Route path="/tshirts" element={<Tshirts />} />

        <Route path="/hoodies" element={<Hoodies />} />

        <Route path="/totebags" element={<Totebags />} />

        <Route path="/phonecases" element={<PhoneCases />} />

        <Route path="/mugs" element={<Mugs />} />

        <Route
          path="/product/:id"
          element={<ProductDetails />}
        />

        <Route
          path="/cart"
          element={<Cart />}
        />

        <Route
          path="/checkout"
          element={<Checkout />}
        />

        <Route
          path="/order-success"
          element={<OrderSuccess />}
        />

        <Route
          path="/about"
          element={<About />}
        />

        <Route
          path="/contact"
          element={<Contact />}
        />

      </Routes>

      <Footer />

    </div>

  );

}

export default App;