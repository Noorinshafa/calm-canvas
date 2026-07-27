import { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import ProductDetails from "./components/pages/ProductDetails";
import Checkout from "./components/pages/Checkout";
import OrderSuccess from "./components/pages/OrderSuccess";

import Cart from "./components/pages/Cart";
import Navbar from './components/layout/Navbar';
import Hero from './components/sections/Hero';
import SignatureCollection from "./components/sections/SignatureCollection";
import FeaturedCollection from "./components/sections/FeaturedCollection";
import ParallaxBanner from "./components/sections/ParallaxBanner";
import Footer from "./components/sections/Footer";
import About from "./components/pages/About";
import Contact from "./components/pages/Contact";
import Collections from "./components/pages/Collections";
import Jewellery from "./components/pages/collections/Jewellery";
import Accessories from "./components/pages/collections/Accessories";
import Gifts from "./components/pages/collections/Gifts";
import './styles/global.css';
import './styles/navbar.css';
import './styles/logo.css';
import './styles/hero.css';
import './App.css';

function App() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

useEffect(() => {

  const handleResize = () => {

    setIsMobile(window.innerWidth <= 768);

  };

  window.addEventListener("resize", handleResize);

  return () => {

    window.removeEventListener("resize", handleResize);

  };

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

  {isMobile ? (
    <>
      <FeaturedCollection />
      <ParallaxBanner />
    </>
  ) : (
    <>
      <SignatureCollection />
      <ParallaxBanner />
      <FeaturedCollection />
    </>
  )}

</>
        }
      />

      <Route
        path="/about"
        element={<About />}
      />

      <Route
    path="/contact"
    element={<Contact />}
  />
 <Route
  path="/product/:id"
  element={<ProductDetails />}

/>

  <Route
  path="/collections"
  element={<Collections />}
  
/>
<Route path="/jewellery" element={<Jewellery />} />

<Route path="/accessories" element={<Accessories />} />

<Route path="/gifts" element={<Gifts />} />

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

    </Routes>

    <Footer />

  </div>

);
}

export default App;