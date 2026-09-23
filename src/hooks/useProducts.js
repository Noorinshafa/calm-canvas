import { useProductsContext } from "../context/ProductsContext";

// Thin wrapper kept so every existing call site (`const { products, loading,
// error } = useProducts()`) keeps working unchanged -- the actual fetch now
// happens once, shared, in <ProductsProvider> (see
// src/context/ProductsContext.jsx) instead of once per component.
function useProducts() {
  const { products, loading, error } = useProductsContext();
  return { products, loading, error };
}

export default useProducts;
