import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useGetProductsQuery } from '../slices/productsApiSlice';
import { useGetCategoriesQuery } from '../slices/categoriesApiSlice';
import { useGetBannersQuery } from '../slices/bannersApiSlice'; 
import { addToCart } from '../slices/cartSlice';
import Product from '../components/Product'; // ✅ Using common Product component for identical style
import Loader from '../components/Loader';
import Message from '../components/Message';
import { toast } from 'react-toastify';

const CSS_OVERRIDES = `
  .slider-container { position: relative; width: 100%; height: 600px; overflow: hidden; background-color: #000; }
  .slide-item { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background-size: cover; background-position: center; opacity: 0; transition: opacity 1s ease-in-out; z-index: 1; }
  .slide-item.active { opacity: 1; z-index: 2; }

  /* ✅ GRID FIXED TO MATCH PRODUCTS SCREEN */
  .product-grid-home {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    padding: 20px 0;
  }

  @media (min-width: 768px) {
    .product-grid-home {
      grid-template-columns: repeat(3, 1fr);
      gap: 24px;
    }
  }

  @media (min-width: 1024px) {
    .product-grid-home {
      grid-template-columns: repeat(4, 1fr);
    }
  }

  @media (min-width: 1280px) {
    .product-grid-home {
      grid-template-columns: repeat(5, 1fr);
    }
  }

  .hover-zoom-img { transition: transform 0.5s ease; }
  .category-card:hover .hover-zoom-img { transform: scale(1.1); }
  
  .cta-btn { transition: all 0.3s ease; }
  .cta-btn:hover { 
    background-color: #FF6F00 !important; 
    color: #F0F8FF !important;
    border-color: #FF6F00 !important;
    box-shadow: 0 4px 15px rgba(255, 111, 0, 0.4); 
    transform: translateY(-2px); 
  }
  .nav-btn-hover:hover { background: rgba(255,255,255,0.4) !important; }

  @media (max-width: 768px) {
    .hide-on-mobile { display: none !important; }
    .slider-container { height: 400px !important; }
    .hero-content-wrapper { 
        left: 50% !important; top: 50% !important; transform: translate(-50%, -50%) !important; 
        width: 90% !important; text-align: center; 
    }
    .hero-heading-text { font-size: 28px !important; }
    .about-container-mobile { flex-direction: column-reverse !important; text-align: center; gap: 30px !important; }
  }
`;

