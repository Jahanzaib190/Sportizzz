import { useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { logout } from '../slices/authSlice';
import { useLogoutMutation, useGetProfileQuery } from '../slices/usersApiSlice';
import { 
  FaBoxOpen, FaImages, FaChartLine, FaUsers, 
  FaTags, FaTshirt, FaUserCog, FaHistory, 
  FaLayerGroup, FaArrowRight, FaSignOutAlt 
} from 'react-icons/fa';

const ProfileScreen = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { userInfo } = useSelector((state) => state.auth);
  const [logoutApiCall] = useLogoutMutation();
  
  // ✅ NEW: Validate user still exists in database (only check on component mount or when userInfo changes)
  const { data: profileData, isError: profileError, error: profileErrorDetail } = useGetProfileQuery(undefined, {
    skip: !userInfo, // Skip if no userInfo
    refetchOnMountOrArgChange: false, // Don't auto-refetch
    pollingInterval: 0, // Disable polling
  });

  // ✅ NEW: Auto-logout ONLY if user actually deleted (404 error, not network error)
  useEffect(() => {
    if (profileError && profileErrorDetail?.status === 404) {
      dispatch(logout());
      navigate('/login');
      toast.error('Your account was deleted or you no longer have access');
    }
  }, [profileError, dispatch, navigate]);

  // ✅ 1. PREPARE USER DATA
  const userData = useMemo(() => {
    if (!userInfo) return null;
    
    const name = userInfo.name;
    const email = userInfo.email;
    const isAdmin = userInfo.isAdmin;
    
    // Generate Avatar
    const avatarName = name.split(' ').map(n => n[0]).join('+');
    const avatar = `https://ui-avatars.com/api/?name=${avatarName}&background=002147&color=F0F8FF&bold=true&length=2`;

    return { name, email, isAdmin, avatar };
  }, [userInfo]);

  // ✅ 2. DEFINE TOOLS (Mapped to Routes)
  const ADMIN_TOOLS = [
    // Dashboard Overview -> Points to Finance Dashboard
    { title: 'Dashboard Overview', desc: 'Track sales and revenue data', path: '/admin/dashboard', icon: <FaChartLine /> },
    { title: 'Manage Orders', desc: 'View and update customer orders', path: '/admin/orderlist', icon: <FaBoxOpen /> },
    { title: 'Home Slider', desc: 'Control homepage banner images', path: '/admin/bannerlist', icon: <FaImages /> },
    { title: 'User Management', desc: 'Manage registered accounts', path: '/admin/userlist', icon: <FaUsers /> },
    { title: 'Manage Categories', desc: 'Add, update or delete store categories', path: '/admin/categorylist', icon: <FaTags /> },
    { title: 'Products', desc: 'Add or edit store products', path: '/admin/productlist', icon: <FaTshirt /> },
    // Account Settings -> Points to Profile Edit (Settings Page)
    { title: 'Account Settings', desc: 'Update profile and password', path: '/profile/edit', icon: <FaUserCog /> }
  ];

  const USER_TOOLS = [
    { title: 'Order History', desc: 'Check status of your purchases', path: '/my-orders', icon: <FaHistory /> },
    { title: 'All Categories', desc: 'Browse products by sports type', path: '/categories', icon: <FaLayerGroup /> },
    // Account Settings -> Points to Profile Edit (Settings Page)
    { title: 'Account Settings', desc: 'Update profile and password', path: '/profile/edit', icon: <FaUserCog /> },
  ];

  // ✅ 3. LOGOUT HANDLER
  const logoutHandler = async () => {
    try {
      await logoutApiCall().unwrap();
      dispatch(logout());
      navigate('/login');
      toast.success('Logged out successfully');
    } catch (err) {
      console.error(err);
    }
  };

  if (!userData) {
    return (
      <div className="bg-[#f0f8ff] min-h-[90vh] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[#002147] mb-4">Loading Profile...</h2>
          <p className="text-gray-500">If this persists, please <a href="/login" className="text-[#002147] font-bold">login again</a></p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f0f8ff] min-h-[90vh] py-10 px-4 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* --- PROFILE HEADER --- */}
        <div className="bg-[#002147] rounded-2xl p-8 md:p-12 shadow-xl flex flex-col md:flex-row items-center gap-8 text-white mb-12 relative overflow-hidden">
          {/* Avatar */}
          <div className="relative z-10">
            <img 
              src={userData.avatar} 
              alt="Profile" 
              className="w-28 h-28 md:w-32 md:h-32 rounded-full border-4 border-[#FF6F00] bg-white p-1 object-cover shadow-2xl" 
            />
          </div>

          {/* Info */}
          <div className="text-center md:text-left z-10 flex-1">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2">{userData.name}</h1>
            <p className="text-blue-100 text-lg mb-4 opacity-80">{userData.email}</p>
            <span className={`inline-block px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
              userData.isAdmin 
                ? 'bg-[#FF6F00] border-[#FF6F00] text-white' 
                : 'bg-white/10 border-white/20 text-blue-100'
            }`}>
              {userData.isAdmin ? 'Administrator' : 'Verified Customer'}
            </span>
          </div>
        </div>

        {/* --- CARDS GRID --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {(userData.isAdmin ? ADMIN_TOOLS : USER_TOOLS).map((item, index) => (
            <Link 
              key={index} 
              to={item.path} 
              className={`group bg-white p-8 rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-300 flex items-center justify-between border-l-[6px] relative overflow-hidden ${
                userData.isAdmin ? 'border-[#FF6F00]' : 'border-[#002147]'
              } hover:-translate-y-2`}
            >
              <div>
                <div className={`text-3xl mb-4 ${userData.isAdmin ? 'text-[#FF6F00]' : 'text-[#002147]'}`}>
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold text-[#002147] mb-2 group-hover:text-[#FF6F00] transition-colors">
                  {item.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
              <div className={`text-2xl text-gray-300 group-hover:translate-x-2 transition-transform duration-300 ${userData.isAdmin ? 'group-hover:text-[#FF6F00]' : 'group-hover:text-[#002147]'}`}>
                <FaArrowRight />
              </div>
            </Link>
          ))}
        </div>

        {/* --- LOGOUT BUTTON --- */}
        <div className="text-center">
          <button 
            onClick={logoutHandler} 
            className="inline-flex items-center gap-3 px-12 py-3 bg-white text-red-600 border-2 border-red-600 rounded-full font-bold text-lg hover:bg-red-600 hover:text-white transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105"
          >
            <FaSignOutAlt /> Logout
          </button>
        </div>

      </div>
    </div>
  );
};

export default ProfileScreen;