import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { API_URL } from '../../vendorDashboard/data/apiPath';
import '../../styles/PremiumUI.css';

// ============================================================
//  RestaurantList.jsx — Customer-Facing Restaurant Browse Page
//  Shows all available restaurants/firms.
//  Data is fetched from GET /vendor/all-vendors API.
//  Redis caching on the backend makes this load much faster!
// ============================================================

const RestaurantList = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Fetch all restaurants when the page loads
  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const response = await fetch(`${API_URL}/vendor/all-vendors`);
        const data = await response.json();
        if (response.ok) {
          // Each vendor can have multiple firms — flatten them all
          const allFirms = [];
          data.vendors.forEach(vendor => {
            if (vendor.firm && vendor.firm.length > 0) {
              vendor.firm.forEach(firm => {
                allFirms.push({ ...firm, vendorName: vendor.username });
              });
            }
          });
          setVendors(allFirms);
        } else {
          setError('Failed to load restaurants. Please try again.');
        }
      } catch (err) {
        setError('Cannot connect to server. Make sure the backend is running.');
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, []); // Empty array means "run once when page loads"

  const handleLogout = () => {
    localStorage.removeItem('customerToken');
    localStorage.removeItem('customerId');
    localStorage.removeItem('customerName');
    navigate('/customer/login');
  };

  const customerName = localStorage.getItem('customerName');

  return (
    <div className="customer-page">
      {/* Top Navigation Bar */}
      <nav className="customer-nav">
        <Link to="/" className="brand">
          Quick<span>Eats</span>
        </Link>
        <div className="nav-links">
          {customerName ? (
            <>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                👋 Hi, <strong>{customerName}</strong>
              </span>
              <Link to="/customer/my-orders" className="btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                My Orders
              </Link>
              <button onClick={handleLogout} className="btn-danger" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/customer/login" className="btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                Login
              </Link>
              <Link to="/customer/register" className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                Register
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero Banner */}
      <div className="page-hero">
        <h1>Find Your Next <span>Favourite Meal</span> 🍽️</h1>
        <p>Browse restaurants near you and order fresh, delicious food delivered to your door.</p>
      </div>

      {/* Restaurant Cards Grid */}
      {loading && (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading restaurants...</p>
        </div>
      )}

      {error && (
        <div style={{ padding: '2rem 5%' }}>
          <div className="error-box">{error}</div>
        </div>
      )}

      {!loading && !error && vendors.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">🍽️</div>
          <h3>No restaurants available yet</h3>
          <p>Check back soon — new restaurants are joining!</p>
        </div>
      )}

      {!loading && vendors.length > 0 && (
        <div className="restaurants-grid">
          {vendors.map((firm) => (
            <Link
              to={`/customer/menu/${firm._id}`}
              key={firm._id}
              className="restaurant-card"
            >
              {/* Restaurant Image */}
              <div className="restaurant-card-img">
                {firm.image ? (
                  <img src={`${API_URL}/uploads/${firm.image}`} alt={firm.firmname} />
                ) : (
                  <span>🏠</span>
                )}
              </div>

              {/* Restaurant Info */}
              <div className="restaurant-card-body">
                <h3>
                  {firm.firmname}
                  {firm.offer && (
                    <span className="offer-badge">🎉 {firm.offer}</span>
                  )}
                </h3>
                <p>📍 {firm.area}</p>

                {/* Food Category Tags (Veg/Non-Veg) */}
                <div>
                  {firm.category && firm.category.map(cat => (
                    <span key={cat} className={`tag ${cat === 'veg' ? 'green' : ''}`}>
                      {cat === 'veg' ? '🟢' : '🔴'} {cat}
                    </span>
                  ))}

                  {/* Cuisine Region Tags */}
                  {firm.region && firm.region.map(reg => (
                    <span key={reg} className="tag">🍴 {reg}</span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default RestaurantList;
