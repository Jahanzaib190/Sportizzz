import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { saveShippingAddress } from '../slices/cartSlice';
import CheckoutSteps from '../components/CheckoutSteps';

// ✅ STYLES
const STYLES = {
  container: { background: '#f4f7f9', minHeight: '80vh', padding: '40px 20px', fontFamily: "'Poppins', sans-serif" },
  formCard: { background: '#fff', padding: '40px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #fff', maxWidth: '600px', margin: '0 auto' },
  heading: { fontSize: '28px', fontWeight: '800', color: '#002147', marginBottom: '30px', textAlign: 'center' },
  label: { display: 'block', fontSize: '14px', fontWeight: '700', color: '#002147', marginBottom: '8px' },
  input: { width: '100%', padding: '14px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '15px', outline: 'none', transition: '0.3s', backgroundColor: '#fff', marginBottom: '20px' },
  button: { width: '100%', padding: '16px', background: '#FF6F00', color: '#fff', border: 'none', borderRadius: '50px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', transition: '0.3s', marginTop: '10px' }
};

const ShippingScreen = () => {
  const cart = useSelector((state) => state.cart);
  const { shippingAddress } = cart;

  const [address, setAddress] = useState(shippingAddress?.address || '');
  const [city, setCity] = useState(shippingAddress?.city || '');
  const [postalCode, setPostalCode] = useState(shippingAddress?.postalCode || '');
  const [country, setCountry] = useState(shippingAddress?.country || '');

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const submitHandler = (e) => {
    e.preventDefault();
    dispatch(saveShippingAddress({ address, city, postalCode, country }));
    navigate('/payment');
  };

  return (
    <div style={STYLES.container}>
      
      {/* Progress Steps */}
      <div style={{maxWidth: '600px', margin: '0 auto 40px auto'}}>
         <CheckoutSteps step1 step2 />
      </div>

      <div style={STYLES.formCard} className="fade-in">
        <h1 style={STYLES.heading}>Shipping Address</h1>

        <form onSubmit={submitHandler}>
          
          <div>
            <label style={STYLES.label}>Address</label>
            <input
              type="text"
              required
              style={STYLES.input}
              placeholder="Enter your street address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>

          <div>
            <label style={STYLES.label}>City</label>
            <input
              type="text"
              required
              style={STYLES.input}
              placeholder="City name"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
          </div>

          <div>
            <label style={STYLES.label}>Postal Code</label>
            <input
              type="text"
              required
              style={STYLES.input}
              placeholder="Zip / Postal Code"
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
            />
          </div>

          <div>
            <label style={STYLES.label}>Country</label>
            <input
              type="text"
              required
              style={STYLES.input}
              placeholder="Country Name"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
            />
          </div>

          <button type="submit" style={STYLES.button} className="primary-btn">
            Continue to Payment
          </button>
        </form>
      </div>
    </div>
  );
};

export default ShippingScreen;