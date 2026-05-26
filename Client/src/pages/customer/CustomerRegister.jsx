import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { API_URL } from '../../vendorDashboard/data/apiPath';
import '../../styles/PremiumUI.css';

// ============================================================
//  CustomerRegister.jsx — Registration Page for New Customers
//  Creates a new customer account so they can place orders.
// ============================================================

const CustomerRegister = () => {
  const [form, setForm] = useState({
    name: '', email: '', password: '', phone: '', address: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Generic input handler — works for all fields
  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/customer/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await response.json();

      if (response.ok) {
        setSuccess('Account created! Redirecting to login...');
        setTimeout(() => navigate('/customer/login'), 2000);
      } else {
        setError(data.message || data.error || 'Registration failed.');
      }
    } catch (err) {
      setError('Cannot connect to server. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-layout">
      {/* Left — Decorative */}
      <div className="auth-left" style={{
        background: 'linear-gradient(135deg, #ff6b00 0%, #ff8c38 100%)',
        flexDirection: 'column',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1.5rem',
        padding: '2rem'
      }}>
        <div style={{ fontSize: '5rem' }}>🍕</div>
        <h2 style={{ color: '#fff', fontFamily: 'Outfit', fontSize: '2rem', fontWeight: 800, textAlign: 'center' }}>
          Join QuickEats
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.8)', textAlign: 'center', maxWidth: '280px' }}>
          Sign up to order food from the best restaurants near you.
        </p>
      </div>

      {/* Right — Registration Form */}
      <div className="auth-right">
        <div className="glass-panel auth-form" style={{ maxWidth: '460px' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <Link to="/" style={{ color: 'var(--primary)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600 }}>
              ← Home
            </Link>
          </div>

          <h2>Create Account</h2>
          <p>Start ordering your favourite food today!</p>

          {error && <div className="error-box">{error}</div>}
          {success && <div className="success-box">{success}</div>}

          <form onSubmit={handleRegister}>
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text" name="name" value={form.name}
                onChange={handleChange} placeholder="Your full name" required
              />
            </div>

            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email" name="email" value={form.email}
                onChange={handleChange} placeholder="your@email.com" required
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password" name="password" value={form.password}
                onChange={handleChange} placeholder="Min. 6 characters" required
              />
            </div>

            <div className="form-group">
              <label>Phone Number <span style={{ color: 'var(--text-secondary)', fontWeight: 400 }}>(optional)</span></label>
              <input
                type="tel" name="phone" value={form.phone}
                onChange={handleChange} placeholder="+91 9876543210"
              />
            </div>

            <div className="form-group">
              <label>Default Delivery Address <span style={{ color: 'var(--text-secondary)', fontWeight: 400 }}>(optional)</span></label>
              <input
                type="text" name="address" value={form.address}
                onChange={handleChange} placeholder="Your home or office address"
              />
            </div>

            <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={loading}>
              {loading ? 'Creating account...' : '🚀 Create Account'}
            </button>
          </form>

          <p style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Already have an account?{' '}
            <Link to="/customer/login" style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'none' }}>
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default CustomerRegister;
