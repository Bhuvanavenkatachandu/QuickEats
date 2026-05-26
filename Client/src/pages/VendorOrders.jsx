import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { API_URL } from '../vendorDashboard/data/apiPath';
import '../styles/PremiumUI.css';

// ============================================================
//  VendorOrders.jsx — Vendor Dashboard: Manage Incoming Orders
//  Vendors can see all orders for their restaurant and update
//  the order status. Socket.io gives INSTANT notifications when
//  a new order arrives — no page refresh needed!
// ============================================================

const STATUS_OPTIONS = [
  'pending', 'confirmed', 'preparing', 'out-for-delivery', 'delivered', 'cancelled'
];

const VendorOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(null); // Track which order is updating
  const [newOrderAlert, setNewOrderAlert] = useState(null); // Real-time alert

  const firmId = localStorage.getItem('firmId');

  // Fetch all orders for this firm
  const fetchOrders = async () => {
    if (!firmId) {
      setError('No firm found. Please add a firm first.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/order/firm/${firmId}`);
      const data = await response.json();

      if (response.ok) {
        setOrders(data.orders || []);
      } else {
        setError('Failed to load orders.');
      }
    } catch (err) {
      setError('Cannot connect to server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [firmId]);

  // Connect to Socket.io for real-time new order notifications
  useEffect(() => {
    if (!firmId) return;

    const socket = io(API_URL);

    socket.on('connect', () => {
      // Join the firm's room to receive new order notifications
      socket.emit('join_firm', firmId);
      console.log('🔌 Vendor connected to real-time server');
    });

    // When a new order arrives — show alert and refresh order list
    socket.on('new_order', (data) => {
      console.log('🔔 New order received!', data);
      setNewOrderAlert('🔔 New order just arrived!');
      fetchOrders(); // Refresh order list

      // Hide alert after 5 seconds
      setTimeout(() => setNewOrderAlert(null), 5000);
    });

    return () => socket.disconnect();
  }, [firmId]);

  // Update order status (e.g., from "pending" to "confirmed")
  const updateStatus = async (orderId, newStatus) => {
    setUpdating(orderId);

    try {
      const response = await fetch(`${API_URL}/order/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        // Update the order in local state without refetching
        setOrders(prev =>
          prev.map(order =>
            order._id === orderId ? { ...order, status: newStatus } : order
          )
        );
      } else {
        alert('Failed to update order status. Please try again.');
      }
    } catch (err) {
      alert('Server error. Please try again.');
    } finally {
      setUpdating(null);
    }
  };

  // Count orders by status for the quick stats
  const stats = orders.reduce((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="orders-section">
      {/* Real-time New Order Alert Banner */}
      {newOrderAlert && (
        <div style={{
          background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
          color: '#fff', padding: '0.85rem 1.5rem', borderRadius: 'var(--radius-md)',
          marginBottom: '1.5rem', fontWeight: 700, fontSize: '1rem',
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          animation: 'pulse 1s ease-in-out'
        }}>
          {newOrderAlert}
          <button
            onClick={() => setNewOrderAlert(null)}
            style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '1.1rem' }}
          >
            ✕
          </button>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <h2 style={{ margin: 0 }}>📋 Incoming Orders</h2>
        <button onClick={fetchOrders} className="btn-secondary" style={{ padding: '0.5rem 1.2rem', fontSize: '0.85rem' }}>
          🔄 Refresh
        </button>
      </div>

      {/* Quick Stats */}
      {!loading && orders.length > 0 && (
        <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
          <div className="stat-card">
            <div className="stat-icon">📦</div>
            <div className="stat-value">{orders.length}</div>
            <div className="stat-label">Total Orders</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">⏳</div>
            <div className="stat-value">{stats.pending || 0}</div>
            <div className="stat-label">Pending</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">👨‍🍳</div>
            <div className="stat-value">{stats.preparing || 0}</div>
            <div className="stat-label">Preparing</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-value">{stats.delivered || 0}</div>
            <div className="stat-label">Delivered</div>
          </div>
        </div>
      )}

      {loading && (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading orders...</p>
        </div>
      )}

      {error && <div className="error-box">{error}</div>}

      {!loading && orders.length === 0 && !error && (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <h3>No orders yet</h3>
          <p>Orders from customers will appear here in real-time. Share your restaurant link!</p>
        </div>
      )}

      {/* Orders List */}
      {orders.map(order => (
        <div key={order._id} className="order-card">
          <div className="order-card-header">
            <div>
              <p style={{ fontWeight: 700, fontSize: '1rem' }}>
                {order.customer?.name || 'Customer'}
                {order.customer?.phone && (
                  <span style={{ fontWeight: 400, color: 'var(--text-secondary)', fontSize: '0.85rem', marginLeft: '0.5rem' }}>
                    📞 {order.customer.phone}
                  </span>
                )}
              </p>
              <p className="order-id">#{order._id?.slice(-8).toUpperCase()}</p>
            </div>
            <span className={`status-badge ${order.status}`}>{order.status}</span>
          </div>

          {/* Ordered Items */}
          <div className="order-items-list">
            {order.items?.map((item, i) => (
              <span key={i}>
                {item.productname} × {item.quantity} (₹{(item.price * item.quantity).toFixed(0)})
                {i < order.items.length - 1 ? ' · ' : ''}
              </span>
            ))}
          </div>

          {/* Delivery Address */}
          {order.deliveryAddress && (
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '0.3rem 0 0.75rem' }}>
              📍 {order.deliveryAddress}
            </p>
          )}

          <div className="order-card-footer">
            <div>
              <p className="order-total-amount">₹{order.totalAmount?.toFixed(0)}</p>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                {new Date(order.createdAt).toLocaleString('en-IN', {
                  day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                })}
              </p>
            </div>

            {/* Status Dropdown — Vendor can change order status here */}
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <select
                className="status-select"
                value={order.status}
                onChange={e => updateStatus(order._id, e.target.value)}
                disabled={updating === order._id || order.status === 'delivered' || order.status === 'cancelled'}
              >
                {STATUS_OPTIONS.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>

              {updating === order._id && (
                <div className="spinner" style={{ width: '20px', height: '20px', borderWidth: '2px' }}></div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default VendorOrders;
