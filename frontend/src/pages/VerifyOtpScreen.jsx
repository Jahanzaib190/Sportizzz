import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useVerifyOtpMutation } from '../slices/usersApiSlice';
import { setCredentials } from '../slices/authSlice';
import { toast } from 'react-toastify';
import loginBg from '../assets/login.png';

const THEME = {
  bg: '#F0F8FF',
  primary: '#002147',
  orange: '#FF6F00',
  white: '#ffffff'
};

const CSS_OVERRIDES = `
  .otp-input {
    width: 50px;
    height: 50px;
    font-size: 24px;
    text-align: center;
    border: 2px solid #002147;
    border-radius: 8px;
    margin: 0 5px;
    font-weight: bold;
  }
  .otp-input:focus {
    outline: none;
    border-color: #FF6F00;
    box-shadow: 0 0 0 3px rgba(255, 111, 0, 0.1);
  }
  .verify-btn:hover:not(:disabled) { 
    transform: scale(1.03); 
    box-shadow: 0 8px 20px rgba(0, 33, 71, 0.3); 
  }
  @media (max-width: 768px) {
    .otp-container { 
      background-image: none !important; 
      background-color: #F0F8FF !important; 
      justify-content: center !important; 
    }
    .otp-overlay { display: none !important; }
    .content-wrapper { 
      margin-right: 0 !important; 
      width: 100% !important; 
      padding: 20px !important; 
    }
    .otp-card { 
      width: 100% !important; 
      max-width: 400px !important; 
      box-shadow: 0 10px 25px rgba(0,0,0,0.1) !important; 
    }
    .otp-input {
      width: 45px;
      height: 45px;
      font-size: 20px;
      margin: 0 3px;
    }
  }
`;

const VerifyOtpScreen = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [email, setEmail] = useState('');
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [verifyOtp, { isLoading }] = useVerifyOtpMutation();

  useEffect(() => {
    // Get email from navigation state or localStorage
    const emailFromState = location.state?.email;
    const emailFromStorage = localStorage.getItem('pendingEmail');
    
    if (emailFromState) {
      setEmail(emailFromState);
      localStorage.setItem('pendingEmail', emailFromState);
    } else if (emailFromStorage) {
      setEmail(emailFromStorage);
    } else {
      toast.error('Please register first');
      navigate('/register');
    }
  }, [location, navigate]);

  const handleOtpChange = (index, value) => {
    // Only allow numbers
    if (!/^\d*$/.test(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Move to previous input on backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    
    if (!/^\d+$/.test(pastedData)) {
      toast.error('Please paste only numbers');
      return;
    }

    const newOtp = pastedData.split('');
    setOtp([...newOtp, ...Array(6 - newOtp.length).fill('')]);
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    
    const otpCode = otp.join('');
    
    if (otpCode.length !== 6) {
      toast.error('Please enter complete 6-digit OTP');
      return;
    }

    try {
      const res = await verifyOtp({ email, otp: otpCode }).unwrap();
      dispatch(setCredentials({ ...res }));
      localStorage.removeItem('pendingEmail');
      toast.success('Account Verified Successfully!');
      navigate('/');
    } catch (err) {
      toast.error(err?.data?.message || err.error);
      setOtp(['', '', '', '', '', '']); // Clear OTP on error
      document.getElementById('otp-0')?.focus();
    }
  };

  return (
    <>
      <style>{CSS_OVERRIDES}</style>

      <div style={STYLES.fullPageContainer} className="fade-up otp-container">
        <div style={STYLES.overlay} className="otp-overlay"></div>

        <div style={STYLES.contentWrapper} className="content-wrapper">
          <div style={{...STYLES.card, backgroundColor: THEME.bg}} className="otp-card">
            
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
              <div style={{ 
                width: '80px', 
                height: '80px', 
                background: THEME.orange, 
                borderRadius: '50%', 
                margin: '0 auto 20px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                fontSize: '36px'
              }}>
                ✉️
              </div>
              <h2 style={{ color: THEME.primary, fontSize: '28px', fontWeight: '800', margin: '0 0 10px 0' }}>
                Verify Your Email
              </h2>
              <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>
                We sent a 6-digit code to<br/>
                <strong>{email}</strong>
              </p>
            </div>

            <form onSubmit={submitHandler}>
              
              {/* OTP Input Boxes */}
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '30px' }} onPaste={handlePaste}>
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    maxLength="1"
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="otp-input"
                    autoFocus={index === 0}
                  />
                ))}
              </div>

              {/* Verify Button */}
              <button 
                type="submit" 
                className="verify-btn"
                disabled={isLoading || otp.join('').length !== 6}
                style={{
                  ...STYLES.button, 
                  backgroundColor: THEME.primary,
                  opacity: (isLoading || otp.join('').length !== 6) ? 0.5 : 1,
                  cursor: (isLoading || otp.join('').length !== 6) ? 'not-allowed' : 'pointer'
                }}
              >
                {isLoading ? 'Verifying...' : 'Verify Account'}
              </button>
            </form>
            
            {/* Resend Link */}
            <p style={{ marginTop: '25px', textAlign: 'center', fontSize: '14px', color: '#666' }}>
              Didn't receive the code? 
              <button 
                onClick={() => toast.info('Resend feature coming soon')}
                style={{ 
                  color: THEME.orange, 
                  fontWeight: '700', 
                  marginLeft: '5px', 
                  background: 'none', 
                  border: 'none', 
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                Resend
              </button>
            </p>

          </div>
        </div>
      </div>
    </>
  );
};

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
    position: 'absolute', 
    top: 0, 
    left: 0, 
    width: '100%', 
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.6)', 
    zIndex: 1
  },
  contentWrapper: {
    position: 'relative', 
    zIndex: 2, 
    marginRight: '10%', 
    width: 'auto'
  },
  card: { 
    padding: '50px 40px', 
    width: '500px', 
    maxWidth: '90vw',
    borderRadius: '30px', 
    boxShadow: '0 15px 35px rgba(0,0,0,0.2)', 
    border: '1px solid rgba(255,255,255,0.2)'
  },
  button: { 
    width: '100%', 
    padding: '16px', 
    color: '#fff', 
    border: 'none', 
    borderRadius: '12px',
    fontWeight: 'bold', 
    fontSize: '16px', 
    boxShadow: '0 5px 15px rgba(0,33,71,0.2)', 
    transition: 'all 0.3s ease'
  }
};

export default VerifyOtpScreen;
