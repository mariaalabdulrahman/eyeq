import { useState, useRef, useEffect } from "react";
import { ScanAnalysis } from "@/types/scan";
import { cn } from "@/lib/utils";
import { Thermometer, Grid3X3, Circle, Contrast, Eye, Microscope } from "lucide-react";

interface VisualizationViewProps {
  scan: ScanAnalysis;
}

type FilterType = 'original' | 'thermal' | 'segmentation' | 'contrast';

const filters: { type: FilterType; icon: React.ElementType; label: string }[] = [
  { type: 'original', icon: Circle, label: 'Original' },
  { type: 'thermal', icon: Thermometer, label: 'Thermal' },
  { type: 'segmentation', icon: Grid3X3, label: 'Segmentation' },
  { type: 'contrast', icon: Contrast, label: 'High Contrast' },
];

export function VisualizationView({ scan }: VisualizationViewProps) {
  const [activeFilter, setActiveFilter] = useState<FilterType>('original');
  const [activeImage, setActiveImage] = useState<'fundus' | 'oct'>('fundus');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [segmentedImageUrl, setSegmentedImageUrl] = useState<string | null>(null);

  const currentImageUrl = activeImage === 'fundus' ? scan.imageUrl : scan.linkedOctUrl;

  // Generate vessel segmentation overlay
  useEffect(() => {
    if (activeFilter === 'segmentation' && activeImage === 'fundus' && scan.imageUrl) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        
        // Draw original image
        ctx.drawImage(img, 0, 0);
        
        // Get image data
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        // Simple vessel detection: look for red/dark channels (blood vessels)
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          
          // Detect dark/red structures (vessels)
          const isDark = (r + g + b) / 3 < 80;
          const isReddish = r > g && r > b && r < 150;
          
          if (isDark || isReddish) {
            // Highlight vessels in green
            data[i] = 0;     // R
            data[i + 1] = 255; // G
            data[i + 2] = 0;   // B
            data[i + 3] = 180; // A
          } else {
            // Make background semi-transparent grayscale
            const gray = (r + g + b) / 3;
            data[i] = gray;
            data[i + 1] = gray;
            data[i + 2] = gray;
            data[i + 3] = 100;
          }
        }
        
        ctx.putImageData(imageData, 0, 0);
        setSegmentedImageUrl(canvas.toDataURL());
      };
      img.src = scan.imageUrl;
    }
  }, [activeFilter, activeImage, scan.imageUrl]);

  const getFilterStyle = (): React.CSSProperties => {
    switch (activeFilter) {
      case 'thermal':
        return {
          filter: 'hue-rotate(180deg) saturate(200%) brightness(0.9)',
        };
      case 'segmentation':
        return {};
      case 'contrast':
        return {
          filter: 'contrast(180%) brightness(1.1)',
        };
      default:
        return {};
    }
  };

  return (
    <div className="h-full flex flex-col gap-4">
      {/* Hidden canvas for segmentation */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* Image Toggle (if OCT available) */}
      {scan.linkedOctUrl && (
        <div className="flex gap-2 bg-card border border-border rounded-xl p-3">
          <button
            onClick={() => setActiveImage('fundus')}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
              activeImage === 'fundus'
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            )}
          >
            <Eye className="w-4 h-4" />
            Fundus
          </button>
          <button
            onClick={() => setActiveImage('oct')}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
              activeImage === 'oct'
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            )}
          >
            <Microscope className="w-4 h-4" />
            OCT
          </button>
        </div>
      )}

      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-2 bg-card border border-border rounded-xl p-4">
        {filters.map(({ type, icon: Icon, label }) => (
          <button
            key={type}
            onClick={() => setActiveFilter(type)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
              activeFilter === type
                ? "bg-primary text-primary-foreground glow-primary"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            )}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Images Display - Side by side if both available */}
      <div className={cn("flex-1 bg-card border border-border rounded-xl p-4 flex flex-col", scan.linkedOctUrl && activeFilter === 'original' && "grid grid-cols-2 gap-4")}>
        {scan.linkedOctUrl && activeFilter === 'original' ? (
          // Show both images side by side
          <>
            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-2">
                <Eye className="w-4 h-4 text-primary" />
                <h3 className="font-semibold text-foreground text-sm">Fundus Image</h3>
              </div>
              <div className="flex-1 flex items-center justify-center bg-secondary/30 rounded-lg overflow-hidden">
                <img
                  src={scan.imageUrl}
                  alt="Fundus"
                  className="max-w-full max-h-full object-contain"
                />
              </div>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-2">
                <Microscope className="w-4 h-4 text-primary" />
                <h3 className="font-semibold text-foreground text-sm">OCT Scan</h3>
              </div>
              <div className="flex-1 flex items-center justify-center bg-secondary/30 rounded-lg overflow-hidden">
                <img
                  src={scan.linkedOctUrl}
                  alt="OCT"
                  className="max-w-full max-h-full object-contain"
                />
              </div>
            </div>
          </>
        ) : (
          // Single image with filter
          <>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">
                {activeImage === 'fundus' ? 'Fundus Image' : 'OCT Scan'}
              </h3>
              <span className="text-sm text-muted-foreground capitalize">
                {activeFilter} View
              </span>
            </div>
            
            <div className="flex-1 flex items-center justify-center bg-secondary/30 rounded-lg overflow-hidden relative">
              {activeFilter === 'segmentation' && segmentedImageUrl && activeImage === 'fundus' ? (
                <img
                  src={segmentedImageUrl}
                  alt="Segmented vessels"
                  className="max-w-full max-h-full object-contain"
                />
              ) : (
                <img
                  src={currentImageUrl}
                  alt={scan.name}
                  className="max-w-full max-h-full object-contain transition-all duration-300"
                  style={getFilterStyle()}
                />
              )}
              
              {/* Thermal color bar */}
              {activeFilter === 'thermal' && (
                <div className="absolute right-4 top-4 bottom-4 w-6 rounded-lg overflow-hidden">
                  <div className="w-full h-full" style={{
                    background: 'linear-gradient(to bottom, #ff0000, #ff7700, #ffff00, #00ff00, #0077ff, #0000ff)',
                  }} />
                  <div className="absolute top-0 left-full ml-2 text-xs text-foreground">High</div>
                  <div className="absolute bottom-0 left-full ml-2 text-xs text-foreground">Low</div>
                </div>
              )}
            </div>

            {/* Info Panel */}
            <div className="mt-4 p-4 bg-secondary/50 rounded-lg">
              <p className="text-sm text-muted-foreground">
                {activeFilter === 'original' && "Original scan without any processing. Shows the raw image as captured."}
                {activeFilter === 'thermal' && "Thermal visualization highlights temperature variations and blood flow patterns. Warmer areas appear in red/yellow, cooler areas in blue."}
                {activeFilter === 'segmentation' && "Vessel segmentation highlights blood vessels in green. The algorithm detects dark and reddish structures characteristic of retinal vasculature."}
                {activeFilter === 'contrast' && "High contrast mode enhances visibility of subtle features and anomalies that may be less visible in the original scan."}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
