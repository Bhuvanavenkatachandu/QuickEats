import React, { useState } from 'react';
import { API_URL } from '../../data/apiPath';
import { motion } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Float, Sphere, Environment, ContactShadows, MeshTransmissionMaterial } from '@react-three/drei';
import '../../../PremiumTheme.css';

const GlassyDonut = () => (
  <Float speed={2.5} rotationIntensity={2} floatIntensity={3}>
    <mesh position={[0, 0, 0]}>
      <torusGeometry args={[1.5, 0.6, 64, 128]} />
      <MeshTransmissionMaterial 
        backside 
        backsideThickness={1} 
        thickness={2} 
        roughness={0.1} 
        transmission={1} 
        ior={1.5} 
        chromaticAberration={0.4} 
        anisotropicBlur={0.2}
        color="#ff7b00"
      />
    </mesh>
    <Sphere args={[0.4, 32, 32]} position={[0, 2.5, 0]}>
      <meshStandardMaterial color="#fff" roughness={0.1} metalness={0.8} />
    </Sphere>
    <Sphere args={[0.2, 32, 32]} position={[2, -1, 1]}>
      <meshStandardMaterial color="#ffc107" roughness={0.2} metalness={0.5} />
    </Sphere>
  </Float>
);

const Login = ({ showWelcomeHandler, showRegisterHandler }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const loginHandler = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/vendor/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (response.ok) {
        setEmail("");
        setPassword("");
        localStorage.setItem("loginToken", data.token);
        showWelcomeHandler();
      }
      
      if(data.vendorId){
        const vendorId = data.vendorId;
        const vendorResponse = await fetch(`${API_URL}/vendor/single-vendor/${vendorId}`);
        const vendorData = await vendorResponse.json();
        if (vendorResponse.ok) {
          const vendorFirmId = vendorData.vendor.firm[0]._id;
          const vendorFirmName = vendorData.vendor.firm[0].firmname;
          localStorage.setItem('firmId', vendorFirmId);
          localStorage.setItem('firmName', vendorFirmName);
          window.location.reload();
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <motion.div 
      className="split-screen"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="split-left">
        <Canvas camera={{ position: [0, 0, 7], fov: 45 }}>
          <ambientLight intensity={0.5} />
          <spotLight position={[10, 10, 10]} intensity={2} penumbra={1} />
          <Environment preset="city" />
          <GlassyDonut />
          <ContactShadows position={[0, -3, 0]} opacity={0.7} scale={10} blur={2.5} far={4} color="#000" />
          <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={1.5} />
        </Canvas>
      </div>

      <div className="split-right">
        <div className="glass-container premium-auth-form">
          <h3>Welcome Back</h3>
          <p>Sign in to your vendor dashboard to manage your menu and track orders.</p>
          
          <form onSubmit={loginHandler}>
            <div className="input-group">
              <label>Email Address</label>
              <input 
                className="premium-input"
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder='vendor@quickeats.com' 
                required
              />
            </div>
            
            <div className="input-group">
              <label>Password</label>
              <input 
                className="premium-input"
                type='password' 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder='••••••••' 
                required
              />
            </div>
            
            <button className="premium-btn" type='submit'>
              Secure Login
            </button>
          </form>

          <div className="auth-link" onClick={showRegisterHandler}>
            Don't have an account? <b>Register your Firm</b>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default Login;