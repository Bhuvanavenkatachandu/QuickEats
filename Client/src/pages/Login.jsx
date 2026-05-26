import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { API_URL } from '../vendorDashboard/data/apiPath';
import { motion } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Float, Sphere } from '@react-three/drei';
import '../styles/PremiumUI.css';

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const loginHandler = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const response = await fetch(`${API_URL}/vendor/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      
      if (response.ok) {
        localStorage.setItem("loginToken", data.token);
        
        if(data.vendorId){
          const vendorResponse = await fetch(`${API_URL}/vendor/single-vendor/${data.vendorId}`);
          const vendorData = await vendorResponse.json();
          if (vendorResponse.ok && vendorData.vendor.firm.length > 0) {
            localStorage.setItem('firmId', vendorData.vendor.firm[0]._id);
            localStorage.setItem('firmName', vendorData.vendor.firm[0].firmname);
          }
        }
        navigate('/dashboard'); 
      } else {
        setError(data.error || "Invalid credentials. Please try again.");
      }
    } catch (err) {
      setError("Server error. Please check your connection.");
    }
  };

  return (
    <div className="auth-layout">
      <div className="auth-left">
        <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[2, 5, 2]} intensity={1} />
          <Float speed={2} rotationIntensity={1} floatIntensity={1}>
            <Sphere args={[1.2, 64, 64]}>
              <meshStandardMaterial color="#ff6b00" roughness={0.2} />
            </Sphere>
          </Float>
          <OrbitControls enableZoom={false} autoRotate />
        </Canvas>
      </div>

      <div className="auth-right">
        <motion.div 
          className="glass-panel auth-form"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2>Vendor Login</h2>
          <p>Access your restaurant dashboard</p>

          {error && <div className="error-box">{error}</div>}

          <form onSubmit={loginHandler}>
            <div className="form-group">
              <label>Email Address</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <button type="submit" className="btn-primary" style={{width: '100%'}}>Login</button>
          </form>

          <p style={{marginTop: '20px', textAlign: 'center'}}>
            Don't have an account? <Link to="/register" style={{color: 'var(--primary)', fontWeight: 'bold', textDecoration: 'none'}}>Register</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
