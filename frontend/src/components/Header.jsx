import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { FaShoppingCart, FaUser, FaBars, FaTimes, FaSearch } from 'react-icons/fa';
import { useLogoutMutation } from '../slices/usersApiSlice';
import { logout } from '../slices/authSlice';
import SearchBox from './SearchBox';

const Header = () => {
  const { cartItems } = useSelector((state) => state.cart);
  const { userInfo } = useSelector((state) => state.auth);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const [logoutApiCall] = useLogoutMutation();
  
  const [isSidebarOpen, setSidebarOpen] = useState(false); 
  const [isMobileSearchOpen, setMobileSearchOpen] = useState(false);

  // ✅ GENERATE AVATAR URL
  const userAvatar = userInfo ? `https://ui-avatars.com/api/?name=${userInfo.name}&background=FF6F00&color=fff&bold=true&length=2` : null;

  const logoutHandler = async () => {
    try {
      await logoutApiCall().unwrap();
      dispatch(logout());
      navigate('/login');
      setSidebarOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const closeSidebar = () => setSidebarOpen(false);

  const handleLogoClick = (e) => {
    e.preventDefault();
    closeSidebar();
    if (location.pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate('/');
      window.scrollTo(0, 0);
    }
  };

  // ✅ SCROLL LOGIC FIXED (About Section Fix)
  const handleScroll = (id) => {
    closeSidebar();
    
    if (location.pathname === '/') {
      // Agar Home Page par hain to direct scroll
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      // Agar kisi aur page par hain to pehle Home par jao pir scroll karo
      navigate('/');
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 300);
    }
  };

  return (
    <>
      {/* ==================== 1. MOBILE SIDEBAR DRAWER ==================== */}
      <div 
        className={`fixed inset-0 bg-black/60 z-[60] transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`} 
        onClick={closeSidebar}
      ></div>

      <div className={`fixed top-0 left-0 h-full w-[75%] max-w-[300px] bg-sport-blue z-[70] shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col justify-between p-6 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div>
          <div className="flex justify-between items-center mb-8">
             <a href="/" onClick={handleLogoClick} className="text-2xl font-extrabold text-white tracking-wider">
               SPORTS<span className="text-sport-orange">GEAR</span>
             </a>
             <FaTimes className="text-white text-2xl cursor-pointer" onClick={closeSidebar} />
          </div>

          <div className="flex flex-col space-y-4">
             <Link to="/" className="text-sport-light text-lg font-medium border-b border-white/10 pb-2 hover:text-sport-orange transition" onClick={handleLogoClick}>Home</Link>
             
             <button onClick={() => handleScroll('about-section')} className="text-left text-sport-light text-lg font-medium border-b border-white/10 pb-2 hover:text-sport-orange transition">About Us</button>
             <button onClick={() => handleScroll('footer')} className="text-left text-sport-light text-lg font-medium border-b border-white/10 pb-2 hover:text-sport-orange transition">Contact</button>

             <Link to="/products" className="text-sport-light text-lg font-medium border-b border-white/10 pb-2 hover:text-sport-orange transition" onClick={closeSidebar}>Browse</Link>

             {userInfo && (
               <>
                 <Link to="/my-orders" className="text-sport-light text-lg font-medium border-b border-white/10 pb-2 hover:text-sport-orange transition" onClick={closeSidebar}>Orders</Link>
                 <Link to="/categories" className="text-sport-light text-lg font-medium border-b border-white/10 pb-2 hover:text-sport-orange transition" onClick={closeSidebar}>Category</Link>
               </>
             )}

             {userInfo && userInfo.isAdmin && (
               <div className="pt-2">
                 <p className="text-sport-orange font-bold text-sm uppercase mb-2">Admin Controls</p>
                 <Link to="/admin/dashboard" className="block text-sport-light text-base py-1 pl-4 border-l-2 border-sport-orange mb-2" onClick={closeSidebar}>Dashboard</Link>
                 <Link to="/admin/orderlist" className="block text-sport-light text-base py-1 pl-4 border-l-2 border-gray-600 mb-2" onClick={closeSidebar}>Orders</Link>
                 <Link to="/admin/productlist" className="block text-sport-light text-base py-1 pl-4 border-l-2 border-gray-600" onClick={closeSidebar}>Products</Link>
               </div>
             )}
          </div>
        </div>

        <div className="bg-white/10 p-4 rounded-xl flex items-center space-x-3 cursor-pointer" onClick={() => { 
             if (userInfo) navigate('/profile'); else navigate('/login'); 
             closeSidebar(); 
        }}>
           <div className="w-10 h-10 rounded-full border-2 border-sport-orange overflow-hidden">
              {userInfo ? (
                  <img src={userAvatar} alt="User" className="w-full h-full object-cover" />
              ) : (
                  <div className="w-full h-full bg-sport-orange flex items-center justify-center text-white"><FaUser /></div>
              )}
           </div>
           <div>
              <p className="text-white font-bold text-sm">{userInfo ? userInfo.name : 'Guest User'}</p>
              <p className="text-white/60 text-xs">{userInfo ? 'View Profile' : 'Login / Sign Up'}</p>
           </div>
        </div>
      </div>


      {/* ==================== 2. MAIN NAVBAR ==================== */}
      <header className="bg-sport-blue sticky top-0 z-50 shadow-lg border-b border-white/10">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          
          <div className="flex items-center gap-4">
             <div className="md:hidden text-white text-xl cursor-pointer" onClick={() => setSidebarOpen(true)}>
                <FaBars />
             </div>
             
             <a href="/" onClick={handleLogoClick} className="text-2xl font-extrabold text-white tracking-wider hover:opacity-90 transition">
               SPORTS<span className="text-sport-orange">GEAR</span>
             </a>
          </div>

          <div className="hidden md:block flex-1 max-w-lg mx-8">
             <SearchBox />
          </div>

          <div className="flex items-center gap-6">
             <div className="md:hidden text-white text-lg cursor-pointer" onClick={() => setMobileSearchOpen(!isMobileSearchOpen)}>
                <FaSearch />
             </div>

             <nav className="hidden md:flex items-center gap-6">
                <Link to="/" className="text-sport-light font-medium hover:text-sport-orange transition" onClick={handleLogoClick}>Home</Link>
                
                {/* ✅ CHANGE 2: Correct ID 'about-section' */}
                <button onClick={() => handleScroll('about-section')} className="text-sport-light font-medium hover:text-sport-orange transition">About</button>
                <button onClick={() => handleScroll('footer')} className="text-sport-light font-medium hover:text-sport-orange transition">Contact</button>
             </nav>

             <Link to="/cart" className="relative text-sport-light hover:text-sport-orange transition flex items-center">
                <FaShoppingCart size={20} />
                {cartItems.length > 0 && (
                   <span className="absolute -top-2 -right-2 bg-sport-orange text-white text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-full border-2 border-sport-blue">
                      {cartItems.reduce((a, c) => a + c.qty, 0)}
                   </span>
                )}
             </Link>

             {/* --- AVATAR & DIRECT LINK --- */}
             {userInfo ? (
                <Link to="/profile" className="hidden md:block group" title="Go to Dashboard">
                   <div className="w-10 h-10 rounded-full border-2 border-sport-orange overflow-hidden transition-transform duration-300 group-hover:scale-105 group-hover:shadow-lg">
                      <img src={userAvatar} alt={userInfo.name} className="w-full h-full object-cover" />
                   </div>
                </Link>
             ) : (
                <Link to="/login" className="hidden md:flex items-center gap-2 bg-sport-orange text-white px-5 py-2 rounded-full font-bold text-sm shadow-lg hover:bg-orange-600 transition transform hover:scale-105">
                   Sign In
                </Link>
             )}
          </div>
        </div>

        {isMobileSearchOpen && (
           <div className="md:hidden bg-white p-3 shadow-inner animate-slideDown">
              <SearchBox />
           </div>
        )}
      </header>
    </>
  );
};

export default Header;