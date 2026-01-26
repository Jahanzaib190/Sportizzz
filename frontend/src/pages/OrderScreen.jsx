import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import Loader from '../components/Loader';
import Message from '../components/Message';
import { 
  useGetOrderDetailsQuery, 
  useUpdateOrderStatusMutation 
} from '../slices/ordersApiSlice';

// ✅ PROFESSIONAL STYLES (Clean & Sleek)
const CSS_OVERRIDES = `
  .order-container { background: #F0F8FF; min-height: 100vh; padding: 40px 20px; font-family: 'Poppins', sans-serif; }
  .grid-layout { display: grid; grid-template-columns: 2fr 1fr; gap: 30px; }
  
  .card-box { background: white; padding: 25px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.03); margin-bottom: 20px; border: 1px solid #eee; }
  .section-title { font-size: 18px; font-weight: 700; color: #002147; margin-bottom: 15px; border-bottom: 1px solid #f0f0f0; padding-bottom: 10px; display: flex; align-items: center; gap: 10px; }
  
  .info-row { display: flex; margin-bottom: 12px; font-size: 14px; color: #555; }
  .info-label { font-weight: 600; color: #002147; width: 120px; flex-shrink: 0; }
  
  .item-row { display: flex; align-items: center; justify-content: space-between; padding: 12px 0; border-bottom: 1px dashed #eee; }
  .item-img { width: 50px; height: 50px; border-radius: 6px; object-fit: cover; border: 1px solid #ddd; }
  
  .summary-row { display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 14px; color: #555; }
  .total-row { display: flex; justify-content: space-between; margin-top: 15px; padding-top: 15px; border-top: 2px solid #002147; font-weight: 800; font-size: 18px; color: #002147; }
  
  /* Status Badges */
  .status-box { padding: 10px; border-radius: 6px; font-weight: 600; text-align: center; font-size: 13px; margin-top: 15px; display: flex; align-items: center; justify-content: center; gap: 8px; }
  .status-success { background: #e6f4ea; color: #1e7e34; border: 1px solid #1e7e34; }
  .status-danger { background: #fce8e6; color: #c5221f; border: 1px solid #c5221f; }
  .status-info { background: #e8f0fe; color: #1967d2; border: 1px solid #1967d2; }
  .status-warn { background: #fff8e1; color: #b06000; border: 1px solid #b06000; }
  
  /* ✅ NEW PROFESSIONAL ACTION BUTTONS */
  .admin-actions-grid { display: grid; grid-template-columns: 1fr; gap: 10px; margin-top: 15px; }
  
  .action-btn { 
    width: 100%; padding: 12px; border-radius: 8px; font-weight: 600; font-size: 14px; 
    cursor: pointer; transition: all 0.3s ease; display: flex; align-items: center; justify-content: center; gap: 8px; border: none;
  }
  
  /* Ship: Navy Blue */
  .btn-ship { background: #002147; color: white; }
  .btn-ship:hover { background: #003366; transform: translateY(-2px); box-shadow: 0 4px 10px rgba(0, 33, 71, 0.2); }

  /* Deliver: Orange */
  .btn-deliver { background: #FF6F00; color: white; }
  .btn-deliver:hover { background: #e65c00; transform: translateY(-2px); box-shadow: 0 4px 10px rgba(255, 111, 0, 0.2); }

  /* Cancel: Outlined Red (Cleaner look) */
  .btn-cancel { background: transparent; border: 1px solid #d32f2f; color: #d32f2f; }
  .btn-cancel:hover { background: #fff5f5; color: #b71c1c; border-color: #b71c1c; }

  @media (max-width: 768px) {
    .grid-layout { grid-template-columns: 1fr; }
    .card-box { padding: 20px; }
  }
`;

