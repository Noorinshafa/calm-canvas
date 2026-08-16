export async function getProducts() {
  const response = await fetch("/api/printify", {
    cache: "no-store",
  });

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      errorText || "Failed to fetch products"
    );
  }

  const data = await response.json();

  if (!Array.isArray(data)) {
    throw new Error(
      "Printify API returned an invalid product list"
    );
  }

  return data;
}