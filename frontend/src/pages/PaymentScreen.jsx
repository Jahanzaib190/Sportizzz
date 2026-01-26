import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { savePaymentMethod } from '../slices/cartSlice';
import CheckoutSteps from '../components/CheckoutSteps';
import { FaMoneyBillWave, FaMobileAlt } from 'react-icons/fa'; 

// ✅ EXACT STYLES (Matching Shipping & Cart Design)
const STYLES = {
  container: { background: '#f4f7f9', minHeight: '80vh', padding: '40px 20px', fontFamily: "'Poppins', sans-serif" },
  formCard: { background: '#fff', padding: '40px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #fff', maxWidth: '600px', margin: '0 auto' },
  heading: { fontSize: '28px', fontWeight: '800', color: '#002147', marginBottom: '30px', textAlign: 'center' },
  subHeading: { fontSize: '16px', color: '#666', marginBottom: '20px', fontWeight: '500' },
  
  // Payment Options
  optionCard: { 
    display: 'flex', alignItems: 'center', gap: '15px', padding: '20px', 
    border: '2px solid #eee', borderRadius: '12px', cursor: 'pointer', transition: '0.2s', marginBottom: '15px' 
  },
  activeOption: { borderColor: '#FF6F00', backgroundColor: '#fff5e6' },
  disabledOption: { opacity: 0.5, cursor: 'not-allowed', backgroundColor: '#f9f9f9' },
  
  icon: { fontSize: '24px', color: '#002147' },
  activeIcon: { color: '#FF6F00' },
  
  label: { fontSize: '16px', fontWeight: 'bold', color: '#002147' },
  badge: { fontSize: '10px', background: '#FF6F00', color: 'white', padding: '2px 8px', borderRadius: '10px', marginLeft: 'auto' },

  button: { width: '100%', padding: '16px', background: '#FF6F00', color: '#fff', border: 'none', borderRadius: '50px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', transition: '0.3s', marginTop: '20px' }
};

const PaymentScreen = () => {
  const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery');

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const cart = useSelector((state) => state.cart);
  const { shippingAddress } = cart;

  useEffect(() => {
    if (!shippingAddress.address) {
      navigate('/shipping');
    }
  }, [shippingAddress, navigate]);

  const submitHandler = (e) => {
    e.preventDefault();
    dispatch(savePaymentMethod(paymentMethod));
    navigate('/placeorder');
  };

  return (
    <div style={STYLES.container}>
      
      {/* Progress Steps */}
      <div style={{maxWidth: '600px', margin: '0 auto 40px auto'}}>
         <CheckoutSteps step1 step2 step3 />
      </div>

      <div style={STYLES.formCard} className="fade-in">
        <h1 style={STYLES.heading}>Payment Method</h1>
        <p style={STYLES.subHeading}>Select how you'd like to pay</p>

        <form onSubmit={submitHandler}>

          {/* Option 1: Cash on Delivery (ACTIVE) */}
          <label 
            style={{
              ...STYLES.optionCard,
              ...(paymentMethod === 'Cash on Delivery' ? STYLES.activeOption : {})
            }}
          >
            <input
              type="radio"
              name="paymentMethod"
              value="Cash on Delivery"
              checked={paymentMethod === 'Cash on Delivery'}
              onChange={(e) => setPaymentMethod(e.target.value)}
              style={{ accentColor: '#FF6F00', width: '20px', height: '20px' }}
            />
            <FaMoneyBillWave style={paymentMethod === 'Cash on Delivery' ? STYLES.activeIcon : STYLES.icon} />
            <span style={STYLES.label}>Cash on Delivery</span>
          </label>

          {/* Option 2: Easypaisa (DISABLED) */}
          <label style={{...STYLES.optionCard, ...STYLES.disabledOption}}>
            <input type="radio" name="paymentMethod" disabled style={{ width: '20px', height: '20px' }} />
            <FaMobileAlt style={STYLES.icon} />
            <div style={{display: 'flex', flexDirection: 'column'}}>
               <span style={{...STYLES.label, color: '#888'}}>Easypaisa</span>
            </div>
            <span style={STYLES.badge}>Coming Soon</span>
          </label>

          {/* Option 3: JazzCash (DISABLED) */}
          <label style={{...STYLES.optionCard, ...STYLES.disabledOption}}>
            <input type="radio" name="paymentMethod" disabled style={{ width: '20px', height: '20px' }} />
            <FaMobileAlt style={STYLES.icon} />
            <div style={{display: 'flex', flexDirection: 'column'}}>
               <span style={{...STYLES.label, color: '#888'}}>JazzCash</span>
            </div>
            <span style={STYLES.badge}>Coming Soon</span>
          </label>

          <button type="submit" style={STYLES.button} className="primary-btn">
            Continue
          </button>
        </form>
      </div>
    </div>
  );
};

export default PaymentScreen;