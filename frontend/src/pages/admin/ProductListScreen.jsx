import { Link, useNavigate, useParams } from 'react-router-dom';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import { 
  useGetProductsQuery, 
  useDeleteProductMutation 
} from '../../slices/productsApiSlice';
import Loader from '../../components/Loader';
import Message from '../../components/Message';
import Paginate from '../../components/Paginate';
import { toast } from 'react-toastify';

// ✅ SHOPIFY-STYLE CSS OVERRIDES
const CSS_OVERRIDES = `
  .product-row { transition: all 0.2s ease-in-out; }
  .product-row:hover { background-color: #f8f9fa; transform: translateY(-1px); box-shadow: 0 2px 5px rgba(0,0,0,0.02); }
  
  .add-new-btn { background-color: #002147 !important; color: white !important; border-radius: 8px !important; padding: 10px 20px !important; font-weight: 600 !important; font-size: 14px !important; transition: 0.3s !important; border: none !important; display: flex; align-items: center; gap: 8px; }
  .add-new-btn:hover { background-color: #FF6F00 !important; transform: translateY(-2px); box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
  
  .product-thumb { width: 50px; height: 50px; border-radius: 6px; object-fit: cover; border: 1px solid #e5e7eb; background: #f9fafb; }
  
  .stock-badge { padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 700; text-transform: uppercase; }
  .in-stock { background: #dcfce7; color: #166534; }
  .out-stock { background: #fee2e2; color: #991b1b; }

  /* Mobile Styles */
  .mobile-product-card { display: none; }
  @media (max-width: 768px) {
    .product-table { display: none !important; }
    .mobile-product-card { display: flex; gap: 15px; background: white; padding: 15px; border-radius: 10px; margin-bottom: 12px; box-shadow: 0 2px 6px rgba(0,0,0,0.04); border: 1px solid #f0f0f0; }
    .header-row { flex-direction: row !important; align-items: center !important; justify-content: space-between !important; }
    .header-title { font-size: 24px !important; }
    .add-new-btn { padding: 8px 15px !important; font-size: 12px !important; }
  }
`;

