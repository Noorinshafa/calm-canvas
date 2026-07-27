export default async function handler(req, res) {
  try {
    const response = await fetch("https://api.printify.com/v1/shops/23619549/products.json", {
      headers: {
        Authorization: `Bearer ${process.env.PRINTIFY_API_TOKEN}`,
      },
    });

    const data = await response.json();

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
}