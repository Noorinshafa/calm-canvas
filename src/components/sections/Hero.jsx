import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";

import "../../styles/hero.css";

import JewelleryBanner from "../../assets/banners/jewellery-banner.png";
import AccessoriesBanner from "../../assets/banners/accessories-banner.png";
import GiftsBanner from "../../assets/banners/gifts-banner.png";

const slides = [

  {
    image: JewelleryBanner,
    subtitle: "✦ CALM CANVAS JEWELLERY",
    title: "Timeless Jewellery",
    description:
      "Discover elegant necklaces, bracelets, earrings and rings crafted to make every moment shine beautifully.",
    button: "Shop Jewellery",
    link: "/jewellery",
  },

  {
    image: AccessoriesBanner,
    subtitle: "✦ ACCESSORIES",
    title: "Little Details, Big Charm",
    description:
      "Hair bands, bows, clips and charming accessories made to complete every beautiful outfit.",
    button: "Explore Accessories",
    link: "/accessories",
  },

  {
    image: GiftsBanner,
    subtitle: "✦ THOUGHTFUL GIFTS",
    title: "Wrapped With Love",
    description:
      "Beautiful gifts carefully selected to celebrate birthdays, anniversaries and unforgettable moments.",
    button: "Discover Gifts",
    link: "/gifts",
  },

];

function Hero() {

  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {

    const interval = setInterval(() => {

      setCurrentSlide((prev) => (prev + 1) % slides.length);

    }, 5000);

    return () => clearInterval(interval);

  }, []);

  return (

    <section className="hero-slider">

      <AnimatePresence initial={false}>

        <motion.div

          key={currentSlide}

          className="hero-slide"

          initial={{ x: 80, opacity: 0 }}

animate={{ x: 0, opacity: 1 }}

exit={{ x: -80, opacity: 0 }}

transition={{
  duration: 1,
  ease: [0.22, 1, 0.36, 1],
}}

        >

          <img

            src={slides[currentSlide].image}

            alt={slides[currentSlide].title}

            className="hero-background"

          />

          <div className="hero-overlay"></div>

          <div className="hero-content">

            <span>{slides[currentSlide].subtitle}</span>

            <h1>{slides[currentSlide].title}</h1>

            <p>{slides[currentSlide].description}</p>

            <Link
  to={slides[currentSlide].link}
  className="hero-btn"
>

  {slides[currentSlide].button}

</Link>

          </div>

        </motion.div>

      </AnimatePresence>

      <div className="hero-dots">

        {slides.map((_, index) => (

          <button

            key={index}

            className={currentSlide === index ? "active" : ""}

            onClick={() => setCurrentSlide(index)}

          />

        ))}

      </div>

    </section>

  );

}

export default Hero;