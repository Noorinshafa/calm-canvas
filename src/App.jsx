import { Routes, Route, Navigate } from "react-router-dom";

import Navbar from "./components/layout/Navbar";
import ScrollToTop from "./components/common/ScrollToTop";
import useTitle from "./hooks/useTitle";

import Hero from "./components/sections/Hero";
import Marquee from "./components/sections/Marquee";
import BestSellers from "./components/sections/BestSellers";
import FeaturedCollection from "./components/sections/FeaturedCollection";
import WhyCalmCanvas from "./components/sections/WhyCalmCanvas";
import ParallaxBanner from "./components/sections/ParallaxBanner";
import ShopCategories from "./components/sections/ShopCategories";
import Footer from "./components/sections/Footer";

import ProductDetails from "./components/pages/ProductDetails";
import Checkout from "./components/pages/Checkout";
import Cart from "./components/pages/Cart";
import About from "./components/pages/About";
import Contact from "./components/pages/Contact";
import OrderSuccess from "./components/pages/OrderSuccess";

import CollectionPage from "./components/common/CollectionPage";

import Tshirts from "./components/pages/collections/Tshirts";
import Hoodies from "./components/pages/collections/Hoodies";
import Sweatshirts from "./components/pages/collections/Sweatshirts";
import Totebags from "./components/pages/collections/Totebags";
import PhoneCases from "./components/pages/collections/PhoneCases";
import Mugs from "./components/pages/collections/Mugs";

import "./styles/global.css";
import "./styles/navbar.css";
import "./styles/hero.css";
import "./styles/featuredcollection.css";
import "./App.css";

function Home() {
  useTitle();

  return (
    <>
      <Hero />
      <Marquee />
      <BestSellers />
      <FeaturedCollection />
      <ShopCategories />
      <WhyCalmCanvas />
      <ParallaxBanner />
      <Footer />
    </>
  );
}

function App() {
  return (
    <div className="app">

      <ScrollToTop />

      <Navbar />

      <Routes>

        {/* ================= HOME ================= */}

        <Route
          path="/"
          element={<Home />}
        />


        {/* ================= COLLECTIONS ================= */}

        <Route
          path="/collections"
          element={<CollectionPage />}
        />

        <Route
          path="/tshirts"
          element={<Tshirts />}
        />

        <Route
          path="/hoodies"
          element={<Hoodies />}
        />

        <Route
          path="/sweatshirts"
          element={<Sweatshirts />}
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


        {/* ================= PRODUCT ================= */}

        <Route
          path="/product/:id"
          element={<ProductDetails />}
        />


        {/* ================= CART ================= */}

        <Route
          path="/cart"
          element={<Cart />}
        />


        {/* ================= COMPANY ================= */}

        <Route
          path="/about"
          element={<About />}
        />

        <Route
          path="/contact"
          element={<Contact />}
        />


        {/* ================= CHECKOUT ================= */}

        <Route
          path="/checkout"
          element={<Checkout />}
        />

        <Route
          path="/order-success"
          element={<OrderSuccess />}
        />


        {/* ================= FALLBACK ================= */}

        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />

      </Routes>

    </div>
  );
}

export default App;
