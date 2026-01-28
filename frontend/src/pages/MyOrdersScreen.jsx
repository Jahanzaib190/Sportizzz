import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useGetMyOrdersQuery } from '../slices/ordersApiSlice';
import useScrollToTop from '../utils/useScrollToTop';
import Loader from '../components/Loader';
import Message from '../components/Message';

// ✅ PROFESSIONAL STYLES
const CSS_OVERRIDES = `
  /* --- DESKTOP DEFAULTS --- */
  .order-card { transition: all 0.3s ease; border: 1px solid transparent; }
  .order-card:hover { transform: translateY(-5px); box-shadow: 0 15px 30px rgba(0, 33, 71, 0.08) !important; border-color: rgba(0, 33, 71, 0.05); }
  
  .tab-btn { transition: all 0.2s ease; }
  .tab-btn:hover { color: #FF6F00; }
  
  .fade-in { animation: fadeIn 0.5s ease-out; }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

  @media (max-width: 768px) {
    .main-container { padding: 0 !important; width: 100% !important; }
    .page-header { margin-bottom: 20px !important; }
    .header-title { font-size: 24px !important; }
    
    .tab-container {
        gap: 10px !important;
        padding-bottom: 10px !important;
        margin-bottom: 20px !important;
        justify-content: flex-start !important; 
        flex-wrap: nowrap !important;
        -webkit-overflow-scrolling: touch;
    }
    .tab-container::-webkit-scrollbar { display: none; }
    
    .tab-btn {
        padding: 8px 18px !important;
        font-size: 13px !important;
        flex-shrink: 0 !important;
    }

    .order-card {
        border-radius: 12px !important;
        box-shadow: 0 4px 10px rgba(0,0,0,0.03) !important;
    }
    .card-header, .card-body, .card-footer {
        padding: 15px !important;
    }

    .card-footer {
        flex-direction: column !important;
        align-items: flex-start !important;
        gap: 10px !important;
    }
    .footer-total-row {
        width: 100% !important;
        display: flex !important;
        justify-content: space-between !important;
        border-bottom: 1px dashed #eee;
        padding-bottom: 10px;
        margin-bottom: 5px;
    }
    .footer-date-row {
        font-size: 12px !important;
        color: #888 !important;
    }
  }
`;

