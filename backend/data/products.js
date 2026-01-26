const products = [
  {
    name: 'Real Madrid Home Kit 2025',
    image: '/images/real-madrid.jpg', // Placeholder for now
    description:
      'Official Real Madrid Home Kit for the 2025/26 season. Features breathable fabric and premium stitching.',
    brand: 'Adidas',
    category: 'Kits',
    price: 120.99,
    countInStock: 10,
    rating: 4.5,
    numReviews: 12,
    sizes: [{ size: 'M', available: true }, { size: 'L', available: true }]
  },
  {
    name: 'Nike Pro Combat Gym Tee',
    image: '/images/nike-gym.jpg',
    description:
      'High-performance compression shirt for intense workout sessions. Sweat-wicking technology.',
    brand: 'Nike',
    category: 'Gym Wear',
    price: 45.99,
    countInStock: 7,
    rating: 4.0,
    numReviews: 8,
    sizes: [{ size: 'S', available: true }, { size: 'M', available: true }]
  },
  {
    name: 'Puma Future Ultimate Cleats',
    image: '/images/puma-cleats.jpg',
    description:
      'Professional grade football boots. Lightweight design for maximum speed on the pitch.',
    brand: 'Puma',
    category: 'Footwear',
    price: 210.00,
    countInStock: 5,
    rating: 5,
    numReviews: 4,
    sizes: [{ size: 'UK-9', available: true }, { size: 'UK-10', available: true }]
  },
  {
    name: 'Barcelona Away Jersey',
    image: '/images/barca-away.jpg',
    description:
      'The vibrant away jersey for FC Barcelona. Made with recycled polyester.',
    brand: 'Nike',
    category: 'Kits',
    price: 115.00,
    countInStock: 11,
    rating: 4.8,
    numReviews: 10,
    sizes: [{ size: 'L', available: true }, { size: 'XL', available: true }]
  },
  {
    name: 'Under Armour Track Pants',
    image: '/images/ua-pants.jpg',
    description:
      'Comfortable and durable track pants suitable for running and casual wear.',
    brand: 'Under Armour',
    category: 'Trousers',
    price: 55.99,
    countInStock: 20,
    rating: 4.2,
    numReviews: 6,
    sizes: [{ size: 'M', available: true }, { size: 'L', available: true }]
  },
  {
    name: 'Training Cones Set (50pc)',
    image: '/images/cones.jpg',
    description:
      'High-visibility training cones for drill sessions. Essential for any coach.',
    brand: 'Generic',
    category: 'Equipment',
    price: 29.99,
    countInStock: 0, // Out of stock example
    rating: 3.5,
    numReviews: 2,
    sizes: []
  },
];

module.exports = products;