const OrderScreen = () => {
  const { id: orderId } = useParams();

  const { data: order, refetch, isLoading, error } = useGetOrderDetailsQuery(orderId);
  const [updateStatus, { isLoading: loadingStatus }] = useUpdateOrderStatusMutation();
  
  const { userInfo } = useSelector((state) => state.auth);

  // Status Helper
  const getStatusUI = (status) => {
    switch (status) {
        case 'Delivered': return { class: 'status-success', icon: 'fa-circle-check', text: 'Delivered' };
        case 'Shipped': return { class: 'status-info', icon: 'fa-truck-fast', text: 'Shipped' };
        case 'Cancelled': return { class: 'status-danger', icon: 'fa-ban', text: 'Cancelled' };
        default: return { class: 'status-warn', icon: 'fa-clock', text: 'Processing' };
    }
  };

  // Action Handler
  const handleStatusChange = async (newStatus) => {
    if (window.confirm(`Mark order as ${newStatus}?`)) {
        try {
            await updateStatus({ orderId, status: newStatus }).unwrap();
            refetch();
            toast.success(`Order Updated: ${newStatus}`);
        } catch (err) {
            toast.error(err?.data?.message || err.error);
        }
    }
  };

  return (
    <div className="order-container fade-up">
      <style>{CSS_OVERRIDES}</style>
      
      {isLoading ? (
        <Loader />
      ) : error ? (
        <Message variant='danger'>{error?.data?.message || error.error}</Message>
      ) : (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          
          {/* Header */}
          <div style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
             <div>
                <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#002147', margin: 0 }}>Order Details</h1>
                <p style={{ color: '#666', fontSize: '14px' }}>ID: <span style={{fontWeight:'bold', color: '#FF6F00'}}>#{order._id}</span></p>
             </div>
             <Link to={userInfo.isAdmin ? "/admin/orderlist" : "/my-orders"} style={{ textDecoration: 'none', color: '#002147', fontWeight: 'bold', border: '2px solid #002147', padding: '8px 24px', borderRadius: '30px', transition: '0.3s' }}>
                &larr; Back
             </Link>
          </div>

          <div className="grid-layout">
            
            {/* LEFT: Order Info */}
            <div>
               {/* Shipping */}
               <div className="card-box">
                  <h2 className="section-title"><i className="fa-solid fa-truck" style={{color: '#FF6F00'}}></i> Shipping Info</h2>
                  <div className="info-row"><span className="info-label">Name:</span> <span>{order.user?.name}</span></div>
                  <div className="info-row"><span className="info-label">Email:</span> <span style={{color:'#FF6F00'}}>{order.user?.email}</span></div>
                  <div className="info-row"><span className="info-label">Address:</span> <span>{order.shippingAddress.address}, {order.shippingAddress.city}</span></div>
                  
                  <div className={`status-box ${getStatusUI(order.status).class}`}>
                     <i className={`fa-solid ${getStatusUI(order.status).icon}`}></i> {getStatusUI(order.status).text}
                  </div>
               </div>

               {/* Payment */}
               <div className="card-box">
                  <h2 className="section-title"><i className="fa-solid fa-credit-card" style={{color: '#FF6F00'}}></i> Payment</h2>
                  <div className="info-row"><span className="info-label">Method:</span> <span style={{textTransform:'capitalize'}}>{order.paymentMethod}</span></div>
                  
                  {order.isPaid ? (
                    <div className="status-box status-success"><i className="fa-solid fa-check"></i> Paid ({order.paidAt?.substring(0, 10)})</div>
                  ) : (
                    <div className="status-box status-danger"><i className="fa-solid fa-circle-exclamation"></i> Not Paid</div>
                  )}
               </div>

               {/* Items */}
               <div className="card-box">
                  <h2 className="section-title"><i className="fa-solid fa-box" style={{color: '#FF6F00'}}></i> Items</h2>
                  {order.orderItems.map((item, index) => (
                    <div key={index} className="item-row">
                       <div style={{display:'flex', alignItems:'center', gap:'15px'}}>
                          <img src={item.image} alt={item.name} className="item-img" />
                          <Link to={`/product/${item.product}`} style={{textDecoration:'none', color:'#002147', fontWeight:'600'}}>
                             {item.name}
                          </Link>
                       </div>
                       <div style={{fontSize:'14px', color:'#555'}}>
                          {item.qty} x Rs {item.price.toLocaleString()} = <span style={{fontWeight:'bold', color:'#002147'}}>Rs {(item.qty * item.price).toLocaleString()}</span>
                       </div>
                    </div>
                  ))}
               </div>
            </div>

            {/* RIGHT: Summary & Actions */}
            <div>
               <div className="card-box" style={{position: 'sticky', top: '20px'}}>
                  <h2 className="section-title">Summary</h2>
                  <div className="summary-row"><span>Items</span><span>Rs {order.itemsPrice?.toLocaleString()}</span></div>
                  <div className="summary-row"><span>Shipping</span><span>Rs {order.shippingPrice?.toLocaleString()}</span></div>
                  <div className="summary-row"><span>Tax</span><span>Rs {order.taxPrice?.toLocaleString()}</span></div>
                  <div className="total-row"><span>Total</span><span style={{color: '#FF6F00'}}>Rs {order.totalPrice?.toLocaleString()}</span></div>

                  {/* ✅ ADMIN ACTION BUTTONS (Sleek Grid) */}
                  {loadingStatus && <Loader />}
                  
                  {userInfo && userInfo.isAdmin && order.status !== 'Cancelled' && (
                     <div style={{marginTop: '25px', paddingTop: '20px', borderTop: '1px solid #eee'}}>
                        <p style={{fontSize:'11px', color:'#888', marginBottom:'10px', textTransform:'uppercase', letterSpacing:'1px', fontWeight:'700'}}>Update Status</p>
                        
                        <div className="admin-actions-grid">
                            {/* Mark Shipped */}
                            {order.status !== 'Shipped' && order.status !== 'Delivered' && (
                                <button onClick={() => handleStatusChange('Shipped')} className="action-btn btn-ship">
                                    <i className="fa-solid fa-truck-fast"></i> Mark Shipped
                                </button>
                            )}

                            {/* Mark Delivered */}
                            {order.status !== 'Delivered' && (
                                <button onClick={() => handleStatusChange('Delivered')} className="action-btn btn-deliver">
                                    <i className="fa-solid fa-box-check"></i> Mark Delivered
                                </button>
                            )}

                            {/* Cancel Order (Outlined Red Button) */}
                            {order.status !== 'Delivered' && (
                                <button onClick={() => handleStatusChange('Cancelled')} className="action-btn btn-cancel">
                                    <i className="fa-solid fa-ban"></i> Cancel Order
                                </button>
                            )}
                        </div>
                     </div>
                  )}

                  {order.status === 'Cancelled' && (
                      <div style={{marginTop: '20px', padding: '12px', background: '#ffebeb', color: '#c62828', textAlign: 'center', borderRadius: '8px', fontSize: '13px', fontWeight: 'bold', border: '1px solid #ffcdd2'}}>
                          <i className="fa-solid fa-circle-info"></i> This order is cancelled.
                      </div>
                  )}
                  
               </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default OrderScreen;