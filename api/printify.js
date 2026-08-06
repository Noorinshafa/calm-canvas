export default async function handler(req, res) {
  try {
    const response = await fetch(
      "https://api.printify.com/v1/shops/23619549/products.json",
      {
        headers: {
          Authorization: `Bearer ${process.env.PRINTIFY_API_TOKEN}`,
        },
      }
    );

    if (!response.ok) {
      const error = await response.text();
      return res.status(response.status).json({ error });
    }

    const result = await response.json();

    const products = result.data.map((product) => ({
      id: product.id,
      title: product.title,
      description: product.description,

      image: product.images?.[0]?.src || null,

      images: (product.images || [])
        .filter((img) => img.src)
        .map((img) => ({
          src: img.src,
        })),

      price: product.variants?.length
  ? `$${(product.variants[0].price / 100).toFixed(2)}`
  : "$0.00",

      blueprint_id: product.blueprint_id,

      variants: product.variants || [],
    }));

    res.setHeader(
      "Cache-Control",
      "public, s-maxage=300, stale-while-revalidate=86400"
    );

    res.status(200).json(products);

  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
}