import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, Scan, Activity, BarChart3, FileText, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";

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
        25
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
    { icon: Upload, label: "Upload Image", angle: -60 },
    { icon: Scan, label: "Scan Analysis", angle: -20 },
    { icon: Activity, label: "Risk Detection", angle: 20 },
    { icon: BarChart3, label: "Visual Reports", angle: 60 },
    { icon: FileText, label: "AI Insights", angle: 100 },
    { icon: Stethoscope, label: "Doctor Tools", angle: 140 },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="px-8 py-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Activity className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">EyeQ</h1>
            <p className="text-xs text-muted-foreground">by LucidEye</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-8 -mt-20">
        {/* Title */}
        <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4 text-center">
          Intelligent Eye Analysis
        </h2>
        <p className="text-lg text-muted-foreground mb-16 text-center max-w-xl">
          Advanced AI-powered medical imaging analysis for eye scans and ultrasounds
        </p>

        {/* Eye Container */}
        <div 
          ref={containerRef}
          className="relative w-80 h-80 md:w-96 md:h-96"
        >
          {/* Outer Eye (Sclera) */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-card to-secondary border-4 border-border shadow-2xl">
            {/* Iris */}
            <div className="absolute inset-8 rounded-full bg-gradient-to-br from-primary/80 to-primary border-2 border-primary/50 flex items-center justify-center overflow-hidden">
              {/* Iris Pattern */}
              <div className="absolute inset-0 opacity-30">
                {[...Array(12)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute inset-0 border-l border-primary-foreground/20"
                    style={{ transform: `rotate(${i * 30}deg)` }}
                  />
                ))}
              </div>
              
              {/* Pupil */}
              <div 
                className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-foreground relative transition-transform duration-75"
                style={{ 
                  transform: `translate(${pupilPosition.x}px, ${pupilPosition.y}px)` 
                }}
              >
                {/* Light Reflection */}
                <div className="absolute top-2 right-3 w-4 h-4 md:w-5 md:h-5 rounded-full bg-background/80" />
                <div className="absolute top-5 right-6 w-2 h-2 rounded-full bg-background/50" />
              </div>
            </div>
          </div>

          {/* Feature Buttons Around Eye */}
          {features.map((feature, index) => {
            const radius = 200;
            const angleRad = (feature.angle * Math.PI) / 180;
            const x = Math.cos(angleRad) * radius;
            const y = Math.sin(angleRad) * radius;
            
            return (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => navigate('/dashboard')}
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-2 bg-card hover:bg-primary hover:text-primary-foreground transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-110"
                style={{
                  transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
                }}
              >
                <feature.icon className="w-4 h-4" />
                <span className="hidden md:inline">{feature.label}</span>
              </Button>
            );
          })}
        </div>

        {/* CTA Button */}
        <Button 
          onClick={() => navigate('/dashboard')}
          size="lg"
          className="mt-16 text-lg px-8 py-6 glow-primary"
        >
          Start Analyzing
        </Button>
      </main>

      {/* Footer */}
      <footer className="px-8 py-6 text-center text-sm text-muted-foreground">
        <p>© 2024 LucidEye Technologies. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Home;
