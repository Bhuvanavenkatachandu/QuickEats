import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Float, Torus, Cylinder, Box } from '@react-three/drei';
import '../styles/PremiumUI.css';

const FoodScene = () => {
  return (
    <>
      <ambientLight intensity={0.8} />
      <directionalLight position={[5, 10, 5]} intensity={1.5} color="#fff" />
      
      <Float speed={2} rotationIntensity={1.5} floatIntensity={2}>
        <group position={[0, 0, 0]}>
          <Cylinder args={[1.5, 1.5, 0.4, 32]} position={[0, 1, 0]}>
            <meshStandardMaterial color="#fca311" />
          </Cylinder>
          <Box args={[2.2, 0.1, 2.2]} position={[0, 0.6, 0]} rotation={[0, Math.PI / 4, 0]}>
            <meshStandardMaterial color="#ffb703" />
          </Box>
          <Cylinder args={[1.4, 1.4, 0.5, 32]} position={[0, 0.1, 0]}>
            <meshStandardMaterial color="#4a2511" />
          </Cylinder>
          <Cylinder args={[1.5, 1.5, 0.4, 32]} position={[0, -0.6, 0]}>
            <meshStandardMaterial color="#fca311" />
          </Cylinder>
        </group>
      </Float>

      <Float speed={3} rotationIntensity={2} floatIntensity={3}>
        <Torus args={[0.5, 0.2, 16, 32]} position={[3, 2, -2]} rotation={[1, 0, 0]}>
          <meshStandardMaterial color="#ef4444" />
        </Torus>
      </Float>
    </>
  );
};

const Home = () => {
  return (
    <div className="home-container">
      {/* Navbar Section */}
      <nav style={{position: 'absolute', top: 0, left: 0, right: 0, padding: '20px 8%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 100}}>
        <div style={{fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--dark)'}}>
          Quick<span style={{color: 'var(--primary)'}}>Eats</span>
        </div>
        <div style={{display: 'flex', gap: '20px'}}>
          <Link to="/" style={{textDecoration: 'none', color: 'var(--dark)', fontWeight: '500'}}>Home</Link>
          <Link to="/restaurants" style={{textDecoration: 'none', color: 'var(--dark)', fontWeight: '500'}}>Order Food</Link>
          <Link to="/login" style={{textDecoration: 'none', color: 'var(--dark)', fontWeight: '500'}}>Vendor Login</Link>
          <Link to="/register" style={{textDecoration: 'none', color: 'var(--dark)', fontWeight: '500'}}>Vendor Register</Link>
        </div>
      </nav>

      <motion.div 
        className="home-content"
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="home-title">
          Order <span>Food</span> or Manage Your <span>Restaurant</span>
        </h1>
        <p className="home-subtitle">
          Craving something delicious? Order from the best restaurants in town.
          <br /><br />
          Restaurant owner? Add your firm, manage your menu, and grow your business online.
        </p>
        <div className="btn-group">
          <Link to="/restaurants" className="btn-primary">Order Food Now</Link>
          <Link to="/login" className="btn-secondary">Vendor Portal</Link>
        </div>
      </motion.div>

      <div className="home-canvas">
        <Canvas camera={{ position: [0, 2, 8], fov: 45 }}>
          <FoodScene />
          <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={1} />
        </Canvas>
      </div>
    </div>
  );
};

export default Home;
