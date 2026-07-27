import "../../styles/explorecard.css";

import { Link } from "react-router-dom";

function ExploreCard({ link }) {

    return (

        <Link
            to={link}
            className="explore-card"
        >

            <div className="explore-icon">+</div>

            <h3>Explore</h3>

            <p>View the complete collection</p>

            <span>Browse →</span>

        </Link>

    );

}

export default ExploreCard;