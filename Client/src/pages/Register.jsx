import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { API_URL } from '../vendorDashboard/data/apiPath';
import { motion } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Float, Box } from '@react-three/drei';
import '../styles/PremiumUI.css';

const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const response = await fetch(`${API_URL}/vendor/register`, {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
      });
      const data = await response.json();
      
      if (response.ok) {
        navigate('/login'); 
      } else {
        setError(data.error || "Registration failed. Please try again.");
      }
    } catch (err) {
      setError("Server error. Please check your connection.");
    }
  };

  return (
    <div className="auth-layout">
      <div className="auth-left" style={{background: '#e0f2fe'}}>
        <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[2, 5, 2]} intensity={1} />
          <Float speed={2} rotationIntensity={1} floatIntensity={1}>
            <Box args={[1.5, 1.5, 1.5]} rotation={[0.5, 0.5, 0]}>
              <meshStandardMaterial color="#0284c7" roughness={0.2} />
            </Box>
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
          <h2>Register Firm</h2>
          <p>Partner with QuickEats today</p>

          {error && <div className="error-box">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Vendor Username</label>
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <button type="submit" className="btn-primary" style={{width: '100%'}}>Register</button>
          </form>

          <p style={{marginTop: '20px', textAlign: 'center'}}>
            Already have an account? <Link to="/login" style={{color: 'var(--primary)', fontWeight: 'bold', textDecoration: 'none'}}>Login</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
