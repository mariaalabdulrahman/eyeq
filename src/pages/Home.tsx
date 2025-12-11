import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, ScanLine, FolderOpen, GitCompare, BarChart3, Stethoscope, Eye } from "lucide-react";

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
        Math.hypot(e.clientX - eyeCenterX, e.clientY - eyeCenterY) / 15,
        40
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
    { icon: Upload, label: "Upload Image", angle: -60, action: () => navigate('/dashboard') },
    { icon: ScanLine, label: "Scan Analysis", angle: -20, action: () => navigate('/dashboard') },
    { icon: FolderOpen, label: "Patient Records", angle: 20, action: () => navigate('/records') },
    { icon: GitCompare, label: "Compare Scans", angle: 60, action: () => navigate('/dashboard') },
    { icon: BarChart3, label: "Visual Reports", angle: 100, action: () => navigate('/dashboard') },
    { icon: Stethoscope, label: "Doctor Tools", angle: 140, action: () => navigate('/dashboard') },
  ];

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#0a0f1a', 
      display: 'flex', 
      flexDirection: 'column',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Animated Background Grid */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `
          linear-gradient(rgba(8, 145, 178, 0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(8, 145, 178, 0.03) 1px, transparent 1px)
        `,
        backgroundSize: '50px 50px',
        animation: 'gridMove 20s linear infinite',
      }} />
      
      {/* Floating Particles */}
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            width: `${Math.random() * 4 + 2}px`,
            height: `${Math.random() * 4 + 2}px`,
            backgroundColor: '#0891b2',
            borderRadius: '50%',
            opacity: Math.random() * 0.5 + 0.1,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animation: `float ${Math.random() * 10 + 10}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 5}s`,
          }}
        />
      ))}

      {/* Circular Tech Rings */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '800px',
        height: '800px',
        border: '1px solid rgba(8, 145, 178, 0.1)',
        borderRadius: '50%',
        animation: 'pulse 4s ease-in-out infinite',
      }} />
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '600px',
        height: '600px',
        border: '1px solid rgba(8, 145, 178, 0.15)',
        borderRadius: '50%',
        animation: 'pulse 4s ease-in-out infinite 0.5s',
      }} />
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '400px',
        height: '400px',
        border: '1px solid rgba(8, 145, 178, 0.2)',
        borderRadius: '50%',
        animation: 'pulse 4s ease-in-out infinite 1s',
      }} />

      {/* Header */}
      <header style={{ padding: '24px 32px', position: 'relative', zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            backgroundColor: 'rgba(8, 145, 178, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Eye size={24} style={{ color: '#0891b2' }} />
          </div>
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#fff' }}>EyeQ</h1>
            <p style={{ fontSize: '12px', color: '#6b7280' }}>by LucidEye</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 32px', marginTop: '-40px', position: 'relative', zIndex: 10 }}>
        {/* Title */}
        <h2 style={{ 
          fontSize: '48px', 
          fontWeight: 700, 
          color: '#fff', 
          marginBottom: '16px', 
          textAlign: 'center',
          textShadow: '0 0 40px rgba(8, 145, 178, 0.3)',
        }}>
          Intelligent Eye Analysis
        </h2>
        <p style={{ fontSize: '18px', color: '#6b7280', marginBottom: '60px', textAlign: 'center', maxWidth: '600px' }}>
          Advanced AI-powered medical imaging analysis for OCT and Fundus scans
        </p>

        {/* Big Eye - Just the eyeball, no skin */}
        <div 
          ref={containerRef}
          style={{ position: 'relative', width: '500px', height: '500px' }}
        >
          {/* Outer Glow */}
          <div style={{
            position: 'absolute',
            inset: '-20px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(8, 145, 178, 0.2) 0%, transparent 70%)',
            animation: 'glow 3s ease-in-out infinite',
          }} />

          {/* Sclera (White of Eye) - Main eyeball */}
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: '#f8f8f8',
            borderRadius: '50%',
            boxShadow: `
              inset 0 0 60px rgba(0,0,0,0.15),
              inset -20px 0 40px rgba(200,180,160,0.15),
              0 0 80px rgba(8, 145, 178, 0.3),
              0 20px 60px rgba(0,0,0,0.4)
            `,
            overflow: 'hidden',
          }}>
            {/* Blood Vessels */}
            <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.2 }}>
              <path d="M 20 150 Q 80 130 150 170" stroke="#cc4444" strokeWidth="1" fill="none" />
              <path d="M 400 100 Q 350 140 320 120" stroke="#cc4444" strokeWidth="0.8" fill="none" />
              <path d="M 30 250 Q 70 230 100 260" stroke="#cc4444" strokeWidth="0.6" fill="none" />
              <path d="M 450 300 Q 400 280 380 320" stroke="#cc4444" strokeWidth="0.7" fill="none" />
              <path d="M 50 350 Q 100 330 130 360" stroke="#cc4444" strokeWidth="0.5" fill="none" />
            </svg>
            
            {/* Iris */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '220px',
              height: '220px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, #2dd4bf 0%, #0891b2 30%, #0e7490 50%, #164e63 80%, #0c4a6e 100%)',
              boxShadow: 'inset 0 0 50px rgba(0,0,0,0.6), 0 0 30px rgba(8, 145, 178, 0.4)',
            }}>
              {/* Iris Texture - Radial Lines */}
              {[...Array(36)].map((_, i) => (
                <div
                  key={i}
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    width: '2px',
                    height: '50%',
                    background: 'linear-gradient(180deg, transparent 0%, rgba(255,255,255,0.15) 30%, rgba(45,212,191,0.2) 60%, transparent 100%)',
                    transformOrigin: 'top',
                    transform: `rotate(${i * 10}deg)`,
                  }}
                />
              ))}
              
              {/* Limbal Ring */}
              <div style={{
                position: 'absolute',
                inset: '-4px',
                borderRadius: '50%',
                border: '4px solid rgba(12,74,110,0.8)',
              }} />
              
              {/* Pupil */}
              <div 
                style={{ 
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  backgroundColor: '#000',
                  transform: `translate(calc(-50% + ${pupilPosition.x}px), calc(-50% + ${pupilPosition.y}px))`,
                  transition: 'transform 0.08s ease-out',
                  boxShadow: '0 0 30px rgba(0,0,0,0.9), inset 0 0 20px rgba(8, 145, 178, 0.2)',
                }}
              >
                {/* Light Reflections */}
                <div style={{
                  position: 'absolute',
                  top: '12px',
                  right: '14px',
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255,255,255,0.95)',
                }} />
                <div style={{
                  position: 'absolute',
                  top: '28px',
                  right: '24px',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255,255,255,0.7)',
                }} />
              </div>
            </div>
          </div>

          {/* Scanning Line Animation */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '2px',
            height: '100%',
            background: 'linear-gradient(180deg, transparent, rgba(8, 145, 178, 0.8), transparent)',
            animation: 'scanLine 3s ease-in-out infinite',
            opacity: 0.6,
          }} />

          {/* Feature Buttons Around Eye */}
          {features.map((feature, index) => {
            const radius = 320;
            const angleRad = (feature.angle * Math.PI) / 180;
            const x = Math.cos(angleRad) * radius;
            const y = Math.sin(angleRad) * radius;
            const Icon = feature.icon;
            
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
                  padding: '12px 20px',
                  borderRadius: '24px',
                  border: '1px solid rgba(8, 145, 178, 0.3)',
                  backgroundColor: 'rgba(10, 15, 26, 0.9)',
                  cursor: 'pointer',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.3), 0 0 20px rgba(8, 145, 178, 0.1)',
                  transition: 'all 0.3s ease',
                  fontWeight: 500,
                  fontSize: '14px',
                  color: '#e5e7eb',
                  whiteSpace: 'nowrap',
                  backdropFilter: 'blur(10px)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#0891b2';
                  e.currentTarget.style.color = 'white';
                  e.currentTarget.style.borderColor = '#0891b2';
                  e.currentTarget.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) scale(1.1)`;
                  e.currentTarget.style.boxShadow = '0 8px 30px rgba(8, 145, 178, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(10, 15, 26, 0.9)';
                  e.currentTarget.style.color = '#e5e7eb';
                  e.currentTarget.style.borderColor = 'rgba(8, 145, 178, 0.3)';
                  e.currentTarget.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.3), 0 0 20px rgba(8, 145, 178, 0.1)';
                }}
              >
                <Icon size={18} />
                <span>{feature.label}</span>
              </button>
            );
          })}
        </div>

        {/* CTA Button */}
        <button 
          onClick={() => navigate('/dashboard')}
          style={{
            marginTop: '100px',
            padding: '16px 40px',
            fontSize: '18px',
            fontWeight: 600,
            borderRadius: '12px',
            border: '1px solid #0891b2',
            backgroundColor: 'rgba(8, 145, 178, 0.2)',
            color: 'white',
            cursor: 'pointer',
            boxShadow: '0 0 30px rgba(8,145,178,0.3)',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#0891b2';
            e.currentTarget.style.boxShadow = '0 0 50px rgba(8,145,178,0.5)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(8, 145, 178, 0.2)';
            e.currentTarget.style.boxShadow = '0 0 30px rgba(8,145,178,0.3)';
          }}
        >
          Start Analyzing
        </button>
      </main>

      {/* Footer */}
      <footer style={{ padding: '24px 32px', textAlign: 'center', fontSize: '14px', color: '#6b7280', position: 'relative', zIndex: 10 }}>
        <p>2024 LucidEye Technologies. All rights reserved.</p>
      </footer>

      {/* CSS Animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          25% { transform: translateY(-20px) translateX(10px); }
          50% { transform: translateY(-10px) translateX(-10px); }
          75% { transform: translateY(-30px) translateX(5px); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 0.6; transform: translate(-50%, -50%) scale(1.05); }
        }
        @keyframes glow {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
        @keyframes scanLine {
          0% { transform: translateX(-50%) rotate(0deg); }
          100% { transform: translateX(-50%) rotate(360deg); }
        }
        @keyframes gridMove {
          0% { transform: translate(0, 0); }
          100% { transform: translate(50px, 50px); }
        }
      `}</style>
    </div>
  );
};

export default Home;