import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useGetProductsQuery } from '../slices/productsApiSlice';
import useScrollToTop from '../utils/useScrollToTop';
import { addToCart } from '../slices/cartSlice';
import { toast } from 'react-toastify';
import Loader from '../components/Loader';
import Message from '../components/Message';

const CSS_OVERRIDES = `
  .product-card-hover:hover { transform: translateY(-5px); box-shadow: 0 10px 25px rgba(0,0,0,0.1) !important; }
  .product-card-hover:hover img { transform: scale(1.05); }
  .back-btn-hover:hover { background-color: #002147 !important; color: #fff !important; }
  .product-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 25px; }

  @media (max-width: 768px) {
    .header-row { flex-direction: column !important; align-items: flex-start !important; gap: 10px !important; margin-bottom: 20px !important; }
    .cat-title { font-size: 22px !important; }
    .product-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 12px !important; }
    .product-card { border-radius: 10px !important; }
    .image-wrapper { height: 140px !important; padding: 5px !important; }
    .card-padding { padding: 10px !important; }
    .prod-title { font-size: 13px !important; height: 32px !important; margin-bottom: 5px !important; }
    .prod-price { font-size: 16px !important; }
    .stock-label { font-size: 10px !important; }
    .add-cart-btn { padding: 8px !important; font-size: 12px !important; margin-top: 5px !important; }
  }
`;

const CategoryProductScreen = () => {
  useScrollToTop(); // ✅ Add scroll to top on page load
  
  const { name: categoryName } = useParams(); // Using 'name' as per your route param
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Using Redux Query to fetch all products
  const { data, isLoading, error } = useGetProductsQuery({ pageNumber: 1 });

  // Add to Cart Logic
  const addToCartHandler = (product) => {
    dispatch(addToCart({ 
        ...product, 
        qty: 1,
        selectedColor: product.colors?.[0]?.colorName || null,
        selectedSize: product.availableSizes?.[0] || null,
        selectedImage: product.colors?.[0]?.images?.[0] || product.image 
    }));
    toast.success("Added to Cart");
  };

  return (
    <div className="main-container fade-up" style={{ padding: '20px 20px 40px 20px', background: '#F0F8FF', minHeight: '100vh' }}>
      
      <style>{CSS_OVERRIDES}</style>

      {/* Back Button */}
      <button onClick={() => navigate(-1)} className="back-btn-hover" style={STYLES.backBtn}>
        <i className="fa-solid fa-arrow-left"></i> Back
      </button>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', marginTop: '10px' }} className="header-row">
        <h2 style={{ textTransform: 'capitalize', fontSize: '28px', fontWeight: '800', margin: 0, color: '#002147' }} className="cat-title">
          {categoryName} Collection
        </h2>
      </div>

      {isLoading ? (
        <Loader />
      ) : error ? (
        <Message variant='danger'>{error?.data?.message || error.error}</Message>
      ) : (
        <>
          {/* Filtering Logic */}
          {data.products.filter((p) => p.category === categoryName).length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 20px' }}>
              <p style={{ fontSize: '18px', color: '#888' }}>No products found in this category.</p>
              <button onClick={() => navigate('/')} style={{ ...STYLES.cartBtn, width: '200px', marginTop: '20px', background: '#333', color: '#fff' }}>
                Go to Home
              </button>
            </div>
          ) : (
            <div className="product-grid">
              {data.products
                .filter((p) => p.category === categoryName)
                .map((product) => (
                  <div key={product._id} className="product-card product-card-hover" style={STYLES.card}>
                    
                    <Link to={`/product/${product._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                      <div style={STYLES.imageWrapper} className="image-wrapper">
                        <img 
                          src={product.colors?.[0]?.images?.[0] || product.image} 
                          alt={product.name} 
                          style={STYLES.image} 
                        />
                      </div>
                      
                      <div style={{ padding: '15px' }} className="card-padding">
                        <h3 style={STYLES.productTitle} className="prod-title">{product.name}</h3>
                        <p style={STYLES.productPrice} className="prod-price">Rs {product.price.toLocaleString()}</p>
                        
                        <p style={{ fontSize: '11px', fontWeight: 'bold', marginTop: '5px', color: product.countInStock <= 0 ? 'red' : '#007600' }} className="stock-label">
                          {product.countInStock <= 0 ? 'Out of Stock' : `In Stock`}
                        </p>
                      </div>
                    </Link>

                    <div style={{ padding: '0 15px 15px 15px' }} className="card-padding">
                      <button 
                        className="add-cart-btn" 
                        onClick={() => addToCartHandler(product)}
                        disabled={product.countInStock <= 0}
                        style={{ 
                          ...STYLES.cartBtn,
                          background: product.countInStock <= 0 ? '#e7e9ec' : '#FF6F00',
                          color: product.countInStock <= 0 ? '#565959' : '#fff',
                          cursor: product.countInStock <= 0 ? 'not-allowed' : 'pointer'
                        }}
                      >
                        {product.countInStock <= 0 ? 'Sold Out' : 'Add to Cart'}
                      </button>
                    </div>
                  </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

// Styles Object
const STYLES = {
  backBtn: { display: 'flex', alignItems: 'center', gap: '8px', background: 'transparent', border: '2px solid #002147', padding: '8px 20px', borderRadius: '30px', cursor: 'pointer', fontSize: '14px', fontWeight: '700', color: '#002147', transition: '0.2s', marginBottom: '10px', width: 'fit-content' },
  card: { background: '#fff', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', height: '100%', boxShadow: '0 4px 10px rgba(0,0,0,0.03)', transition: 'all 0.3s ease' },
  imageWrapper: { width: '100%', height: '220px', overflow: 'hidden', padding: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#fff', borderBottom: '1px solid #f5f5f5' },
  image: { maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', transition: 'transform 0.5s ease' },
  productTitle: { fontSize: '16px', fontWeight: '700', color: '#002147', margin: '0 0 5px 0', lineHeight: '1.3', height: '42px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' },
  productPrice: { fontSize: '18px', fontWeight: '800', color: '#FF6F00', margin: 0 },
  cartBtn: { width: '100%', padding: '10px', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '14px', transition: '0.2s', textTransform: 'uppercase', letterSpacing: '0.5px' }
};

export default CategoryProductScreen;