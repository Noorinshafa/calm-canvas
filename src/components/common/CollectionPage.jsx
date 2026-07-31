import "../../styles/collectionPage.css";
import { Link } from "react-router-dom";

import hoodies from "../../assets/categories/hoodies.png";
import tshirts from "../../assets/categories/tshirts.png";
import sweatshirts from "../../assets/categories/sweatshirts.png";
import phonecases from "../../assets/categories/phonecases.png";
import mugs from "../../assets/categories/mugs.png";
import totebags from "../../assets/categories/totebags.png";

function CollectionPage() {

  const collections = [

    {
      title: "Hoodies",
      image: hoodies,
      link: "/hoodies",
    },

    {
      title: "T-Shirts",
      image: tshirts,
      link: "/tshirts",
    },

    {
      title: "Sweatshirts",
      image: sweatshirts,
      link: "/sweatshirts",
    },

    {
      title: "Phone Cases",
      image: phonecases,
      link: "/phonecases",
    },

    {
      title: "Mugs",
      image: mugs,
      link: "/mugs",
    },

    {
      title: "Tote Bags",
      image: totebags,
      link: "/totebags",
    },

  ];

  return (

    <section className="collection-page">

      <div className="collection-header">

        <span>CALM CANVAS</span>

        <h1>Explore Our Collections</h1>

        <p>
          Discover beautifully designed products made
          to bring creativity into your everyday life.
        </p>

      </div>

      <div className="collection-grid">

        {collections.map((item) => (

          <Link
            key={item.title}
            to={item.link}
            className="collection-card"
          >

            <img
              src={item.image}
              alt={item.title}
            />

            <div className="collection-content">

              <h2>{item.title}</h2>

              <button>

                Explore

              </button>

            </div>

          </Link>

        ))}

      </div>

    </section>

  );

}

export default CollectionPage;