const HomeScreen = () => {
  const { keyword } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { data: productsData, isLoading: loadingProducts, error } = useGetProductsQuery({ keyword });
  const { data: categoriesData } = useGetCategoriesQuery();
  const { data: bannersData } = useGetBannersQuery();

  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = bannersData || [];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [loadingProducts]); 

  useEffect(() => {
    if (slides.length > 0 && !keyword) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
      }, 5000); 
      return () => clearInterval(timer);
    }
  }, [slides.length, keyword]);

  const displayProducts = useMemo(() => {
    if (!productsData) return [];
    let allProducts = Array.isArray(productsData) ? productsData : productsData.products || [];
    if (!keyword) {
        return [...allProducts]
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 20); 
    }
    return allProducts;
  }, [productsData, keyword]);

  const displayCategories = useMemo(() => {
      if(!categoriesData) return [];
      return categoriesData.slice(0, 4); 
  }, [categoriesData]);

  return (
    <div style={{ background: '#F0F8FF', paddingBottom: '0px', fontFamily: "'Poppins', sans-serif" }}>
      <style>{CSS_OVERRIDES}</style>

      {!keyword && slides.length > 0 && (
      <div className="slider-container">
        {slides.map((slide, index) => (
          <div key={slide._id} className={`slide-item ${index === currentSlide ? 'active' : ''}`} style={{ backgroundImage: `url(${slide.image})` }} />
        ))}
        <div style={STYLES.sliderOverlay}></div>
        <div style={STYLES.heroContent} className="hero-content-wrapper">
          <p style={STYLES.tagline}>Pakistan’s Trusted Sportswear Brand</p>
          <h1 style={STYLES.heroHeading} className="hero-heading-text">Premium Sportswear for <br /> Performance & Style</h1>
          <button onClick={() => navigate('/products')} style={STYLES.heroBtn} className="cta-btn">Shop Sportswear</button>
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
            <button onClick={() => navigate('/')} style={{display: 'flex', alignItems: 'center', gap: '8px', border: 'none', background: 'transparent', marginTop: '20px', color: '#002147', fontWeight: 'bold', cursor: 'pointer'}}>
               &larr; Back to Home
            </button>
        )}

        {!keyword && (
        <div className="hide-on-mobile">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '60px', marginBottom: '30px' }}>
              <div>
                  <h2 style={STYLES.sectionTitle}>Shop by Category</h2>
                  <p style={{color: '#002147', opacity: 0.7, fontSize: '14px', margin: 0}}>Explore our premium collections</p>
              </div>
              <button onClick={() => navigate('/categories')} className="cta-btn" style={STYLES.seeAllButton}>View All</button>
            </div>
            <div style={STYLES.categoryGrid}>
              {displayCategories.map((cat) => (
                <div key={cat._id} style={STYLES.categoryCard} className="category-card" onClick={() => navigate(`/category/${cat.name}`)}>
                    <img src={cat.image || 'https://via.placeholder.com/300'} alt={cat.name} style={STYLES.categoryImg} className="hover-zoom-img" />
                    <div style={STYLES.categoryOverlay}><span>{cat.name}</span></div>
                </div>
              ))}
            </div>
        </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: keyword ? '30px' : '80px', marginBottom: '20px' }}>
          <div>
            <h2 style={STYLES.sectionTitle}>{keyword ? `Results for "${keyword}"` : 'Just For You'}</h2>
            {!keyword && <p style={{fontSize: '14px', color: '#002147', opacity: 0.7}}>Check out our latest arrivals</p>}
          </div>
          {!keyword && (
            <button onClick={() => navigate('/products')} style={STYLES.seeAllButton} className="cta-btn">See All &rarr;</button>
          )}
        </div>

        {loadingProducts ? <Loader /> : error ? <Message variant='danger'>{error?.data?.message || error.error}</Message> : (
          <div className="product-grid-home">
            {displayProducts.map(product => (
              <Product key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>

      {!keyword && (
      <section id="about-section" style={STYLES.aboutSection}>
        <div style={STYLES.aboutContainer} className="about-container-mobile">
          <div style={STYLES.aboutContent}>
            <div style={STYLES.aboutDivider}></div>
            <h2 style={STYLES.aboutHeading}>ELEVATE YOUR STYLE & PERFORMANCE</h2>
            <p style={STYLES.aboutText}>SportsGear is your ultimate destination for premium sportswear.</p>
            <button onClick={() => navigate('/products')} style={STYLES.aboutBtn} className="cta-btn">Discover More</button>
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

const STYLES = {
  sliderOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 33, 71, 0.55)', zIndex: 3 },
  heroContent: { position: 'absolute', top: '50%', left: '10%', transform: 'translateY(-50%)', zIndex: 4, color: '#F0F8FF', maxWidth: '550px' },
  tagline: { fontSize: '15px', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '10px', color: '#FF6F00', fontWeight: '600' },
  heroHeading: { fontSize: '42px', fontWeight: '800', lineHeight: '1.2', marginBottom: '15px' },
  heroBtn: { padding: '14px 35px', fontSize: '16px', fontWeight: 'bold', color: '#fff', backgroundColor: '#FF6F00', border: 'none', borderRadius: '50px', cursor: 'pointer' },
  navBtnLeft: { position: 'absolute', left: '25px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.2)', color: '#fff', border: 'none', padding: '15px 20px', cursor: 'pointer', zIndex: 10, borderRadius: '50%', fontSize: '20px', backdropFilter: 'blur(5px)' },
  navBtnRight: { position: 'absolute', right: '25px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.2)', color: '#fff', border: 'none', padding: '15px 20px', cursor: 'pointer', zIndex: 10, borderRadius: '50%', fontSize: '20px', backdropFilter: 'blur(5px)' },
  dotsContainer: { position: 'absolute', bottom: '30px', width: '100%', display: 'flex', justifyContent: 'center', gap: '10px', zIndex: 4 },
  dot: { width: '12px', height: '12px', borderRadius: '50%', transition: '0.3s' },
  sectionTitle: { fontSize: '28px', fontWeight: '800', color: '#002147', margin: '0 0 5px 0' },
  seeAllButton: { background: 'transparent', border: '2px solid #FF6F00', color: '#002147', padding: '8px 25px', borderRadius: '30px', fontWeight: '700', fontSize: '14px', cursor: 'pointer' },
  categoryGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '25px' },
  categoryCard: { position: 'relative', height: '280px', borderRadius: '16px', overflow: 'hidden', cursor: 'pointer', boxShadow: '0 10px 20px rgba(0,0,0,0.1)' },
  categoryImg: { width: '100%', height: '100%', objectFit: 'cover' },
  categoryOverlay: { position: 'absolute', bottom: 0, width: '100%', height: '80px', background: 'linear-gradient(to top, rgba(0, 33, 71, 0.6), rgba(0, 33, 71, 0.4))', display: 'flex', alignItems: 'flex-end', padding: '20px', color: '#F0F8FF', fontWeight: 'bold', fontSize: '18px' },
  aboutSection: { backgroundColor: '#F0F8FF', padding: '100px 20px', display: 'flex', justifyContent: 'center', marginTop: '40px' },
  aboutContainer: { maxWidth: '1100px', width: '100%', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '80px' },
  aboutContent: { flex: '1', minWidth: '300px' },
  aboutDivider: { width: '60px', height: '4px', backgroundColor: '#00A8E8', marginBottom: '25px', borderRadius: '2px' },
  aboutHeading: { color: '#002147', fontSize: '36px', fontWeight: '800', marginBottom: '25px', lineHeight: '1.2' },
  aboutText: { color: '#002147', fontSize: '16px', lineHeight: '1.7', marginBottom: '35px', opacity: 0.8 },
  aboutBtn: { display: 'inline-block', backgroundColor: '#FF6F00', color: 'white', padding: '14px 35px', borderRadius: '30px', fontWeight: 'bold', border: 'none', cursor: 'pointer' },
  aboutImageWrapper: { flex: '1', minWidth: '300px' },
  aboutImage: { width: '100%', borderRadius: '20px', boxShadow: '0 20px 40px rgba(0,33,71,0.15)' }
};

export default HomeScreen;