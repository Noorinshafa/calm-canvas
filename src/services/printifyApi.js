// `cache: "no-store"` here was telling the browser to ignore its own HTTP
// cache and always hit the network -- even though the server sends a
// Cache-Control header meant to let the browser reuse this for 5 minutes.
// That meant every single page navigation re-downloaded the full product
// list from scratch. Using the browser's normal caching now lets repeat
// page views (e.g. going from the homepage to a collection, or back) reuse
// what's already been downloaded instead of re-fetching every time.
export async function getProducts() {
  const response = await fetch("/api/printify");

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(errorText || "Failed to fetch products");
  }

  const data = await response.json();

  if (!Array.isArray(data)) {
    throw new Error("Printify API returned an invalid product list");
  }

  return data;
}

// Fetches just ONE product's full details (including variants, needed for
// size/color selection) instead of downloading the entire catalog to find
// it -- see api/product.js for why this exists.
export async function getProduct(id) {
  const response = await fetch(`/api/product?id=${encodeURIComponent(id)}`);

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(errorText || "Failed to fetch product");
  }

  return response.json();
}
