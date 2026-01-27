import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useGetProductsQuery } from '../slices/productsApiSlice';
import { useGetCategoriesQuery } from '../slices/categoriesApiSlice';
import { useGetBannersQuery } from '../slices/bannersApiSlice'; // ✅ Banners from DB
import { addToCart } from '../slices/cartSlice';
import Loader from '../components/Loader';
import Message from '../components/Message';
import { toast } from 'react-toastify';

// ✅ PROFESSIONAL STYLES (Unchanged)
const CSS_OVERRIDES = `
  /* --- DESKTOP DEFAULTS --- */
  .slider-container { position: relative; width: 100%; height: 600px; overflow: hidden; background-color: #000; }
  .slide-item { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background-size: cover; background-position: center; opacity: 0; transition: opacity 1s ease-in-out; z-index: 1; }
  .slide-item.active { opacity: 1; z-index: 2; }

  /* PC View: Professional Horizontal Grid */
  .horizontal-scroll-container {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 25px;
    padding: 20px 5px 40px 5px;
    overflow-x: hidden;
  }

  /* Hover Effects */
  .hover-zoom-img { transition: transform 0.5s ease; }
  .category-card:hover .hover-zoom-img { transform: scale(1.1); }
  
  .product-card-hover { transition: all 0.3s ease; }
  .product-card-hover:hover { 
    transform: translateY(-10px); 
    box-shadow: 0 15px 35px rgba(0, 33, 71, 0.2) !important; 
  }
  
  .cta-btn { transition: all 0.3s ease; }
  .cta-btn:hover { 
    background-color: #FF6F00 !important; 
    color: #F0F8FF !important;
    border-color: #FF6F00 !important;
    box-shadow: 0 4px 15px rgba(255, 111, 0, 0.4); 
    transform: translateY(-2px); 
  }
  .cta-btn:hover i { color: #F0F8FF !important; }
  .nav-btn-hover:hover { background: rgba(255,255,255,0.4) !important; }

  /* =========================================
      📱 MOBILE VIEW 
     ========================================= */
  @media (max-width: 768px) {
    .hide-on-mobile { display: none !important; }
    .slider-container { height: 400px !important; }
    .hero-content-wrapper { 
        left: 50% !important; top: 50% !important; transform: translate(-50%, -50%) !important; 
        width: 90% !important; text-align: center; 
    }
    .hero-heading-text { font-size: 28px !important; }
    .nav-arrow-btn { width: 35px !important; height: 35px !important; font-size: 14px !important; padding: 0 !important; display: flex !important; justify-content: center; align-items: center; }

    .horizontal-scroll-container {
        display: grid !important; 
        grid-template-columns: repeat(2, 1fr) !important; 
        gap: 15px !important;
        padding-bottom: 20px !important;
        overflow-x: visible !important;
    }
    .product-card-mobile { min-width: unset !important; max-width: 100% !important; width: 100% !important; }
    .prod-image-wrapper-mobile { height: 160px !important; padding: 10px !important; }
    .prod-name-mobile { font-size: 13px !important; height: 36px !important; }
    .prod-price-mobile { font-size: 16px !important; }
    .cta-btn-mobile { padding: 8px !important; font-size: 12px !important; }

    .about-container-mobile { flex-direction: column-reverse !important; text-align: center; gap: 30px !important; }
    .about-divider-mobile { margin: 0 auto 20px auto !important; }
    .about-header-mobile { justify-content: center !important; }
    .about-heading-mobile { font-size: 24px !important; }
    .about-text-mobile { font-size: 14px !important; }
  }
`;

