import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const [pupilPosition, setPupilPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      const eyeCenterX = rect.left + rect.width / 2;
      const eyeCenterY = rect.top + rect.height / 2;
      
      const angle = Math.atan2(e.clientY - eyeCenterY, e.clientX - eyeCenterX);
      const distance = Math.min(
        Math.hypot(e.clientX - eyeCenterX, e.clientY - eyeCenterY) / 20,
        30
      );
      
      setPupilPosition({
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const features = [
    { icon: "📤", label: "Upload Image", angle: -70, action: () => navigate('/dashboard') },
    { icon: "🔬", label: "Scan Analysis", angle: -30, action: () => navigate('/dashboard') },
    { icon: "📋", label: "Patient Records", angle: 10, action: () => navigate('/records') },
    { icon: "⚖️", label: "Compare Scans", angle: 50, action: () => navigate('/dashboard') },
    { icon: "📊", label: "Visual Reports", angle: 90, action: () => navigate('/dashboard') },
    { icon: "🩺", label: "Doctor Tools", angle: 130, action: () => navigate('/dashboard') },
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header style={{ padding: '24px 32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            backgroundColor: '#ecfeff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <span style={{ fontSize: '20px' }}>👁️</span>
          </div>
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#111' }}>EyeQ</h1>
            <p style={{ fontSize: '12px', color: '#6b7280' }}>by LucidEye</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 32px', marginTop: '-40px' }}>
        {/* Title */}
        <h2 style={{ fontSize: '48px', fontWeight: 700, color: '#111', marginBottom: '16px', textAlign: 'center' }}>
          Intelligent Eye Analysis
        </h2>
        <p style={{ fontSize: '18px', color: '#6b7280', marginBottom: '60px', textAlign: 'center', maxWidth: '600px' }}>
          Advanced AI-powered medical imaging analysis for OCT and Fundus scans
        </p>

        {/* Realistic Eye Container */}
        <div 
          ref={containerRef}
          style={{ position: 'relative', width: '450px', height: '280px' }}
        >
          {/* Eye Shape (Almond/Lemon shape) */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, #fef3e2 0%, #fde8d0 50%, #fce4c4 100%)',
            borderRadius: '50% / 100%',
            boxShadow: 'inset 0 -20px 40px rgba(0,0,0,0.1), 0 10px 40px rgba(0,0,0,0.15)',
            border: '3px solid #d4a574',
          }}>
            {/* Upper Eyelid Shadow */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: '10%',
              right: '10%',
              height: '30%',
              background: 'linear-gradient(180deg, rgba(180,140,100,0.3) 0%, transparent 100%)',
              borderRadius: '50% 50% 0 0',
            }} />
            
            {/* Sclera (White of Eye) */}
            <div style={{
              position: 'absolute',
              top: '15%',
              left: '15%',
              right: '15%',
              bottom: '15%',
              backgroundColor: '#fff',
              borderRadius: '50%',
              boxShadow: 'inset 0 4px 20px rgba(0,0,0,0.1), inset -5px 0 15px rgba(200,180,160,0.2)',
              overflow: 'hidden',
            }}>
              {/* Blood Vessels */}
              <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.15 }}>
                <path d="M 10 80 Q 40 70 80 90" stroke="#cc4444" strokeWidth="0.5" fill="none" />
                <path d="M 250 60 Q 220 80 200 70" stroke="#cc4444" strokeWidth="0.5" fill="none" />
                <path d="M 20 130 Q 50 120 70 140" stroke="#cc4444" strokeWidth="0.4" fill="none" />
              </svg>
              
              {/* Iris */}
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '140px',
                height: '140px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, #3d7a5a 0%, #2d5a40 40%, #1a3a28 70%, #0f2518 100%)',
                boxShadow: 'inset 0 0 30px rgba(0,0,0,0.5), 0 0 10px rgba(0,0,0,0.2)',
              }}>
                {/* Iris Texture */}
                {[...Array(24)].map((_, i) => (
                  <div
                    key={i}
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      width: '1px',
                      height: '50%',
                      background: 'linear-gradient(180deg, transparent 0%, rgba(100,160,120,0.4) 30%, rgba(60,100,70,0.3) 60%, transparent 100%)',
                      transformOrigin: 'top',
                      transform: `rotate(${i * 15}deg)`,
                    }}
                  />
                ))}
                
                {/* Limbal Ring */}
                <div style={{
                  position: 'absolute',
                  inset: '-2px',
                  borderRadius: '50%',
                  border: '3px solid rgba(10,30,20,0.6)',
                }} />
                
                {/* Pupil */}
                <div 
                  style={{ 
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    backgroundColor: '#000',
                    transform: `translate(calc(-50% + ${pupilPosition.x}px), calc(-50% + ${pupilPosition.y}px))`,
                    transition: 'transform 0.1s ease-out',
                    boxShadow: '0 0 20px rgba(0,0,0,0.8)',
                  }}
                >
                  {/* Light Reflections */}
                  <div style={{
                    position: 'absolute',
                    top: '8px',
                    right: '10px',
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(255,255,255,0.9)',
                  }} />
                  <div style={{
                    position: 'absolute',
                    top: '18px',
                    right: '18px',
                    width: '5px',
                    height: '5px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(255,255,255,0.6)',
                  }} />
                </div>
              </div>
            </div>
            
            {/* Lower Eyelid Highlight */}
            <div style={{
              position: 'absolute',
              bottom: '5%',
              left: '20%',
              right: '20%',
              height: '15%',
              background: 'linear-gradient(0deg, rgba(255,255,255,0.3) 0%, transparent 100%)',
              borderRadius: '0 0 50% 50%',
            }} />
          </div>

          {/* Feature Buttons Around Eye */}
          {features.map((feature, index) => {
            const radiusX = 300;
            const radiusY = 180;
            const angleRad = (feature.angle * Math.PI) / 180;
            const x = Math.cos(angleRad) * radiusX;
            const y = Math.sin(angleRad) * radiusY;
            
            return (
              <button
                key={index}
                onClick={feature.action}
                style={{
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 16px',
                  borderRadius: '20px',
                  border: '1px solid #e5e7eb',
                  backgroundColor: 'white',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  transition: 'all 0.3s ease',
                  fontWeight: 500,
                  fontSize: '14px',
                  color: '#374151',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#0891b2';
                  e.currentTarget.style.color = 'white';
                  e.currentTarget.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) scale(1.1)`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'white';
                  e.currentTarget.style.color = '#374151';
                  e.currentTarget.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
                }}
              >
                <span>{feature.icon}</span>
                <span>{feature.label}</span>
              </button>
            );
          })}
        </div>

        {/* CTA Button */}
        <button 
          onClick={() => navigate('/dashboard')}
          style={{
            marginTop: '80px',
            padding: '16px 40px',
            fontSize: '18px',
            fontWeight: 600,
            borderRadius: '12px',
            border: 'none',
            backgroundColor: '#0891b2',
            color: 'white',
            cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(8,145,178,0.4)',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)';
            e.currentTarget.style.boxShadow = '0 6px 30px rgba(8,145,178,0.5)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 4px 20px rgba(8,145,178,0.4)';
          }}
        >
          Start Analyzing
        </button>
      </main>

      {/* Footer */}
      <footer style={{ padding: '24px 32px', textAlign: 'center', fontSize: '14px', color: '#6b7280' }}>
        <p>© 2024 LucidEye Technologies. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Home;
