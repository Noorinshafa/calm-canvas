import { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";

import Navbar from "./components/layout/Navbar";
import ScrollToTop from "./components/common/ScrollToTop";
import useSEO from "./hooks/useSEO";

import Hero from "./components/sections/Hero";
import Marquee from "./components/sections/Marquee";
import BestSellers from "./components/sections/BestSellers";
import FeaturedCollection from "./components/sections/FeaturedCollection";
import WhyCalmCanvas from "./components/sections/WhyCalmCanvas";
import ParallaxBanner from "./components/sections/ParallaxBanner";
import ShopCategories from "./components/sections/ShopCategories";
import Footer from "./components/sections/Footer";

// Every one of these used to be imported eagerly, which meant a first-time
// visitor to the homepage downloaded the JS for checkout, every collection
// page, and the product-detail page before clicking anything. Lazy-loading
// everything except the homepage means the initial bundle only contains
// what the homepage actually needs; each route's code is fetched only when
// someone navigates there.
const ProductDetails = lazy(() => import("./components/pages/ProductDetails"));
const Checkout = lazy(() => import("./components/pages/Checkout"));
const Cart = lazy(() => import("./components/pages/Cart"));
const About = lazy(() => import("./components/pages/About"));
const Contact = lazy(() => import("./components/pages/Contact"));
const OrderSuccess = lazy(() => import("./components/pages/OrderSuccess"));
const Terms = lazy(() => import("./components/pages/Terms"));
const Privacy = lazy(() => import("./components/pages/Privacy"));
const ShippingReturns = lazy(() => import("./components/pages/ShippingReturns"));
const NotFound = lazy(() => import("./components/pages/NotFound"));

const CollectionPage = lazy(() => import("./components/common/CollectionPage"));

const Tshirts = lazy(() => import("./components/pages/collections/Tshirts"));
const Hoodies = lazy(() => import("./components/pages/collections/Hoodies"));
const Sweatshirts = lazy(() => import("./components/pages/collections/Sweatshirts"));
const Totebags = lazy(() => import("./components/pages/collections/Totebags"));
const PhoneCases = lazy(() => import("./components/pages/collections/PhoneCases"));
const Mugs = lazy(() => import("./components/pages/collections/Mugs"));

import "./styles/global.css";
import "./styles/navbar.css";
import "./styles/hero.css";
import "./styles/featuredcollection.css";
import "./App.css";

function Home() {
  // No overrides -- resets title/description/canonical/OG back to the site
  // defaults (matching index.html) whenever someone navigates back to "/"
  // after visiting a product or category page.
  useSEO({ path: "/" });

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

// A minimal, layout-neutral fallback -- routes below already show their own
// "Loading..." state once mounted, this only covers the brief moment the
// route's JS chunk itself is still being fetched.
function RouteFallback() {
  return <div className="route-loading" aria-hidden="true" />;
}

function App() {
  return (
    <div className="app">

      <ScrollToTop />

      <Navbar />

      <Suspense fallback={<RouteFallback />}>

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


        {/* ================= LEGAL ================= */}

        <Route
          path="/terms"
          element={<Terms />}
        />

        <Route
          path="/privacy-policy"
          element={<Privacy />}
        />

        <Route
          path="/shipping-returns"
          element={<ShippingReturns />}
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
          element={<NotFound />}
        />

      </Routes>

      </Suspense>

    </div>
  );
}

export default App;
