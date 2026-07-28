import "../../styles/featuredcollection.css";
import useProducts from "../../hooks/useProducts";

import ProductCard from "../ui/ProductCard";
import ExploreCard from "../ui/ExploreCard";

import jewellery from "../../data/jewellery";
import accessories from "../../data/accessories";
import gifts from "../../data/gifts";


function FeaturedCollection() {
    const { products, loading, error } = useProducts();
    if (loading) return <h2>Loading products...</h2>;

if (error) return <h2>{error}</h2>;

return(

<section className="featured">

<div className="featured-heading">

<span>SHOP OUR FAVORITES</span>

<h2>Made to Make You Smile</h2>

<p>
Discover elegant jewellery, adorable accessories,
and thoughtful gifts made with love.
</p>

</div>

{/* Jewellery */}

<div className="category-heading">

    <span>✦ CUTE JEWELLERY</span>

    <h3>Jewellery You'll Love</h3>

    <p>
        Delicate pieces chosen to add elegance to every moment.
    </p>

</div>

<div className="products-row">

{jewellery.slice(0,4).map((product) => (

<ProductCard

key={product.id}

{...product}

/>

))}

<ExploreCard link="/jewellery" />

</div>

{/* Accessories */}

<div className="category-heading">

    <span>✦ CUTE ACCESSORIES</span>

    <h3>Little Details, Big Charm</h3>

    <p>
        Sweet finishing touches for your everyday style.
    </p>

</div>

<div className="products-row">

{accessories.slice(0,4).map((product) => (

<ProductCard

key={product.id}

{...product}

/>

))}

<ExploreCard link="/accessories" />

</div>

{/* Gifts */}

<div className="category-heading">

    <span>✦ THOUGHTFUL GIFTS</span>

    <h3>Made to Make Someone Smile</h3>

    <p>
        Beautiful gifts wrapped with love for every special occasion.
    </p>

</div>

<div className="products-row">

{gifts.slice(0,4).map((product) => (

<ProductCard

key={product.id}

{...product}

/>

))}

<ExploreCard link="/gifts" />

</div>

</section>

);

}

export default FeaturedCollection;