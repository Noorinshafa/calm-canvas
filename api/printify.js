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

   const products = result.data.map((product) => ({
  id: product.id,
  title: product.title,
  description: product.description,

  image: product.images[0]?.src,

  images: product.images.map((img) => ({
    src: img.src,
  })),

  price: `Rs. ${(product.variants[0].price / 100).toLocaleString()}`,

  blueprint_id: product.blueprint_id,

  variants: product.variants,
}));

res.status(200).json(products);

  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
}