const MyOrdersScreen = () => {
  useScrollToTop(); // ✅ Add scroll to top on page load
  
  const { data: orders, isLoading, error } = useGetMyOrdersQuery();
  const [activeTab, setActiveTab] = useState('All'); 

  // ✅ IMPROVED FILTER LOGIC (Handles COD & Statuses Correctly)
  const filteredOrders = useMemo(() => {
    if (!orders) return [];
    if (activeTab === 'All') return orders;
    
    // 1. TO PAY:
    // Sirf wo orders jo "Online Payment" hain aur "Paid" nahi hain.
    // (COD orders yahan nahi ayenge, wo seedha "To Ship" mein jayenge)
    if (activeTab === 'To Pay') {
        return orders.filter(o => !o.isPaid && o.paymentMethod !== 'Cash on Delivery' && o.status !== 'Cancelled');
    }
    
    // 2. TO SHIP (Processing):
    // Wo orders jo Paid hain YA phir COD hain. Aur Status "Processing" ya "Pending" hai.
    if (activeTab === 'To Ship') {
        return orders.filter(o => 
            (o.isPaid || o.paymentMethod === 'Cash on Delivery') && 
            (o.status === 'Processing' || o.status === 'Pending')
        );
    }
    
    // 3. TO RECEIVE (Shipped):
    // Jab Admin "Ship" karega to order yahan aayega.
    if (activeTab === 'To Receive') {
        return orders.filter(o => o.status === 'Shipped');
    }

    // 4. DELIVERED (History):
    if (activeTab === 'Delivered') { // Agar aap delivered tab add karna chahein
        return orders.filter(o => o.status === 'Delivered');
    }
    
    return orders;
  }, [orders, activeTab]);

  // Helper for Status UI
  const getStatusStyles = (status) => {
    switch (status) {
        case 'Delivered': return { bg: '#e6f4ea', color: '#1e7e34', icon: 'fa-check' }; 
        case 'Shipped': return { bg: '#e8f0fe', color: '#1967d2', icon: 'fa-truck-fast' }; 
        case 'Cancelled': return { bg: '#fce8e6', color: '#c5221f', icon: 'fa-ban' }; 
        default: return { bg: '#fff8e1', color: '#b06000', icon: 'fa-clock' }; 
    }
  };

  return (
    <div style={{ background: '#F0F8FF', minHeight: '100vh', padding: '40px 20px', fontFamily: "'Poppins', sans-serif" }}>
      <style>{CSS_OVERRIDES}</style>

      <div className="main-container fade-in" style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        {/* HEADER */}
        <div style={{ marginBottom: '30px' }} className="page-header">
          <Link to="/profile" style={{textDecoration:'none', color:'#666', fontSize:'13px', fontWeight:'600', marginBottom:'10px', display:'block'}}>
             &larr; Back to Profile
          </Link>
          <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#002147', marginBottom: '5px' }} className="header-title">My Orders</h1>
        </div>

        {/* TABS (Added 'Delivered' Tab for completeness) */}
        <div style={STYLES.tabContainer} className="tab-container">
          {['All', 'To Pay', 'To Ship', 'To Receive', 'Delivered'].map((tab) => (
            <button 
              key={tab} 
              onClick={() => setActiveTab(tab)}
              className="tab-btn"
              style={{
                ...STYLES.tab,
                backgroundColor: activeTab === tab ? '#FF6F00' : 'transparent',
                color: activeTab === tab ? '#fff' : '#002147',
                fontWeight: activeTab === tab ? '600' : '500',
                boxShadow: activeTab === tab ? '0 4px 10px rgba(255, 111, 0, 0.3)' : 'none'
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* LIST */}
        {isLoading ? (
          <Loader />
        ) : error ? (
          <Message variant='danger'>{error?.data?.message || error.error}</Message>
        ) : filteredOrders.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
            {filteredOrders.map((order) => {
               const statusUI = getStatusStyles(order.status || 'Pending');
               
               return (
                <div key={order._id} style={STYLES.card} className="order-card">
                  
                  {/* Header */}
                  <div style={STYLES.cardHeader} className="card-header">
                    <div>
                      <span style={{fontSize: '12px', color: '#565959', textTransform: 'uppercase', letterSpacing: '0.5px'}}>Order ID</span>
                      <Link to={`/order/${order._id}`} style={{textDecoration: 'none'}}>
                          <div style={{fontWeight: '700', color: '#002147', fontSize: '16px', cursor: 'pointer'}}>#{order._id.substring(0, 10).toUpperCase()}</div>
                      </Link>
                    </div>
                    
                    <span style={{ 
                      ...STYLES.statusBadge,
                      background: statusUI.bg,
                      color: statusUI.color,
                      border: `1px solid ${statusUI.color}20` 
                    }}>
                      <i className={`fa-solid ${statusUI.icon}`} style={{marginRight:'6px'}}></i> 
                      {order.status || 'Processing'}
                    </span>
                  </div>

                  {/* Items */}
                  <div style={STYLES.cardBody} className="card-body">
                    {order.orderItems.map((item, i) => (
                      <div key={i} style={STYLES.itemRow}>
                        <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                          <img src={item.image} alt={item.name} style={{width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px'}} />
                          <div>
                              <span style={{fontWeight: '600', color: '#002147', fontSize: '15px', display: 'block'}}>{item.name}</span>
                              <span style={{fontSize: '13px', color: '#777'}}>Qty: {item.qty}</span>
                          </div>
                        </div>
                        <span style={{fontWeight: '500', color: '#555'}}>Rs {item.price.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>

                  {/* Footer */}
                  <div style={STYLES.cardFooter} className="card-footer">
                    <div style={{fontSize: '14px', color: '#565959'}} className="footer-date-row">
                      Ordered on: {new Date(order.createdAt).toLocaleDateString()}
                    </div>
                    
                    <div style={{display: 'flex', alignItems: 'center', gap: '15px'}} className="footer-total-row">
                       {order.status === 'Cancelled' ? (
                          <span style={{fontSize:'13px', color:'#c5221f', background:'#fce8e6', padding:'4px 8px', borderRadius:'4px', fontWeight:'600'}}>Cancelled</span>
                       ) : order.isPaid ? (
                          <span style={{fontSize:'13px', color:'#1e7e34', background:'#e6f4ea', padding:'4px 8px', borderRadius:'4px', fontWeight:'600'}}>Paid</span>
                       ) : (
                          <span style={{fontSize:'13px', color:'#b06000', background:'#fff8e1', padding:'4px 8px', borderRadius:'4px', fontWeight:'600'}}>Unpaid (COD)</span>
                       )}

                      <div style={{display:'flex', alignItems:'center', gap:'5px'}}>
                          <span style={{fontSize: '14px', color: '#002147'}}>Total:</span>
                          <span style={{fontSize: '18px', fontWeight: '800', color: '#FF6F00'}}>Rs {order.totalPrice.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                </div>
               );
            })}
          </div>
        ) : (
          /* Empty State */
          <div style={STYLES.emptyState}>
            <div style={STYLES.emptyIconBg}>
              <i className="fa-solid fa-box-open" style={{ fontSize: '32px', color: '#FF6F00' }}></i>
            </div>
            <h3 style={{color: '#002147', margin: '15px 0 5px 0'}}>No Orders Found</h3>
            <p style={{color: '#666', fontSize: '14px'}}>
                There are no orders in the <b>{activeTab}</b> tab.
            </p>
            <Link to="/" style={{marginTop: '15px', display: 'inline-block', color: '#FF6F00', fontWeight: 'bold'}}>Start Shopping</Link>
          </div>
        )}
      </div>
    </div>
  );
};

const STYLES = {
  tabContainer: { display: 'flex', gap: '10px', marginBottom: '30px', overflowX: 'auto', paddingBottom: '5px' },
  tab: { padding: '10px 25px', borderRadius: '30px', cursor: 'pointer', fontSize: '14px', border: 'none', whiteSpace: 'nowrap' },
  card: { background: '#fff', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' },
  cardHeader: { padding: '20px 25px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff' },
  cardBody: { padding: '20px 25px' },
  cardFooter: { padding: '15px 25px', background: '#fcfcfc', borderTop: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' },
  itemRow: { display: 'flex', justifyContent: 'space-between', marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px dashed #eee' },
  statusBadge: { padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', display:'inline-flex', alignItems:'center' },
  emptyState: { textAlign: 'center', padding: '60px 20px', background: '#fff', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' },
  emptyIconBg: { width: '70px', height: '70px', background: '#fff3e0', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }
};

export default MyOrdersScreen;