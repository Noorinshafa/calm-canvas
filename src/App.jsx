import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";

import Navbar from "./components/layout/Navbar";

import Hero from "./components/sections/Hero";
import FeaturedCollection from "./components/sections/FeaturedCollection";
import ParallaxBanner from "./components/sections/ParallaxBanner";
import ShopCategories from "./components/sections/ShopCategories";
import Footer from "./components/sections/Footer";
import ProductDetails from "./components/pages/ProductDetails";
import Checkout from "./components/pages/Checkout";

import CollectionPage from "./components/common/CollectionPage";
import Tshirts from "./components/pages/collections/Tshirts";
import Hoodies from "./components/pages/collections/Hoodies";
import Totebags from "./components/pages/collections/Totebags";
import PhoneCases from "./components/pages/collections/PhoneCases";
import Mugs from "./components/pages/collections/Mugs";

import "./styles/global.css";
import "./styles/navbar.css";
import "./styles/logo.css";
import "./styles/hero.css";
import "./styles/featuredcollection.css";
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

      <Routes>

        {/* ================= HOME ================= */}

        <Route
          path="/"
          element={
            <>
              <Hero />
              <FeaturedCollection />
              <ParallaxBanner/>
              <ShopCategories />
              <Footer/>
            </>
          }
        />

        {/* ================= COLLECTIONS ================= */}

        <Route
          path="/tshirts"
          element={<Tshirts />}
        />

        <Route
          path="/hoodies"
          element={<Hoodies />}
        />

        <Route
          path="/totebags"
          element={<Totebags />}
        />

        <Route
          path="/phonecases"
          element={<PhoneCases />}
        />

        <Route
          path="/mugs"
          element={<Mugs />}
        />
        <Route
  path="/collections"
  element={<CollectionPage />}
/>
<Route
  path="/product/:id"
  element={<ProductDetails />}
/>
<Route
  path="/checkout"
  element={<Checkout />}
/>

      </Routes>

    </div>

  );

}

export default App;