import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { io } from 'socket.io-client';
import { API_URL } from '../../vendorDashboard/data/apiPath';
import '../../styles/PremiumUI.css';

// ============================================================
//  OrderTracking.jsx — Real-Time Order Status Page
//  Uses Socket.io to listen for live updates from the server.
//  When the vendor updates the order status, THIS page
//  automatically updates without needing a page refresh!
// ============================================================

// Status steps in order — from placed to delivered
const STATUS_STEPS = [
  { key: 'pending',           label: 'Order Placed',   icon: '🧾' },
  { key: 'confirmed',         label: 'Confirmed',      icon: '✅' },
  { key: 'preparing',         label: 'Preparing',      icon: '👨‍🍳' },
  { key: 'out-for-delivery',  label: 'On the Way',     icon: '🛵' },
  { key: 'delivered',         label: 'Delivered',      icon: '🎉' },
];

const OrderTracking = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [liveStatus, setLiveStatus] = useState('');

  // Fetch order details from API
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const token = localStorage.getItem('customerToken');
        const response = await fetch(`${API_URL}/order/${orderId}`, {
          headers: token ? { 'token': token } : {}
        });
        const data = await response.json();

        if (response.ok) {
          setOrder(data.order);
          setLiveStatus(data.order.status);
        } else {
          setError(data.error || 'Order not found.');
        }
      } catch (err) {
        setError('Cannot connect to server.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  // Connect to Socket.io for real-time updates
  useEffect(() => {
    const customerId = localStorage.getItem('customerId');
    if (!customerId) return;

    // Create a Socket.io connection to our backend
    const socket = io(API_URL);

    // Join the customer's private room to receive their order updates
    socket.on('connect', () => {
      socket.emit('join_customer', customerId);
      console.log('🔌 Connected to real-time server');
    });

    // Listen for order status updates from the vendor
    socket.on('order_status_update', (data) => {
      if (data.orderId === orderId) {
        setLiveStatus(data.status); // Update status instantly without page refresh!
        console.log('📦 Order status updated to:', data.status);
      }
    });

    // Clean up socket when component unmounts (user leaves page)
    return () => {
      socket.disconnect();
    };
  }, [orderId]);

  // Find which step we're at in the status flow
  const currentStepIndex = STATUS_STEPS.findIndex(s => s.key === liveStatus);
  const isCancelled = liveStatus === 'cancelled';

  // Progress bar width as a percentage
  const progressPercent = isCancelled
    ? 0
    : currentStepIndex >= 0
      ? (currentStepIndex / (STATUS_STEPS.length - 1)) * 100
      : 0;

  if (loading) return (
    <div className="tracking-page">
      <div className="loading-container" style={{ paddingTop: '6rem' }}>
        <div className="spinner"></div>
        <p>Loading your order...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="tracking-page">
      <div className="tracking-card">
        <div className="error-box">{error}</div>
        <Link to="/restaurants" className="btn-primary" style={{ display: 'inline-block', marginTop: '1rem' }}>
          ← Back to Restaurants
        </Link>
      </div>
    </div>
  );

  return (
    <div className="tracking-page">
      {/* Navigation */}
      <nav className="customer-nav">
        <Link to="/restaurants" className="brand">Quick<span>Eats</span></Link>
        <Link to="/customer/my-orders" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem' }}>
          My Orders
        </Link>
      </nav>

      <div className="tracking-card">
        {/* Order Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <h2>Track Your Order 📦</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontFamily: 'monospace' }}>
              Order ID: {order?._id}
            </p>
          </div>
          <span className={`status-badge ${liveStatus}`} style={{ fontSize: '0.85rem', padding: '0.4rem 1rem' }}>
            {liveStatus}
          </span>
        </div>

        {/* Restaurant Info */}
        {order?.firm && (
          <div style={{
            background: 'linear-gradient(135deg, #fff7f0, #ffecd9)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem',
            marginTop: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <span style={{ fontSize: '2rem' }}>🏠</span>
            <div>
              <p style={{ fontWeight: 700, fontSize: '1rem' }}>{order.firm.firmname}</p>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>📍 {order.firm.area}</p>
            </div>
          </div>
        )}

        {/* Status Steps — Visual Timeline */}
        {!isCancelled ? (
          <div className="status-steps">
            {/* Progress bar behind the dots */}
            <div className="status-progress-bar" style={{ width: `${progressPercent}%` }}></div>

            {STATUS_STEPS.map((step, index) => {
              const isDone = index < currentStepIndex;
              const isActive = index === currentStepIndex;
              return (
                <div key={step.key} className={`step ${isDone ? 'done' : ''} ${isActive ? 'active' : ''}`}>
                  <div className="step-dot">
                    {isDone ? '✓' : step.icon}
                  </div>
                  <span className="step-label">{step.label}</span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="error-box" style={{ margin: '1.5rem 0', textAlign: 'center' }}>
            ❌ This order has been cancelled.
          </div>
        )}

        {/* Live status message */}
        {!isCancelled && (
          <div style={{
            background: '#f0fdf4', border: '1px solid #bbf7d0',
            borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem',
            fontSize: '0.9rem', color: '#065f46', fontWeight: 500,
            marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem'
          }}>
            <span style={{ fontSize: '1rem' }}>🔴</span>
            LIVE — Updates appear automatically when the restaurant acts on your order.
          </div>
        )}

        {/* Order Items Summary */}
        <h3 style={{ fontWeight: 700, marginBottom: '0.75rem', color: 'var(--dark)' }}>Order Summary</h3>
        <div className="order-summary-items">
          {order?.items?.map((item, i) => (
            <div key={i} className="order-item-row">
              <span>{item.productname} × {item.quantity}</span>
              <span>₹{(item.price * item.quantity).toFixed(0)}</span>
            </div>
          ))}
          <div className="order-total">
            <span>Total Paid</span>
            <span>₹{order?.totalAmount?.toFixed(0)}</span>
          </div>
        </div>

        {/* Delivery Address */}
        <div style={{ marginTop: '1rem', padding: '0.85rem 1rem', background: '#f9fafb', borderRadius: 'var(--radius-sm)' }}>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '0.25rem' }}>
            DELIVERY ADDRESS
          </p>
          <p style={{ fontSize: '0.92rem' }}>{order?.deliveryAddress}</p>
        </div>

        {/* Back Button */}
        <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link to="/customer/my-orders" className="btn-secondary">View All Orders</Link>
          <Link to="/restaurants" className="btn-primary">Order More Food 🍔</Link>
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;
