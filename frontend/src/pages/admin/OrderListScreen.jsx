import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useGetOrdersQuery } from '../../slices/ordersApiSlice';
import Loader from '../../components/Loader';
import Message from '../../components/Message';
import { FaTimes, FaCheck } from 'react-icons/fa';

// ✅ PROFESSIONAL ADMIN STYLES
const CSS_OVERRIDES = `
  /* Table Styles */
  .order-main-table { width: 100%; border-collapse: separate; border-spacing: 0 10px; }
  .order-main-table thead tr { background: transparent; }
  .order-main-table th { padding: 15px; color: #555; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; border: none; }
  
  .order-main-table tbody tr { background: white; box-shadow: 0 2px 5px rgba(0,0,0,0.02); transition: 0.2s; }
  .order-main-table tbody tr:hover { transform: translateY(-2px); box-shadow: 0 5px 15px rgba(0,0,0,0.05); }
  .order-main-table td { padding: 15px; font-size: 14px; border-top: 1px solid #f0f0f0; border-bottom: 1px solid #f0f0f0; }
  .order-main-table td:first-child { border-left: 1px solid #f0f0f0; border-top-left-radius: 8px; border-bottom-left-radius: 8px; }
  .order-main-table td:last-child { border-right: 1px solid #f0f0f0; border-top-right-radius: 8px; border-bottom-right-radius: 8px; }

  /* Status Badges */
  .badge-status { padding: 6px 12px; border-radius: 30px; font-size: 11px; font-weight: 700; text-transform: uppercase; display: inline-flex; align-items: center; gap: 6px; }
  
  .status-delivered { background: #e6f4ea; color: #1e7e34; border: 1px solid #1e7e34; }
  .status-shipped { background: #e8f0fe; color: #1967d2; border: 1px solid #1967d2; }
  .status-cancelled { background: #fce8e6; color: #c5221f; border: 1px solid #c5221f; }
  .status-pending { background: #fff8e1; color: #b06000; border: 1px solid #b06000; } /* Processing */

  /* Inputs */
  .search-input { padding: 12px 15px; border: 1px solid #ddd; border-radius: 50px; outline: none; width: 300px; font-size: 14px; transition: 0.3s; }
  .search-input:focus { border-color: #FF6F00; box-shadow: 0 0 0 3px rgba(255, 111, 0, 0.1); }

  /* Mobile */
  .mobile-order-card { display: none; }

  @media (max-width: 768px) {
    .order-main-table { display: none; }
    .mobile-order-card { display: block; background: white; padding: 20px; border-radius: 12px; margin-bottom: 15px; border: 1px solid #eee; box-shadow: 0 2px 8px rgba(0,0,0,0.03); }
    .search-input { width: 100%; margin-top: 10px; }
    .header-flex { flex-direction: column; align-items: flex-start; gap: 10px; }
  }
`;

