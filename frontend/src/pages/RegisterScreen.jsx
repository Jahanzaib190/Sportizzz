import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useRegisterMutation } from '../slices/usersApiSlice';
import { setCredentials } from '../slices/authSlice';
import { toast } from 'react-toastify';

// ✅ Image Import
import sidebarImage from '../assets/signup.jpg'; 

const THEME = {
  bg: '#F0F8FF', primary: '#002147', white: '#ffffff'
};

const CSS_OVERRIDES = `
  .action-btn:hover { transform: scale(1.03); box-shadow: 0 8px 20px rgba(0, 33, 71, 0.3); }
  @media (max-width: 768px) {
    .signup-container { background-image: none !important; background-color: #F0F8FF !important; justify-content: center !important; }
    .signup-overlay { display: none !important; }
    .content-wrapper { margin-right: 0 !important; width: 100% !important; padding: 20px !important; }
    .signup-card { width: 100% !important; max-width: 400px !important; box-shadow: 0 10px 25px rgba(0,0,0,0.1) !important; }
  }
`;

const RegisterScreen = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [register, { isLoading }] = useRegisterMutation();
  const { userInfo } = useSelector((state) => state.auth);

  const { search } = useLocation();
  const sp = new URLSearchParams(search);
  const redirect = sp.get('redirect') || '/';

  useEffect(() => {
    if (userInfo) {
      navigate(redirect);
    }
  }, [userInfo, redirect, navigate]);

  const submitHandler = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    } else {
      try {
        const res = await register({ name, email, password }).unwrap();
        
        // ✅ Check if OTP was sent (not user data)
        if (res.message && res.message.includes('OTP')) {
          toast.success('OTP sent to your email! Please verify.');
          navigate('/verify-otp', { state: { email } }); // ✅ Pass email to OTP page
          return;
        }
        
        // If login response received (user was logged in directly)
        dispatch(setCredentials({ ...res }));
        toast.success('Account Created Successfully!');
        navigate(redirect);
      } catch (err) {
        toast.error(err?.data?.message || err.error);
      }
    }
  };

  return (
    <>
      <style>{CSS_OVERRIDES}</style>

      {/* Container */}
      <div style={STYLES.fullPageContainer} className="fade-up signup-container">
        
        <div style={STYLES.overlay} className="signup-overlay"></div>

        {/* Card Container */}
        <div style={STYLES.contentWrapper} className="content-wrapper">
          <div style={{...STYLES.card, backgroundColor: THEME.bg}} className="signup-card">
            
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
              <h2 style={{ color: THEME.primary, fontSize: '32px', fontWeight: '800', margin: '0 0 10px 0' }}>
                Create Account
              </h2>
              <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>
                Join us for the best sports gear experience
              </p>
            </div>

            <form onSubmit={submitHandler}>
              
              <div style={{ marginBottom: '20px' }}>
                <label style={{...STYLES.label, color: THEME.primary}}>Full Name</label>
                <input 
                  type="text" 
                  style={{...STYLES.input, borderColor: THEME.primary}} 
                  placeholder="First and last name" 
                  value={name}
                  onChange={(e) => setName(e.target.value)} 
                  required 
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{...STYLES.label, color: THEME.primary}}>Email Address</label>
                <input 
                  type="email" 
                  style={{...STYLES.input, borderColor: THEME.primary}} 
                  placeholder="example@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{...STYLES.label, color: THEME.primary}}>Password</label>
                <input 
                  type="password" 
                  style={{...STYLES.input, borderColor: THEME.primary}} 
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                />
              </div>

              <div style={{ marginBottom: '30px' }}>
                <label style={{...STYLES.label, color: THEME.primary}}>Confirm Password</label>
                <input 
                  type="password" 
                  style={{...STYLES.input, borderColor: THEME.primary}} 
                  placeholder="Retype password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)} 
                  required 
                />
              </div>

              <button 
                type="submit" 
                className="action-btn"
                disabled={isLoading}
                style={{
                  ...STYLES.button, 
                  backgroundColor: THEME.primary,
                  opacity: isLoading ? 0.7 : 1,
                  cursor: isLoading ? 'not-allowed' : 'pointer'
                }}
              >
                {isLoading ? "Creating Account..." : "Register"}
              </button>
            </form>

            <p style={{ marginTop: '25px', textAlign: 'center', fontSize: '14px', color: '#666' }}>
              Already have an account? 
              <Link to={redirect ? `/login?redirect=${redirect}` : '/login'} style={{ color: THEME.primary, fontWeight: '800', marginLeft: '5px', textDecoration: 'none' }}>
                Sign In
              </Link>
            </p>

          </div>
        </div>
      </div>
    </>
  );
};

const STYLES = {
  fullPageContainer: {
    backgroundImage: `url(${sidebarImage})`, 
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    height: '100vh',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end', 
    position: 'relative'
  },
  overlay: {
    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.6)', zIndex: 1
  },
  contentWrapper: {
    position: 'relative', zIndex: 2, marginRight: '10%', width: 'auto'
  },
  card: { 
    padding: '50px 40px', width: '500px', maxWidth: '90vw', 
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
    fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', boxShadow: '0 5px 15px rgba(0,33,71,0.2)', transition: '0.3s ease'
  }
};

export default RegisterScreen;