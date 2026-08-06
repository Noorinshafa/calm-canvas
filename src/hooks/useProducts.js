import { useEffect, useState } from "react";
import { getProducts } from "../services/printifyApi";

function useProducts() {

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {

    async function fetchProducts() {

      try {

        const data = await getProducts();
        setProducts(data);

      } catch (err) {

        setError(err.message);

      } finally {

        setLoading(false);

      }

    }

    fetchProducts();

  }, []);

  return {
    products,
    loading,
    error,
  };

}

export default useProducts;