import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import '../styles/PremiumUI.css';

const DashboardLayout = () => {
  const firmName = localStorage.getItem('firmName') || 'Vendor';

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-content">
        <div className="dashboard-header">
          <h1>Welcome back, {firmName}</h1>
          <p style={{color: '#6b7280'}}>Manage your restaurant operations effectively.</p>
        </div>
        <div className="dashboard-content-area">
          <Outlet /> 
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
