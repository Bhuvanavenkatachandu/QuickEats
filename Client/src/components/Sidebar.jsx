import React from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';

const Sidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('loginToken');
    localStorage.removeItem('firmId');
    localStorage.removeItem('firmName');
    navigate('/login');
  };

  return (
    <div className="sidebar">
      <Link to="/" className="sidebar-logo" style={{ textDecoration: 'none' }}>
        Quick<span>Eats</span>
      </Link>
      <div className="sidebar-nav">
        <Link to="/" className="nav-item">
          🏠 Main Home
        </Link>
        <NavLink to="/dashboard" className={({isActive}) => isActive ? "nav-item active" : "nav-item"} end>
          Overview
        </NavLink>
        <NavLink to="/add-firm" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
          Add Firm
        </NavLink>
        <NavLink to="/add-product" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
          Add Product
        </NavLink>
        <NavLink to="/all-products" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
          All Products
        </NavLink>
        <NavLink to="/vendor-orders" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
          Orders
        </NavLink>
        
        <div className="nav-item" onClick={handleLogout} style={{marginTop: 'auto', color: '#ef4444'}}>
          Logout
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