const HomeScreen = () => {
  const { keyword } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // 1. Redux Data Fetching
  const { data: productsData, isLoading: loadingProducts, error } = useGetProductsQuery({ keyword });
  const { data: categoriesData } = useGetCategoriesQuery();
  const { data: bannersData, isLoading: loadingBanners } = useGetBannersQuery(); // ✅ Fetch Admin Uploaded Banners

  const [currentSlide, setCurrentSlide] = useState(0);

  // 2. Slider Logic (Using DB Data)
  const slides = bannersData || []; // ✅ Use fetched banners instead of static

  // 3. Scroll Restoration
  useEffect(() => {
    const savedPosition = sessionStorage.getItem("homeScrollPosition");
    if (savedPosition) {
      setTimeout(() => {
        window.scrollTo(0, parseInt(savedPosition));
        sessionStorage.removeItem("homeScrollPosition"); 
      }, 100);
    } else {
      window.scrollTo(0, 0);
    }
  }, [loadingProducts]); 

  const saveScrollPosition = useCallback(() => {
    sessionStorage.setItem("homeScrollPosition", window.scrollY);
  }, []);

  // 4. Slider Auto-Play
  useEffect(() => {
    if (slides.length > 0 && !keyword) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
      }, 5000); 
      return () => clearInterval(timer);
    }
  }, [slides.length, keyword]);

  // 5. Add To Cart Handler
  const addToCartHandler = (product) => {
    dispatch(addToCart({ ...product, qty: 1 }));
    toast.success(`${product.name} added to cart!`);
  };

  // 6. Products Processing (Latest 20)
  const displayProducts = useMemo(() => {
    if (!productsData) return [];
    
    let allProducts = Array.isArray(productsData) ? productsData : productsData.products || [];
    
    // Reverse logic (Sort by Latest Date)
    if (!keyword) {
        return [...allProducts]
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) // ✅ Sort by Latest
          .slice(0, 20); // ✅ Limit to 20
    }
    return allProducts;
  }, [productsData, keyword]);

  // 7. Categories Processing
  const displayCategories = useMemo(() => {
      if(!categoriesData) return [];
      return categoriesData.slice(0, 4); 
  }, [categoriesData]);

  return (
    <div style={{ background: '#F0F8FF', paddingBottom: '0px', fontFamily: "'Poppins', sans-serif" }}>
      
      <style>{CSS_OVERRIDES}</style>

      {/* ✅ 1. HERO SLIDER (Using Admin Uploaded Images) */}
      {!keyword && slides.length > 0 && (
      <div className="slider-container">
        {slides.map((slide, index) => (
          <div 
            key={slide._id}
            className={`slide-item ${index === currentSlide ? 'active' : ''}`}
            // Use 'image' property from DB banner model
            style={{ backgroundImage: `url(${slide.image})` }} 
          />
        ))}

        <div style={STYLES.sliderOverlay}></div>

        <div style={STYLES.heroContent} className="hero-content-wrapper">
          <p style={STYLES.tagline}>Pakistan’s Trusted Sportswear Brand</p>
          <h1 style={STYLES.heroHeading} className="hero-heading-text">Premium Sportswear for <br /> Performance & Style</h1>
          <p style={STYLES.subheading}>Football • Cricket • Gym Wear • Tracksuits</p>
          
          <button onClick={() => navigate('/products')} style={STYLES.heroBtn} className="cta-btn">
            Shop Sportswear
          </button>
        </div>

        <button onClick={() => setCurrentSlide(currentSlide === 0 ? slides.length - 1 : currentSlide - 1)} style={STYLES.navBtnLeft} className="nav-btn-hover nav-arrow-btn">❮</button>
        <button onClick={() => setCurrentSlide(currentSlide === slides.length - 1 ? 0 : currentSlide + 1)} style={STYLES.navBtnRight} className="nav-btn-hover nav-arrow-btn">❯</button>
        
        <div style={STYLES.dotsContainer}>
          {slides.map((_, i) => (
            <span key={i} style={{ ...STYLES.dot, backgroundColor: currentSlide === i ? '#FF6F00' : 'rgba(255,255,255,0.5)' }} />
          ))}
        </div>
      </div>
      )}

      <div className="main-container" style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 20px' }}>
        
        {keyword && (
            <Link to="/" style={{display: 'inline-flex', alignItems: 'center', marginTop: '20px', color: '#002147', fontWeight: 'bold', textDecoration: 'none'}}>
                &larr; Back to Home
            </Link>
        )}

        {/* ✅ 2. CATEGORIES SECTION */}
        {!keyword && (
        <div className="hide-on-mobile">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '60px', marginBottom: '30px' }}>
            <div>
                <h2 style={STYLES.sectionTitle}>Shop by Category</h2>
                <p style={{color: '#002147', opacity: 0.7, fontSize: '14px', margin: 0}}>Explore our premium collections</p>
            </div>
            <button onClick={() => navigate('/categories')} className="cta-btn" style={STYLES.seeAllButton}>
                View All
            </button>
            </div>

            <div style={STYLES.categoryGrid}>
            {displayCategories.length > 0 ? (
                displayCategories.map((cat) => (
                <div 
                    key={cat._id} 
                    style={STYLES.categoryCard} 
                    className="category-card"
                    onClick={() => navigate(`/category/${cat.name}`)}
                >
                    <div style={{width: '100%', height: '100%', overflow: 'hidden'}}>
                    <img src={cat.image || 'https://via.placeholder.com/300'} alt={cat.name} style={STYLES.categoryImg} className="hover-zoom-img" />
                    </div>
                    <div style={STYLES.categoryOverlay}>
                    <span>{cat.name}</span>
                    </div>
                </div>
                ))
            ) : (
                <p style={{fontSize: '14px', color: '#888'}}>Loading categories...</p>
            )}
            </div>
        </div>
        )}

        {/* ✅ 3. LATEST PRODUCTS (15-20 Updates) */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: keyword ? '30px' : '80px', marginBottom: '20px' }}>
          <div>
            <h2 style={STYLES.sectionTitle}>{keyword ? `Results for "${keyword}"` : 'Just For You'}</h2>
            {!keyword && <p style={{fontSize: '14px', color: '#002147', opacity: 0.7}}>Check out our latest arrivals</p>}
          </div>
          
          {!keyword && (
            <button onClick={() => navigate('/products')} style={STYLES.seeAllButton} className="cta-btn">
                See All <i className="fa-solid fa-arrow-right" style={{marginLeft: '8px'}}></i>
            </button>
          )}
        </div>

        {loadingProducts ? (
           <Loader />
        ) : error ? (
           <Message variant='danger'>{error?.data?.message || error.error}</Message>
        ) : (
          <>
          <div className="horizontal-scroll-container">
            {displayProducts.map(product => (
              <div key={product._id} style={STYLES.productCard} className="product-card-hover product-card-mobile">
                
                <Link to={`/product/${product._id}`} style={{textDecoration: 'none'}} onClick={saveScrollPosition}>
                  <div style={STYLES.prodImageWrapper} className="prod-image-wrapper-mobile">
                    {/* Handles both old simple image and new color-based images */}
                    <img 
                        src={product.colors?.[0]?.images?.[0] || product.image} 
                        alt={product.name} 
                        style={STYLES.prodImage} 
                    />
                  </div>
                </Link>

                <div style={STYLES.productInfo}>
                  <Link to={`/product/${product._id}`} style={{ textDecoration: 'none', color: '#002147' }} onClick={saveScrollPosition}>
                    <h3 style={STYLES.productName} className="prod-name-mobile">{product.name}</h3>
                  </Link>

                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px'}}>
                      <p style={STYLES.productPrice} className="prod-price-mobile">Rs {product.price}</p>
                      <p style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: product.countInStock <= 0 ? '#e74c3c' : '#27ae60' }}>
                        {product.countInStock <= 0 ? 'Sold Out' : 'In Stock'}
                      </p>
                  </div>

                  <button className="cta-btn cta-btn-mobile" onClick={() => addToCartHandler(product)} disabled={product.countInStock <= 0} style={{ ...STYLES.addToCartBtn, background: product.countInStock <= 0 ? '#bdc3c7' : '#FF6F00' }}>
                    {product.countInStock <= 0 ? 'Out of Stock' : 'Add to Cart'}
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          {displayProducts.length === 0 && (
              <div style={{textAlign:'center', padding:'50px', color:'#666'}}>No products found.</div>
          )}
          </>
        )}

      </div>

      {/* ✅ 4. ABOUT US SECTION (Unchanged) */}
      {!keyword && (
      <section id="about-section" style={STYLES.aboutSection}>
        <div style={STYLES.aboutContainer} className="about-container-mobile">
          
          <div style={STYLES.aboutContent}>
            <div style={STYLES.aboutDivider} className="about-divider-mobile"></div>
            
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }} className="about-header-mobile">
               <i className="fa-solid fa-medal" style={{ color: '#002147', fontSize: '24px', marginRight: '10px' }}></i>
               <span style={{ color: '#002147', fontWeight: '800', letterSpacing: '1px' }}>SPORTSGEAR</span>
            </div>

            <h2 style={STYLES.aboutHeading} className="about-heading-mobile">ELEVATE YOUR STYLE & PERFORMANCE</h2>
            
            <p style={STYLES.aboutText} className="about-text-mobile">
              SportsGear is your ultimate destination for premium sportswear. We specialize in 
              high-quality <strong>tracksuits, football jerseys, and activewear</strong> designed for modern athletes.
              Combining breathable fabrics with cutting-edge designs, we ensure you stay 
              comfortable and stylish.
            </p>

            <button onClick={() => navigate('/products')} style={STYLES.aboutBtn} className="cta-btn">
              Discover More
            </button>
          </div>

          <div style={STYLES.aboutImageWrapper}>
            <img src="https://images.unsplash.com/photo-1517466787929-bc90951d0974?q=80&w=1000" alt="Model" style={STYLES.aboutImage} />
          </div>

        </div>
      </section>
      )}

    </div>
  );
}

