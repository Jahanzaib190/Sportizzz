import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

const PrivateRoute = () => {
  const { userInfo } = useSelector((state) => state.auth);

  // Agar user logged in hai to page dikhao (<Outlet />)
  // Warna Login page par bhej do (<Navigate to='/login' />)
  return userInfo ? <Outlet /> : <Navigate to='/login' replace />;
};

export default PrivateRoute;