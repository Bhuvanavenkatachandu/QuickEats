import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { API_URL } from '../../vendorDashboard/data/apiPath';
import '../../styles/PremiumUI.css';

// ============================================================
//  CustomerLogin.jsx — Login Page for Food Customers
//  Customers log in here to place orders and track them.
//  After successful login, the JWT token is saved in
//  localStorage so the customer stays logged in.
// ============================================================

const CustomerLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/customer/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();

      if (response.ok) {
        // Save login info to localStorage
        localStorage.setItem('customerToken', data.token);
        localStorage.setItem('customerId', data.customerId);
        localStorage.setItem('customerName', data.name);

        navigate('/restaurants'); // Go to restaurant list
      } else {
        setError(data.error || 'Login failed. Please try again.');
      }
    } catch (err) {
      setError('Cannot connect to server. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-layout">
      {/* Left — Decorative side */}
      <div className="auth-left" style={{
        background: 'linear-gradient(135deg, #1a1a2e 0%, #2d2d4e 100%)',
        flexDirection: 'column',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1.5rem',
        padding: '2rem'
      }}>
        <div style={{ fontSize: '5rem' }}>🍔</div>
        <h2 style={{ color: '#fff', fontFamily: 'Outfit', fontSize: '2rem', fontWeight: 800, textAlign: 'center' }}>
          Order Delicious Food!
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.6)', textAlign: 'center', maxWidth: '280px' }}>
          Browse restaurants, place orders, and track them in real-time.
        </p>
      </div>

      {/* Right — Login Form */}
      <div className="auth-right">
        <div className="glass-panel auth-form">
          <div style={{ marginBottom: '1.5rem' }}>
            <Link to="/" style={{ color: 'var(--primary)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600 }}>
              ← Home
            </Link>
          </div>

          <h2>Customer Login</h2>
          <p>Welcome back! Place your favourite order.</p>

          {error && <div className="error-box">{error}</div>}

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={loading}>
              {loading ? 'Logging in...' : '🍽️ Login & Order'}
            </button>
          </form>

          <p style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            New here?{' '}
            <Link to="/customer/register" style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'none' }}>
              Create Account
            </Link>
          </p>

          <div style={{
            marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)',
            textAlign: 'center'
          }}>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Are you a restaurant owner?</p>
            <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.9rem', textDecoration: 'none' }}>
              Vendor Login →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerLogin;
