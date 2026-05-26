import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { API_URL } from '../../vendorDashboard/data/apiPath';
import '../../styles/PremiumUI.css';

// ============================================================
//  RestaurantMenu.jsx — Menu Page for a Single Restaurant
//  Shows all products of a specific firm/restaurant.
//  Customers can add items to cart, then place an order.
//  Uses Redis-cached product data from the backend.
// ============================================================

const RestaurantMenu = () => {
  const { firmId } = useParams(); // Get firmId from URL: /customer/menu/:firmId
  const navigate = useNavigate();

  const [restaurantName, setRestaurantName] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cart, setCart] = useState({}); // { productId: { ...product, quantity: n } }
  const [ordering, setOrdering] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState('');
  const [address, setAddress] = useState('');
  const [showOrderForm, setShowOrderForm] = useState(false);

  // Total number of items in cart
  const cartCount = Object.values(cart).reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = Object.values(cart).reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);

  // Fetch products for this restaurant
  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const response = await fetch(`${API_URL}/product/${firmId}/products`);
        const data = await response.json();
        if (response.ok) {
          setRestaurantName(data.restaurentName);
          setProducts(data.products || []);
        } else {
          setError('Failed to load menu.');
        }
      } catch (err) {
        setError('Cannot connect to server.');
      } finally {
        setLoading(false);
      }
    };

    fetchMenu();
  }, [firmId]);

  // Add one item to the cart
  const addToCart = (product) => {
    setCart(prev => {
      if (prev[product._id]) {
        // Already in cart — increase quantity
        return { ...prev, [product._id]: { ...prev[product._id], quantity: prev[product._id].quantity + 1 } };
      } else {
        // New item — add to cart with quantity 1
        return { ...prev, [product._id]: { ...product, quantity: 1 } };
      }
    });
  };

  // Remove one item from the cart
  const removeFromCart = (productId) => {
    setCart(prev => {
      if (!prev[productId]) return prev;
      if (prev[productId].quantity === 1) {
        // Remove item entirely
        const updated = { ...prev };
        delete updated[productId];
        return updated;
      }
      return { ...prev, [productId]: { ...prev[productId], quantity: prev[productId].quantity - 1 } };
    });
  };

  // Place the order
  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    // Check if customer is logged in
    const customerToken = localStorage.getItem('customerToken');
    if (!customerToken) {
      navigate('/customer/login');
      return;
    }

    if (!address.trim()) {
      alert('Please enter your delivery address!');
      return;
    }

    setOrdering(true);

    // Convert cart object into an array of order items
    const items = Object.values(cart).map(item => ({
      product: item._id,
      productname: item.productname,
      price: parseFloat(item.price),
      quantity: item.quantity
    }));

    try {
      const response = await fetch(`${API_URL}/order/place`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'token': customerToken
        },
        body: JSON.stringify({ firmId, items, deliveryAddress: address })
      });

      const data = await response.json();

      if (response.ok) {
        setOrderSuccess('Order placed successfully! 🎉');
        setCart({});
        setShowOrderForm(false);
        // Navigate to order tracking after 2 seconds
        setTimeout(() => {
          navigate(`/customer/track/${data.order._id}`);
        }, 2000);
      } else {
        setError(data.error || 'Failed to place order.');
      }
    } catch (err) {
      setError('Server error. Please try again.');
    } finally {
      setOrdering(false);
    }
  };

  return (
    <div className="menu-page">
      {/* Navigation */}
      <nav className="customer-nav">
        <Link to="/restaurants" className="brand">Quick<span>Eats</span></Link>
        <div className="nav-links">
          <Link to="/restaurants" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem' }}>
            ← All Restaurants
          </Link>
        </div>
      </nav>

      {/* Restaurant Header */}
      <div className="menu-header">
        <h1>{restaurantName || 'Restaurant Menu'}</h1>
        <p>Fresh food made with love 🍳</p>
      </div>

      {orderSuccess && (
        <div style={{ padding: '1rem 5%' }}>
          <div className="success-box" style={{ textAlign: 'center', fontSize: '1rem' }}>{orderSuccess}</div>
        </div>
      )}

      {error && <div style={{ padding: '1rem 5%' }}><div className="error-box">{error}</div></div>}

      {loading && (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading menu...</p>
        </div>
      )}

      {/* Products Grid */}
      {!loading && products.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">🍽️</div>
          <h3>No items on the menu yet</h3>
          <p>This restaurant hasn't added products yet.</p>
        </div>
      )}

      {!loading && products.length > 0 && (
        <div className="menu-grid">
          {products.map((product) => {
            const qty = cart[product._id]?.quantity || 0;
            return (
              <div key={product._id} className="menu-item-card">
                {/* Product Image */}
                <div className="menu-item-img">
                  {product.image ? (
                    <img src={`${API_URL}/uploads/${product.image}`} alt={product.productname} />
                  ) : (
                    <span>🍽️</span>
                  )}
                </div>

                <div className="menu-item-body">
                  <h3>{product.productname}</h3>
                  {product.description && <p>{product.description}</p>}

                  {/* Tags */}
                  <div style={{ marginBottom: '0.75rem' }}>
                    {product.category && product.category.map(cat => (
                      <span key={cat} className={`tag ${cat === 'veg' ? 'green' : ''}`}>
                        {cat === 'veg' ? '🟢' : '🔴'} {cat}
                      </span>
                    ))}
                    {product.bestSellar === 'true' && (
                      <span className="tag" style={{ background: '#fef9c3', color: '#713f12', borderColor: 'rgba(234,179,8,0.3)' }}>
                        ⭐ Best Seller
                      </span>
                    )}
                  </div>

                  <div className="menu-item-footer">
                    <span className="price">₹{product.price}</span>

                    {/* Quantity Control */}
                    {qty === 0 ? (
                      <button className="btn-primary" style={{ padding: '0.45rem 1.2rem', fontSize: '0.85rem' }}
                        onClick={() => addToCart(product)}>
                        + Add
                      </button>
                    ) : (
                      <div className="qty-control">
                        <button className="qty-btn" onClick={() => removeFromCart(product._id)}>−</button>
                        <span className="qty-value">{qty}</span>
                        <button className="qty-btn" onClick={() => addToCart(product)}>+</button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cart Bar — appears when items are in the cart */}
      <div className={`cart-bar ${cartCount > 0 ? 'visible' : ''}`}>
        <div className="cart-bar-info">
          🛒 {cartCount} item{cartCount !== 1 ? 's' : ''} &nbsp;|&nbsp; Total: <span>₹{cartTotal.toFixed(0)}</span>
        </div>
        <button
          className="btn-primary"
          style={{ padding: '0.65rem 1.5rem' }}
          onClick={() => setShowOrderForm(true)}
        >
          Place Order →
        </button>
      </div>

      {/* Order Form Modal */}
      {showOrderForm && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 300, padding: '1rem'
        }}>
          <div style={{
            background: '#fff', borderRadius: 'var(--radius-xl)', padding: '2rem',
            width: '100%', maxWidth: '480px', boxShadow: 'var(--shadow-xl)'
          }}>
            <h2 style={{ fontFamily: 'Outfit', fontWeight: 800, marginBottom: '1.5rem' }}>
              Confirm Your Order 🛒
            </h2>

            {/* Order Summary */}
            <div className="order-summary-items">
              {Object.values(cart).map(item => (
                <div key={item._id} className="order-item-row">
                  <span>{item.productname} × {item.quantity}</span>
                  <span>₹{(parseFloat(item.price) * item.quantity).toFixed(0)}</span>
                </div>
              ))}
              <div className="order-total">
                <span>Total</span>
                <span>₹{cartTotal.toFixed(0)}</span>
              </div>
            </div>

            <form onSubmit={handlePlaceOrder}>
              <div className="form-group">
                <label>Delivery Address</label>
                <textarea
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  placeholder="Enter your full delivery address..."
                  style={{
                    width: '100%', padding: '0.8rem 1rem',
                    border: '1.5px solid var(--border)', borderRadius: 'var(--radius-sm)',
                    fontFamily: 'Inter', fontSize: '0.95rem', resize: 'vertical',
                    minHeight: '80px', outline: 'none'
                  }}
                  required
                />
              </div>

              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                💳 Payment: Cash on Delivery
              </p>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button type="submit" className="btn-primary" style={{ flex: 1 }} disabled={ordering}>
                  {ordering ? 'Placing Order...' : '✅ Confirm Order'}
                </button>
                <button type="button" className="btn-secondary" onClick={() => setShowOrderForm(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RestaurantMenu;
