import React from 'react';
import { Routes, Route } from 'react-router-dom';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import DashboardLayout from './pages/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoute';

import AddFirm from './vendorDashboard/components/forms/AddFirm';
import AddProducts from './vendorDashboard/components/forms/AddProducts';
import AllProducts from './vendorDashboard/components/AllProducts';
import VendorOrders from './pages/VendorOrders';

// Customer Pages
import CustomerLogin from './pages/customer/CustomerLogin';
import CustomerRegister from './pages/customer/CustomerRegister';
import RestaurantList from './pages/customer/RestaurantList';
import RestaurantMenu from './pages/customer/RestaurantMenu';
import MyOrders from './pages/customer/MyOrders';
import OrderTracking from './pages/customer/OrderTracking';

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Customer Routes */}
      <Route path="/customer/login" element={<CustomerLogin />} />
      <Route path="/customer/register" element={<CustomerRegister />} />
      <Route path="/restaurants" element={<RestaurantList />} />
      <Route path="/customer/menu/:firmId" element={<RestaurantMenu />} />
      <Route path="/customer/my-orders" element={<MyOrders />} />
      <Route path="/customer/track/:orderId" element={<OrderTracking />} />

      <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<div><h3>Overview</h3><p>Select an option from the sidebar to manage your firm.</p></div>} />
        <Route path="/add-firm" element={<AddFirm />} />
        <Route path="/add-product" element={<AddProducts />} />
        <Route path="/all-products" element={<AllProducts />} />
        <Route path="/vendor-orders" element={<VendorOrders />} />
      </Route>
    </Routes>
  );
};

export default App;