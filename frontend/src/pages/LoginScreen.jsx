import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useLoginMutation } from '../slices/usersApiSlice';
import { setCredentials } from '../slices/authSlice';
import { toast } from 'react-toastify';

// ✅ Image Import (Ensure this file exists in src/assets)
import loginBg from '../assets/login.png'; 

// ✅ THEME CONSTANTS
const THEME = {
  bg: '#F0F8FF',      // Alice Blue
  primary: '#002147', // Navy Blue
  white: '#ffffff'
};

// ✅ CSS STYLES
const CSS_OVERRIDES = `
  .login-btn:hover { transform: scale(1.03); box-shadow: 0 8px 20px rgba(0, 33, 71, 0.3); }
  @media (max-width: 768px) {
    .login-container { background-image: none !important; background-color: #F0F8FF !important; justify-content: center !important; }
    .login-overlay { display: none !important; }
    .content-wrapper { margin-right: 0 !important; width: 100% !important; padding: 20px !important; }
    .login-card { width: 100% !important; max-width: 400px !important; box-shadow: 0 10px 25px rgba(0,0,0,0.1) !important; }
  }
`;

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { search } = useLocation();
  const sp = new URLSearchParams(search);
  const redirect = sp.get('redirect') || '/';

  const [login, { isLoading }] = useLoginMutation();
  const { userInfo } = useSelector((state) => state.auth);

  useEffect(() => {
    if (userInfo) {
      navigate(redirect);
    }
  }, [navigate, redirect, userInfo]);

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      const res = await login({ email, password }).unwrap();
      dispatch(setCredentials({ ...res }));
      toast.success('Login Successful');
      navigate(redirect);
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  return (
    <>
      <style>{CSS_OVERRIDES}</style>

      {/* ✅ Full Page Container */}
      <div style={STYLES.fullPageContainer} className="fade-up login-container">
        
        {/* Dark Overlay */}
        <div style={STYLES.overlay} className="login-overlay"></div>

        {/* Right Side Card */}
        <div style={STYLES.contentWrapper} className="content-wrapper">
          <div style={{...STYLES.card, backgroundColor: THEME.bg}} className="login-card">
            
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
              <h2 style={{ color: THEME.primary, fontSize: '32px', fontWeight: '800', margin: '0 0 10px 0' }}>
                Welcome Back
              </h2>
              <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>
                Sign in to access your sports gear
              </p>
            </div>

            <form onSubmit={submitHandler}>
              
              {/* Email Input */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{...STYLES.label, color: THEME.primary}}>Email Address</label>
                <input 
                  type="email" 
                  style={{...STYLES.input, borderColor: THEME.primary}} 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                  placeholder="name@example.com"
                />
              </div>

              {/* Password Input */}
              <div style={{ marginBottom: '30px' }}>
                <label style={{...STYLES.label, color: THEME.primary}}>Password</label>
                <input 
                  type="password" 
                  style={{...STYLES.input, borderColor: THEME.primary}} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                  placeholder="Enter your password"
                />
              </div>

              {/* Forgot Password Link */}
              <div style={{ textAlign: 'right', marginBottom: '20px', marginTop: '-20px' }}>
                <Link to="/forgot-password" style={{ color: '#FF6F00', fontSize: '13px', textDecoration: 'none', fontWeight: '600' }}>
                    Forgot Password?
                </Link>
              </div>

              {/* Submit Button */}
              <button 
                type="submit" 
                className="login-btn"
                disabled={isLoading}
                style={{
                  ...STYLES.button, 
                  backgroundColor: THEME.primary,
                  opacity: isLoading ? 0.7 : 1,
                  cursor: isLoading ? 'not-allowed' : 'pointer'
                }}
              >
                {isLoading ? 'Signing In...' : 'Sign In'}
              </button>
            </form>
            
            {/* Signup Link */}
            <p style={{ marginTop: '25px', textAlign: 'center', fontSize: '14px', color: '#666' }}>
              New customer? 
              <Link to={redirect ? `/register?redirect=${redirect}` : '/register'} style={{ color: THEME.primary, fontWeight: '800', marginLeft: '5px', textDecoration: 'none' }}>
                Create Account
              </Link>
            </p>

          </div>
        </div>
      </div>
    </>
  );
};

// ✅ STYLE OBJECT
const STYLES = {
  fullPageContainer: {
    backgroundImage: `url(${loginBg})`, 
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    height: '100vh',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    position: 'relative',
    overflow: 'hidden'
  },
  overlay: {
    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.6)', zIndex: 1
  },
  contentWrapper: {
    position: 'relative', zIndex: 2, marginRight: '10%', width: 'auto'
  },
  card: { 
    padding: '50px 40px', width: '450px', maxWidth: '90vw',
    borderRadius: '30px', boxShadow: '0 15px 35px rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.2)'
  },
  label: { 
    display: 'block', fontSize: '15px', fontWeight: '700', marginBottom: '8px', marginLeft: '5px' 
  },
  input: { 
    width: '100%', padding: '14px 18px', borderWidth: '2px', borderStyle: 'solid',
    borderRadius: '12px', fontSize: '15px', outline: 'none', transition: '0.3s', backgroundColor: '#fff'
  },
  button: { 
    width: '100%', padding: '16px', color: '#fff', border: 'none', borderRadius: '12px',
    fontWeight: 'bold', fontSize: '16px', boxShadow: '0 5px 15px rgba(0,33,71,0.2)', transition: 'all 0.3s ease'
  }
};

export default LoginScreen;