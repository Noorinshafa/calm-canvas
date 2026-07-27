import { Link } from "react-router-dom";
import "../../styles/searchbar.css";

function SearchBar({
  search,
  setSearch,
  products,
  closeSearch,
}) {
  const filteredProducts = products.filter((item) =>
    item.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="search-bar">

      <input
        type="text"
        placeholder="Search products..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {search && (

        <div className="search-results">


          {filteredProducts.map((product) => (

            <Link
              key={product.id}
              to={`/product/${product.id}`}
              className="search-product"
              onClick={closeSearch}
            >

              <img
                src={product.image}
                alt={product.title}
              />

              <div>

                <h4>{product.title}</h4>

                <p>{product.price}</p>

              </div>

            </Link>

          ))}

        </div>

      )}

    </div>
  );
}

export default SearchBar;