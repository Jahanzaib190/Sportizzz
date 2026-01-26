import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useCreateOrderMutation } from '../slices/ordersApiSlice';
import { clearCartItems } from '../slices/cartSlice'; 
import CheckoutSteps from '../components/CheckoutSteps';
import Message from '../components/Message';
import Loader from '../components/Loader';

// ✅ EXACT STYLES (Matching Cart & Product Page)
const CSS_OVERRIDES = `
  .checkout-grid { display: grid; grid-template-columns: 2.5fr 1fr; gap: 30px; max-width: 1200px; margin: 0 auto; }
  .info-card { background: #fff; padding: 25px; borderRadius: 16px; box-shadow: 0 4px 15px rgba(0,0,0,0.03); margin-bottom: 20px; }
  .section-title { font-size: 18px; fontWeight: 700; color: #002147; margin-bottom: 15px; border-bottom: 1px solid #eee; padding-bottom: 10px; }
  .summary-card { background: #fff; padding: 30px; borderRadius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); position: sticky; top: 20px; }
  .place-btn { width: 100%; padding: 16px; background: #FF6F00; color: #fff; border: none; borderRadius: 50px; fontWeight: bold; fontSize: 16px; cursor: pointer; transition: 0.3s; marginTop: 20px; }
  .place-btn:hover:not(:disabled) { background: #e65c00; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(230, 92, 0, 0.3); }
  
  .item-row { display: flex; align-items: center; justify-content: space-between; padding: 15px 0; border-bottom: 1px solid #f9f9f9; }
  .item-row:last-child { border-bottom: none; }
  .item-img { width: 50px; height: 50px; border-radius: 8px; object-fit: cover; border: 1px solid #eee; margin-right: 15px; }
  
  @media (max-width: 900px) {
    .checkout-grid { display: block; }
    .summary-card { margin-top: 30px; position: static; }
  }
`;

const PlaceOrderScreen = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const cart = useSelector((state) => state.cart);

  const [createOrder, { isLoading, error }] = useCreateOrderMutation();

  useEffect(() => {
    if (!cart.shippingAddress.address) {
      navigate('/shipping');
    } else if (!cart.paymentMethod) {
      navigate('/payment');
    }
  }, [cart.paymentMethod, cart.shippingAddress.address, navigate]);

  const placeOrderHandler = async () => {
    try {
      const res = await createOrder({
        orderItems: cart.cartItems,
        shippingAddress: cart.shippingAddress,
        paymentMethod: cart.paymentMethod,
        itemsPrice: cart.itemsPrice,
        shippingPrice: cart.shippingPrice,
        taxPrice: cart.taxPrice,
        totalPrice: cart.totalPrice,
      }).unwrap();
      
      dispatch(clearCartItems());
      navigate(`/order/${res._id}`);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ background: '#f4f7f9', minHeight: '100vh', padding: '40px 20px', fontFamily: "'Poppins', sans-serif" }}>
      <style>{CSS_OVERRIDES}</style>
      
      {/* Progress Steps */}
      <div style={{maxWidth: '800px', margin: '0 auto 40px auto'}}>
         <CheckoutSteps step1 step2 step3 step4 />
      </div>

      <div className="checkout-grid fade-in">
        
        {/* LEFT SIDE: DETAILS */}
        <div>
          
          {/* 1. Shipping Info */}
          <div className="info-card">
            <h2 className="section-title">Shipping Address</h2>
            <p style={{color: '#555', lineHeight: '1.6'}}>
              <strong>Address: </strong>
              {cart.shippingAddress.address}, {cart.shippingAddress.city}, {cart.shippingAddress.postalCode}, {cart.shippingAddress.country}
            </p>
          </div>

          {/* 2. Payment Method */}
          <div className="info-card">
            <h2 className="section-title">Payment Method</h2>
            <p style={{color: '#555'}}>
              <strong>Method: </strong>
              {cart.paymentMethod}
            </p>
          </div>

          {/* 3. Order Items */}
          <div className="info-card">
            <h2 className="section-title">Order Items</h2>
            {cart.cartItems.length === 0 ? (
              <Message>Your cart is empty</Message>
            ) : (
              <div>
                {cart.cartItems.map((item, index) => (
                  <div key={index} className="item-row">
                    <div style={{display: 'flex', alignItems: 'center'}}>
                      <img src={item.selectedImage || item.image} alt={item.name} className="item-img" />
                      <div>
                          <Link to={`/product/${item.productId || item._id}`} style={{textDecoration: 'none', color: '#002147', fontWeight: '600', fontSize: '15px'}}>
                            {item.name}
                          </Link>
                          {/* Show Variant Info */}
                          <div style={{fontSize: '12px', color: '#777'}}>
                             {item.selectedColor && <span>Color: {item.selectedColor} </span>}
                             {item.selectedSize && <span>• Size: {item.selectedSize}</span>}
                          </div>
                      </div>
                    </div>
                    <div style={{color: '#555', fontSize: '14px'}}>
                      {item.qty} x Rs {item.price.toLocaleString()} = <span style={{fontWeight: 'bold', color: '#002147'}}>Rs {(item.qty * item.price).toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT SIDE: SUMMARY */}
        <div>
          <div className="summary-card">
            <h2 style={{fontSize: '22px', fontWeight: '800', color: '#002147', marginBottom: '25px', textAlign: 'center'}}>Order Summary</h2>
            
            <div style={STYLES.summaryRow}>
              <span>Items</span>
              <span>Rs {cart.itemsPrice}</span>
            </div>
            <div style={STYLES.summaryRow}>
              <span>Shipping</span>
              <span>Rs {cart.shippingPrice}</span>
            </div>
            <div style={STYLES.summaryRow}>
              <span>Tax</span>
              <span>Rs {cart.taxPrice}</span>
            </div>
            
            <div style={{...STYLES.summaryRow, borderTop: '1px solid #eee', paddingTop: '15px', marginTop: '10px', fontSize: '18px', fontWeight: 'bold', color: '#FF6F00'}}>
              <span>Total</span>
              <span>Rs {cart.totalPrice}</span>
            </div>

            {error && <Message variant='danger'>{error.data?.message || error.error}</Message>}

            <button
              type="button"
              className="place-btn"
              disabled={cart.cartItems.length === 0 || isLoading}
              onClick={placeOrderHandler}
            >
              {isLoading ? 'Processing...' : 'Place Order'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

const STYLES = {
    summaryRow: { display: 'flex', justifyContent: 'space-between', marginBottom: '12px', color: '#555', fontSize: '15px' }
};

export default PlaceOrderScreen;