const ProductListScreen = () => {
  const { pageNumber } = useParams();
  const navigate = useNavigate();

  // Fetch Products
  const { data, isLoading, error, refetch } = useGetProductsQuery({ 
    pageNumber: pageNumber || 1 
  });

  const [deleteProduct, { isLoading: loadingDelete }] = useDeleteProductMutation();

  const deleteHandler = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct(id).unwrap();
        toast.success('Product Deleted');
        refetch();
      } catch (err) {
        toast.error(err?.data?.message || err.error);
      }
    }
  };

  const createProductHandler = () => {
    navigate('/admin/product/create');
  };

  // --- SAFE DATA HANDLING ---
  let products = [];
  let pages = 1;
  let page = 1;

  if (data) {
    if (Array.isArray(data)) {
      products = data;
    } else if (data.products) {
      products = data.products;
      pages = data.pages;
      page = data.page;
    }
  }

  return (
    <div style={{ background: '#f4f7f9', minHeight: '100vh', padding: '40px 20px', fontFamily: "'Poppins', sans-serif" }}>
      <style>{CSS_OVERRIDES}</style>
      
      <div className="main-container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* HEADER */}
        <div className="header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
            <div>
                <h1 className="header-title" style={{ fontSize: '28px', fontWeight: '800', color: '#002147', margin: 0 }}>Products</h1>
                <p style={{ color: '#666', fontSize: '14px', marginTop: '4px' }}>Manage your catalog ({products.length} items)</p>
            </div>
            
            <button onClick={createProductHandler} className="add-new-btn">
                <FaPlus /> Add Product
            </button>
        </div>

        {loadingDelete && <Loader />}

        {isLoading ? (
            <Loader />
        ) : error ? (
            <Message variant="danger">
               Error: {error?.data?.message || error.error || JSON.stringify(error)}
            </Message>
        ) : (
            <>
            <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', overflow: 'hidden', border: '1px solid #eee' }}>
                
                {/* ✅ DESKTOP TABLE (Shopify Style) */}
                <table className="product-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: '#f8f9fa', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>
                            <th style={{ padding: '15px 20px', color: '#6b7280', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', width: '80px' }}>Image</th>
                            <th style={{ padding: '15px', color: '#6b7280', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase' }}>Product Name</th>
                            <th style={{ padding: '15px', color: '#6b7280', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase' }}>Price</th>
                            <th style={{ padding: '15px', color: '#6b7280', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase' }}>Stock</th>
                            <th style={{ padding: '15px', color: '#6b7280', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase' }}>Category</th>
                            <th style={{ padding: '15px', color: '#6b7280', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase' }}>Brand</th>
                            <th style={{ padding: '15px', color: '#6b7280', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map((product) => (
                        <tr key={product._id} className="product-row" style={{ borderBottom: '1px solid #f3f4f6' }}>
                            {/* IMAGE COLUMN */}
                            <td style={{ padding: '12px 20px' }}>
                                <img 
                                    src={product.image || (product.colors && product.colors[0]?.images[0]) || '/placeholder.jpg'} 
                                    alt={product.name} 
                                    className="product-thumb"
                                />
                            </td>
                            
                            {/* NAME */}
                            <td style={{ padding: '12px 15px', fontWeight: '600', color: '#111827', fontSize:'14px' }}>
                                {product.name}
                            </td>
                            
                            {/* PRICE */}
                            <td style={{ padding: '12px 15px', fontWeight: '600', color: '#002147' }}>
                                Rs {product.price.toLocaleString()}
                            </td>

                            {/* STOCK STATUS (New) */}
                            <td style={{ padding: '12px 15px' }}>
                                {product.countInStock > 0 ? (
                                    <span className="stock-badge in-stock">In Stock ({product.countInStock})</span>
                                ) : (
                                    <span className="stock-badge out-stock">Out of Stock</span>
                                )}
                            </td>

                            {/* CATEGORY */}
                            <td style={{ padding: '12px 15px', color: '#4b5563', fontSize:'14px' }}>
                                {product.category}
                            </td>

                            {/* BRAND */}
                            <td style={{ padding: '12px 15px', color: '#4b5563', fontSize:'14px' }}>
                                {product.brand}
                            </td>

                            {/* ACTIONS */}
                            <td style={{ padding: '12px 15px', display: 'flex', gap: '12px' }}>
                                <Link to={`/admin/product/${product._id}/edit`} style={{ padding: '6px', background:'#f3f4f6', borderRadius:'4px', color: '#4b5563', display:'flex', alignItems:'center' }} title="Edit">
                                    <FaEdit />
                                </Link>
                                <button 
                                    onClick={() => deleteHandler(product._id)} 
                                    style={{ padding: '6px', background:'#fee2e2', borderRadius:'4px', border: 'none', color: '#dc2626', cursor: 'pointer', display:'flex', alignItems:'center' }}
                                    title="Delete"
                                >
                                    <FaTrash />
                                </button>
                            </td>
                        </tr>
                        ))}
                    </tbody>
                </table>

                {/* ✅ MOBILE CARDS (With Image) */}
                <div className="mobile-product-card-list">
                    {products.map((product) => (
                        <div key={product._id} className="mobile-product-card">
                            {/* Left: Image */}
                            <div style={{ flexShrink: 0 }}>
                                <img 
                                    src={product.image || (product.colors && product.colors[0]?.images[0]) || '/placeholder.jpg'} 
                                    alt={product.name} 
                                    style={{ width: '80px', height: '80px', borderRadius: '8px', objectFit: 'cover', border: '1px solid #eee' }}
                                />
                            </div>

                            {/* Right: Details */}
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                <div>
                                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
                                        <h4 style={{ margin: '0 0 5px 0', color: '#002147', fontSize: '15px', fontWeight:'700', lineHeight:'1.3' }}>{product.name}</h4>
                                        <span style={{ fontWeight: '700', color: '#FF6F00', fontSize:'14px' }}>Rs {product.price.toLocaleString()}</span>
                                    </div>
                                    <div style={{ fontSize: '12px', color: '#666', display: 'flex', gap: '8px', alignItems:'center', marginTop:'4px' }}>
                                        <span style={{ background: '#f3f4f6', padding: '2px 6px', borderRadius: '4px' }}>{product.category}</span>
                                        {product.countInStock > 0 ? (
                                            <span style={{ color: 'green', fontWeight:'600' }}>In Stock</span>
                                        ) : (
                                            <span style={{ color: 'red', fontWeight:'600' }}>Out Stock</span>
                                        )}
                                    </div>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '15px', marginTop: '10px', borderTop:'1px dashed #eee', paddingTop:'8px' }}>
                                    <Link to={`/admin/product/${product._id}/edit`} style={{ color: '#555', textDecoration: 'none', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                        <FaEdit /> Edit
                                    </Link>
                                    <button onClick={() => deleteHandler(product._id)} style={{ color: '#dc2626', border: 'none', background: 'none', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
                                        <FaTrash /> Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

            </div>

            {/* Pagination */}
            <div style={{marginTop: '25px', display: 'flex', justifyContent: 'center'}}>
                <Paginate pages={pages} page={page} isAdmin={true} />
            </div>
            </>
        )}
      </div>
    </div>
  );
};

export default ProductListScreen;