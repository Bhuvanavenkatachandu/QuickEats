import React, { useState } from 'react';
import { API_URL } from '../../data/apiPath';
import { motion } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Float, Box, Sphere, Environment, ContactShadows, MeshWobbleMaterial } from '@react-three/drei';
import '../../../PremiumTheme.css';

const AbstractStorefront = () => (
  <Float speed={2} rotationIntensity={1.5} floatIntensity={2}>
    <group position={[0, 0, 0]}>
      {/* Central building core */}
      <Box args={[2, 2.5, 2]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#ffffff" roughness={0.1} metalness={0.8} />
      </Box>
      {/* Dynamic roof/awning */}
      <Box args={[2.4, 0.2, 2.4]} position={[0, 1.35, 0]}>
        <meshStandardMaterial color="#ff5722" roughness={0.3} />
      </Box>
      {/* Bouncing jelly object */}
      <Sphere args={[0.6, 32, 32]} position={[0, 2.5, 0]}>
        <MeshWobbleMaterial factor={1} speed={2} color="#ffc107" roughness={0} metalness={0.5} />
      </Sphere>
      <Box args={[0.5, 0.5, 0.5]} position={[-1.5, -1, 1.5]} rotation={[Math.PI/4, Math.PI/4, 0]}>
        <meshStandardMaterial color="#d84315" roughness={0.2} metalness={0.5} />
      </Box>
    </group>
  </Float>
);

const Register = ({ showLoginHandler }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/vendor/register`, {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
      });
      const data = await response.json();
      if (response.ok) {
        setUsername("");
        setEmail("");
        setPassword("");
        showLoginHandler();
      }
    } catch (error) {
      console.error("Registration failed", error);
    }
  };

  return (
    <motion.div 
      className="split-screen"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="split-right">
        <div className="glass-container premium-auth-form">
          <h3>Join QuickEats</h3>
          <p>Partner with us and scale your food business with our powerful dashboard.</p>
          
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label>Vendor Username</label>
              <input 
                className="premium-input"
                type="text" 
                placeholder='Enter your name' 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
                required
              />
            </div>
            
            <div className="input-group">
              <label>Email Address</label>
              <input 
                className="premium-input"
                type="email" 
                placeholder='Enter your email' 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required
              />
            </div>
            
            <div className="input-group">
              <label>Password</label>
              <input 
                className="premium-input"
                type="password" 
                placeholder='Create a secure password' 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required
              />
            </div>
            
            <button className="premium-btn" type='submit'>
              Register Firm
            </button>
          </form>

          <div className="auth-link" onClick={showLoginHandler}>
            Already a partner? <b>Login here</b>
          </div>
        </div>
      </div>

      <div className="split-left">
        <Canvas camera={{ position: [0, 3, 8], fov: 45 }}>
          <ambientLight intensity={0.6} />
          <spotLight position={[-10, 20, 10]} intensity={2} angle={0.5} penumbra={1} castShadow />
          <Environment preset="city" />
          <AbstractStorefront />
          <ContactShadows position={[0, -2.5, 0]} opacity={0.6} scale={15} blur={2} far={4} color="#000" />
          <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={1.2} maxPolarAngle={Math.PI / 2 + 0.1} />
        </Canvas>
      </div>
    </motion.div>
  );
}

export default Register;