import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useGetCategoriesQuery, useDeleteCategoryMutation } from '../../slices/categoriesApiSlice';
import Loader from '../../components/Loader';
import Message from '../../components/Message';

const CSS_OVERRIDES = `
  .cat-card { transition: all 0.3s ease; }
  .cat-card:hover { transform: translateY(-8px); box-shadow: 0 20px 40px rgba(0,0,0,0.12) !important; }
  .add-btn:hover { background-color: #e2b93d !important; transform: translateY(-1px); }
  .edit-btn:hover { background-color: #e2b93d !important; border-color: #9c7e31 !important; }
  .delete-btn:hover { background-color: #b00 !important; }
  .img-container img { transition: transform 0.5s ease; }
  .cat-card:hover .img-container img { transform: scale(1.05); }

  @media (max-width: 768px) {
    .header-row { flex-direction: column !important; align-items: flex-start !important; gap: 15px !important; margin-bottom: 30px !important; }
    .add-new-btn { width: 100% !important; text-align: center !important; }
    .category-grid { grid-template-columns: 1fr !important; gap: 15px !important; }
    .cat-card { flex-direction: row !important; align-items: center !important; height: auto !important; padding: 10px !important; }
    .img-container { width: 80px !important; height: 80px !important; border-radius: 8px !important; flex-shrink: 0 !important; border-bottom: none !important; }
    .info-section { padding: 0 0 0 15px !important; text-align: left !important; width: 100% !important; }
    .cat-name { font-size: 16px !important; margin-bottom: 10px !important; }
    .btn-group { gap: 10px !important; }
    .action-btn { padding: 6px 0 !important; font-size: 12px !important; }
  }
`;

const CategoryListScreen = () => {
  const navigate = useNavigate();
  
  // ✅ REDUX LOGIC
  const { data: categories, isLoading, error, refetch } = useGetCategoriesQuery();
  const [deleteCategory, { isLoading: loadingDelete }] = useDeleteCategoryMutation();

  const deleteHandler = async (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await deleteCategory(id).unwrap();
        toast.success('Category deleted');
        refetch();
      } catch (err) {
        toast.error(err?.data?.message || err.error);
      }
    }
  };

  return (
    <div style={{ background: '#f4f7f9', minHeight: '100vh', padding: '40px 30px', fontFamily: "'Poppins', sans-serif" }}>
      <style>{CSS_OVERRIDES}</style>

      <div className="main-container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }} className="header-row">
          <div>
            <h2 style={{ fontSize: '32px', fontWeight: '800', color: '#131921', margin: '0 0 5px 0', letterSpacing: '-0.5px' }}>Category Management</h2>
            <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>Manage your store categories.</p>
          </div>
          <button onClick={() => navigate('/admin/category/create')} className="add-btn add-new-btn" style={STYLES.addBtn}>
            + Create Category
          </button>
        </div>

        {loadingDelete && <Loader />}
        
        {isLoading ? (
          <Loader />
        ) : error ? (
          <Message variant='danger'>{error?.data?.message || error.error}</Message>
        ) : (
          <div style={STYLES.grid} className="category-grid">
            {categories.map((cat) => (
              <div key={cat._id} style={STYLES.card} className="cat-card">
                
                {/* Image Section */}
                <div style={STYLES.imgContainer} className="img-container">
                  <img src={cat.image} alt={cat.name} style={STYLES.img} />
                </div>

                {/* Info Section */}
                <div style={STYLES.info} className="info-section">
                  <h3 style={STYLES.catName} className="cat-name">{cat.name}</h3>
                  
                  <div style={STYLES.btnGroup} className="btn-group">
                    <button 
                        onClick={() => navigate(`/admin/category/${cat._id}/edit`)} 
                        style={STYLES.editBtn} 
                        className="edit-btn action-btn"
                    >
                        Edit
                    </button>
                    <button 
                        onClick={() => deleteHandler(cat._id)} 
                        style={STYLES.deleteBtn} 
                        className="delete-btn action-btn"
                    >
                        Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Styles
const STYLES = {
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '30px' },
  card: { background: '#fff', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(0,0,0,0.03)', boxShadow: '0 6px 20px rgba(0,0,0,0.06)', position: 'relative', display: 'flex', flexDirection: 'column' },
  imgContainer: { width: '100%', height: '170px', overflow: 'hidden', backgroundColor: '#f9f9f9', borderBottom: '1px solid #f0f0f0' },
  img: { width: '100%', height: '100%', objectFit: 'cover' },
  info: { padding: '20px', textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' },
  catName: { fontSize: '18px', fontWeight: '700', marginBottom: '20px', color: '#131921', lineHeight: '1.4' },
  addBtn: { backgroundColor: '#f0c14b', border: '1px solid #a88734', padding: '12px 24px', borderRadius: '8px', fontSize: '14px', fontWeight: '700', color: '#111', cursor: 'pointer', transition: '0.3s', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' },
  btnGroup: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' },
  editBtn: { background: '#fff', border: '1px solid #f0c14b', color: '#111', padding: '10px 0', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px', transition: '0.2s', backgroundColor: '#fff9f0' },
  deleteBtn: { background: '#d00', color: '#fff', border: '1px solid #b00', padding: '10px 0', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px', transition: '0.2s', boxShadow: '0 2px 5px rgba(221, 0, 0, 0.2)' }
};

export default CategoryListScreen;