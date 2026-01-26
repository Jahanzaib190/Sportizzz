import { useNavigate } from 'react-router-dom';
import { useGetCategoriesQuery } from '../slices/categoriesApiSlice';
import Loader from '../components/Loader';
import Message from '../components/Message';

// ✅ PROFESSIONAL STYLES (Navy Blue & Orange)
const CSS_OVERRIDES = `
  .category-card-item:hover { transform: scale(1.03); box-shadow: 0 15px 35px rgba(0, 33, 71, 0.15) !important; }
  .category-card-item:hover img { transform: scale(1.1); }
  .view-btn:hover { background: #FF6F00 !important; color: #fff !important; box-shadow: 0 0 15px rgba(255, 111, 0, 0.6); border-color: #FF6F00 !important; }
  .back-btn:hover { background-color: #FF6F00 !important; color: #fff !important; border-color: #FF6F00 !important; }
  .fade-up { animation: fadeInUp 0.6s ease-out; }
  @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

  @media (max-width: 768px) {
    .category-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 15px !important; }
    .category-card-item { height: 200px !important; border-radius: 12px !important; }
    .cat-name { font-size: 18px !important; margin-bottom: 10px !important; }
    .view-btn { padding: 8px 15px !important; font-size: 11px !important; }
    .cat-overlay { padding: 15px !important; }
    .header-title { font-size: 28px !important; margin-top: 10px !important; }
    .header-desc { font-size: 14px !important; }
  }
`;

const CategoryListPage = () => {
  const navigate = useNavigate();
  // ✅ Using Redux Query Hook
  const { data: categories, isLoading, error } = useGetCategoriesQuery();

  return (
    <div style={{ background: '#F0F8FF', minHeight: '100vh', padding: '40px 20px', fontFamily: "'Poppins', sans-serif" }}>
      
      <style>{CSS_OVERRIDES}</style>

      <div className="main-container fade-up" style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* HEADER */}
        <div style={{ marginBottom: '40px' }}>
          <button onClick={() => navigate(-1)} className="back-btn" style={STYLES.backBtn}>
            <i className="fa-solid fa-arrow-left"></i> Back
          </button>

          <h2 style={STYLES.headerTitle} className="header-title">Explore Collections</h2>
          <p style={STYLES.headerDesc} className="header-desc">Find the best gear for your favorite sports</p>
        </div>
        
        {/* GRID */}
        {isLoading ? (
          <Loader />
        ) : error ? (
          <Message variant='danger'>{error?.data?.message || error.error}</Message>
        ) : (
          <div style={STYLES.grid} className="category-grid">
            {categories.map((cat) => (
              <div 
                key={cat._id} 
                className="category-card-item"
                style={STYLES.card} 
                onClick={() => navigate(`/category/${cat.name}`)}
              >
                {/* Image */}
                <img src={cat.image} alt={cat.name} style={STYLES.img} />
                
                {/* Overlay & Text */}
                <div style={STYLES.overlay} className="cat-overlay">
                  <h3 style={STYLES.catName} className="cat-name">{cat.name}</h3>
                  <button className="view-btn" style={STYLES.viewBtn}>View Collection</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// STYLES OBJECT
const STYLES = {
  backBtn: { display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'transparent', border: '2px solid #002147', padding: '8px 24px', borderRadius: '30px', cursor: 'pointer', fontSize: '14px', fontWeight: '700', color: '#002147', transition: 'all 0.3s ease' },
  headerTitle: { fontSize: '36px', fontWeight: '800', color: '#002147', margin: '20px 0 5px 0' },
  headerDesc: { color: '#002147', fontSize: '16px', opacity: 0.8, margin: 0 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '30px' },
  card: { position: 'relative', height: '350px', borderRadius: '20px', overflow: 'hidden', cursor: 'pointer', boxShadow: '0 10px 25px rgba(0,0,0,0.08)', transition: 'transform 0.3s ease, box-shadow 0.3s ease', background: '#fff' },
  img: { width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' },
  overlay: { position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0, 33, 71, 0.9), rgba(0, 33, 71, 0.1))', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center', padding: '30px', textAlign: 'center' },
  catName: { margin: '0 0 15px 0', fontSize: '26px', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase', color: '#F0F8FF', textShadow: '0 2px 10px rgba(0,0,0,0.3)' },
  viewBtn: { padding: '12px 30px', fontSize: '14px', fontWeight: 'bold', background: '#FF6F00', color: '#fff', border: 'none', borderRadius: '50px', cursor: 'pointer', transition: '0.3s', textTransform: 'uppercase', letterSpacing: '0.5px' }
};

export default CategoryListPage;