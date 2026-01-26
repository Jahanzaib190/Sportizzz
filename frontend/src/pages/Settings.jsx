import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useProfileMutation } from '../slices/usersApiSlice';
import { setCredentials } from '../slices/authSlice';
import Loader from '../components/Loader';
import { FaUser, FaShieldAlt, FaArrowLeft, FaCamera } from 'react-icons/fa';

const Settings = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [activeTab, setActiveTab] = useState('personal'); // 'personal' or 'security'
  
  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Redux
  const { userInfo } = useSelector((state) => state.auth);
  const [updateProfile, { isLoading }] = useProfileMutation();

  useEffect(() => {
    if (userInfo) {
      setName(userInfo.name);
      setEmail(userInfo.email);
    }
  }, [userInfo]);

  const submitHandler = async (e) => {
    e.preventDefault();
    if (activeTab === 'security' && password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    try {
      const res = await updateProfile({ 
        _id: userInfo._id, 
        name, 
        email, 
        password 
      }).unwrap();
      
      dispatch(setCredentials({ ...res }));
      toast.success('Profile Updated Successfully');
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-[85vh] font-sans bg-[#F0F8FF]">
      
      {/* --- SIDEBAR (Left) --- */}
      <div className="w-full md:w-1/4 bg-[#002147] text-white p-6 flex flex-col items-center md:items-start shadow-xl relative z-10">
        
        {/* Header / Avatar */}
        <div className="mb-8 text-center md:text-left border-b border-white/10 pb-6 w-full flex flex-col items-center md:items-start">
          <div className="w-20 h-20 bg-[#FF6F00] rounded-full flex items-center justify-center text-3xl font-bold mb-3 shadow-lg relative group cursor-pointer border-4 border-white/10">
            {userInfo?.name?.charAt(0).toUpperCase()}
            {/* Hover Camera Icon */}
            <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <FaCamera className="text-white text-sm" />
            </div>
          </div>
          <h3 className="text-xl font-bold tracking-wide">{userInfo?.name}</h3>
          <p className="text-blue-200 text-xs">{userInfo?.email}</p>
        </div>

        {/* Navigation Menu */}
        <div className="flex flex-col gap-3 w-full">
          <button 
            onClick={() => setActiveTab('personal')}
            className={`flex items-center gap-3 px-5 py-3 rounded-lg text-sm font-semibold transition-all duration-300 w-full text-left ${
                activeTab === 'personal' 
                ? 'bg-[#FF6F00] text-white shadow-md translate-x-1' 
                : 'text-gray-300 hover:bg-white/10 hover:text-white hover:pl-6'
            }`}
          >
            <FaUser /> Personal Info
          </button>

          <button 
            onClick={() => setActiveTab('security')}
            className={`flex items-center gap-3 px-5 py-3 rounded-lg text-sm font-semibold transition-all duration-300 w-full text-left ${
                activeTab === 'security' 
                ? 'bg-[#FF6F00] text-white shadow-md translate-x-1' 
                : 'text-gray-300 hover:bg-white/10 hover:text-white hover:pl-6'
            }`}
          >
            <FaShieldAlt /> Security
          </button>
        </div>

        {/* Back Button */}
        <div className="mt-auto w-full pt-6 border-t border-white/10">
            <button 
                onClick={() => navigate('/profile')}
                className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors text-sm font-medium"
            >
                <FaArrowLeft /> Back to Dashboard
            </button>
        </div>
      </div>

      {/* --- CONTENT AREA (Right) --- */}
      <div className="w-full md:w-3/4 p-6 md:p-12 bg-white md:bg-[#F0F8FF]">
        
        {/* Tab 1: Personal Info */}
        {activeTab === 'personal' && (
          <div className="animate-fade-in-up max-w-2xl bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-2xl font-extrabold text-[#002147] mb-2">Personal Information</h2>
            <p className="text-gray-500 mb-8 text-sm">Manage your personal details and contact info.</p>

            <form onSubmit={submitHandler} className="space-y-6">
              <div>
                <label className="block text-[#002147] font-bold mb-2 text-sm">Full Name</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#FF6F00] focus:ring-2 focus:ring-[#FF6F00]/20 transition-all font-medium text-[#002147]"
                  placeholder="Enter your name"
                />
              </div>

              <div>
                <label className="block text-[#002147] font-bold mb-2 text-sm">Email Address</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#FF6F00] focus:ring-2 focus:ring-[#FF6F00]/20 transition-all font-medium text-[#002147]"
                  placeholder="Enter your email"
                />
              </div>

              {/* Note: Phone/Address inputs removed temporarily as standard User Model only has Name/Email. 
                  If you updated the backend model, let me know to add them back! */}

              <div className="pt-4">
                  <button type="submit" className="bg-[#002147] text-white px-8 py-3.5 rounded-xl font-bold hover:bg-[#FF6F00] transition-all duration-300 shadow-lg hover:-translate-y-1 w-full md:w-auto" disabled={isLoading}>
                    {isLoading ? 'Saving Changes...' : 'Save Changes'}
                  </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab 2: Security */}
        {activeTab === 'security' && (
          <div className="animate-fade-in-up max-w-2xl bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-2xl font-extrabold text-[#002147] mb-2">Login & Security</h2>
            <p className="text-gray-500 mb-8 text-sm">Ensure your account is secure with a strong password.</p>

            <form onSubmit={submitHandler} className="space-y-6">
              <div>
                <label className="block text-[#002147] font-bold mb-2 text-sm">New Password</label>
                <input 
                  type="password" 
                  placeholder="Min 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#FF6F00] focus:ring-2 focus:ring-[#FF6F00]/20 transition-all"
                />
              </div>

              <div>
                <label className="block text-[#002147] font-bold mb-2 text-sm">Confirm Password</label>
                <input 
                  type="password" 
                  placeholder="Retype new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#FF6F00] focus:ring-2 focus:ring-[#FF6F00]/20 transition-all"
                />
              </div>

              <div className="pt-4">
                  <button type="submit" className="bg-[#002147] text-white px-8 py-3.5 rounded-xl font-bold hover:bg-[#FF6F00] transition-all duration-300 shadow-lg hover:-translate-y-1 w-full md:w-auto" disabled={isLoading}>
                    {isLoading ? 'Updating...' : 'Update Password'}
                  </button>
              </div>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};

export default Settings;