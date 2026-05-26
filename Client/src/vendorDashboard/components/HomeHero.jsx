import React from 'react';
import { motion } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Float, Sphere, Cylinder, Box, ContactShadows, Environment, MeshDistortMaterial } from '@react-three/drei';
import '../../PremiumTheme.css';

const AbstractBurger = () => {
  return (
    <group position={[0, -0.5, 0]}>
      {/* Top Bun */}
      <Sphere args={[1.6, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} position={[0, 1.2, 0]}>
        <meshStandardMaterial color="#fca311" roughness={0.4} metalness={0.1} />
      </Sphere>
      
      {/* Lettuce */}
      <Cylinder args={[1.7, 1.7, 0.2, 32]} position={[0, 0.9, 0]}>
        <MeshDistortMaterial color="#55a630" speed={2} distort={0.3} radius={1} roughness={0.6} />
      </Cylinder>
      
      {/* Cheese */}
      <Box args={[2.4, 0.1, 2.4]} position={[0, 0.6, 0]} rotation={[0, Math.PI / 4, 0]}>
        <meshStandardMaterial color="#ffb703" roughness={0.2} metalness={0.2} />
      </Box>
      
      {/* Tomato */}
      <Cylinder args={[1.5, 1.5, 0.3, 32]} position={[0, 0.3, 0]}>
        <meshStandardMaterial color="#d00000" roughness={0.3} metalness={0.1} />
      </Cylinder>
      
      {/* Patty */}
      <Cylinder args={[1.55, 1.55, 0.5, 32]} position={[0, -0.2, 0]}>
        <meshStandardMaterial color="#370617" roughness={0.9} metalness={0.1} />
      </Cylinder>
      
      {/* Bottom Bun */}
      <Cylinder args={[1.6, 1.5, 0.4, 32]} position={[0, -0.8, 0]}>
        <meshStandardMaterial color="#fca311" roughness={0.5} />
      </Cylinder>
    </group>
  );
};

const HomeHero = ({ showLoginHandler, showRegisterHandler }) => {
  return (
    <div className="hero-section">
      <motion.div 
        className="hero-content"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <h1 className="hero-title">
          Scale Your <span className="highlight-text">Restaurant</span> With QuickEats
        </h1>
        <p className="hero-subtitle">
          The ultimate vendor dashboard. Add your firm, seamlessly manage your dynamic menu, and skyrocket your food business online.
        </p>
        <div className="hero-buttons">
          <motion.button 
            whileHover={{ scale: 1.05, boxShadow: "0 10px 20px rgba(255, 87, 34, 0.4)" }}
            whileTap={{ scale: 0.95 }}
            className="premium-btn" 
            onClick={showLoginHandler}
          >
            Vendor Login
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.05, backgroundColor: "rgba(255, 255, 255, 0.1)" }}
            whileTap={{ scale: 0.95 }}
            className="premium-btn ghost-btn" 
            onClick={showRegisterHandler}
          >
            Create Account
          </motion.button>
        </div>
        
        <div className="hero-stats">
          <div className="stat">
            <h4>10k+</h4>
            <p>Active Vendors</p>
          </div>
          <div className="stat">
            <h4>1M+</h4>
            <p>Orders Delivered</p>
          </div>
        </div>
      </motion.div>

      <div className="hero-canvas-container">
        <Canvas camera={{ position: [0, 2, 8], fov: 45 }}>
          <ambientLight intensity={0.6} />
          <spotLight position={[10, 15, 10]} angle={0.3} penumbra={1} intensity={2} castShadow />
          <pointLight position={[-10, -10, -10]} intensity={1} color="#ff5722" />
          
          <Environment preset="city" />
          
          <Float speed={2} rotationIntensity={1.5} floatIntensity={2}>
             <AbstractBurger />
          </Float>
          
          {/* Floating Accents */}
          <Float speed={3} rotationIntensity={2} floatIntensity={3}>
             <Sphere args={[0.3, 32, 32]} position={[3, 2, -1]}>
                <MeshDistortMaterial color="#ff5722" speed={3} distort={0.5} />
             </Sphere>
          </Float>
          <Float speed={2} rotationIntensity={3} floatIntensity={2}>
             <Box args={[0.5, 0.5, 0.5]} position={[-3, 1, 2]}>
                <meshStandardMaterial color="#ffc107" roughness={0.1} metalness={0.8} />
             </Box>
          </Float>

          <ContactShadows position={[0, -2.5, 0]} opacity={0.6} scale={15} blur={2.5} far={4} color="#000" />
          <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.8} maxPolarAngle={Math.PI / 2} minPolarAngle={Math.PI / 3} />
        </Canvas>
      </div>
    </div>
  );
};

export default HomeHero;
