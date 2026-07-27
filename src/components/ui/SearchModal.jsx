import "../../styles/searchmodal.css";

function SearchModal() {

    return (

        <div className="search-overlay">

            <div className="search-modal">

                <input
                    type="text"
                    placeholder="Search products..."
                    className="search-input"
                />

            </div>

        </div>

    );

}

export default SearchModal;