// ✅ STATIC STYLES
const STYLES = {
  sliderOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 33, 71, 0.55)', zIndex: 3 },
  heroContent: { position: 'absolute', top: '50%', left: '10%', transform: 'translateY(-50%)', zIndex: 4, color: '#F0F8FF', maxWidth: '550px' },
  tagline: { fontSize: '15px', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '10px', color: '#FF6F00', fontWeight: '600' },
  heroHeading: { fontSize: '42px', fontWeight: '800', lineHeight: '1.2', marginBottom: '15px' },
  subheading: { fontSize: '17px', marginBottom: '30px', opacity: 0.9, fontWeight: '500' },
  heroBtn: { padding: '14px 35px', fontSize: '16px', fontWeight: 'bold', color: '#fff', backgroundColor: '#FF6F00', border: 'none', borderRadius: '50px', cursor: 'pointer', transition: '0.3s' },
  navBtnLeft: { position: 'absolute', left: '25px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.2)', color: '#fff', border: 'none', padding: '15px 20px', cursor: 'pointer', zIndex: 10, borderRadius: '50%', fontSize: '20px', backdropFilter: 'blur(5px)', transition: '0.3s' },
  navBtnRight: { position: 'absolute', right: '25px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.2)', color: '#fff', border: 'none', padding: '15px 20px', cursor: 'pointer', zIndex: 10, borderRadius: '50%', fontSize: '20px', backdropFilter: 'blur(5px)', transition: '0.3s' },
  dotsContainer: { position: 'absolute', bottom: '30px', width: '100%', display: 'flex', justifyContent: 'center', gap: '10px', zIndex: 4 },
  dot: { width: '12px', height: '12px', borderRadius: '50%', transition: '0.3s' },
  sectionTitle: { fontSize: '28px', fontWeight: '800', color: '#002147', margin: '0 0 5px 0' },
  seeAllButton: { background: 'transparent', border: '2px solid #FF6F00', color: '#002147', padding: '8px 25px', borderRadius: '30px', fontWeight: '700', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', transition: '0.3s' },
  categoryGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '25px' },
  categoryCard: { position: 'relative', height: '280px', borderRadius: '16px', overflow: 'hidden', cursor: 'pointer', boxShadow: '0 10px 20px rgba(0,0,0,0.1)' },
  categoryImg: { width: '100%', height: '100%', objectFit: 'cover' },
  categoryOverlay: { position: 'absolute', bottom: 0, width: '100%', height: '80px', background: 'linear-gradient(to top, rgba(0, 33, 71, 0.6), rgba(0, 33, 71, 0.4))', display: 'flex', alignItems: 'flex-end', padding: '20px', color: '#F0F8FF', fontWeight: 'bold', fontSize: '18px' },
  productCard: { minWidth: '280px', maxWidth: '280px', backgroundColor: '#fff', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 5px 15px rgba(0,0,0,0.05)', position: 'relative', border: '1px solid rgba(0,0,0,0.03)' },
  prodImageWrapper: { height: '260px', padding: '20px', backgroundColor: '#f9f9f9', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  prodImage: { width: '100%', height: '100%', objectFit: 'contain' },
  productInfo: { padding: '20px' },
  productName: { fontSize: '16px', fontWeight: '700', margin: '0 0 10px 0', height: '44px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' },
  productPrice: { fontSize: '20px', color: '#002147', fontWeight: '800', margin: 0 },
  addToCartBtn: { width: '100%', padding: '12px', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '14px', fontWeight: 'bold', transition: '0.3s' },
  aboutSection: { backgroundColor: '#F0F8FF', padding: '100px 20px', display: 'flex', justifyContent: 'center', marginTop: '40px', borderTop: '1px solid rgba(0,33,71,0.05)' },
  aboutContainer: { maxWidth: '1100px', width: '100%', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '80px' },
  aboutContent: { flex: '1', minWidth: '300px' },
  aboutDivider: { width: '60px', height: '4px', backgroundColor: '#00A8E8', marginBottom: '25px', borderRadius: '2px' },
  aboutHeading: { color: '#002147', fontSize: '36px', fontWeight: '800', marginBottom: '25px', lineHeight: '1.2' },
  aboutText: { color: '#002147', fontSize: '16px', lineHeight: '1.7', marginBottom: '35px', opacity: 0.8 },
  aboutBtn: { display: 'inline-block', backgroundColor: '#FF6F00', color: 'white', padding: '14px 35px', borderRadius: '30px', textDecoration: 'none', fontWeight: 'bold', border: 'none', cursor: 'pointer', fontSize: '15px' },
  aboutImageWrapper: { flex: '1', minWidth: '300px' },
  aboutImage: { width: '100%', borderRadius: '20px', boxShadow: '0 20px 40px rgba(0,33,71,0.15)' }
};

export default HomeScreen;