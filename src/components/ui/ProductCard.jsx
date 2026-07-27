import "../../styles/productcard.css";

import { Link } from "react-router-dom";

function ProductCard({ id, image, title, description, price }) {

    return (

        <Link
            to={`/product/${id}`}
            className="product-card"
        >

            <div className="card-glow"></div>

            <div className="product-image">

                <img
                    src={image}
                    alt={title}
                />

            </div>

            <div className="product-content">

                <h3>{title}</h3>

                <p>{description}</p>

                <span>{price}</span>

            </div>

        </Link>

    );

}

export default ProductCard;