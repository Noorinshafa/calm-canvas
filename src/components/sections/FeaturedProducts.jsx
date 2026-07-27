import ProductCard from '../products/ProductCard';

const products = [
  { id: 1, image: '💍', name: 'Rose Gold Ring', price: 1200 },
  { id: 2, image: '👜', name: 'Pastel Mini Bag', price: 2500 },
  { id: 3, image: '📿', name: 'Pearl Bracelet', price: 900 },
  { id: 4, image: '🎀', name: 'Hair Bow Clip', price: 350 },
];

function FeaturedProducts() {
  return (
    <section className="featured-products">
      <h2>Featured Picks</h2>
      <div className="products-grid">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            image={product.image}
            name={product.name}
            price={product.price}
          />
        ))}
      </div>
    </section>
  );
}

export default FeaturedProducts;