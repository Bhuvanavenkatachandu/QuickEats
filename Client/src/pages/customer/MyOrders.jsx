import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { API_URL } from '../../vendorDashboard/data/apiPath';
import '../../styles/PremiumUI.css';

// ============================================================
//  MyOrders.jsx — Customer's Order History Page
//  Shows all past and current orders for the logged-in customer.
//  Data is fetched with Redis caching — super fast on repeat visits!
// ============================================================

const statusColors = {
  pending: '#92400e',
  confirmed: '#1e40af',
  preparing: '#9d174d',
  'out-for-delivery': '#5b21b6',
  delivered: '#065f46',
  cancelled: '#991b1b'
};

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMyOrders = async () => {
      const token = localStorage.getItem('customerToken');
      if (!token) {
        setError('Please login to view your orders.');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_URL}/order/my-orders`, {
          headers: { 'token': token }
        });
        const data = await response.json();

        if (response.ok) {
          setOrders(data.orders || []);
        } else {
          setError(data.error || 'Failed to load orders.');
        }
      } catch (err) {
        setError('Cannot connect to server.');
      } finally {
        setLoading(false);
      }
    };

    fetchMyOrders();
  }, []);

  return (
    <div className="customer-page">
      <nav className="customer-nav">
        <Link to="/restaurants" className="brand">Quick<span>Eats</span></Link>
        <Link to="/restaurants" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem' }}>
          ← Browse Restaurants
        </Link>
      </nav>

      <div className="page-hero" style={{ padding: '2.5rem 5%' }}>
        <h1>My <span>Orders</span> 🛍️</h1>
        <p>Track your current and past orders</p>
      </div>

      <div style={{ padding: '2rem 5%', maxWidth: '750px', margin: '0 auto' }}>
        {loading && (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading your orders...</p>
          </div>
        )}

        {error && <div className="error-box">{error}</div>}

        {!loading && orders.length === 0 && !error && (
          <div className="empty-state">
            <div className="empty-icon">🛒</div>
            <h3>No orders yet!</h3>
            <p>Your order history will appear here.</p>
            <Link to="/restaurants" className="btn-primary" style={{ display: 'inline-block', marginTop: '1rem' }}>
              Browse Restaurants
            </Link>
          </div>
        )}

        {orders.map(order => (
          <div key={order._id} className="order-card">
            <div className="order-card-header">
              <div>
                <p style={{ fontWeight: 700, fontSize: '1rem' }}>
                  {order.firm?.firmname || 'Restaurant'}
                </p>
                <p className="order-id">#{order._id?.slice(-8).toUpperCase()}</p>
              </div>
              <span className={`status-badge ${order.status}`}>{order.status}</span>
            </div>

            <div className="order-items-list">
              {order.items?.map((item, i) => (
                <span key={i}>
                  {item.productname} × {item.quantity}
                  {i < order.items.length - 1 ? ', ' : ''}
                </span>
              ))}
            </div>

            <div className="order-card-footer">
              <div>
                <p className="order-total-amount">₹{order.totalAmount?.toFixed(0)}</p>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  {new Date(order.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric', month: 'short', year: 'numeric',
                    hour: '2-digit', minute: '2-digit'
                  })}
                </p>
              </div>

              {order.status !== 'delivered' && order.status !== 'cancelled' && (
                <Link to={`/customer/track/${order._id}`} className="btn-primary" style={{ padding: '0.5rem 1.2rem', fontSize: '0.85rem' }}>
                  Track Order →
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyOrders;
