import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, ScanLine, FolderOpen, GitCompare, BarChart3, Stethoscope } from "lucide-react";
import Logo from "@/components/Logo";
import kkeshLogo from "@/assets/kkesh-logo.png";

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
      const distance = Math.min(Math.hypot(e.clientX - eyeCenterX, e.clientY - eyeCenterY) / 15, 60);

      setPupilPosition({
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const features = [
    { icon: Upload, label: "Upload Image", angle: -140, action: () => navigate("/dashboard") },
    { icon: ScanLine, label: "Scan Analysis", angle: -180, action: () => navigate("/dashboard") },
    { icon: FolderOpen, label: "Patient Records", angle: -220, action: () => navigate("/records") },
    { icon: GitCompare, label: "Compare Scans", angle: -40, action: () => navigate("/dashboard") },
    { icon: BarChart3, label: "Visual Reports", angle: 0, action: () => navigate("/dashboard") },
    { icon: Stethoscope, label: "Doctor Tools", angle: 40, action: () => navigate("/dashboard") },
  ];

  const floatingGraphics = [
    { src: aiBrainImg, size: 200, x: 3, y: 10, duration: 12, delay: 0 },
    { src: eyeScanImg, size: 180, x: 85, y: 8, duration: 14, delay: 1 },
    { src: dnaDataImg, size: 160, x: 5, y: 65, duration: 11, delay: 2 },
    { src: mlNetworkImg, size: 190, x: 82, y: 70, duration: 13, delay: 0.5 },
  ];

  return (
    <div
      style={{
        height: "100vh",
        maxHeight: "100vh",
        backgroundColor: "#ffffff",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Animated Background Grid */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
          linear-gradient(rgba(8, 145, 178, 0.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(8, 145, 178, 0.04) 1px, transparent 1px)
        `,
          backgroundSize: "80px 80px",
          animation: "gridMove 25s linear infinite",
        }}
      />

      {/* Large Floating Graphics */}
      {floatingGraphics.map((item, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: `${item.x}%`,
            top: `${item.y}%`,
            width: `${item.size}px`,
            height: `${item.size}px`,
            animation: `floatGraphic ${item.duration}s ease-in-out infinite`,
            animationDelay: `${item.delay}s`,
            opacity: 0.4,
            zIndex: 1,
            borderRadius: "20px",
            overflow: "hidden",
          }}
        >
          <img
            src={item.src}
            alt=""
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              filter: "blur(1px)",
            }}
          />
        </div>
      ))}

      {/* Circular Tech Rings */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "900px",
          height: "900px",
          border: "1px solid rgba(8, 145, 178, 0.06)",
          borderRadius: "50%",
          animation: "pulse 4s ease-in-out infinite",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "700px",
          height: "700px",
          border: "1px solid rgba(8, 145, 178, 0.08)",
          borderRadius: "50%",
          animation: "pulse 4s ease-in-out infinite 0.5s",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "500px",
          height: "500px",
          border: "1px solid rgba(8, 145, 178, 0.1)",
          borderRadius: "50%",
          animation: "pulse 4s ease-in-out infinite 1s",
        }}
      />

      {/* Header */}
      <header style={{ padding: "16px 24px", position: "relative", zIndex: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
          <Logo size={36} />
        </div>
        <img 
          src={kkeshLogo} 
          alt="King Khaled Eye Specialist Hospital" 
          style={{ height: "50px", objectFit: "contain" }}
        />
      </header>

      {/* Main Content */}
      <main
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 24px",
          marginTop: "-20px",
          position: "relative",
          zIndex: 10,
        }}
      >
        {/* Title */}
        <h2
          style={{
            fontSize: "36px",
            fontWeight: 700,
            color: "#111",
            marginBottom: "10px",
            textAlign: "center",
          }}
        >
          Intelligent Eye Analysis
        </h2>
        <p style={{ fontSize: "15px", color: "#6b7280", marginBottom: "30px", textAlign: "center", maxWidth: "500px" }}>
          Advanced AI-powered medical imaging analysis for OCT and Fundus scans
        </p>

        {/* Big Eye - Just the eyeball */}
        <div ref={containerRef} style={{ position: "relative", width: "380px", height: "380px" }}>
          {/* Outer Glow */}
          <div
            style={{
              position: "absolute",
              inset: "-40px",
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(8, 145, 178, 0.15) 0%, transparent 70%)",
              animation: "glow 3s ease-in-out infinite",
            }}
          />

          {/* Sclera (White of Eye) - More realistic */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundColor: "#fefefe",
              borderRadius: "50%",
              boxShadow: `
              inset 0 0 80px rgba(0,0,0,0.08),
              inset -25px 0 50px rgba(200,180,160,0.08),
              inset 25px 0 50px rgba(180,160,140,0.06),
              0 0 80px rgba(8, 145, 178, 0.15),
              0 25px 80px rgba(0,0,0,0.12)
            `,
              overflow: "hidden",
            }}
          >
            {/* Subtle sclera texture */}
            <div style={{
              position: "absolute",
              inset: 0,
              background: "radial-gradient(ellipse at 30% 20%, rgba(255,220,200,0.04) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(200,180,160,0.03) 0%, transparent 50%)",
            }} />
            
            {/* Blood Vessels - More detailed and realistic */}
            <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.12 }}>
              {/* Main vessels */}
              <path d="M 15 100 Q 45 85 85 110 Q 110 120 130 115" stroke="#b91c1c" strokeWidth="1.2" fill="none" />
              <path d="M 330 70 Q 295 90 270 80 Q 250 75 235 85" stroke="#b91c1c" strokeWidth="1" fill="none" />
              <path d="M 20 180 Q 50 165 75 185 Q 95 200 110 190" stroke="#dc2626" strokeWidth="0.9" fill="none" />
              <path d="M 370 220 Q 335 205 310 230 Q 290 245 270 235" stroke="#dc2626" strokeWidth="0.8" fill="none" />
              <path d="M 30 260 Q 65 245 95 270 Q 115 285 130 275" stroke="#b91c1c" strokeWidth="0.7" fill="none" />
              <path d="M 355 300 Q 320 285 295 305" stroke="#dc2626" strokeWidth="0.6" fill="none" />
              {/* Smaller branching vessels */}
              <path d="M 85 110 Q 100 105 110 115" stroke="#ef4444" strokeWidth="0.5" fill="none" />
              <path d="M 270 80 Q 260 85 255 78" stroke="#ef4444" strokeWidth="0.4" fill="none" />
              <path d="M 75 185 Q 85 175 95 180" stroke="#ef4444" strokeWidth="0.4" fill="none" />
            </svg>

            {/* Iris - moves with cursor - SMALLER relative to bigger eyeball */}
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                width: "160px",
                height: "160px",
                borderRadius: "50%",
                background: "radial-gradient(circle at 35% 35%, #93c5fd 0%, #60a5fa 12%, #3b82f6 25%, #2563eb 45%, #1d4ed8 70%, #1e40af 100%)",
                boxShadow: "inset 0 0 50px rgba(0,0,0,0.5), inset 0 0 15px rgba(59,130,246,0.3), 0 0 20px rgba(8, 145, 178, 0.25)",
                transform: `translate(calc(-50% + ${pupilPosition.x}px), calc(-50% + ${pupilPosition.y}px))`,
                transition: "transform 0.08s ease-out",
              }}
            >
              {/* Iris Texture - More detailed radial fibers */}
              {[...Array(48)].map((_, i) => (
                <div
                  key={i}
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    width: i % 2 === 0 ? "1.5px" : "1px",
                    height: "50%",
                    background:
                      i % 3 === 0 
                        ? "linear-gradient(180deg, transparent 0%, rgba(255,255,255,0.25) 25%, rgba(147,197,253,0.4) 50%, rgba(37,99,235,0.2) 75%, transparent 100%)"
                        : "linear-gradient(180deg, transparent 0%, rgba(255,255,255,0.15) 30%, rgba(96,165,250,0.25) 60%, transparent 100%)",
                    transformOrigin: "top",
                    transform: `rotate(${i * 7.5}deg)`,
                  }}
                />
              ))}
              
              {/* Iris color variations - corona effect */}
              <div style={{
                position: "absolute",
                inset: "20%",
                borderRadius: "50%",
                background: "radial-gradient(circle, rgba(251,191,36,0.15) 0%, rgba(251,191,36,0.08) 30%, transparent 60%)",
              }} />

              {/* Limbal Ring - darker edge */}
              <div
                style={{
                  position: "absolute",
                  inset: "-3px",
                  borderRadius: "50%",
                  border: "5px solid rgba(30,64,175,0.85)",
                  boxShadow: "inset 0 0 10px rgba(0,0,0,0.3)",
                }}
              />
              
              {/* Collarette ring */}
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  width: "70px",
                  height: "70px",
                  borderRadius: "50%",
                  border: "1px solid rgba(255,255,255,0.15)",
                  transform: "translate(-50%, -50%)",
                }}
              />

              {/* Pupil - centered within iris - smaller */}
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  width: "48px",
                  height: "48px",
                  borderRadius: "50%",
                  background: "radial-gradient(circle at 40% 40%, #1a1a1a 0%, #000000 60%, #000000 100%)",
                  transform: "translate(-50%, -50%)",
                  boxShadow: "0 0 30px rgba(0,0,0,0.95), inset 0 0 12px rgba(30,64,175,0.15)",
                }}
              >
                {/* Light Reflections - scaled down */}
                <div
                  style={{
                    position: "absolute",
                    top: "6px",
                    right: "8px",
                    width: "12px",
                    height: "10px",
                    borderRadius: "50%",
                    background: "radial-gradient(ellipse at 50% 50%, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0.7) 60%, transparent 100%)",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    bottom: "10px",
                    left: "8px",
                    width: "6px",
                    height: "5px",
                    borderRadius: "50%",
                    background: "radial-gradient(ellipse, rgba(255,255,255,0.6) 0%, transparent 100%)",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    top: "18px",
                    right: "12px",
                    width: "4px",
                    height: "4px",
                    borderRadius: "50%",
                    backgroundColor: "rgba(255,255,255,0.5)",
                  }}
                />
              </div>
            </div>
          </div>

          {/* Scanning Line Animation */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: "50%",
              transform: "translateX(-50%)",
              width: "2px",
              height: "100%",
              background: "linear-gradient(180deg, transparent, rgba(8, 145, 178, 0.6), transparent)",
              animation: "scanLine 3s ease-in-out infinite",
              opacity: 0.5,
            }}
          />

          {/* Feature Buttons Around Eye - Left and Right sides */}
          {features.map((feature, index) => {
            const radius = 260;
            const angleRad = (feature.angle * Math.PI) / 180;
            const x = Math.cos(angleRad) * radius;
            const y = Math.sin(angleRad) * radius;
            const Icon = feature.icon;
            const floatDelay = index * 0.4;
            const floatDuration = 3 + (index % 3) * 0.5;

            return (
              <button
                key={index}
                onClick={feature.action}
                style={{
                  position: "absolute",
                  left: "50%",
                  top: "50%",
                  transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "12px 20px",
                  borderRadius: "24px",
                  border: "1px solid rgba(8, 145, 178, 0.2)",
                  backgroundColor: "rgba(255, 255, 255, 0.95)",
                  cursor: "pointer",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.08), 0 0 20px rgba(8, 145, 178, 0.05)",
                  transition: "background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease",
                  fontWeight: 500,
                  fontSize: "14px",
                  color: "#374151",
                  whiteSpace: "nowrap",
                  backdropFilter: "blur(10px)",
                  animation: `floatButtonOrbit ${floatDuration}s ease-in-out infinite`,
                  animationDelay: `${floatDelay}s`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#0891b2";
                  e.currentTarget.style.color = "white";
                  e.currentTarget.style.borderColor = "#0891b2";
                  e.currentTarget.style.boxShadow = "0 8px 30px rgba(8, 145, 178, 0.4)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.95)";
                  e.currentTarget.style.color = "#374151";
                  e.currentTarget.style.borderColor = "rgba(8, 145, 178, 0.2)";
                  e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.08), 0 0 20px rgba(8, 145, 178, 0.05)";
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
          onClick={() => navigate("/dashboard")}
          style={{
            marginTop: "50px",
            padding: "14px 36px",
            fontSize: "16px",
            fontWeight: 600,
            borderRadius: "10px",
            border: "none",
            backgroundColor: "#0891b2",
            color: "white",
            cursor: "pointer",
            boxShadow: "0 4px 20px rgba(8,145,178,0.3)",
            transition: "all 0.3s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#0e7490";
            e.currentTarget.style.boxShadow = "0 8px 30px rgba(8,145,178,0.5)";
            e.currentTarget.style.transform = "translateY(-2px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#0891b2";
            e.currentTarget.style.boxShadow = "0 4px 20px rgba(8,145,178,0.3)";
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          Start Analyzing
        </button>
      </main>

      {/* Footer */}
      <footer
        style={{
          padding: "16px 24px",
          textAlign: "center",
          fontSize: "13px",
          color: "#6b7280",
          position: "relative",
          zIndex: 10,
        }}
      >
        <p>© 2025 LucidEye Technologies. All rights reserved.</p>
      </footer>

      {/* CSS Animations */}
      <style>{`
        @keyframes floatGraphic {
          0%, 100% { transform: translateY(0px) scale(1); }
          25% { transform: translateY(-20px) scale(1.02); }
          50% { transform: translateY(-10px) scale(0.98); }
          75% { transform: translateY(-25px) scale(1.01); }
        }
        @keyframes floatButtonOrbit {
          0%, 100% { 
            margin-top: 0px; 
            margin-left: 0px; 
          }
          25% { 
            margin-top: -10px; 
            margin-left: 5px; 
          }
          50% { 
            margin-top: -5px; 
            margin-left: -3px; 
          }
          75% { 
            margin-top: -12px; 
            margin-left: 3px; 
          }
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
