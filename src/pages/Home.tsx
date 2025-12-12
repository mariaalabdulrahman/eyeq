import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, ScanLine, FolderOpen, GitCompare, BarChart3, Stethoscope } from "lucide-react";
import Logo from "@/components/Logo";

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
    { icon: Upload, label: "Upload Image", angle: -150, action: () => navigate("/dashboard") },
    { icon: ScanLine, label: "Scan Analysis", angle: -110, action: () => navigate("/dashboard") },
    { icon: FolderOpen, label: "Patient Records", angle: -70, action: () => navigate("/records") },
    { icon: GitCompare, label: "Compare Scans", angle: 70, action: () => navigate("/dashboard") },
    { icon: BarChart3, label: "Visual Reports", angle: 110, action: () => navigate("/dashboard") },
    { icon: Stethoscope, label: "Doctor Tools", angle: 150, action: () => navigate("/dashboard") },
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
        minHeight: "100vh",
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
      <header style={{ padding: "24px 32px", position: "relative", zIndex: 10 }}>
        <div onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
          <Logo size={40} />
        </div>
      </header>

      {/* Main Content */}
      <main
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 32px",
          marginTop: "-40px",
          position: "relative",
          zIndex: 10,
        }}
      >
        {/* Title */}
        <h2
          style={{
            fontSize: "48px",
            fontWeight: 700,
            color: "#111",
            marginBottom: "16px",
            textAlign: "center",
          }}
        >
          Intelligent Eye Analysis
        </h2>
        <p style={{ fontSize: "18px", color: "#6b7280", marginBottom: "60px", textAlign: "center", maxWidth: "600px" }}>
          Advanced AI-powered medical imaging analysis for OCT and Fundus scans
        </p>

        {/* Big Eye - Just the eyeball */}
        <div ref={containerRef} style={{ position: "relative", width: "400px", height: "400px" }}>
          {/* Outer Glow */}
          <div
            style={{
              position: "absolute",
              inset: "-30px",
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(8, 145, 178, 0.15) 0%, transparent 70%)",
              animation: "glow 3s ease-in-out infinite",
            }}
          />

          {/* Fundus Background (Retina) */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              background: "radial-gradient(circle at 35% 35%, #ff8c42 0%, #e85d04 20%, #c73e1d 40%, #9d0208 60%, #6a040f 80%, #370617 100%)",
              boxShadow: `
              inset 0 0 80px rgba(0,0,0,0.4),
              0 0 60px rgba(8, 145, 178, 0.2),
              0 20px 60px rgba(0,0,0,0.15)
            `,
              overflow: "hidden",
            }}
          >
            {/* Optic Disc */}
            <div
              style={{
                position: "absolute",
                top: "30%",
                left: "25%",
                width: "60px",
                height: "55px",
                borderRadius: "50%",
                background: "radial-gradient(circle, #ffe5b4 0%, #ffd699 40%, #ffb347 70%, #e8a020 100%)",
                boxShadow: "0 0 20px rgba(255,200,100,0.5)",
              }}
            />

            {/* Macula (darker central region) */}
            <div
              style={{
                position: "absolute",
                top: "42%",
                left: "55%",
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                background: "radial-gradient(circle, #4a0e0e 0%, transparent 70%)",
              }}
            />

            {/* Segmented Blood Vessels - Main arteries (red) */}
            <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
              {/* Main vessel from optic disc going up-right */}
              <path d="M 120 135 Q 150 100 200 80 Q 250 65 300 50" stroke="#dc2626" strokeWidth="4" fill="none" strokeLinecap="round" />
              <path d="M 120 135 Q 145 105 190 90 Q 240 75 280 65" stroke="#22c55e" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeDasharray="8 4" />
              
              {/* Main vessel going down-right */}
              <path d="M 120 145 Q 160 180 220 220 Q 280 260 340 300" stroke="#dc2626" strokeWidth="4" fill="none" strokeLinecap="round" />
              <path d="M 120 145 Q 155 175 210 210 Q 265 245 320 280" stroke="#22c55e" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeDasharray="8 4" />
              
              {/* Secondary branches - upper */}
              <path d="M 180 85 Q 200 70 230 55 Q 260 40 290 30" stroke="#dc2626" strokeWidth="2.5" fill="none" strokeLinecap="round" />
              <path d="M 180 85 Q 195 72 220 60 Q 250 48 275 40" stroke="#22c55e" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeDasharray="6 3" />
              
              <path d="M 200 80 Q 240 95 280 85 Q 320 75 360 60" stroke="#dc2626" strokeWidth="2" fill="none" strokeLinecap="round" />
              <path d="M 200 80 Q 235 92 270 83 Q 305 74 340 62" stroke="#22c55e" strokeWidth="1.2" fill="none" strokeLinecap="round" strokeDasharray="5 3" />
              
              {/* Secondary branches - lower */}
              <path d="M 180 200 Q 220 230 260 250 Q 300 270 350 290" stroke="#dc2626" strokeWidth="2.5" fill="none" strokeLinecap="round" />
              <path d="M 180 200 Q 215 225 250 242 Q 290 260 335 278" stroke="#22c55e" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeDasharray="6 3" />
              
              <path d="M 200 240 Q 240 260 280 290 Q 320 320 370 350" stroke="#dc2626" strokeWidth="2" fill="none" strokeLinecap="round" />
              <path d="M 200 240 Q 235 258 272 285 Q 310 312 355 338" stroke="#22c55e" strokeWidth="1.2" fill="none" strokeLinecap="round" strokeDasharray="5 3" />
              
              {/* Tertiary small vessels */}
              <path d="M 250 65 Q 280 50 310 45" stroke="#dc2626" strokeWidth="1.5" fill="none" strokeLinecap="round" />
              <path d="M 250 65 Q 275 52 300 48" stroke="#22c55e" strokeWidth="1" fill="none" strokeLinecap="round" strokeDasharray="4 2" />
              
              <path d="M 280 250 Q 310 240 340 245" stroke="#dc2626" strokeWidth="1.5" fill="none" strokeLinecap="round" />
              <path d="M 280 250 Q 305 242 330 246" stroke="#22c55e" strokeWidth="1" fill="none" strokeLinecap="round" strokeDasharray="4 2" />
              
              <path d="M 140 160 Q 120 200 100 250" stroke="#dc2626" strokeWidth="2" fill="none" strokeLinecap="round" />
              <path d="M 140 160 Q 122 195 105 240" stroke="#22c55e" strokeWidth="1.2" fill="none" strokeLinecap="round" strokeDasharray="5 3" />
              
              <path d="M 130 120 Q 100 100 70 90" stroke="#dc2626" strokeWidth="2" fill="none" strokeLinecap="round" />
              <path d="M 130 120 Q 102 102 75 93" stroke="#22c55e" strokeWidth="1.2" fill="none" strokeLinecap="round" strokeDasharray="5 3" />
            </svg>

            {/* Iris - moves with cursor - BLUE */}
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                width: "180px",
                height: "180px",
                borderRadius: "50%",
                background: "radial-gradient(circle at 40% 40%, #67e8f9 0%, #22d3ee 20%, #0891b2 40%, #0e7490 60%, #164e63 80%, #0c4a6e 100%)",
                boxShadow: "inset 0 0 50px rgba(0,0,0,0.5), 0 0 40px rgba(8, 145, 178, 0.4)",
                transform: `translate(calc(-50% + ${pupilPosition.x}px), calc(-50% + ${pupilPosition.y}px))`,
                transition: "transform 0.08s ease-out",
              }}
            >
              {/* Iris Texture */}
              {[...Array(36)].map((_, i) => (
                <div
                  key={i}
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    width: "2px",
                    height: "50%",
                    background:
                      "linear-gradient(180deg, transparent 0%, rgba(255,255,255,0.2) 30%, rgba(34,211,238,0.3) 60%, transparent 100%)",
                    transformOrigin: "top",
                    transform: `rotate(${i * 10}deg)`,
                  }}
                />
              ))}

              {/* Limbal Ring */}
              <div
                style={{
                  position: "absolute",
                  inset: "-4px",
                  borderRadius: "50%",
                  border: "4px solid rgba(6,182,212,0.6)",
                }}
              />

              {/* Pupil */}
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  width: "60px",
                  height: "60px",
                  borderRadius: "50%",
                  backgroundColor: "#000",
                  transform: "translate(-50%, -50%)",
                  boxShadow: "0 0 30px rgba(0,0,0,0.9), inset 0 0 15px rgba(8, 145, 178, 0.3)",
                }}
              >
                {/* Light Reflections */}
                <div
                  style={{
                    position: "absolute",
                    top: "8px",
                    right: "10px",
                    width: "14px",
                    height: "14px",
                    borderRadius: "50%",
                    backgroundColor: "rgba(255,255,255,0.95)",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    top: "20px",
                    right: "18px",
                    width: "5px",
                    height: "5px",
                    borderRadius: "50%",
                    backgroundColor: "rgba(255,255,255,0.7)",
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
                  transition: "all 0.3s ease",
                  fontWeight: 500,
                  fontSize: "14px",
                  color: "#374151",
                  whiteSpace: "nowrap",
                  backdropFilter: "blur(10px)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#0891b2";
                  e.currentTarget.style.color = "white";
                  e.currentTarget.style.borderColor = "#0891b2";
                  e.currentTarget.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) scale(1.1)`;
                  e.currentTarget.style.boxShadow = "0 8px 30px rgba(8, 145, 178, 0.4)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.95)";
                  e.currentTarget.style.color = "#374151";
                  e.currentTarget.style.borderColor = "rgba(8, 145, 178, 0.2)";
                  e.currentTarget.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
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
            marginTop: "100px",
            padding: "16px 40px",
            fontSize: "18px",
            fontWeight: 600,
            borderRadius: "12px",
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
          padding: "24px 32px",
          textAlign: "center",
          fontSize: "14px",
          color: "#6b7280",
          position: "relative",
          zIndex: 10,
        }}
      >
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