const OrderListScreen = () => {
  const { data: orders, isLoading, error } = useGetOrdersQuery();
  const [searchTerm, setSearchTerm] = useState('');

  // Client-side filtering logic
  const filteredOrders = useMemo(() => {
    if (!orders) return [];
    return orders.filter(o => 
      o._id.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (o.user && o.user.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [orders, searchTerm]);

  // Helper for Badge Styles
  const getStatusClass = (status) => {
      switch (status) {
          case 'Delivered': return 'status-delivered';
          case 'Shipped': return 'status-shipped';
          case 'Cancelled': return 'status-cancelled';
          default: return 'status-pending';
      }
  };

  return (
    <div style={{ padding: '30px', background: '#f4f7f9', minHeight: '100vh', fontFamily: "'Poppins', sans-serif" }}>
      <style>{CSS_OVERRIDES}</style>

      {/* HEADER */}
      <div className="header-flex" style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'30px'}}>
        <div>
            <h1 style={{fontSize:'28px', fontWeight:'800', color: '#002147', margin: 0}}>Orders Management</h1>
            <p style={{color: '#666', fontSize:'14px', margin: '5px 0 0 0'}}>Total Orders: {filteredOrders.length}</p>
        </div>
        <input 
          type="text" 
          placeholder="🔍 Search Order ID or User..." 
          className="search-input"
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {isLoading ? <Loader /> : error ? <Message variant='danger'>{error?.data?.message || error.error}</Message> : (
        <div>
          
          {/* DESKTOP TABLE */}
          <table className="order-main-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>USER</th>
                <th>DATE</th>
                <th>TOTAL</th>
                <th>STATUS</th> {/* ✅ NEW COLUMN */}
                <th>PAID</th>
                <th>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map(order => (
                <tr key={order._id}>
                  <td style={{fontWeight:'700', color:'#007185'}}>#{order._id.substring(0, 10)}...</td>
                  <td>{order.user && order.user.name}</td>
                  <td>{order.createdAt.substring(0, 10)}</td>
                  <td style={{fontWeight:'800', color: '#002147'}}>Rs {order.totalPrice.toLocaleString()}</td>
                  
                  {/* ✅ STATUS BADGE */}
                  <td>
                    <span className={`badge-status ${getStatusClass(order.status || 'Pending')}`}>
                        {order.status || 'Pending'}
                    </span>
                  </td>

                  {/* PAID STATUS */}
                  <td>
                    {order.isPaid ? (
                        <span style={{color:'green', fontWeight:'bold', display:'flex', alignItems:'center', gap:'5px', fontSize:'12px'}}>
                            <FaCheck /> {order.paidAt.substring(0, 10)}
                        </span>
                    ) : (
                        <FaTimes style={{color:'red', fontSize:'14px'}} />
                    )}
                  </td>

                  <td>
                    <Link to={`/order/${order._id}`} style={{background: '#002147', color:'white', padding: '8px 16px', borderRadius: '30px', textDecoration: 'none', fontSize: '12px', fontWeight: 'bold', display:'inline-block'}}>
                        Details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* MOBILE CARDS */}
          <div className="mobile-order-list">
             {filteredOrders.map(order => (
                <div key={order._id} className="mobile-order-card">
                   <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '15px', borderBottom:'1px dashed #eee', paddingBottom:'10px'}}>
                      <span style={{fontWeight: '700', color: '#002147'}}>#{order._id.substring(0, 10)}</span>
                      <span className={`badge-status ${getStatusClass(order.status || 'Pending')}`}>
                          {order.status || 'Pending'}
                      </span>
                   </div>
                   
                   <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', fontSize:'13px', color:'#555', marginBottom:'15px'}}>
                       <div><i className="fa-solid fa-user"></i> {order.user && order.user.name}</div>
                       <div style={{textAlign:'right'}}><i className="fa-solid fa-calendar"></i> {order.createdAt.substring(0, 10)}</div>
                       
                       <div style={{fontWeight:'bold', color:'#FF6F00'}}>Rs {order.totalPrice.toLocaleString()}</div>
                       <div style={{textAlign:'right'}}>
                           {order.isPaid ? <span style={{color:'green'}}>Paid ✅</span> : <span style={{color:'red'}}>Unpaid ❌</span>}
                       </div>
                   </div>

                   <Link to={`/order/${order._id}`} style={{display:'block', textAlign:'center', background: '#f0f2f5', padding: '10px', borderRadius: '8px', textDecoration: 'none', fontSize: '13px', color: '#333', fontWeight:'bold', border:'1px solid #ddd'}}>
                       View Full Details &rarr;
                   </Link>
                </div>
             ))}
          </div>

          {filteredOrders.length === 0 && (
              <div style={{textAlign:'center', padding:'40px', color:'#888'}}>No orders found matching your search.</div>
          )}

        </div>
      )}
    </div>
  );
};

export default OrderListScreen;