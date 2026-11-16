import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { getProducts, getCatalogSnapshot } from "../services/printifyApi";

// Every page that needs the catalog (homepage best-sellers, every collection
// page, navbar search, a product page's "related products") used to fetch
// it independently via its own useProducts() call. Fetching once here,
// shared through context, means the catalog is requested a single time per
// visit and every consumer just reads from the same already-resolved (or
// in-flight) state.
//
// Two sources are used:
//   1. the snapshot made at build time: a small static file from the CDN,
//      so product lists can appear almost at once; and
//   2. the live list from the server, which can take several seconds when
//      Printify has to be asked, but is always up to date.
// The snapshot is shown first. The live list is asked for once the snapshot
// is on screen and the browser has a quiet moment, so it does not compete
// with the page's own first loading (or straight away when there is no
// snapshot). It replaces the snapshot only if something actually changed
// (a new product, a new price): most of the time the two are identical, and
// redrawing every product list on the page for nothing would only cost the
// visitor's phone time.
const ProductsContext = createContext(null);

// Never wait longer than this for the snapshot before asking for the live
// list (for example on a very slow connection).
const SNAPSHOT_WAIT_MS = 2500;

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Resolves at the browser's next quiet moment (at most 2 seconds later).
// Safari has no requestIdleCallback, so it gets a short timer instead.
function whenIdle() {
  return new Promise((resolve) => {
    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      window.requestIdleCallback(() => resolve(), { timeout: 2000 });
    } else {
      setTimeout(resolve, 300);
    }
  });
}

// True when both lists hold exactly the same products with the same details.
// Both come from the same JSON format, so comparing their text is reliable
// and takes about a millisecond for the whole catalogue.
function sameProducts(a, b) {
  if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) {
    return false;
  }

  try {
    return JSON.stringify(a) === JSON.stringify(b);
  } catch {
    return false;
  }
}

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

    let shown = null;

    const snapshotPromise = getCatalogSnapshot().then((snapshot) => {
      if (snapshot && !liveLoaded.current) {
        shown = snapshot;
        setProducts(snapshot);
        setLoading(false);
      }

      return snapshot;
    });

    // Wait for the snapshot (but not for ever), then for a quiet moment.
    const snapshot = await Promise.race([
      snapshotPromise,
      wait(SNAPSHOT_WAIT_MS).then(() => null),
    ]);

    if (snapshot) {
      await whenIdle();
    }

    try {
      const live = await getProducts();

      liveLoaded.current = true;

      if (!sameProducts(live, shown)) {
        setProducts(live);
      }
    } catch (err) {
      // The live list failed. That is only a problem if the snapshot did not
      // load either.
      const fallback = await snapshotPromise;

      if (!fallback) {
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
