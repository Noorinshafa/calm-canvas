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

    const result = await response.json();

    const summary = result.data.map(product => ({
  title: product.title,
  blueprint_id: product.blueprint_id,
}));

res.status(200).json(summary);

  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
}