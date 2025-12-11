import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, ScanLine, FolderOpen, GitCompare, BarChart3, Stethoscope, Eye } from "lucide-react";

import aiBrainImg from "@/assets/ai-brain.png";
import eyeScanImg from "@/assets/eye-scan.png";
import dnaDataImg from "@/assets/dna-data.png";
import mlNetworkImg from "@/assets/ml-network.png";

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

  const floatingGraphics = [
    { src: aiBrainImg, size: 200, x: 3, y: 10, duration: 12, delay: 0 },
    { src: eyeScanImg, size: 180, x: 85, y: 8, duration: 14, delay: 1 },
    { src: dnaDataImg, size: 160, x: 5, y: 65, duration: 11, delay: 2 },
    { src: mlNetworkImg, size: 190, x: 82, y: 70, duration: 13, delay: 0.5 },
  ];

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#ffffff', 
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
          linear-gradient(rgba(8, 145, 178, 0.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(8, 145, 178, 0.04) 1px, transparent 1px)
        `,
        backgroundSize: '80px 80px',
        animation: 'gridMove 25s linear infinite',
      }} />

      {/* Large Floating Graphics */}
      {floatingGraphics.map((item, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: `${item.x}%`,
            top: `${item.y}%`,
            width: `${item.size}px`,
            height: `${item.size}px`,
            animation: `floatGraphic ${item.duration}s ease-in-out infinite`,
            animationDelay: `${item.delay}s`,
            opacity: 0.4,
            zIndex: 1,
            borderRadius: '20px',
            overflow: 'hidden',
          }}
        >
          <img 
            src={item.src} 
            alt="" 
            style={{ 
              width: '100%', 
              height: '100%', 
              objectFit: 'cover',
              filter: 'blur(1px)',
            }} 
          />
        </div>
      ))}

      {/* Circular Tech Rings */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '900px',
        height: '900px',
        border: '1px solid rgba(8, 145, 178, 0.06)',
        borderRadius: '50%',
        animation: 'pulse 4s ease-in-out infinite',
      }} />
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '700px',
        height: '700px',
        border: '1px solid rgba(8, 145, 178, 0.08)',
        borderRadius: '50%',
        animation: 'pulse 4s ease-in-out infinite 0.5s',
      }} />
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '500px',
        height: '500px',
        border: '1px solid rgba(8, 145, 178, 0.1)',
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
            backgroundColor: 'rgba(8, 145, 178, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Eye size={24} style={{ color: '#0891b2' }} />
          </div>
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#111' }}>EyeQ</h1>
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
          color: '#111', 
          marginBottom: '16px', 
          textAlign: 'center',
        }}>
          Intelligent Eye Analysis
        </h2>
        <p style={{ fontSize: '18px', color: '#6b7280', marginBottom: '60px', textAlign: 'center', maxWidth: '600px' }}>
          Advanced AI-powered medical imaging analysis for OCT and Fundus scans
        </p>

        {/* Big Eye - Just the eyeball */}
        <div 
          ref={containerRef}
          style={{ position: 'relative', width: '400px', height: '400px' }}
        >
          {/* Outer Glow */}
          <div style={{
            position: 'absolute',
            inset: '-30px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(8, 145, 178, 0.15) 0%, transparent 70%)',
            animation: 'glow 3s ease-in-out infinite',
          }} />

          {/* Sclera (White of Eye) */}
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: '#fafafa',
            borderRadius: '50%',
            boxShadow: `
              inset 0 0 60px rgba(0,0,0,0.1),
              inset -20px 0 40px rgba(200,180,160,0.1),
              0 0 60px rgba(8, 145, 178, 0.2),
              0 20px 60px rgba(0,0,0,0.15)
            `,
            overflow: 'hidden',
          }}>
            {/* Blood Vessels */}
            <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.15 }}>
              <path d="M 20 120 Q 60 100 120 140" stroke="#cc4444" strokeWidth="1" fill="none" />
              <path d="M 320 80 Q 280 110 260 95" stroke="#cc4444" strokeWidth="0.8" fill="none" />
              <path d="M 25 200 Q 55 185 80 210" stroke="#cc4444" strokeWidth="0.6" fill="none" />
              <path d="M 360 240 Q 320 225 305 255" stroke="#cc4444" strokeWidth="0.7" fill="none" />
              <path d="M 40 280 Q 80 265 105 290" stroke="#cc4444" strokeWidth="0.5" fill="none" />
            </svg>
            
            {/* Iris */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '180px',
              height: '180px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, #2dd4bf 0%, #0891b2 30%, #0e7490 50%, #164e63 80%, #0c4a6e 100%)',
              boxShadow: 'inset 0 0 50px rgba(0,0,0,0.6), 0 0 30px rgba(8, 145, 178, 0.3)',
            }}>
              {/* Iris Texture */}
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
                  width: '65px',
                  height: '65px',
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
                  top: '10px',
                  right: '12px',
                  width: '15px',
                  height: '15px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255,255,255,0.95)',
                }} />
                <div style={{
                  position: 'absolute',
                  top: '24px',
                  right: '20px',
                  width: '6px',
                  height: '6px',
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
            background: 'linear-gradient(180deg, transparent, rgba(8, 145, 178, 0.6), transparent)',
            animation: 'scanLine 3s ease-in-out infinite',
            opacity: 0.5,
          }} />

          {/* Feature Buttons Around Eye */}
          {features.map((feature, index) => {
            const radius = 280;
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
                  border: '1px solid rgba(8, 145, 178, 0.2)',
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  cursor: 'pointer',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08), 0 0 20px rgba(8, 145, 178, 0.05)',
                  transition: 'all 0.3s ease',
                  fontWeight: 500,
                  fontSize: '14px',
                  color: '#374151',
                  whiteSpace: 'nowrap',
                  backdropFilter: 'blur(10px)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#0891b2';
                  e.currentTarget.style.color = 'white';
                  e.currentTarget.style.borderColor = '#0891b2';
                  e.currentTarget.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) scale(1.1)`;
                  e.currentTarget.style.boxShadow = '0 8px 30px rgba(8, 145, 178, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
                  e.currentTarget.style.color = '#374151';
                  e.currentTarget.style.borderColor = 'rgba(8, 145, 178, 0.2)';
                  e.currentTarget.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08), 0 0 20px rgba(8, 145, 178, 0.05)';
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
            border: 'none',
            backgroundColor: '#0891b2',
            color: 'white',
            cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(8,145,178,0.3)',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#0e7490';
            e.currentTarget.style.boxShadow = '0 8px 30px rgba(8,145,178,0.5)';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#0891b2';
            e.currentTarget.style.boxShadow = '0 4px 20px rgba(8,145,178,0.3)';
            e.currentTarget.style.transform = 'translateY(0)';
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
        @keyframes floatGraphic {
          0%, 100% { transform: translateY(0px) scale(1); }
          25% { transform: translateY(-20px) scale(1.02); }
          50% { transform: translateY(-10px) scale(0.98); }
          75% { transform: translateY(-25px) scale(1.01); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 0.5; transform: translate(-50%, -50%) scale(1.03); }
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
          100% { transform: translate(80px, 80px); }
        }
      `}</style>
    </div>
  );
};

export default Home;