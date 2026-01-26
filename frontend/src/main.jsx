import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './store';

// Import Pages
import App from './App.jsx';
import HomeScreen from './pages/HomeScreen.jsx';
import ProductScreen from './pages/ProductScreen.jsx';
import CartScreen from './pages/CartScreen.jsx';
import LoginScreen from './pages/LoginScreen.jsx';
import RegisterScreen from './pages/RegisterScreen.jsx';
import ShippingScreen from './pages/ShippingScreen.jsx';
import PaymentScreen from './pages/PaymentScreen.jsx';
import ProfileScreen from './pages/ProfileScreen.jsx';
import Settings from './pages/Settings.jsx';
import MyOrdersScreen from './pages/MyOrdersScreen.jsx';
import PlaceOrderScreen from './pages/PlaceOrderScreen.jsx';
import OrderScreen from './pages/OrderScreen.jsx';

// Admin Pages
import UserListScreen from './pages/admin/UserListScreen.jsx';
import UserEditScreen from './pages/admin/UserEditScreen.jsx';
import CategoryListScreen from './pages/admin/CategoryListScreen.jsx';
import CategoryEditScreen from './pages/admin/CategoryEditScreen.jsx';
import DashboardScreen from './pages/admin/DashboardScreen.jsx';
import BannerListScreen from './pages/admin/BannerListScreen.jsx';
import ProductListScreen from './pages/admin/ProductListScreen.jsx';
import OrderListScreen from './pages/admin/OrderListScreen.jsx';
import ProductEditScreen from './pages/admin/ProductEditScreen.jsx'; // We use this for Create too

// Public Category & Product Pages
import CategoryListPage from './pages/CategoryListPage.jsx';
import CategoryProductScreen from './pages/CategoryProductScreen.jsx';
import ProductsScreen from './pages/ProductsScreen.jsx';

// Auth Pages
import ForgotPasswordScreen from './pages/ForgotPasswordScreen.jsx';
import ResetPasswordScreen from './pages/ResetPasswordScreen.jsx';
import VerifyOtpScreen from './pages/VerifyOtpScreen.jsx'; // ✅ NEW

// Components
import AdminRoute from './components/AdminRoute.jsx';
import PrivateRoute from './components/PrivateRoute.jsx';

import './index.css';

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />}>
      
      {/* --- PUBLIC ROUTES --- */}
      <Route index={true} path="/" element={<HomeScreen />} />
      <Route path="/categories" element={<CategoryListPage />} />
      <Route path="/category/:name" element={<CategoryProductScreen />} />
      <Route path="/products" element={<ProductsScreen />} />
      <Route path="/search/:keyword" element={<ProductsScreen />} />
      <Route path="/page/:pageNumber" element={<ProductsScreen />} />
      <Route path="/search/:keyword/page/:pageNumber" element={<ProductsScreen />} />
      <Route path="/product/:id" element={<ProductScreen />} />
      <Route path="/cart" element={<CartScreen />} />
      <Route path="/login" element={<LoginScreen />} />
      <Route path="/register" element={<RegisterScreen />} />
      <Route path="/verify-otp" element={<VerifyOtpScreen />} /> {/* ✅ NEW */}
      <Route path="/forgot-password" element={<ForgotPasswordScreen />} />
      <Route path='/reset-password' element={<ResetPasswordScreen />} />

      {/* --- PRIVATE ROUTES (User Must Be Logged In) --- */}
      <Route path='' element={<PrivateRoute />}>
          <Route path="/shipping" element={<ShippingScreen />} />
          <Route path="/payment" element={<PaymentScreen />} />
          <Route path="/placeorder" element={<PlaceOrderScreen />} />
          <Route path="/order/:id" element={<OrderScreen />} />
          <Route path="/profile" element={<ProfileScreen />} />
          <Route path="/profile/edit" element={<Settings />} /> 
          
          {/* ✅ FIXED: Added dash to match your link '/my-orders' */}
          <Route path="/my-orders" element={<MyOrdersScreen />} />
      </Route>

      {/* --- ADMIN ROUTES (Admin Only) --- */}
      <Route path="" element={<AdminRoute />}>
        <Route path="/admin/dashboard" element={<DashboardScreen />} />
        
        {/* Orders */}
        <Route path="/admin/orderlist" element={<OrderListScreen />} />
        
        {/* Products */}
        <Route path="/admin/productlist" element={<ProductListScreen />} />
        <Route path="/admin/productlist/:pageNumber" element={<ProductListScreen />} />
        
        {/* ✅ IMPORTANT: Create & Edit use SAME component */}
        <Route path="/admin/product/create" element={<ProductEditScreen />} /> 
        <Route path="/admin/product/:id/edit" element={<ProductEditScreen />} />

        {/* Categories */}
        <Route path="/admin/categorylist" element={<CategoryListScreen />} />
        <Route path='/admin/category/create' element={<CategoryEditScreen />} />
        <Route path="/admin/category/:id/edit" element={<CategoryEditScreen />} />

        {/* Users */}
        <Route path='/admin/userlist' element={<UserListScreen />} />
        <Route path='/admin/user/:id/edit' element={<UserEditScreen />} />

        {/* Banners */}
        <Route path="/admin/bannerlist" element={<BannerListScreen />} />
      </Route>

    </Route>
  )
);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </React.StrictMode>
);