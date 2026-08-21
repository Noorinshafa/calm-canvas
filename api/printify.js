// Cached in memory for as long as this serverless function stays "warm" —
// Printify's product catalog (blueprint names) barely ever changes, so we
// avoid re-fetching it on every single page load.
let blueprintTitleCache = null;
let blueprintTitleCacheTime = 0;
const BLUEPRINT_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

async function getBlueprintTitles(headers) {
  const isFresh =
    blueprintTitleCache && Date.now() - blueprintTitleCacheTime < BLUEPRINT_CACHE_TTL;

  if (isFresh) {
    return blueprintTitleCache;
  }

  try {
    const response = await fetch(
      "https://api.printify.com/v1/catalog/blueprints.json",
      { headers }
    );

    if (!response.ok) {
      // If this fails, don't break the whole product list — just fall
      // back to whatever we had before (or an empty map).
      return blueprintTitleCache || {};
    }

    const blueprints = await response.json();
    const map = {};

    for (const blueprint of blueprints) {
      map[blueprint.id] = (blueprint.title || "").toLowerCase();
    }

    blueprintTitleCache = map;
    blueprintTitleCacheTime = Date.now();

    return map;
  } catch {
    return blueprintTitleCache || {};
  }
}

export default async function handler(req, res) {
  try {
    const headers = {
      Authorization: `Bearer ${process.env.PRINTIFY_API_TOKEN}`,
    };

    let page = 1;
    let lastPage = 1;
    let allProducts = [];

    do {
      const response = await fetch(
        `https://api.printify.com/v1/shops/23619549/products.json?limit=50&page=${page}`,
        { headers }
      );

      if (!response.ok) {
        const error = await response.text();
        return res.status(response.status).json({ error });
      }

      const result = await response.json();

      allProducts = [...allProducts, ...(result.data || [])];
      lastPage = result.last_page || 1;
      page++;
    } while (page <= lastPage);

    const blueprintTitles = await getBlueprintTitles(headers);

    const products = allProducts.map((product) => {
      const availableVariants = (product.variants || []).filter(
        (variant) =>
          variant.is_enabled !== false && variant.is_available !== false
      );

      const pricedVariants = availableVariants.length
        ? availableVariants
        : product.variants || [];

      const prices = pricedVariants
        .map((variant) => variant.price)
        .filter((price) => typeof price === "number");

      const lowestPriceCents = prices.length ? Math.min(...prices) : 0;
      const priceValue = Number((lowestPriceCents / 100).toFixed(2));

      return {
        id: product.id,
        title: product.title,
        description: product.description,
        image: product.images?.[0]?.src || null,
        images: (product.images || [])
          .filter((img) => img.src)
          .map((img) => ({ src: img.src })),
        price: `$${priceValue.toFixed(2)}`,
        priceValue,
        blueprint_id: product.blueprint_id,
        blueprintTitle: blueprintTitles[product.blueprint_id] || "",
        variants: product.variants || [],
      };
    });

    res.setHeader(
      "Cache-Control",
      "public, s-maxage=300, stale-while-revalidate=86400"
    );

    return res.status(200).json(products);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
