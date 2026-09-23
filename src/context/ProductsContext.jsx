import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { getProducts } from "../services/printifyApi";

// Every page that needs the catalog (homepage best-sellers, every collection
// page, navbar search, a product page's "related products") used to fetch
// it independently via its own useProducts() call. The browser's HTTP cache
// (see api/printify.js's Cache-Control header) kept that from hitting
// Printify repeatedly, but it still meant a fresh network round-trip -- and
// a fresh "Loading..." flash -- every time a component mounted. Fetching
// once here, shared through context, means the catalog is requested a
// single time per visit and every consumer just reads from the same
// already-resolved (or in-flight) state.
const ProductsContext = createContext(null);

export function ProductsProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getProducts();

      setProducts(data);
    } catch (err) {
      setError(err?.message || "Unable to load products.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return (
    <ProductsContext.Provider
      value={{ products, loading, error, refetch: fetchProducts }}
    >
      {children}
    </ProductsContext.Provider>
  );
}

export function useProductsContext() {
  const context = useContext(ProductsContext);

  if (!context) {
    throw new Error(
      "useProductsContext must be used within <ProductsProvider>."
    );
  }

  return context;
}
