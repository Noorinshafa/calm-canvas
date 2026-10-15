import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { getProducts, getCatalogSnapshot } from "../services/printifyApi";

// Every page that needs the catalog (homepage best-sellers, every collection
// page, navbar search, a product page's "related products") used to fetch
// it independently via its own useProducts() call. Fetching once here,
// shared through context, means the catalog is requested a single time per
// visit and every consumer just reads from the same already-resolved (or
// in-flight) state.
//
// Two sources are asked at the same time:
//   1. the snapshot made at build time: a small static file from the CDN,
//      so product lists can appear almost at once; and
//   2. the live list from the server, which can take several seconds when
//      Printify has to be asked, but is always up to date.
// Whichever arrives first is shown. The live list always replaces the
// snapshot when it arrives, so new products and price changes still show up
// without the visitor waiting for them.
const ProductsContext = createContext(null);

export function ProductsProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Set once the live list has arrived, so a slow snapshot can never
  // overwrite newer live data.
  const liveLoaded = useRef(false);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError("");

    liveLoaded.current = false;

    const snapshotPromise = getCatalogSnapshot().then((snapshot) => {
      if (snapshot && !liveLoaded.current) {
        setProducts(snapshot);
        setLoading(false);
      }

      return snapshot;
    });

    try {
      const live = await getProducts();

      liveLoaded.current = true;
      setProducts(live);
    } catch (err) {
      // The live list failed. That is only a problem if the snapshot did not
      // load either.
      const snapshot = await snapshotPromise;

      if (!snapshot) {
        setError(err?.message || "Unable to load products.");
      }
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
